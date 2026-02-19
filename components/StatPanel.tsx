"use client";

import { useState } from "react";
import type { CharacterStats } from "@/lib/blizzard";

function StatRow({ label, value, color }: { label: string; value: string | number; color?: string }) {
  const formatted = typeof value === "number"
    ? (value % 1 !== 0 ? value.toFixed(2) : value.toLocaleString())
    : value;

  return (
    <div className="flex justify-between items-baseline py-[3px]">
      <span className="text-neutral-400 text-sm">{label}</span>
      <span className="text-sm font-medium tabular-nums" style={color ? { color } : undefined}>
        {formatted}
      </span>
    </div>
  );
}

function StatSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="wow-panel p-4">
      <h3 className="font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-amber-200/60 mb-3 pb-2 border-b border-amber-900/30">
        {title}
      </h3>
      {children}
    </div>
  );
}

const RESIST_COLORS: Record<string, string> = {
  Fire: "#ff4040",
  Nature: "#40ff40",
  Shadow: "#a040ff",
  Arcane: "#e0a0ff",
  Holy: "#ffe080",
};

export default function StatPanel({ stats }: { stats: CharacterStats }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-center gap-2 cursor-pointer font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-amber-200/60 hover:text-amber-200 transition-colors mb-4"
      >
        <span className="h-px flex-1 bg-amber-900/30" />
        <span>Stats</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        <span className="h-px flex-1 bg-amber-900/30" />
      </button>

      <div
        className={`grid grid-cols-2 lg:grid-cols-4 gap-3 overflow-hidden transition-all duration-300 ${
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
      {/* Resources */}
      <StatSection title="Resources">
        <StatRow label="Health" value={stats.health} color="#22c55e" />
        <StatRow label={stats.powerType} value={stats.power} color="#3b82f6" />
      </StatSection>

      {/* Base Attributes */}
      <StatSection title="Attributes">
        <StatRow label="Strength" value={stats.strength} />
        <StatRow label="Agility" value={stats.agility} />
        <StatRow label="Stamina" value={stats.stamina} />
        <StatRow label="Intellect" value={stats.intellect} />
        <StatRow label="Spirit" value={stats.spirit} />
      </StatSection>

      {/* Melee */}
      <StatSection title="Melee">
        <StatRow label="Attack Power" value={stats.attackPower} />
        <StatRow label="Crit" value={`${stats.meleeCrit.toFixed(2)}%`} />
        <StatRow label="Haste" value={`${stats.meleeHaste.toFixed(2)}%`} />
        {stats.mainHandDps > 0 && (
          <>
            <StatRow label="MH DPS" value={stats.mainHandDps.toFixed(1)} />
            <StatRow label="MH Dmg" value={`${stats.mainHandDamageMin}-${stats.mainHandDamageMax}`} />
            <StatRow label="MH Speed" value={stats.mainHandSpeed.toFixed(2)} />
          </>
        )}
        {stats.offHandDps > 0 && (
          <>
            <StatRow label="OH DPS" value={stats.offHandDps.toFixed(1)} />
            <StatRow label="OH Dmg" value={`${stats.offHandDamageMin}-${stats.offHandDamageMax}`} />
          </>
        )}
      </StatSection>

      {/* Spell */}
      <StatSection title="Spell">
        <StatRow label="Spell Power" value={stats.spellPower} />
        <StatRow label="Crit" value={`${stats.spellCrit.toFixed(2)}%`} />
        <StatRow label="Haste" value={`${stats.spellHaste.toFixed(2)}%`} />
        <StatRow label="Penetration" value={stats.spellPenetration} />
        <StatRow label="MP5" value={stats.manaRegen} />
        <StatRow label="MP5 (combat)" value={stats.manaRegenCombat} />
      </StatSection>

      {/* Defense */}
      <StatSection title="Defense">
        <StatRow label="Armor" value={stats.armor} />
        <StatRow label="Defense" value={stats.defense} />
        <StatRow label="Dodge" value={`${stats.dodge.toFixed(2)}%`} />
        <StatRow label="Parry" value={`${stats.parry.toFixed(2)}%`} />
        <StatRow label="Block" value={`${stats.block.toFixed(2)}%`} />
      </StatSection>

      {/* Resistances */}
      <StatSection title="Resistances">
        <StatRow label="Holy" value={stats.holyResistance} color={RESIST_COLORS.Holy} />
        <StatRow label="Fire" value={stats.fireResistance} color={RESIST_COLORS.Fire} />
        <StatRow label="Nature" value={stats.natureResistance} color={RESIST_COLORS.Nature} />
        <StatRow label="Shadow" value={stats.shadowResistance} color={RESIST_COLORS.Shadow} />
        <StatRow label="Arcane" value={stats.arcaneResistance} color={RESIST_COLORS.Arcane} />
      </StatSection>

      {/* Ranged */}
      {(stats.rangedCrit > 0 || stats.rangedHaste > 0) && (
        <StatSection title="Ranged">
          <StatRow label="Crit" value={`${stats.rangedCrit.toFixed(2)}%`} />
          <StatRow label="Haste" value={`${stats.rangedHaste.toFixed(2)}%`} />
        </StatSection>
      )}
      </div>
    </div>
  );
}
