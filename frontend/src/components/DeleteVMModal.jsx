import React, { useEffect } from "react";
import { useTranslation } from "../i18n"; // ✅ i18n hook

export default function DeleteVMModal({ visible, vmToDelete, onCancel, onConfirm, darkMode = false }) {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel?.();
      }
    };

    if (visible) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, onCancel]);

  if (!visible || !vmToDelete) return null;

  const modalClasses = darkMode
    ? "bg-gray-800 text-white border-gray-700"
    : "bg-white text-black border-gray-200";

  const buttonCancelClasses = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-white"
    : "bg-gray-300 hover:bg-gray-400 text-black";

  const buttonConfirmClasses = darkMode
    ? "bg-red-700 hover:bg-red-800 text-white"
    : "bg-red-600 hover:bg-red-700 text-white";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
      <div className={`rounded-xl shadow-xl p-6 w-[400px] ${modalClasses}`}>
        <h2 className="text-lg font-semibold mb-4 text-center text-red-600">
          “{vmToDelete}” {t("silme_onayı")}
        </h2>
        <div className="flex justify-center space-x-4">
          <button
            className={`px-4 py-2 rounded ${buttonCancelClasses}`}
            onClick={onCancel}
          >
            ✖ {t("hayır_iptal")}
          </button>
          <button
            className={`px-4 py-2 rounded ${buttonConfirmClasses}`}
            onClick={() => onConfirm(vmToDelete)}
          >
            ✔ {t("evet_sil")}
          </button>
        </div>
      </div>
    </div>
  );
}
