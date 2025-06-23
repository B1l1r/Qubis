import React, { useState, useEffect } from "react";
import { useTranslation } from "../i18n";

export default function VMSettingsModal({ visible, vm, onClose, onSave, darkMode = false }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    subtype: "",
    ram: "",
    cpu: "",
    disk: "",
    network: "",
  });

  const [activeTab, setActiveTab] = useState("general");
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const labelMap = {
    ostype: t("os_type"),
    cpus: t("cpu_count"),
    memory: t("ram_mb"),
    vram: t("video_ram"),
    firmware: t("firmware"),
    graphicscontroller: t("graphics_controller"),
    usb: t("usb_support"),
    audio: t("audio"),
    nic1: t("network_adapter"),
    vrde: t("vrde"),
    "nested-hw-virt": t("nested_virtualization"),
    boot1: t("boot_order"),
  };

  useEffect(() => {
    if (visible && vm) {
      setFormData({
        name: vm.name || "",
        description: vm.description || "",
        type: vm.type || "",
        subtype: vm.subtype || "",
        ram: vm.ram?.toString() || "",
        cpu: vm.cpu?.toString() || "",
        disk: vm.disk?.toString() || "",
        network: vm.network || "",
      });
      fetchDetails(vm.name);
    }
  }, [vm, visible]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    if (visible) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, onClose]);

  const fetchDetails = async (vmName) => {
    setLoadingDetails(true);
    try {
      const res = await fetch(`http://localhost:5000/api/vm/${vmName}/details`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      setDetails(data);
    } catch (err) {
      console.error("Detail fetch error:", err);
      setDetails({ error: err.message });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/vm/${vm.name}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSave();
        onClose();
      } else {
        const error = await res.json();
        alert(t("update_failed") + ": " + (error.message || error.error || t("unknown_error")));
      }
    } catch (err) {
      console.error("Update error:", err);
      alert(t("server_error"));
    }
  };

  if (!visible || !vm) return null;

  const modalClasses = darkMode
    ? "bg-gray-900 text-white border border-gray-700"
    : "bg-white text-black border border-gray-200";

  const inputClasses = darkMode
    ? "bg-gray-800 text-white border-gray-600"
    : "bg-white text-black border-gray-300";

  const hintClasses = "text-xs text-gray-400 italic truncate";
  const tabActive = "bg-blue-600 text-white";
  const tabInactive = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
    : "bg-gray-200 hover:bg-gray-300 text-gray-800";

  const renderWithHint = (name, label, placeholder) => (
    <div>
      <input
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full p-2 rounded border ${inputClasses}`}
      />
      {details?.[name] && (
        <div className={hintClasses}>{t("current_value")}: {details[name]}</div>
      )}
    </div>
  );

  return (
    <div className="modal-overlay backdrop-blur-sm bg-black/60">
      <div className={`rounded-lg shadow-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto ${modalClasses}`}>
        <h2 className="text-xl font-bold mb-4 text-center">“{vm.name}” {t("settings")}</h2>

        <div className="flex justify-center space-x-3 mb-4 border-b pb-2">
          {["general", "hardware", "network", "info"].map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                activeTab === tab ? tabActive : tabInactive
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {t(tab)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {activeTab === "general" && (
            <>
              {renderWithHint("name", t("machine_name"), t("machine_name"))}
              {renderWithHint("description", t("description"), t("description"))}
              <div className="flex space-x-2">
                <div className="w-1/2">{renderWithHint("type", t("type"), t("type"))}</div>
                <div className="w-1/2">{renderWithHint("subtype", t("subtype"), t("subtype"))}</div>
              </div>
            </>
          )}

          {activeTab === "hardware" && (
            <>
              <label className="text-sm opacity-80">{t("ram_mb")}</label>
              {renderWithHint("ram", t("ram"), t("ram"))}
              <label className="text-sm opacity-80">{t("cpu")}</label>
              {renderWithHint("cpu", t("cpu"), t("cpu"))}
              <label className="text-sm opacity-80">{t("disk_mb")}</label>
              {renderWithHint("disk", t("disk"), t("disk"))}
            </>
          )}

          {activeTab === "network" && (
            <>
              <label className="text-sm opacity-80">{t("network_type")}</label>
              <select
                name="network"
                value={formData.network}
                onChange={handleChange}
                className={`w-full p-2 rounded border ${inputClasses}`}
              >
                <option value="">{t("select")}</option>
                <option value="NAT">NAT</option>
                <option value="NAT Network">NAT Network</option>
                <option value="Bridged">Bridged</option>
              </select>
              {details?.network && <div className={hintClasses}>{t("current_value")}: {details.network}</div>}
            </>
          )}

          {activeTab === "info" && (
            <div className="text-sm space-y-2">
              {loadingDetails && <p>{t("loading")}</p>}
              {details && !loadingDetails && !details.error &&
                Object.entries(details).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b pb-1">
                    <span className="font-medium">{labelMap[key] || key}</span>
                    <span className="text-right opacity-70">{val}</span>
                  </div>
                ))}
              {details?.error && <p className="text-red-500">{details.error}</p>}
            </div>
          )}

          {activeTab !== "info" && (
            <div className="flex justify-between pt-4">
              <button type="button" onClick={onClose} className="text-red-500 hover:underline">
                ✖ {t("cancel")}
              </button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                ✔ {t("save")}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}