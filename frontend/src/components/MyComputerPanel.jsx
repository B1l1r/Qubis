import React from "react";
import { useTranslation } from "../i18n";

export default function MyComputerPanel({ machines, darkMode }) {
  const { t } = useTranslation();
  const safeMachines = Array.isArray(machines) ? machines : [];

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "running":
        return "🟢";
      case "paused":
        return "🟡";
      case "powered off":
      default:
        return "🔴";
    }
  };

  const getAdapterLabel = (adapterType) => {
    switch (adapterType?.toLowerCase()) {
      case "nat":
        return t("adapter_nat");
      case "bridged":
        return t("adapter_bridged");
      case "nat-network":
        return t("adapter_nat_network");
      case "host-only":
        return t("adapter_host_only");
      default:
        return t("adapter_other");
    }
  };

  const formatIP = (vm) => {
    if (!vm.ipValid) return t("ip_unknown");
    return vm.ip || t("waiting_for_ip");
  };

  const bgColor = darkMode ? "bg-gray-900" : "bg-white";
  const textColor = darkMode ? "text-white" : "text-gray-800";
  const boxColor = darkMode
    ? "bg-gray-800 border-gray-700 text-white"
    : "bg-gray-100 border-gray-300 text-gray-900";
  const borderColor = darkMode ? "border-gray-400" : "border-gray-300";
  const labelColor = darkMode ? "text-gray-300" : "text-gray-600";
  const ipColor = darkMode ? "text-gray-400" : "text-gray-500";

  return (
    <div
      className={`w-[300px] min-w-[300px] max-w-[300px] h-full flex flex-col ${bgColor} p-4 border-r ${borderColor} shadow-inner select-none`}
    >
      <h2 className={`text-2xl font-bold mb-4 border-b pb-2 ${textColor} ${borderColor}`}>
        📂 {t("virtual_machines")}
      </h2>

      <div className="space-y-3 flex-1 overflow-hidden">
        {safeMachines.length === 0 ? (
          <p className={`${labelColor} text-base`}>{t("no_virtual_machines")}</p>
        ) : (
          safeMachines.map((vm) => (
            <div
              key={vm.id}
              className={`p-3 rounded-xl shadow-md hover:shadow-lg hover:bg-opacity-90 transition-all duration-200 border ${boxColor}`}
              title={vm.status === "running" ? `IP: ${vm.ip}` : t("vm_off")}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold truncate">{vm.name}</span>
                <span className="text-xl">{getStatusIcon(vm.status)}</span>
              </div>

              <div className={`text-sm mt-1 truncate ${labelColor}`}>
                {t("network")}: {getAdapterLabel(vm.adapterType)}
              </div>

              <div className={`text-xs mt-1 truncate ${ipColor}`}>
                🌐 IP: {formatIP(vm)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}