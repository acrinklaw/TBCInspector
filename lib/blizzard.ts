let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const clientId = process.env.BLIZZARD_CLIENT_ID;
  const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing BLIZZARD_CLIENT_ID or BLIZZARD_CLIENT_SECRET");
  }

  const res = await fetch("https://oauth.battle.net/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`OAuth token request failed: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return cachedToken.token;
}

// --- Interfaces ---

export interface EquippedItem {
  slot: { type: string; name: string };
  item: { id: number };
  name: string;
  quality: { type: string; name: string };
  level: { value: number };
  itemLevel?: number;
  inventoryType?: string;
  icon?: string;
  enchantments?: {
    display_string: string;
    enchantment_id: number;
    enchantment_slot?: { id: number };
    source_item?: { name: string; id: number };
  }[];
  sockets?: { type: string; name: string }[];
  socketBonus?: string;
  set?: { item_set: { name: string; id: number }; display_string: string };
}

interface RawEquippedItem extends EquippedItem {
  media?: { key: { href: string }; id: number };
  inventory_type?: { type: string; name: string };
}

export interface CharacterProfile {
  name: string;
  level: number;
  gender: string;
  faction: string;
  race: string;
  characterClass: string;
  realm: { slug: string; name: string };
  guild?: string;
  avgItemLevel: number;
  equippedItemLevel: number;
  lastLogin?: number;
}

export interface CharacterStats {
  health: number;
  power: number;
  powerType: string;
  strength: number;
  agility: number;
  intellect: number;
  stamina: number;
  spirit: number;
  armor: number;
  defense: number;
  dodge: number;
  parry: number;
  block: number;
  attackPower: number;
  meleeCrit: number;
  meleeHaste: number;
  mainHandDps: number;
  mainHandSpeed: number;
  mainHandDamageMin: number;
  mainHandDamageMax: number;
  offHandDps: number;
  offHandSpeed: number;
  offHandDamageMin: number;
  offHandDamageMax: number;
  rangedCrit: number;
  rangedHaste: number;
  spellPower: number;
  spellPenetration: number;
  spellCrit: number;
  spellHaste: number;
  manaRegen: number;
  manaRegenCombat: number;
  fireResistance: number;
  holyResistance: number;
  shadowResistance: number;
  natureResistance: number;
  arcaneResistance: number;
}

export interface PvpSummary {
  honorableKills: number;
  pvpRank: number;
}

export interface GearScoreResult {
  score: number;
  color: { r: number; g: number; b: number };
}

export interface GearWarning {
  type: "low_gs" | "missing_enchant" | "missing_gem";
  severity: "error" | "warning";
  message: string;
  item?: string;
}

export interface CharacterData {
  profile: CharacterProfile;
  equipment: EquippedItem[];
  stats: CharacterStats | null;
  pvp: PvpSummary | null;
  avatarUrl: string | null;
  gearScore: GearScoreResult | null;
  warnings: GearWarning[];
}

// --- Namespace resolution ---

const NAMESPACES = ["profile-classicann-us", "profile-classic-us", "profile-classic1x-us"];

async function resolveNamespace(
  token: string,
  realm: string,
  name: string
): Promise<string | null> {
  for (const ns of NAMESPACES) {
    const url = `https://us.api.blizzard.com/profile/wow/character/${encodeURIComponent(realm)}/${encodeURIComponent(name)}?namespace=${ns}&locale=en_US`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) return ns;
  }
  return null;
}

// --- Fetchers ---

