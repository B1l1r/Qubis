# Qubis — Interactive Virtual Machine Management Interface

**Qubis** is a modern, React-based web application that offers an intuitive, real-time interface for managing VirtualBox virtual machines. It provides live network visualization, complete VM lifecycle control, and remote desktop access via Apache Guacamole, allowing users to fully interact with VM desktops directly from the browser through secure RDP sessions — making it ideal for developers, sysadmins, and IT professionals.

---

## 🚀 Features

**🖥️ Visual VM & Network Mapping**  
  • Draggable nodes for VMs, host, and internet  
  • NAT, Bridged, and NAT Network types shown via animated SVG lines  
  • Real-time VM/network status shown using colors, stroke styles, and opacity

**⚙️ Full VM Lifecycle Control**  
  • Start, stop, delete, snapshot VMs with right-click menus  
  • Tabbed modals for editing general, hardware, and network settings  
  • Asynchronous updates via REST API

**🌐 RDP Access via Guacamole**  
  • **Double-clicking a VM opens an RDP session in your browser**  
  • No need for external RDP clients  
  • Guacamole server manages sessions dynamically and securely

**🌍 Multilingual & Dark Mode**  
  • English and Turkish support via i18n  
  • Seamless dark mode with full styling

**🔄 Real-Time & Interactive**  
  • Auto-refresh VM/network data every 5 seconds  
  • Escape key closes modals and menus  
  • Hover tooltips and drag animations enhance usability

**🎨 Responsive & Themed UI**  
  • React + Tailwind CSS  
  • Dark/light theme-aware draggable elements  
  • Optimized for all screen sizes

---

## 🛠 Requirements

Install the following **in this order**:

1. [**Oracle VirtualBox**](https://www.virtualbox.org/)  
2. [**VirtualBox Extension Pack**](https://www.virtualbox.org/wiki/Downloads) — for USB & VRDE support  
3. [**Docker Desktop** *(optional)*](https://www.docker.com/products/docker-desktop) — for backend containerization  
4. [**Node.js v22.15.0 (x64)**](https://nodejs.org/en/download) — for frontend development

> 📌 **Installation Wizard Order (as shown in setup image):**  
> `setup virtualbox` → `setup docker` → `run node.msi`

---

## 📦 Frontend Setup

```
cd ../frontend

npm install react-scripts --save
npm install react-i18next --save
npm install --package-lock-only
npm install --force
```
⚙️ VBoxManage Path (Windows)
Ensure the following path is in your system PATH:

```C:\Program Files\Oracle\VirtualBox\VBoxManage.exe```
Steps:
• Win + S → “Environment Variables”
• Edit Path under System Variables
• Add the path if missing

🌐 Backend API Endpoints
Qubis uses a backend server at http://localhost:5000 with:
```
GET /api/vms — List all VMs
POST /api/vm/:name/start|stop|snapshot|delete — Control VM lifecycle
GET /api/vm/:name/details — VM settings
POST /api/vm/:name/update — Save updates
POST /api/guac-port, /connect, /guac-url — Guacamole for RDP access
```
**🙋 Why Qubis?**
   • Visual clarity: Network and VM topology at a glance
   • Hands-on control: Right-click menus, drag/drop, double-click for RDP
   • Config in-browser: Edit RAM, CPU, name, network live
   • Remote access: Use Guacamole to connect over RDP — no external apps
   • Always in sync: Auto-updates with no manual refresh needed

📸 Screenshots
## 📸 Screenshots

<img src="https://github.com/user-attachments/assets/b8126da7-9b18-4364-9e24-580fdef7adc0" width="700"/>

<img src="https://github.com/user-attachments/assets/c6d22505-4459-47a4-8eba-a6fc2f8ecbe7" width="700"/>

<img src="https://github.com/user-attachments/assets/c38b3b32-d452-4f91-86eb-ba37792cb37d" width="700"/>

<img src="https://github.com/user-attachments/assets/10ac88cf-6166-4f87-8a33-902f6551bc1f" width="700"/>

<img src="https://github.com/user-attachments/assets/e772f755-3b78-49ac-ac9c-0457ac8f4d56" width="700"/>

<img src="https://github.com/user-attachments/assets/527e2fba-ad2f-44e8-8091-b7506756e532" width="700"/>


📄 License
MIT License
