import React, { useEffect } from "react";
import { useTranslation } from "../i18n"; // i18n hook

export default function HelpModal({ visible, onClose, darkMode = false }) {
  const { t } = useTranslation();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    if (visible) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const modalClasses = darkMode
    ? "bg-gray-800 text-white border border-gray-700"
    : "bg-white text-black border border-gray-200";

  const sectionTitleClasses = darkMode ? "text-blue-400" : "text-blue-700";
  const nestedBg = darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-50 text-gray-600";

  return (
    <div className="modal-overlay">
      <div className={`p-6 rounded-xl shadow-xl w-full max-w-2xl relative ${modalClasses}`}>
        <h2 className="text-xl font-bold text-center mb-4">📘 {t("yardım_paneli")}</h2>

        <div className="space-y-6 text-sm">
          <section>
            <h3 className={`font-semibold text-lg mb-2 ${sectionTitleClasses}`}>🧭 {t("genel_kullanım")}</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t("vm_sürükleme")}</li>
              <li>{t("sağ_tık_menü")}</li>
              <li>{t("yeni_vm_oluşturma")}</li>
              <li>{t("silme_modu_açıklama")}</li>
              <li>{t("tema_değiştir")}</li>
              <li>{t("rdp_bağlantısı")}</li>
              <li>{t("esc_kapat")}</li>
            </ul>
          </section>

          <section>
            <h3 className={`font-semibold text-lg mb-2 ${sectionTitleClasses}`}>🌐 {t("ağ_tipi_başlık")}</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>NAT:</strong> <span className="text-gray-400">{t("nat_açıklama")}</span></li>
              <li><strong>NAT Network:</strong> <span className="text-gray-400">{t("natnetwork_açıklama")}</span></li>
              <li><strong>Bridged Adapter:</strong> <span className="text-gray-400">{t("bridged_açıklama")}</span></li>
            </ul>
          </section>

          <section>
            <h3 className={`font-semibold text-lg mb-2 ${sectionTitleClasses}`}>💡 {t("ekstra_bilgi")}</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t("vm_simgeleri_sürüklenebilir")}</li>
              <li>{t("harita_sürükleme")}</li>
              <li>{t("otomatil_güncelleme")}</li>
              <li>{t("tema_geçiş_uyumu")}</li>
              <li>{t("kısayol_bilgi")}</li>
              <div className={`mt-2 ml-4 p-2 border rounded text-xs ${nestedBg}`}>
                <p>{t("kısayol_sağ_tık")}</p>
                <p>{t("kısayol_çift_tık")}</p>
                <p>{t("kısayol_ekle")}</p>
                <p>{t("kısayol_esc")}</p>
              </div>
            </ul>
          </section>
        </div>

        <div className="flex justify-end mt-6">
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            onClick={onClose}
          >
            {t("kapat")}
          </button>
        </div>
      </div>
    </div>
  );
}
