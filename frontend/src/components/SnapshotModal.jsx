import React, { useEffect, useState } from "react";
import { useTranslation } from "../i18n";

export default function SnapshotModal({ visible, onClose, vm, onRefresh, darkMode = false }) {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (visible && vm) {
      fetchSnapshots(vm.name);
    }
  }, [visible, vm]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    if (visible) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, onClose]);

  const fetchSnapshots = async (vmName) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/api/vm/${vmName}/snapshots`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("snapshot_yükleme_hatası"));
      setSnapshots(data.snapshots || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (snapshotName) => {
    if (!window.confirm(`${t("geri_yükle_onay")} "${snapshotName}"?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/vm/${vm.name}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot: snapshotName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("geri_yükleme_hatası"));
      alert(`✅ ${t("geri_yüklendi")}: ${snapshotName}`);
      onClose();
      onRefresh();
    } catch (err) {
      alert(`❌ ${err.message}`);
    }
  };

  if (!visible || !vm) return null;

  const modalClasses = darkMode
    ? "bg-gray-900 text-white border border-gray-700"
    : "bg-white text-black border border-gray-200";

  const listItemBg = darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const errorText = darkMode ? "text-red-400" : "text-red-600";

  return (
    <div className="modal-overlay backdrop-blur-sm bg-black/60">
      <div className={`rounded-lg shadow-lg p-6 w-[400px] max-h-[80vh] overflow-y-auto ${modalClasses}`}>
        <h2 className="text-xl font-bold mb-4">📸 {vm.name} - {t("snapshotlar")}</h2>

        {loading && <p>{t("yükleniyor")}</p>}
        {error && <p className={`${errorText} text-sm`}>{error}</p>}

        {snapshots.length === 0 && !loading ? (
          <p className={`${textMuted}`}>{t("snapshot_bulunamadı")}</p>
        ) : (
          <ul className="space-y-2">
            {snapshots.map((snap) => (
              <li key={snap} className={`flex justify-between items-center px-3 py-2 rounded-md transition ${listItemBg}`}>
                <span className="text-sm font-medium truncate">{snap}</span>
                <button className="text-blue-400 hover:underline text-sm" onClick={() => handleRestore(snap)}>
                  {t("geri_yükle")}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 text-right">
          <button className="px-4 py-1 bg-gray-700 text-white rounded hover:bg-gray-800" onClick={onClose}>
            {t("kapat")}
          </button>
        </div>
      </div>
    </div>
  );
}
