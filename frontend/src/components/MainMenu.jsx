import React, { useEffect } from "react";
import { useTranslation } from "../i18n"; // ✅ kendi custom hook'un
import trFlag from "../assets/tr-flag.png";
import enFlag from "../assets/en-flag.jpg";

export default function MainMenu({
  onOpenCreate,
  onToggleDeleteMode,
  onToggleHelp,
  onToggleView,
  isDeleteMode,
  darkMode,
}) {
  const { t, lang, setLang } = useTranslation(); // ✅ i18n yerine kendi hook'un

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleLanguage = () => {
    setLang(lang === "tr" ? "en" : "tr");
  };

  return (
    <div
      className={`flex items-center p-2 space-x-4 border-b shadow-md select-none z-50 transition-all duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      {/* ➕ VM Oluştur */}
      <button
        className="px-4 py-1 rounded hover:bg-gray-700 dark:hover:bg-gray-800 transition"
        onClick={onOpenCreate}
        title={t("yeni_vm")}
      >
        ➕ <span className="ml-1">{t("ekle")}</span>
      </button>

      {/* 🗑️ Silme Modu */}
      <button
        className={`px-4 py-1 rounded transition flex items-center space-x-1 ${
          isDeleteMode
            ? "bg-red-700 text-white shadow-md"
            : "hover:bg-gray-700 dark:hover:bg-gray-800"
        }`}
        onClick={onToggleDeleteMode}
        title={t("silme_modu")}
      >
        <span>🗑️</span>
        <span>{t("sil")}</span>
        {isDeleteMode && (
          <span className="ml-2 text-xs bg-white text-red-700 px-2 rounded-full">
            {t("aktif")}
          </span>
        )}
      </button>

      {/* 👁️ Görünüm (Dark/Light) */}
      <button
        className="px-4 py-1 hover:bg-gray-700 dark:hover:bg-gray-800 rounded transition"
        onClick={onToggleView}
        title={t("tema")}
      >
        {darkMode ? "🌙" : "☀️"} <span className="ml-1">{t("tema")}</span>
      </button>
      

      {/* ❓ Yardım */}
      <button
        className="ml-auto px-4 py-1 hover:bg-gray-700 dark:hover:bg-gray-800 rounded transition"
        onClick={onToggleHelp}
        title={t("yardım_penceresi")}
      >
        ❓ <span className="ml-1">{t("yardım")}</span>
      </button>
      <div className="flex-grow" />
      {/* 🌐 Dil Değiştirici */}
      <button
        onClick={toggleLanguage}
        title="Change Language"
        className="ml-2 px-2 py-1 rounded hover:bg-gray-700 dark:hover:bg-gray-800 transition flex items-center"
      >
        <img
          src={lang === "tr" ? enFlag : trFlag}
          alt="Dil"
          className="w-14 h-10"
        />
      </button>
    </div>
  );
}
