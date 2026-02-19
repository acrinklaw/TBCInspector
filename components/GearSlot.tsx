"use client";
/* eslint-disable @next/next/no-img-element */
import { EquippedItem } from "@/lib/blizzard";
import { useState } from "react";

const QUALITY_COLORS: Record<string, string> = {
  POOR: "border-neutral-500 text-neutral-400",
  COMMON: "border-neutral-300 text-neutral-200",
  UNCOMMON: "border-green-500 text-green-400",
  RARE: "border-blue-500 text-blue-400",
  EPIC: "border-purple-500 text-purple-400",
  LEGENDARY: "border-orange-500 text-orange-400",
  ARTIFACT: "border-amber-400 text-amber-300",
  HEIRLOOM: "border-sky-400 text-sky-300",
};

const QUALITY_BG: Record<string, string> = {
  POOR: "bg-neutral-500/10",
  COMMON: "bg-neutral-300/10",
  UNCOMMON: "bg-green-500/10",
  RARE: "bg-blue-500/10",
  EPIC: "bg-purple-500/10",
  LEGENDARY: "bg-orange-500/10",
  ARTIFACT: "bg-amber-400/10",
  HEIRLOOM: "bg-sky-400/10",
};

const QUALITY_BORDER_ICON: Record<string, string> = {
  POOR: "ring-neutral-500/50",
  COMMON: "ring-neutral-400/50",
  UNCOMMON: "ring-green-500/60",
  RARE: "ring-blue-500/60",
  EPIC: "ring-purple-500/60",
  LEGENDARY: "ring-orange-500/60",
  ARTIFACT: "ring-amber-400/60",
  HEIRLOOM: "ring-sky-400/60",
};

const SOCKET_STYLES: Record<string, { border: string; bg: string; shadow: string }> = {
  META: { border: "#a1a1aa", bg: "rgba(161,161,170,0.3)", shadow: "0 0 4px rgba(161,161,170,0.6)" },
  RED: { border: "#ef4444", bg: "rgba(239,68,68,0.3)", shadow: "0 0 4px rgba(239,68,68,0.6)" },
  BLUE: { border: "#3b82f6", bg: "rgba(59,130,246,0.3)", shadow: "0 0 4px rgba(59,130,246,0.6)" },
  YELLOW: { border: "#facc15", bg: "rgba(250,204,21,0.3)", shadow: "0 0 4px rgba(250,204,21,0.6)" },
  DEFAULT: { border: "#737373", bg: "rgba(115,115,115,0.3)", shadow: "0 0 4px rgba(115,115,115,0.6)" },
};

const SLOT_LABELS: Record<string, string> = {
  HEAD: "Head",
  NECK: "Neck",
  SHOULDER: "Shoulder",
  SHIRT: "Shirt",
  CHEST: "Chest",
  WAIST: "Waist",
  LEGS: "Legs",
  FEET: "Feet",
  WRIST: "Wrist",
  HANDS: "Hands",
  FINGER_1: "Ring 1",
  FINGER_2: "Ring 2",
  TRINKET_1: "Trinket 1",
  TRINKET_2: "Trinket 2",
  BACK: "Back",
  MAIN_HAND: "Main Hand",
  OFF_HAND: "Off Hand",
  RANGED: "Ranged",
  TABARD: "Tabard",
};

export default function GearSlot({
  item,
  slotType,
}: {
  item: EquippedItem | null;
  slotType: string;
}) {
  const [imgError, setImgError] = useState(false);
  const label = SLOT_LABELS[slotType] ?? slotType;

  if (!item) {
    return (
      <div className="border border-neutral-700/50 rounded-lg bg-neutral-800/30 p-3 flex items-center gap-3 min-h-[72px]">
        <div className="w-10 h-10 rounded bg-neutral-800 border border-neutral-700/50 shrink-0" />
        <span className="text-[11px] text-neutral-600 uppercase tracking-wider">
          {label}
        </span>
      </div>
    );
  }

  const quality = item.quality?.type ?? "COMMON";
  const colors = QUALITY_COLORS[quality] ?? QUALITY_COLORS.COMMON;
  const bg = QUALITY_BG[quality] ?? QUALITY_BG.COMMON;
  const iconRing = QUALITY_BORDER_ICON[quality] ?? QUALITY_BORDER_ICON.COMMON;

  return (
    <a
      href={`https://www.wowhead.com/tbc/item=${item.item.id}`}
      target="_blank"
      rel="noreferrer"
      data-wowhead={`item=${item.item.id}&domain=tbc`}
      className={`flex items-center gap-3 border rounded-lg p-3 ${colors} ${bg} hover:brightness-125 transition-all duration-150 min-h-[72px]`}
    >
      {item.icon && !imgError ? (
        <img
          src={item.icon}
          alt=""
          width={40}
          height={40}
          onError={() => setImgError(true)}
          className={`w-10 h-10 rounded ring-2 ${iconRing} shrink-0`}
        />
      ) : (
        <div className={`w-10 h-10 rounded ring-2 ${iconRing} bg-neutral-800 shrink-0 flex items-center justify-center text-neutral-500 text-lg`}>?</div>
      )}
      <div className="min-w-0">
        <div className="text-[11px] text-neutral-500 uppercase tracking-wider mb-0.5">
          {label}
        </div>
        <div className="font-medium text-sm leading-tight truncate">{item.name}</div>
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          {item.enchantments?.map((ench, i) => (
            <span key={i} className="text-[11px] text-green-400 truncate">
              {ench.display_string}
            </span>
          ))}
          {item.sockets?.length ? (
            <span className="flex items-center gap-1 ml-0.5" title={item.socketBonus ?? undefined}>
              {item.sockets.map((socket, i) => {
                const s = SOCKET_STYLES[socket.type.toUpperCase()] ?? SOCKET_STYLES.DEFAULT;
                const isMeta = socket.type.toLowerCase() === "meta";
                return (
                  <span
                    key={i}
                    title={socket.name}
                    className={`inline-block ${isMeta ? "w-3.5 h-2.5" : "w-2.5 h-2.5"}`}
                    style={{
                      transform: isMeta ? undefined : "rotate(45deg)",
                      borderRadius: isMeta ? "50% / 40%" : "1px",
                      border: `1.5px solid ${s.border}`,
                      background: `radial-gradient(ellipse at 35% 35%, ${s.border}88, ${s.bg})`,
                      boxShadow: s.shadow,
                    }}
                  />
                );
              })}
            </span>
          ) : null}
        </div>
      </div>
    </a>
  );
}
