import React from "react";
import { useTranslation } from "../i18n";

export default function ContextMenu({
  x,
  y,
  vm,
  onStart,
  onStop,
  onSnapshot,
  onViewSnapshots,
  onDelete,
  onSettings,
  onClose,
  darkMode = false,
}) {
  const { t } = useTranslation(); 

  if (!vm || x === null || y === null) return null;

  const menuStyle = {
    top: y,
    left: x,
    zIndex: 9999,
  };

  const handleAction = (callback) => {
    if (typeof callback === "function") callback(vm.name);
    onClose();
  };

  const baseBg = darkMode
    ? "bg-gray-800 text-white border-gray-700"
    : "bg-white text-black border-gray-200";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100";

  return (
    <div
      className={`absolute rounded-md shadow-xl border w-44 animate-fade-in ${baseBg}`}
      style={menuStyle}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <MenuItem label={`▶ ${t("başlat")}`} onClick={() => handleAction(onStart)} hoverClass={hoverBg} />
      <MenuItem label={`⏻ ${t("kapat")}`} onClick={() => handleAction(onStop)} hoverClass={hoverBg} />
      <MenuItem label={`📸 ${t("snapshot_al")}`} onClick={() => handleAction(onSnapshot)} hoverClass={hoverBg} />
      <MenuItem
        label={`🧾 ${t("snapshotlar")}`}
        onClick={() => {
          onViewSnapshots?.(vm);
          onClose();
        }}
        hoverClass={hoverBg}
      />
      <MenuItem label={`🗑 ${t("sil")}`} onClick={() => handleAction(onDelete)} hoverClass={hoverBg} />
      <MenuItem
        label={`⚙ ${t("ayarlar")}`}
        onClick={() => {
          onSettings?.(vm);
          onClose();
        }}
        hoverClass={hoverBg}
      />
    </div>
  );
}

function MenuItem({ label, onClick, hoverClass }) {
  return (
    <div
      className={`p-2 text-sm cursor-pointer select-none transition ${hoverClass}`}
      onClick={onClick}
    >
      {label}
    </div>
  );
}
