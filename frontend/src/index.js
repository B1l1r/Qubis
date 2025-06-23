import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import VirtualBoxUI from "./components/VirtualBoxUI";
import { I18nProvider } from "./i18n"; // ✅ i18n dosyasından çeviri sağlayıcısı eklendi

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <I18nProvider>
      <VirtualBoxUI />
    </I18nProvider>
  </React.StrictMode>
);
