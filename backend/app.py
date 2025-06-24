import os
import subprocess
import socket
import psycopg2
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import base64
import requests
import uuid

app = Flask(__name__)
CORS(app)

VBOXMANAGE = "VBoxManage"
BASE_PORT = 3169
UPLOAD_FOLDER = os.path.expanduser("~/Documents/Sanal_Makineler")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
vm_port_map = {}


def run_command(cmd):
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        return f"Hata: {e.stderr.strip()}"
def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0
def upsert_guac_connection(vm_name, port):
    conn = psycopg2.connect(
        dbname="guacamole_db",
        user="guacamole_user",
        password="akane",
        host="localhost",
        port=5432
    )
    cur = conn.cursor()

   
    cur.execute("SELECT connection_id, identifier FROM guacamole_connection WHERE connection_name = %s", (vm_name,))
    row = cur.fetchone()

    if row:
        conn_id, identifier = row
        if not identifier:
            identifier = str(uuid.uuid4())
            cur.execute("UPDATE guacamole_connection SET identifier = %s WHERE connection_id = %s", (identifier, conn_id))
        cur.execute("DELETE FROM guacamole_connection_parameter WHERE connection_id = %s", (conn_id,))
    else:
        identifier = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO guacamole_connection (connection_name, protocol, max_connections, max_connections_per_user, identifier)
            VALUES (%s, 'rdp', 10, 1, %s)
            RETURNING connection_id
        """, (vm_name, identifier))
        conn_id = cur.fetchone()[0]

    params = [
        (conn_id, 'hostname', 'host.docker.internal'),
        (conn_id, 'port', str(port)),
        (conn_id, 'security', 'any'),
        (conn_id, 'ignore-cert', 'true'),
        (conn_id, 'keyboard-layout', 'tr-tr-qwerty')
    ]
    for p in params:
        cur.execute("""
            INSERT INTO guacamole_connection_parameter (connection_id, parameter_name, parameter_value)
            VALUES (%s, %s, %s)
        """, p)

    conn.commit()
    cur.close()
    conn.close()
    return conn_id

def get_next_available_port():
    used_ports = set()
    output = run_command([VBOXMANAGE, "list", "vms"])
    for line in output.splitlines():
        if '"' in line:
            vm_name = line.split('"')[1]
            info = run_command([VBOXMANAGE, "showvminfo", vm_name, "--machinereadable"])
            for info_line in info.splitlines():
                if info_line.startswith("VRDEPort="):
                    try:
                        used_ports.add(int(info_line.split("=")[1].strip().strip('"')))
                    except:
                        pass

    port = BASE_PORT
    while port in used_ports or is_port_in_use(port):
        port += 1
    return port

def get_vm_network_type(vm_name):
    info = run_command([VBOXMANAGE, "showvminfo", vm_name, "--machinereadable"])
    for line in info.splitlines():
        if line.startswith("nic1="):
            raw_type = line.split("=")[1].replace('"', '').lower()
            mapping = {
                "natnetwork": "NAT-Network",
                "hostonly": "Host-Only",
                "bridged": "Bridged",
                "nat": "NAT",
                "internal": "internal",
                "none": "None"
            }
            return mapping.get(raw_type, raw_type)
    return "none"

def get_vm_state(vm_name):
    info = run_command([VBOXMANAGE, "showvminfo", vm_name, "--machinereadable"])
    for line in info.splitlines():
        if line.startswith("VMState="):
            return line.split("=")[1].replace('"', '')
    return "unknown"

def get_vm_ip_safe(vm_name):
    ip_raw = run_command([VBOXMANAGE, "guestproperty", "get", vm_name, "/VirtualBox/GuestInfo/Net/0/V4/IP"])
    if ip_raw.startswith("Value:"):
        return ip_raw.split("Value:")[-1].strip(), True
    return None, False

@app.route("/api/vms", methods=["GET"])
def list_vms():
    output = run_command([VBOXMANAGE, "list", "vms"])
    vms = []
    used_ports = set(vm_port_map.values())

    for line in output.splitlines():
        if '"' in line:
            name = line.split('"')[1]
            vm_id = line.split("{")[-1].strip("}")
            network_type = get_vm_network_type(name)
            state = get_vm_state(name)
            ip, ip_valid = get_vm_ip_safe(name) if state == "running" else (None, False)


            if name not in vm_port_map:
                port = BASE_PORT
                while port in used_ports or is_port_in_use(port):
                    port += 1
                vm_port_map[name] = port
                used_ports.add(port)

            vms.append({
                "name": name,
                "id": vm_id,
                "adapterType": network_type,
                "networkInfo": network_type,
                "status": state,
                "ip": ip,
                "ipValid": ip_valid
            })

    return jsonify(vms)
@app.route("/api/guac-port", methods=["POST"])
def assign_vrde_port():
    data = request.get_json()
    vm_name = data.get("name")
    if not vm_name:
        return jsonify({"error": "VM adı gerekli"}), 400


    if vm_name in vm_port_map:
        port = vm_port_map[vm_name]
    else:
        used_ports = set(vm_port_map.values())
        port = BASE_PORT
        while port in used_ports or is_port_in_use(port):
            port += 1
        vm_port_map[vm_name] = port


    if get_vm_state(vm_name) == "running":
        run_command([VBOXMANAGE, "controlvm", vm_name, "poweroff"])


    run_command([VBOXMANAGE, "modifyvm", vm_name, "--vrde", "on"])
    run_command([VBOXMANAGE, "modifyvm", vm_name, "--vrdeport", str(port)])
    run_command([VBOXMANAGE, "startvm", vm_name, "--type", "headless"])

    return jsonify({"port": port})

@app.route("/api/vm/<vm_name>/details", methods=["GET"])
def vm_details(vm_name):
    info = run_command([VBOXMANAGE, "showvminfo", vm_name, "--machinereadable"])
    if info.startswith("Hata"):
        return jsonify({"error": info}), 500

    details = {}
    for line in info.splitlines():
        if "=" in line:
            key, val = line.split("=", 1)
            key = key.strip()
            val = val.strip().strip('"')
            if key in [
                "ostype", "cpus", "memory", "vram", "firmware", "graphicscontroller",
                "usb", "audio", "nic1", "vrde", "nested-hw-virt", "boot1"
            ]:
                details[key] = val
    return jsonify(details)

@app.route("/api/vm/<vm_name>/snapshots", methods=["GET"])
def list_snapshots(vm_name):
    output = run_command([VBOXMANAGE, "snapshot", vm_name, "list", "--machinereadable"])
    if output.startswith("Hata"):
        return jsonify({"error": output}), 500
    snapshots = []
    for line in output.splitlines():
        if line.startswith("SnapshotName"):
            parts = line.split("=")
            if len(parts) == 2:
                snapshots.append(parts[1].strip('"'))
    return jsonify({"snapshots": snapshots})

@app.route("/api/vm/<vm_name>/restore", methods=["POST"])
def restore_snapshot(vm_name):
    data = request.get_json()
    snapshot_name = data.get("snapshot")
    if not snapshot_name:
        return jsonify({"error": "Snapshot adı belirtilmedi."}), 400
    result = run_command([VBOXMANAGE, "snapshot", vm_name, "restore", snapshot_name])
    if result.startswith("Hata"):
        return jsonify({"message": result}), 500

    return jsonify({"message": f"{vm_name} geri yüklendi: {snapshot_name}"})

@app.route("/api/internet-status", methods=["GET"])
def internet_status():
    try:
        socket.create_connection(("8.8.8.8", 53), timeout=2)
        return jsonify({"online": True})
    except OSError:
        return jsonify({"online": False})

@app.route("/api/vm/<vm_name>/<action>", methods=["POST"])
def vm_action(vm_name, action):
    state = get_vm_state(vm_name)
    if action == "start":
        if state == "running":
            return jsonify({"message": f"{vm_name} zaten çalışıyor."}), 200
        cmd = [VBOXMANAGE, "startvm", vm_name, "--type", "headless"]
    elif action == "stop":
        if state == "poweroff":
            return jsonify({"message": f"{vm_name} zaten kapalı."}), 200
        cmd = [VBOXMANAGE, "controlvm", vm_name, "poweroff"]
    elif action == "snapshot":
        snapshot_name = f"snapshot_{vm_name}"
        cmd = [VBOXMANAGE, "snapshot", vm_name, "take", snapshot_name]
    else:
        return jsonify({"error": "Geçersiz işlem"}), 400

    output = run_command(cmd)
    if output.startswith("Hata"):
        return jsonify({"error": output}), 500
    return jsonify({"message": f"{vm_name} için '{action}' işlemi başarıyla gerçekleştirildi."})

@app.route("/api/create", methods=["POST"])
def create_vm():
    data = request.get_json()
    name = data.get("name")
    ram = data.get("ram")
    cpu = data.get("cpu")
    disk = data.get("disk")

    if not all([name, ram, cpu, disk]):
        return jsonify({"error": "Tüm alanlar zorunludur."}), 400

    try:
        ram = int(ram)
        cpu = int(cpu)
        disk = int(disk)
        if ram < 4 or cpu < 1 or disk < 100:
            return jsonify({"error": "Minimum: RAM 4 MB, CPU 1, Disk 100 MB"}), 400
    except ValueError:
        return jsonify({"error": "Geçersiz sayısal değer."}), 400

    vm_dir = os.path.join(app.config["UPLOAD_FOLDER"], name)
    os.makedirs(vm_dir, exist_ok=True)
    disk_path = os.path.join(vm_dir, f"{name}.vmdk")

    cmds = [
        [VBOXMANAGE, "createhd", "--filename", disk_path, "--size", str(disk)],
        [VBOXMANAGE, "createvm", "--name", name, "--register"],
        [VBOXMANAGE, "modifyvm", name, "--memory", str(ram), "--cpus", str(cpu), "--nic1", "nat", "--boot1", "dvd"],
        [VBOXMANAGE, "storagectl", name, "--name", "SATA", "--add", "sata", "--controller", "IntelAhci"],
        [VBOXMANAGE, "storageattach", name, "--storagectl", "SATA", "--port", "0", "--device", "0", "--type", "hdd", "--medium", disk_path]
    ]

    for cmd in cmds:
        result = run_command(cmd)
        if result.startswith("Hata"):
            return jsonify({"error": result}), 500

    return jsonify({"message": "VM başarıyla oluşturuldu."})

@app.route("/api/upload_iso", methods=["POST"])
def upload_iso():
    file = request.files.get("iso")
    vm_name = request.form.get("name")
    if not file or not vm_name:
        return jsonify({"error": "ISO dosyası ve VM adı zorunludur."}), 400

    filename = secure_filename(file.filename)
    vm_folder = os.path.join(app.config["UPLOAD_FOLDER"], vm_name)
    os.makedirs(vm_folder, exist_ok=True)
    iso_path = os.path.join(vm_folder, filename)
    file.save(iso_path)

    attach_cmd = [
        VBOXMANAGE, "storageattach", vm_name,
        "--storagectl", "SATA", "--port", "1", "--device", "0",
        "--type", "dvddrive", "--medium", iso_path
    ]
    result = run_command(attach_cmd)
    if result.startswith("Hata"):
        return jsonify({"error": result}), 500

    return jsonify({"message": "ISO başarıyla yüklendi."})

@app.route("/api/delete/<vm_name>", methods=["DELETE"])
def delete_vm(vm_name):
    result = run_command([VBOXMANAGE, "unregistervm", vm_name, "--delete"])
    if result.startswith("Hata"):
        return jsonify({"error": result}), 500
    return jsonify({"message": f"{vm_name} başarıyla silindi."})

@app.route("/api/vm/<vm_name>/update", methods=["POST"])
def update_vm(vm_name):
    data = request.get_json()
    updates = []

    if not data:
        return jsonify({"error": "Veri alınamadı"}), 400


    state = get_vm_state(vm_name)
    if state != "poweroff":
        return jsonify({"error": f"{vm_name} şu anda çalışıyor veya kilitli. Lütfen kapatıp tekrar deneyin."}), 409

    if data.get("ram"):
        try:
            ram_value = int(data["ram"])
            updates.append(["modifyvm", vm_name, "--memory", str(ram_value)])
        except ValueError:
            return jsonify({"error": "Geçersiz RAM değeri"}), 400


    if data.get("cpu"):
        try:
            cpu_value = int(data["cpu"])
            updates.append(["modifyvm", vm_name, "--cpus", str(cpu_value)])
        except ValueError:
            return jsonify({"error": "Geçersiz CPU değeri"}), 400


    if data.get("network"):
        net_mode = data["network"].lower().replace(" ", "")
        if net_mode in ["nat", "natnetwork", "bridged"]:
            updates.append(["modifyvm", vm_name, "--nic1", net_mode])
        else:
            return jsonify({"error": f"Geçersiz ağ tipi: {data['network']}"}), 400


    if data.get("name") and data["name"] != vm_name:
        updates.append(["modifyvm", vm_name, "--name", data["name"]])


    if data.get("type"):
        updates.append(["modifyvm", vm_name, "--description", f"Type: {data['type']}"])
    if data.get("subtype"):
        updates.append(["modifyvm", vm_name, "--description", f"Subtype: {data['subtype']}"])
    if data.get("description"):
        updates.append(["modifyvm", vm_name, "--description", data["description"]])

    if data.get("disk"):
        try:
            int(data["disk"]) 
        except ValueError:
            return jsonify({"error": "Geçersiz Disk değeri"}), 400

    for cmd in updates:
        result = run_command([VBOXMANAGE] + cmd)
        if result.startswith("Hata"):
            return jsonify({"error": result}), 500

    return jsonify({"message": "Ayarlar güncellendi."})

@app.route("/api/connect", methods=["POST"])
def connect_vm():
    data = request.get_json()
    port = data.get("port")
    name = data.get("name")
    if not port:
        return jsonify({"error": "Port bilgisi gerekli"}), 400

    try:
        conn = psycopg2.connect(
            dbname="guacamole_db",
            user="guacamole_user",
            password="akane",
            host="localhost",
            port=5432
        )
        cur = conn.cursor()

        name = f"{name}"
        cur.execute("SELECT connection_id FROM guacamole_connection WHERE connection_name = %s", (name,))
        existing = cur.fetchone()

        if existing:
            conn_id = existing[0]
            cur.execute("DELETE FROM guacamole_connection_parameter WHERE connection_id = %s", (conn_id,))
        else:
            cur.execute("""
                INSERT INTO guacamole_connection (connection_name, protocol, max_connections, max_connections_per_user)
                VALUES (%s, 'rdp', 10, 1)
                RETURNING connection_id
            """, (name,))
            conn_id = cur.fetchone()[0]

        params = [
            (conn_id, 'hostname', 'host.docker.internal'),
            (conn_id, 'port', str(port)),
            (conn_id, 'security', 'any'),
            (conn_id, 'ignore-cert', 'true'),
            (conn_id, 'server-layout', 'tr-tr-qwerty')
        ]

        for p in params:
            cur.execute("""
                INSERT INTO guacamole_connection_parameter (connection_id, parameter_name, parameter_value)
                VALUES (%s, %s, %s)
            """, p)

        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"connectionId": conn_id})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/guac-url", methods=["POST"])
def get_guac_url():
    data = request.get_json()
    name = data.get("name")

    if not name:
        return jsonify({"error": "VM adı gerekli"}), 400

    try:

        conn = psycopg2.connect(
            dbname="guacamole_db",
            user="guacamole_user",
            password="akane",
            host="localhost",
            port=5432
        )
        cur = conn.cursor()
        cur.execute("SELECT connection_id FROM guacamole_connection WHERE connection_name = %s", (name,))
        row = cur.fetchone()
        cur.close()
        conn.close()

        if not row:
            return jsonify({"error": "Bağlantı bulunamadı."}), 404

        conn_id = row[0]


        raw = f"{conn_id}\x00c\x00postgresql".encode("utf-8")
        encoded_id = base64.b64encode(raw).decode("utf-8")


        auth_res = requests.post("http://localhost:8080/guacamole/api/tokens", data={
            "username": "guacadmin",
            "password": "guacadmin"
        })

        if auth_res.status_code != 200:
            return jsonify({"error": "Token alınamadı"}), 500

        token = auth_res.json().get("authToken")
        if not token:
            return jsonify({"error": "Token boş"}), 500


        url = f"http://localhost:8080/guacamole/#/client/{encoded_id}?token={token}&username=guacadmin"
        return jsonify({"url": url})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
