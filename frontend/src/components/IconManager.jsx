import React from "react";
import Draggable from "react-draggable";
import windowsIcon from "../assets/windows-icon.png";
import cloudIcon from "../assets/internet.png";
import { useTranslation } from "../i18n";

/**
 * Bu bileşen, harita üzerinde sabit iki önemli simgeyi gösterir:
 * - Windows (Host OS)
 * - İnternet (Cloud)
 * 
 * Simgeler draggable'dır ve `onDragStop` ile parent'a konum bildirir.
 */
export default function IconManager({ hostPosition, internetPosition, onHostDrag, onInternetDrag }) {
  return (
    <>
      {/* Windows Host OS Simgesi */}
      <Draggable
        position={hostPosition}
        onStop={(e, data) => onHostDrag({ x: data.x, y: data.y })}
        bounds="parent"
      >
        <div className="absolute text-center cursor-move select-none z-[1000]">
          <img src={windowsIcon} className="w-14 h-14 mx-auto" alt="Host OS" />
          <span className="text-black text-sm font-medium">Windows (Host OS)</span>
        </div>
      </Draggable>

      {/* İnternet Bulut Simgesi */}
      <Draggable
        position={internetPosition}
        onStop={(e, data) => onInternetDrag({ x: data.x, y: data.y })}
        bounds="parent"
      >
        <div className="absolute text-center cursor-move select-none z-[1000]">
          <img src={cloudIcon} className="w-14 h-14 mx-auto" alt="Internet" />
          <span className="text-black text-sm font-medium">İnternet</span>
        </div>
      </Draggable>
    </>
  );
}