async function fetchJson(url: string, token: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

function parseProfile(data: Record<string, unknown>): CharacterProfile {
  const d = data as Record<string, Record<string, unknown>>;
  return {
    name: data.name as string,
    level: data.level as number,
    gender: (d.gender?.name as string) ?? "",
    faction: (d.faction?.type as string) ?? "",
    race: (d.race?.name as string) ?? "",
    characterClass: (d.character_class?.name as string) ?? "",
    realm: {
      slug: (d.realm?.slug as string) ?? "",
      name: (d.realm?.name as string) ?? "",
    },
    guild: (d.guild?.name as string) ?? undefined,
    avgItemLevel: (data.average_item_level as number) ?? 0,
    equippedItemLevel: (data.equipped_item_level as number) ?? 0,
    lastLogin: (data.last_login_timestamp as number) ?? undefined,
  };
}

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "object" && v !== null && "value" in v) return (v as { value: number }).value;
  return 0;
}

function parseStats(data: Record<string, unknown>): CharacterStats {
  const pt = data.power_type as Record<string, unknown> | undefined;
  return {
    health: num(data.health),
    power: num(data.power),
    powerType: (pt?.name as string) ?? "Mana",
    strength: num(data.strength),
    agility: num(data.agility),
    intellect: num(data.intellect),
    stamina: num(data.stamina),
    spirit: num(data.spirit),
    armor: num(data.armor),
    defense: num(data.defense),
    dodge: num(data.dodge),
    parry: num(data.parry),
    block: num(data.block),
    attackPower: num(data.attack_power),
    meleeCrit: num(data.melee_crit),
    meleeHaste: num(data.melee_haste),
    mainHandDps: num(data.main_hand_dps),
    mainHandSpeed: num(data.main_hand_speed),
    mainHandDamageMin: num(data.main_hand_damage_min),
    mainHandDamageMax: num(data.main_hand_damage_max),
    offHandDps: num(data.off_hand_dps),
    offHandSpeed: num(data.off_hand_speed),
    offHandDamageMin: num(data.off_hand_damage_min),
    offHandDamageMax: num(data.off_hand_damage_max),
    rangedCrit: num(data.ranged_crit),
    rangedHaste: num(data.ranged_haste),
    spellPower: num(data.spell_power),
    spellPenetration: num(data.spell_penetration),
    spellCrit: num(data.spell_crit),
    spellHaste: num(data.spell_haste),
    manaRegen: num(data.mana_regen),
    manaRegenCombat: num(data.mana_regen_combat),
    fireResistance: num(data.fire_resistance),
    holyResistance: num(data.holy_resistance),
    shadowResistance: num(data.shadow_resistance),
    natureResistance: num(data.nature_resistance),
    arcaneResistance: num(data.arcane_resistance),
  };
}

