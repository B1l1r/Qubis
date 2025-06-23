# Qubis — Interactive Virtual Machine Management Interface

Qubis is a modern, React-based web application that offers a dynamic and intuitive interface for managing VirtualBox virtual machines. It provides real-time monitoring, network visualization, and lifecycle control, allowing developers and IT professionals to handle complex VM setups with ease.

---

## 🚀 Features

**Dynamic VM & Network Visualization**
Graphically represents virtual machines, host, and internet with draggable nodes.
Network types like NAT, Bridged, and NAT Network are visualized with animated SVG lines.
Real-time VM states are reflected visually using color, opacity, and stroke changes.

**Complete VM Lifecycle Management**
Start, stop, delete, and snapshot VMs using right-click context menus.
VM settings are editable via tabbed modal: General, Hardware, Network, and Info.
Settings are fetched and updated asynchronously through a backend API.

**Internationalization & Dark Mode**
English and Turkish language support (i18n).
Fully styled dark mode with seamless transitions.

**Real-Time Interaction & Auto Refresh**
VM list and statuses refresh every 5 seconds.
Double-click to connect to VM via browser (Guacamole).
Escape key closes modals and context menus.

**Responsive & Styled Interface**
Built with Tailwind CSS and React Hooks.
Smooth animations, tooltips, and responsive layout.
Draggable VM nodes styled with dark/light themes.

---

## 🛠 Requirements

Make sure to install the following software **in the exact order** shown below:

### Required Software

1. **Oracle VirtualBox**
   [https://www.virtualbox.org/](https://www.virtualbox.org/)

2. **VirtualBox Extension Pack**
   Enables USB support and VRDE connections.
   [https://www.virtualbox.org/wiki/Downloads](https://www.virtualbox.org/wiki/Downloads)

3. **Docker Desktop** *(Optional, if backend runs in Docker)*
   [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

4. **Node.js v22.15.0 (x64)**
   Required to build and run the frontend.
   [https://nodejs.org/en/download](https://nodejs.org/en/download)

> ⚠️ **Installation Wizard Order**
> Run installers in the following order as shown in the setup image:
>
> * `setup virtualbox`
> * `setup docker`
> * `run node.msi`

---

## 📦 Project Setup (Frontend)

```bash
# Navigate to the frontend directory
cd ../frontend

# Install project dependencies
npm install react-scripts --save
npm install react-i18next --save
npm install --package-lock-only
npm install --force
```

---

## ⚙️ Environment Configuration

### VirtualBox SDK & VBoxManage Path

Ensure that VirtualBox's CLI tool is available globally:

**Add to PATH**:

```
C:\Program Files\Oracle\VirtualBox\VBoxManage.exe
```

Steps:

* Open Environment Variables (Win + S > "Environment Variables")
* Edit the system `Path` variable
* Add the above path if missing

---

## 🌐 Backend API Endpoints

Qubis requires a backend server on `http://localhost:5000` providing the following endpoints:

* `GET /api/vms` — Fetch VM list
* `POST /api/vm/:name/start|stop|snapshot|delete` — VM lifecycle operations
* `GET /api/vm/:name/details` — Get VM detailed settings
* `POST /api/vm/:name/update` — Save VM configuration
* `POST /api/guac-port`, `/connect`, `/guac-url` — For Guacamole integration

---

## 🙋 Why Qubis?

* **Visual clarity:** Monitor network and VM status at a glance
* **User-friendly interaction:** Drag, drop, right-click, double-click — intuitive controls
* **Detailed config:** Modify VM RAM, CPU, name, and more without leaving the browser
* **Real-time sync:** Automatically keeps state up-to-date without reloads

---

## 📸 Screenshots

*(Add your screenshots here for best effect)*

---

## 📄 License

MIT License

---

## 👨‍💻 Authors

* [Your Name](https://github.com/your-username)
* Contributors welcome!
