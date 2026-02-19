"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const REALMS = [
  "crusader-strike",
  "dreamscythe",
  "living-flame",
  "lone-wolf",
  "nightslayer",
  "shadowstrike",
  "wild-growth",
];

export default function SearchForm() {
  const [realm, setRealm] = useState("dreamscythe");
  const [name, setName] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return;
    router.push(`/character/${realm}/${trimmed}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="realm" className="text-sm font-medium text-amber-200/70 uppercase tracking-wider">
          Realm
        </label>
        <select
          id="realm"
          value={realm}
          onChange={(e) => setRealm(e.target.value)}
          className="bg-neutral-800/80 border border-amber-900/50 rounded-lg px-4 py-3 text-amber-100 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 transition-colors appearance-none cursor-pointer"
        >
          {REALMS.map((r) => (
            <option key={r} value={r}>
              {r
                .split("-")
                .map((w) => w[0].toUpperCase() + w.slice(1))
                .join(" ")}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-amber-200/70 uppercase tracking-wider">
          Character Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter character name"
          autoComplete="off"
          className="bg-neutral-800/80 border border-amber-900/50 rounded-lg px-4 py-3 text-amber-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 transition-colors"
        />
      </div>

      <button
        type="submit"
        className="mt-2 bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-150 shadow-lg shadow-amber-900/30 hover:shadow-amber-800/40 active:scale-[0.98] cursor-pointer"
      >
        Inspect Gear
      </button>
    </form>
  );
}
