"use client";

import { useState } from "react";
import type { GearWarning } from "@/lib/blizzard";

function WarningRow({ icon, color, warning }: { icon: string; color: string; warning: GearWarning }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className={`${color} shrink-0 mt-0.5`}>{icon}</span>
      <span className={color.replace("500", "200/80").replace("400", "300")}>
        {warning.item && (
          <span className={color.replace("500", "100").replace("400", "200") + " font-medium"}>
            {warning.item}:{" "}
          </span>
        )}
        {warning.message}
      </span>
    </div>
  );
}

function AggregatedGroup({
  warnings,
  label,
  icon,
  color,
}: {
  warnings: GearWarning[];
  label: string;
  icon: string;
  color: string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (warnings.length <= 2) {
    return (
      <>
        {warnings.map((w, i) => (
          <WarningRow key={i} icon={icon} color={color} warning={w} />
        ))}
      </>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-start gap-2 text-sm cursor-pointer hover:brightness-125 transition-all`}
      >
        <span className={`${color} shrink-0 mt-0.5`}>{icon}</span>
        <span className={color.replace("500", "200/80").replace("400", "300")}>
          {label} ({warnings.length} items)
        </span>
        <svg
          className={`w-3.5 h-3.5 mt-0.5 shrink-0 transition-transform duration-150 ${color} ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="ml-6 mt-1 space-y-1">
          {warnings.map((w, i) => (
            <div key={i} className="text-sm text-yellow-200/60">
              {w.item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WarningPanel({ warnings }: { warnings: GearWarning[] }) {
  if (warnings.length === 0) return null;

  const errors = warnings.filter((w) => w.severity === "error");
  const enchantWarns = warnings.filter((w) => w.severity === "warning" && w.type === "missing_enchant");
  const otherWarns = warnings.filter((w) => w.severity === "warning" && w.type !== "missing_enchant");

  return (
    <div className="wow-panel border-red-900/50 bg-red-950/20 p-4 space-y-3">
      <h3 className="font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-red-400 flex items-center gap-2">
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        {warnings.length} Red Flag{warnings.length !== 1 ? "s" : ""}
      </h3>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((w, i) => (
            <WarningRow key={i} icon="&#x2716;" color="text-red-400" warning={w} />
          ))}
        </div>
      )}

      {enchantWarns.length > 0 && (
        <div className="space-y-1">
          <AggregatedGroup
            warnings={enchantWarns}
            label="Missing enchants"
            icon="&#x26A0;"
            color="text-yellow-500"
          />
        </div>
      )}

      {otherWarns.length > 0 && (
        <div className="space-y-1">
          {otherWarns.map((w, i) => (
            <WarningRow key={i} icon="&#x26A0;" color="text-yellow-500" warning={w} />
          ))}
        </div>
      )}
    </div>
  );
}
