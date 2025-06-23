import React, { useEffect, useState } from "react";
import MainMenu from "./MainMenu";
import MyComputerPanel from "./MyComputerPanel";
import UnifiedMap from "./UnifiedMap";
import ContextMenu from "./ContextMenu";
import CreateVMModal from "./CreateVMModal";
import DeleteVMModal from "./DeleteVMModal";
import HelpModal from "./HelpModal";
import VMSettingsModal from "./VMSettingsModal";
import SnapshotModal from "./SnapshotModal";
import { useTranslation } from "../i18n";

export default function VirtualBoxUI() {
  const { t } = useTranslation();

  const [machines, setMachines] = useState([]);
  const [selectedVM, setSelectedVM] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [positions, setPositions] = useState({});
  const [hostPosition, setHostPosition] = useState({ x: 600, y: 100 });
  const [internetPosition, setInternetPosition] = useState({ x: 600, y: 20 });

  const fetchVMs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/vms");
      const data = await res.json();
      const withIds = Array.isArray(data)
        ? data.map((vm) => ({ ...vm, id: vm.id || vm.name }))
        : [];
      setMachines(withIds);
    } catch (err) {
      console.error("VM listesi alınamadı:", err);
    }
  };

  useEffect(() => {
    fetchVMs();
  }, [refreshFlag]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchVMs();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const refresh = () => setRefreshFlag((prev) => !prev);

  const handleRightClick = (e, vm) => {
    e.preventDefault();
    setSelectedVM(vm);
    setContextMenu({ x: e.pageX, y: e.pageY, vm });
  };

  const clearContextMenu = () => setContextMenu(null);

  const exitDeleteMode = () => {
    setDeleteTarget(null);
    setShowDelete(false);
  };

  const handleOpenSettings = (vm) => {
    setSelectedVM(vm);
    setShowSettings(true);
  };

  const sendVMAction = async (vmName, action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/vm/${vmName}/${action}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("operation_failed"));
      refresh();
    } catch (err) {
      alert(`${t("operation_failed")}: ${err.message}`);
    }
  };

  const handleDoubleClick = async (vm) => {
    try {
      const portRes = await fetch("http://localhost:5000/api/guac-port", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: vm.name }),
      });
      const portData = await portRes.json();
      if (!portRes.ok) throw new Error(portData.error || t("port_error"));

      const connectRes = await fetch("http://localhost:5000/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ port: portData.port, name: vm.name }),
      });
      const connectData = await connectRes.json();
      if (!connectRes.ok) throw new Error(connectData.error || t("guac_connect_error"));

      const urlRes = await fetch("http://localhost:5000/api/guac-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: vm.name }),
      });
      const urlData = await urlRes.json();
      if (!urlRes.ok) throw new Error(urlData.error || t("url_error"));

      window.open(urlData.url, "_blank");
    } catch (err) {
      alert(t("guac_connection_failed") + ": " + err.message);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowCreate(false);
        setShowDelete(false);
        setShowHelp(false);
        setShowSettings(false);
        setShowSnapshots(false);
        clearContextMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDeleteConfirm = (vmName) => {
    if (vmName) {
      setDeleteTarget(vmName);
      setShowDelete(true);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden relative ${
        darkMode ? "bg-gray-950 text-white" : "bg-white"
      }`}
      onClick={clearContextMenu}
    >
      <MainMenu
        onOpenCreate={() => setShowCreate(true)}
        onToggleHelp={() => setShowHelp(true)}
        onToggleDeleteMode={() => setShowDelete(true)}
        onToggleView={() => setDarkMode((prev) => !prev)}
        isDeleteMode={showDelete}
        darkMode={darkMode}
      />

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`w-[300px] min-w-[300px] border-r border-gray-400 overflow-hidden ${
            darkMode ? "bg-gray-900" : "bg-white"
          }`}
        >
          <MyComputerPanel machines={machines} darkMode={darkMode} />
        </div>

        <div className="relative flex-1 bg-gray-100">
          <UnifiedMap
            machines={machines}
            positions={positions}
            setPositions={setPositions}
            onRightClick={handleRightClick}
            onDoubleClick={handleDoubleClick}
            onDeleteConfirm={handleDeleteConfirm}
            hostPosition={hostPosition}
            setHostPosition={setHostPosition}
            internetPosition={internetPosition}
            setInternetPosition={setInternetPosition}
            showDelete={showDelete}
            darkMode={darkMode}
          />
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          vm={contextMenu.vm}
          onStart={(vmName) => sendVMAction(vmName, "start")}
          onStop={(vmName) => sendVMAction(vmName, "stop")}
          onSnapshot={(vmName) => sendVMAction(vmName, "snapshot")}
          onDelete={(vmName) => {
            setDeleteTarget(vmName);
            setShowDelete(true);
            clearContextMenu();
          }}
          onSettings={(vm) => {
            handleOpenSettings(vm);
            clearContextMenu();
          }}
          onViewSnapshots={(vm) => {
            setSelectedVM(vm);
            setShowSnapshots(true);
            clearContextMenu();
          }}
          onClose={clearContextMenu}
          darkMode={darkMode}
        />
      )}

      <CreateVMModal
        visible={showCreate}
        onClose={() => {
          setShowCreate(false);
          refresh();
        }}
        onSuccess={refresh}
        darkMode={darkMode}
      />

      <DeleteVMModal
        visible={showDelete}
        vmToDelete={deleteTarget}
        onCancel={exitDeleteMode}
        onConfirm={() => {
          if (!deleteTarget) return;
          fetch(`http://localhost:5000/api/delete/${deleteTarget}`, {
            method: "DELETE",
          })
            .then(() => refresh())
            .catch(console.error);
          exitDeleteMode();
        }}
        darkMode={darkMode}
      />

      <HelpModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        darkMode={darkMode}
      />

      <VMSettingsModal
        visible={showSettings}
        vm={selectedVM}
        onClose={() => setShowSettings(false)}
        onSave={refresh}
        darkMode={darkMode}
      />

      <SnapshotModal
        visible={showSnapshots}
        onClose={() => setShowSnapshots(false)}
        onRefresh={refresh}
        vm={selectedVM}
        darkMode={darkMode}
      />
    </div>
  );
}