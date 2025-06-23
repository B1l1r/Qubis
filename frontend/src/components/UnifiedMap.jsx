import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import windowsIcon from "../assets/windows-icon.png";
import cloudIcon from "../assets/internet.png";
import qubisBg from "../assets/qubis_bg.png";
import { useTranslation } from "../i18n";

export default function UnifiedMap({
  machines,
  positions,
  setPositions,
  hostPosition,
  setHostPosition,
  internetPosition,
  setInternetPosition,
  onRightClick,
  onDoubleClick,
  darkMode,
  showDelete,
  onDeleteConfirm,
}) {
  const { t } = useTranslation();
  const outerRef = useRef(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const [internetOnline, setInternetOnline] = useState(false);
  const [machineStates, setMachineStates] = useState({});
  const [initialLayoutDone, setInitialLayoutDone] = useState(false);

  const safeMachines = Array.isArray(machines) ? machines : [];

  const computeGridPosition = (index, startX, startY, maxPerRow, xGap = 160, yGap = 130) => {
    const col = index % maxPerRow;
    const row = Math.floor(index / maxPerRow);
    return {
      x: startX + col * xGap,
      y: startY + row * yGap,
    };
  };

  useEffect(() => {
    if (safeMachines.length > 0) {
      const updatedPositions = {};
      const centerX = Math.floor(window.innerWidth / 2) - 60;

      safeMachines.forEach((vm, i) => {
        const oldName = Object.keys(positions).find((key) => vm.oldName && key === vm.oldName);
        if (oldName && positions[oldName]) {
          updatedPositions[vm.name] = positions[oldName];
        } else if (positions[vm.name]) {
          updatedPositions[vm.name] = positions[vm.name];
        } else {
          const isBridged = vm.adapterType?.toLowerCase().includes("bridged");
          updatedPositions[vm.name] = computeGridPosition(
            i,
            isBridged ? centerX - 750 : centerX - 50,
            isBridged ? 400 : 500,
            6
          );
        }
      });

      setPositions(updatedPositions);
      if (!initialLayoutDone) {
        setInternetPosition({ x: centerX - 250, y: 0 });
        setHostPosition({ x: centerX + 100, y: 250 });
        setInitialLayoutDone(true);
      }
    }
  }, [safeMachines]);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/internet-status");
        const data = await res.json();
        setInternetOnline(data.online);
      } catch {
        setInternetOnline(false);
      }

      const stateMap = {};
      safeMachines.forEach((vm) => {
        stateMap[vm.name] = vm.ipValid;
      });
      setMachineStates(stateMap);
    };

    fetchStatuses();
    const interval = setInterval(fetchStatuses, 5000);
    return () => clearInterval(interval);
  }, [machines]);

  const handleMouseDown = (e) => {
    if (e.target.closest(".draggable-box")) return;
    if (e.button !== 0) return;
    setIsDraggingMap(true);
    setDragOffset({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDraggingMap || !outerRef.current) return;
    const dx = e.clientX - dragOffset.x;
    const dy = e.clientY - dragOffset.y;
    outerRef.current.scrollLeft -= dx;
    outerRef.current.scrollTop -= dy;
    setDragOffset({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDraggingMap(false);

  const getCenter = (pos) => ({
    x: pos.x + 60,
    y: pos.y + 50,
  });

  const bgClass = darkMode ? "bg-gray-800" : "bg-gray-100";

  return (
    <div className={`flex-1 relative ${bgClass} z-10 select-none`}>
      <div
        ref={outerRef}
        className="relative w-full h-full overflow-auto border border-black"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div className="network-canvas relative">
          <img
            src={qubisBg}
            alt="Background Logo"
            className="absolute top-10/10 left-10/10 -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none w-[500px] select-none z-0"
          />

          <svg className="network-lines">
            <line
              {...getLineProps(
                getCenter(hostPosition),
                getCenter(internetPosition),
                "host-internet-line",
                internetOnline ? "" : "offline"
              )}
            />
            {safeMachines.map((vm) => {
              const vmPos = positions[vm.name];
              if (!vmPos || !vm.adapterType) return null;

              const isBridged = vm.adapterType.toLowerCase().includes("bridged");
              const target = isBridged ? internetPosition : hostPosition;
              const strokeWidth = vm.bandwidth ? Math.max(2, vm.bandwidth / 10) : 2;

              const ipOk = machineStates[vm.name] !== false;
              const modifier = isBridged && !ipOk ? "offline" : "";

              return (
                <line
                  key={vm.name}
                  {...getLineProps(
                    getCenter(vmPos),
                    getCenter(target),
                    `network-line ${vm.adapterType.toLowerCase().replace(/\s/g, "-")}`,
                    modifier,
                    strokeWidth
                  )}
                >
                  <title>{`${vm.name} → ${isBridged ? t("internet") : t("host_os")}`}</title>
                </line>
              );
            })}
          </svg>

          {/* Host */}
          <Draggable position={hostPosition} onDrag={(e, d) => setHostPosition({ x: d.x, y: d.y })} bounds="parent">
            <div className="draggable-box shadow-md rounded-lg px-2 py-1 hover:shadow-2xl transition">
              <img src={windowsIcon} alt="Windows" className="w-14 h-14 mx-auto" draggable={false} />
              <div className="text-sm font-medium dark:text-white text-black">{t("host_os")}</div>
            </div>
          </Draggable>

          {/* Internet */}
          <Draggable position={internetPosition} onDrag={(e, d) => setInternetPosition({ x: d.x, y: d.y })} bounds="parent">
            <div className="draggable-box shadow-md rounded-lg px-2 py-1 hover:shadow-2xl transition">
              <img src={cloudIcon} alt="Internet" className="w-14 h-14 mx-auto" draggable={false} />
              <div className="text-sm font-medium dark:text-white text-black">{t("internet")}</div>
            </div>
          </Draggable>

          {/* VM icons */}
          {safeMachines.map((vm, i) => {
            const pos = positions[vm.name] || { x: 400 + i * 140, y: 300 };
            const ipText = vm.ipValid ? vm.ip : t("ip_unknown");

            const handleClick = () => {
              if (showDelete && onDeleteConfirm) {
                onDeleteConfirm(vm.name);
              }
            };

            return (
              <Draggable
                key={vm.name}
                position={pos}
                onDrag={(e, d) =>
                  setPositions((prev) => ({
                    ...prev,
                    [vm.name]: { x: d.x, y: d.y },
                  }))
                }
                bounds="parent"
                disabled={showDelete}
              >
                <div
                  className="draggable-box shadow-md rounded-lg px-2 py-1 hover:shadow-2xl transition"
                  onContextMenu={(e) => onRightClick(e, vm)}
                  onDoubleClick={() => onDoubleClick?.(vm)}
                  onClick={handleClick}
                  title={`VM: ${vm.name}\nAdapter: ${vm.adapterType || "N/A"}\nIP: ${ipText}`}
                >
                  <div className="text-4xl">💻</div>
                  <div className="text-sm font-semibold truncate w-[100px] mx-auto dark:text-white text-black">
                    {vm.name}
                  </div>
                  {vm.networkInfo && (
                    <div className="text-xs mt-1 truncate text-gray-500 dark:text-gray-300">{vm.networkInfo}</div>
                  )}
                  <div className="text-xs italic mt-1 truncate text-gray-400 dark:text-gray-300">🌐 {ipText}</div>
                </div>
              </Draggable>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getLineProps(from, to, baseClass = "", modifier = "", strokeWidth = 2) {
  return {
    x1: from.x,
    y1: from.y,
    x2: to.x,
    y2: to.y,
    strokeWidth,
    className: `${baseClass} ${modifier}`.trim(),
  };
}
