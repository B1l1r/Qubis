import React, { useEffect, useState } from "react";
import { useTranslation } from "../i18n"; 

export default function CreateVMModal({ visible, onClose, onSuccess, darkMode }) {
  const { t } = useTranslation(); 
  const [formData, setFormData] = useState({
    name: "",
    ram: "",
    cpu: "",
    disk: "",
    iso: null,
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

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

  if (!visible) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "iso") {
      setFormData({ ...formData, iso: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name) errs.name = t("hata_vm_adı_gerekli");
    if (!formData.ram || parseInt(formData.ram) < 4)
      errs.ram = t("hata_min_ram");
    if (!formData.cpu || parseInt(formData.cpu) < 1)
      errs.cpu = t("hata_min_cpu");
    if (!formData.disk || parseInt(formData.disk) < 100)
      errs.disk = t("hata_min_disk");
    if (!formData.iso) errs.iso = t("hata_iso_gerekli");
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      const res1 = await fetch("http://localhost:5000/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          ram: formData.ram,
          cpu: formData.cpu,
          disk: formData.disk,
        }),
      });
      const data1 = await res1.json();
      if (!res1.ok) throw new Error(data1.error);

      const fd = new FormData();
      fd.append("iso", formData.iso);
      fd.append("name", formData.name);

      const res2 = await fetch("http://localhost:5000/api/upload_iso", {
        method: "POST",
        body: fd,
      });
      const data2 = await res2.json();
      if (!res2.ok) throw new Error(data2.error);

      setMessage(t("vm_olusturuldu"));
      setFormData({ name: "", ram: "", cpu: "", disk: "", iso: null });
      setErrors({});
      onSuccess?.();
      onClose();
    } catch (err) {
      setMessage(err.message || t("bir_hata_olustu"));
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className={`w-[420px] rounded-xl shadow-lg relative p-6 border ${
          darkMode
            ? "bg-[#1e293b] text-white border-gray-600"
            : "bg-white text-black border-gray-300"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">{t("yeni_sanal_makine")}</h2>

        {message && (
          <p className="mb-2 text-sm text-red-600 dark:text-red-400">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {["name", "ram", "cpu", "disk"].map((field) => (
            <div key={field}>
              <input
                type={field === "name" ? "text" : "number"}
                name={field}
                placeholder={t(`placeholder_${field}`)}
                value={formData[field]}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${
                  darkMode
                    ? "bg-gray-800 text-white border-gray-600"
                    : "bg-white text-black border-gray-300"
                }`}
              />
              {errors[field] && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors[field]}</p>
              )}
            </div>
          ))}

          <div>
            <input
              type="file"
              name="iso"
              accept=".iso"
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                darkMode
                  ? "bg-gray-800 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
              }`}
            />
            {errors.iso && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.iso}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              className={`px-4 py-2 border rounded hover:bg-opacity-80 ${
                darkMode
                  ? "text-white border-gray-500 hover:bg-gray-700"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
              onClick={onClose}
            >
              ✖ {t("iptal")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ✔ {t("oluştur")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
