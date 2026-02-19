"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import GearGrid from "@/components/GearGrid";
import CharacterPageSkeleton from "@/components/GearGridSkeleton";
import CharacterHeader from "@/components/CharacterHeader";
import StatPanel from "@/components/StatPanel";
import WarningPanel from "@/components/WarningPanel";
import type { CharacterData } from "@/lib/blizzard";

declare global {
  interface Window {
    $WowheadPower?: { refreshLinks: () => void };
  }
}

export default function CharacterPage() {
  const params = useParams<{ realm: string; name: string }>();
  const router = useRouter();
  const [data, setData] = useState<CharacterData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const realm = decodeURIComponent(params.realm);
    const name = decodeURIComponent(params.name);
    if (!realm || !name) return;

    setLoading(true);
    setError(null);

    fetch(`/api/inspect?realm=${encodeURIComponent(realm)}&name=${encodeURIComponent(name)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Request failed (${res.status})`);
        }
        return res.json();
      })
      .then((json: CharacterData) => {
        setData(json);
        setTimeout(() => {
          window.$WowheadPower?.refreshLinks();
        }, 200);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.realm, params.name]);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-amber-200/60 hover:text-amber-200 transition-colors mb-6 flex items-center gap-1 cursor-pointer font-cinzel tracking-wide"
        >
          &larr; New Search
        </button>

        {loading && <CharacterPageSkeleton />}

        {error && (
          <div className="wow-panel p-6 text-center">
            <p className="text-red-400 font-medium">{error}</p>
            <p className="text-neutral-500 text-sm mt-2">
              Make sure the character name and realm are correct.
            </p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <CharacterHeader
              profile={data.profile}
              pvp={data.pvp}
              avatarUrl={data.avatarUrl}
              gearScore={data.gearScore}
            />

            {data.warnings.length > 0 && <WarningPanel warnings={data.warnings} />}

            {data.stats && <StatPanel stats={data.stats} />}

            <div>
              <h2 className="font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-amber-200/60 text-center mb-4">
                Equipment
              </h2>
              <GearGrid items={data.equipment} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
