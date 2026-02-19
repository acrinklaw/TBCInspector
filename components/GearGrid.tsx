import { EquippedItem } from "@/lib/blizzard";
import GearSlot from "./GearSlot";

const LEFT_SLOTS = [
  "HEAD",
  "NECK",
  "SHOULDER",
  "BACK",
  "CHEST",
  "SHIRT",
  "TABARD",
  "WRIST",
];

const RIGHT_SLOTS = [
  "HANDS",
  "WAIST",
  "LEGS",
  "FEET",
  "FINGER_1",
  "FINGER_2",
  "TRINKET_1",
  "TRINKET_2",
];

const BOTTOM_SLOTS = ["MAIN_HAND", "OFF_HAND", "RANGED"];

export default function GearGrid({ items }: { items: EquippedItem[] }) {
  const bySlot = new Map<string, EquippedItem>();
  for (const item of items) {
    bySlot.set(item.slot.type, item);
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        <div className="flex flex-col gap-2">
          {LEFT_SLOTS.map((slot) => (
            <GearSlot key={slot} slotType={slot} item={bySlot.get(slot) ?? null} />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {RIGHT_SLOTS.map((slot) => (
            <GearSlot key={slot} slotType={slot} item={bySlot.get(slot) ?? null} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        {BOTTOM_SLOTS.map((slot) => (
          <GearSlot key={slot} slotType={slot} item={bySlot.get(slot) ?? null} />
        ))}
      </div>
    </div>
  );
}
