/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import type { CharacterProfile, PvpSummary, GearScoreResult } from "@/lib/blizzard";
import { CLASS_COLORS } from "@/lib/class-colors";

export default function CharacterHeader({
  profile,
  pvp,
  avatarUrl,
  gearScore,
}: {
  profile: CharacterProfile;
  pvp: PvpSummary | null;
  avatarUrl: string | null;
  gearScore: GearScoreResult | null;
}) {
  const [avatarError, setAvatarError] = useState(false);
  const classColor = CLASS_COLORS[profile.characterClass] ?? "#e7e5e4";
  const factionIcon = profile.faction === "ALLIANCE" ? "\u{2694}" : "\u{1F5E1}";

  return (
    <div className="wow-panel relative overflow-hidden">
      {/* Decorative top border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${classColor}66, transparent)` }}
      />

      <div className="flex items-start gap-6 p-6">
        {/* Avatar */}
        <div className="shrink-0">
          <div className="w-24 h-24 rounded-lg overflow-hidden ring-2 ring-amber-700/50 shadow-lg shadow-black/40">
            {avatarUrl && !avatarError ? (
              <img
                src={avatarUrl}
                alt=""
                width={96}
                height={96}
                onError={() => setAvatarError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-3xl text-neutral-600">
                {profile.name[0]}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1
            className="font-cinzel text-3xl font-bold tracking-wide leading-none"
            style={{ color: classColor }}
          >
            {profile.name}
          </h1>

          {profile.guild && (
            <p className="text-amber-200/60 text-sm mt-1.5 font-cinzel tracking-wide">
              &lt;{profile.guild}&gt;
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-neutral-300">
            <span>
              Level <span className="text-amber-100 font-medium">{profile.level}</span>
            </span>
            <span className="text-neutral-600">|</span>
            <span>{profile.gender} {profile.race}</span>
            <span className="text-neutral-600">|</span>
            <span style={{ color: classColor }}>{profile.characterClass}</span>
            <span className="text-neutral-600">|</span>
            <span>{factionIcon} {profile.faction === "ALLIANCE" ? "Alliance" : "Horde"}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500">Equipped iLvl</span>
              <span className="text-xl font-cinzel font-bold text-amber-100">{profile.equippedItemLevel}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500">Avg iLvl</span>
              <span className="text-xl font-cinzel font-bold text-neutral-300">{profile.avgItemLevel}</span>
            </div>
            {gearScore && (
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-neutral-500">GearScore</span>
                <span
                  className="text-xl font-cinzel font-bold"
                  style={{ color: `rgb(${gearScore.color.r},${gearScore.color.g},${gearScore.color.b})` }}
                >
                  {gearScore.score.toLocaleString()}
                </span>
              </div>
            )}
            {pvp && pvp.honorableKills > 0 && (
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-neutral-500">Honor Kills</span>
                <span className="text-xl font-cinzel font-bold text-red-400">{pvp.honorableKills.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