async function fetchEquipmentWithIcons(
  token: string,
  realm: string,
  name: string,
  namespace: string
): Promise<EquippedItem[]> {
  const url = `https://us.api.blizzard.com/profile/wow/character/${encodeURIComponent(realm)}/${encodeURIComponent(name)}/equipment?namespace=${namespace}&locale=en_US`;
  const data = await fetchJson(url, token);
  if (!data) return [];

  const rawItems: RawEquippedItem[] = data.equipped_items ?? [];

  return Promise.all(
    rawItems.map(async (item) => {
      try {
        const tooltipRes = await fetch(
          `https://nether.wowhead.com/tooltip/item/${item.item.id}?dataEnv=8&locale=0`
        );
        if (tooltipRes.ok) {
          const tooltipData = await tooltipRes.json();
          const enriched: Partial<EquippedItem> = {};

          if (
            tooltipData.icon &&
            typeof tooltipData.icon === "string" &&
            /^[a-z0-9_-]+$/i.test(tooltipData.icon)
          ) {
            enriched.icon = `https://wow.zamimg.com/images/wow/icons/large/${tooltipData.icon}.jpg`;
          }

          // Parse sockets from tooltip HTML
          const tooltip: string = tooltipData.tooltip ?? "";
          const socketMatches = tooltip.matchAll(/class="socket-(meta|red|blue|yellow)\s/g);
          const sockets: { type: string; name: string }[] = [];
          for (const m of socketMatches) {
            const type = m[1];
            sockets.push({ type, name: `${type.charAt(0).toUpperCase() + type.slice(1)} Socket` });
          }
          if (sockets.length > 0) enriched.sockets = sockets;

          const bonusMatch = tooltip.match(/Socket Bonus: ([^<]+)/);
          if (bonusMatch) enriched.socketBonus = bonusMatch[1].trim();

          // Parse item level from tooltip HTML
          const ilvlMatch = tooltip.match(/Item Level\s*(?:<!--ilvl-->)?\s*(\d+)/i);
          if (ilvlMatch) enriched.itemLevel = parseInt(ilvlMatch[1], 10);

          // Pass through inventory type from Blizzard API
          const invType = item.inventory_type?.type;
          if (invType) enriched.inventoryType = invType;

          return { ...item, ...enriched };
        }
      } catch {
        // wowhead fetch failed, not critical
      }
      return item;
    })
  );
}

async function fetchAvatar(
  token: string,
  realm: string,
  name: string,
  namespace: string
): Promise<string | null> {
  const url = `https://us.api.blizzard.com/profile/wow/character/${encodeURIComponent(realm)}/${encodeURIComponent(name)}/character-media?namespace=${namespace}&locale=en_US`;
  const data = await fetchJson(url, token);
  if (!data) return null;
  const assets = data.assets as { key: string; value: string }[] | undefined;
  return assets?.find((a) => a.key === "avatar")?.value ?? null;
}

// --- GearScore (TacoTip formula) ---

const GS_SLOT_MOD: Record<string, number> = {
  RELIC: 0.3164, TRINKET: 0.5625, TWOHWEAPON: 2.0,
  WEAPONMAINHAND: 1.0, WEAPONOFFHAND: 1.0,
  RANGED: 0.3164, THROWN: 0.3164, RANGEDRIGHT: 0.3164,
  SHIELD: 1.0, WEAPON: 1.0, HOLDABLE: 1.0,
  HEAD: 1.0, NECK: 0.5625, SHOULDER: 0.75,
  CHEST: 1.0, ROBE: 1.0, WAIST: 0.75,
  LEGS: 1.0, FEET: 0.75, WRIST: 0.5625,
  HAND: 0.75, FINGER: 0.5625, CLOAK: 0.5625, BODY: 0,
};

const QUALITY_NUM: Record<string, number> = {
  POOR: 0, COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 4, LEGENDARY: 5, ARTIFACT: 6, HEIRLOOM: 7,
};

// Tables A (ilvl > 120) and B (ilvl <= 120)
const GS_TABLE_A: Record<number, { A: number; B: number }> = {
  4: { A: 91.45, B: 0.65 }, 3: { A: 81.375, B: 0.8125 }, 2: { A: 73.0, B: 1.0 },
};
const GS_TABLE_B: Record<number, { A: number; B: number }> = {
  4: { A: 26.0, B: 1.2 }, 3: { A: 0.75, B: 1.8 }, 2: { A: 8.0, B: 2.0 }, 1: { A: 0.0, B: 2.25 },
};

const BRACKET = 400; // TBC bracket size

const GS_QUALITY_BRACKETS = [
  { threshold: BRACKET * 6, R: { A: 0.94, B: BRACKET * 5, C: 0.00006, D: 1 }, G: { A: 0, B: 0, C: 0, D: 0 }, B: { A: 0.47, B: BRACKET * 5, C: 0.00047, D: -1 } },
  { threshold: BRACKET * 5, R: { A: 0.69, B: BRACKET * 4, C: 0.00025, D: 1 }, G: { A: 0.97, B: BRACKET * 4, C: 0.00096, D: -1 }, B: { A: 0.28, B: BRACKET * 4, C: 0.00019, D: 1 } },
  { threshold: BRACKET * 4, R: { A: 0.0, B: BRACKET * 3, C: 0.00069, D: 1 }, G: { A: 1, B: BRACKET * 3, C: 0.00003, D: -1 }, B: { A: 0.5, B: BRACKET * 3, C: 0.00022, D: -1 } },
  { threshold: BRACKET * 3, R: { A: 0.12, B: BRACKET * 2, C: 0.00012, D: -1 }, G: { A: 0, B: BRACKET * 2, C: 0.001, D: 1 }, B: { A: 1, B: BRACKET * 2, C: 0.0005, D: -1 } },
  { threshold: BRACKET * 2, R: { A: 1, B: BRACKET, C: 0.00088, D: -1 }, G: { A: 1, B: BRACKET, C: 0.001, D: -1 }, B: { A: 1, B: 0, C: 0, D: 0 } },
  { threshold: BRACKET, R: { A: 0.55, B: 0, C: 0.00045, D: 1 }, G: { A: 0.55, B: 0, C: 0.00045, D: 1 }, B: { A: 0.55, B: 0, C: 0.00045, D: 1 } },
];

function gsColor(score: number): { r: number; g: number; b: number } {
  const s = Math.min(score, BRACKET * 6 - 1);
  for (let i = 0; i < GS_QUALITY_BRACKETS.length; i++) {
    const low = (GS_QUALITY_BRACKETS.length - 1 - i) * BRACKET;
    const high = GS_QUALITY_BRACKETS[GS_QUALITY_BRACKETS.length - 1 - i].threshold;
    if (s > low && s <= high) {
      const q = GS_QUALITY_BRACKETS[GS_QUALITY_BRACKETS.length - 1 - i];
      const r = q.R.A + ((s - q.R.B) * q.R.C) * q.R.D;
      const g = q.G.A + ((s - q.G.B) * q.G.C) * q.G.D;
      const b = q.B.A + ((s - q.B.B) * q.B.C) * q.B.D;
      return {
        r: Math.round(Math.max(0, Math.min(1, r)) * 255),
        g: Math.round(Math.max(0, Math.min(1, g)) * 255),
        b: Math.round(Math.max(0, Math.min(1, b)) * 255),
      };
    }
  }
  return { r: 128, g: 128, b: 128 };
}

function getItemGearScore(itemLevel: number, qualityType: string, invType: string): number {
  const slotMod = GS_SLOT_MOD[invType] ?? 0;
  if (slotMod === 0) return 0;

  let rarity = QUALITY_NUM[qualityType] ?? 1;
  let qualityScale = 1;

  if (rarity === 5) { qualityScale = 1.3; rarity = 4; }
  else if (rarity <= 1) { qualityScale = 0.005; rarity = 2; }
  else if (rarity === 7) { rarity = 3; itemLevel = 187.05; }

  const table = itemLevel > 120 ? GS_TABLE_A : GS_TABLE_B;
  const entry = table[rarity];
  if (!entry) return 0;

  const score = Math.floor(((itemLevel - entry.A) / entry.B) * slotMod * 1.8618 * qualityScale);
  return Math.max(0, score);
}

function calculateGearScore(equipment: EquippedItem[], characterClass: string): GearScoreResult | null {
  if (equipment.length === 0) return null;

  let total = 0;
  const isHunter = characterClass.toUpperCase() === "HUNTER";

  // Check for 2H + OH (Titan Grip) — unlikely in TBC but formula handles it
  const mainHand = equipment.find(i => i.slot.type === "MAIN_HAND");
  const offHand = equipment.find(i => i.slot.type === "OFF_HAND");
  const titanGrip = (mainHand?.inventoryType === "TWOHWEAPON" && offHand) ||
                    (offHand?.inventoryType === "TWOHWEAPON") ? 0.5 : 1;

  for (const item of equipment) {
    const ilvl = item.itemLevel;
    const invType = item.inventoryType;
    const quality = item.quality?.type;
    if (!ilvl || !invType || !quality) continue;

    let score = getItemGearScore(ilvl, quality, invType);

    if (isHunter) {
      if (item.slot.type === "MAIN_HAND") score = Math.floor(score * 0.3164);
      else if (item.slot.type === "RANGED") score = Math.floor(score * 5.3224);
    }

    if (item.slot.type === "MAIN_HAND" || item.slot.type === "OFF_HAND") {
      score = Math.floor(score * titanGrip);
    }

    total += score;
  }

  if (total === 0) return null;
  return { score: total, color: gsColor(total) };
}

// --- Warnings ---

const ENCHANTABLE_SLOTS = new Set([
  "HEAD", "SHOULDER", "CHEST", "ROBE", "LEGS", "FEET",
  "WRIST", "HAND", "CLOAK",
  "TWOHWEAPON", "WEAPONMAINHAND", "WEAPONOFFHAND", "SHIELD", "WEAPON", "RANGED",
]);

function computeWarnings(
  equipment: EquippedItem[],
  gearScore: GearScoreResult | null
): GearWarning[] {
  const warnings: GearWarning[] = [];

  // Low GearScore
  if (gearScore && gearScore.score < 1380) {
    warnings.push({
      type: "low_gs",
      severity: "error",
      message: `GearScore ${gearScore.score} is below 1380`,
    });
  }

  for (const item of equipment) {
    // Missing gems: compare socket count (from Wowhead) vs gem enchantments (slot 2-4)
    const socketCount = item.sockets?.length ?? 0;
    if (socketCount > 0) {
      const gemCount = item.enchantments?.filter(
        (e) => e.enchantment_slot && e.enchantment_slot.id >= 2 && e.enchantment_slot.id <= 4
      ).length ?? 0;
      const missing = socketCount - gemCount;
      if (missing > 0) {
        warnings.push({
          type: "missing_gem",
          severity: "error",
          message: `${missing} empty socket${missing > 1 ? "s" : ""}`,
          item: item.name,
        });
      }
    }

    // Missing enchant: enchantable item without enchantment_slot 0
    const invType = item.inventoryType;
    if (invType && ENCHANTABLE_SLOTS.has(invType)) {
      const hasEnchant = item.enchantments?.some(
        (e) => e.enchantment_slot && e.enchantment_slot.id === 0
      );
      if (!hasEnchant) {
        warnings.push({
          type: "missing_enchant",
          severity: "warning",
          message: `No enchant`,
          item: item.name,
        });
      }
    }
  }

  return warnings;
}

// --- Main export ---

export async function getCharacterData(
  realmSlug: string,
  characterName: string
): Promise<CharacterData> {
  const token = await getAccessToken();
  const name = characterName.toLowerCase();
  const realm = realmSlug.toLowerCase();

  const namespace = await resolveNamespace(token, realm, name);
  if (!namespace) {
    throw new Error("Character not found on any known namespace");
  }

  const base = `https://us.api.blizzard.com/profile/wow/character/${encodeURIComponent(realm)}/${encodeURIComponent(name)}`;

  const [profileData, statsData, pvpData, equipment, avatarUrl] = await Promise.all([
    fetchJson(`${base}?namespace=${namespace}&locale=en_US`, token),
    fetchJson(`${base}/statistics?namespace=${namespace}&locale=en_US`, token),
    fetchJson(`${base}/pvp-summary?namespace=${namespace}&locale=en_US`, token),
    fetchEquipmentWithIcons(token, realm, name, namespace),
    fetchAvatar(token, realm, name, namespace),
  ]);

  if (!profileData) {
    throw new Error("Failed to fetch character profile");
  }

  const profile = parseProfile(profileData);
  const gearScore = calculateGearScore(equipment, profile.characterClass);

  return {
    profile,
    equipment,
    stats: statsData ? parseStats(statsData) : null,
    pvp: pvpData
      ? { honorableKills: pvpData.honorable_kills ?? 0, pvpRank: pvpData.pvp_rank ?? 0 }
      : null,
    avatarUrl,
    gearScore,
    warnings: computeWarnings(equipment, gearScore),
  };
}
