const LEFT_COUNT = 8;
const RIGHT_COUNT = 8;
const BOTTOM_COUNT = 3;

function SlotSkeleton() {
  return (
    <div className="border border-neutral-700/50 rounded-lg bg-neutral-800/30 p-3 flex items-center gap-3 min-h-[72px] animate-pulse">
      <div className="w-10 h-10 rounded bg-neutral-700/50 shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-2.5 w-12 bg-neutral-700/40 rounded" />
        <div className="h-3.5 w-28 bg-neutral-700/50 rounded" />
      </div>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="wow-panel p-6 animate-pulse">
      <div className="flex items-start gap-6">
        <div className="w-24 h-24 rounded-lg bg-neutral-700/50 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-7 w-48 bg-neutral-700/50 rounded" />
          <div className="h-4 w-32 bg-neutral-700/30 rounded" />
          <div className="h-4 w-64 bg-neutral-700/30 rounded mt-2" />
          <div className="flex gap-6 mt-3">
            <div className="space-y-1.5">
              <div className="h-2.5 w-16 bg-neutral-700/30 rounded" />
              <div className="h-6 w-10 bg-neutral-700/50 rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="h-2.5 w-12 bg-neutral-700/30 rounded" />
              <div className="h-6 w-10 bg-neutral-700/50 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPanelSkeleton() {
  return (
    <div className="wow-panel p-4 animate-pulse">
      <div className="h-3 w-20 bg-neutral-700/40 rounded mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3 w-16 bg-neutral-700/30 rounded" />
            <div className="h-3 w-10 bg-neutral-700/40 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CharacterPageSkeleton() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <StatPanelSkeleton key={i} />
        ))}
      </div>

      <div>
        <div className="h-3 w-24 bg-neutral-700/40 rounded mb-4 mx-auto animate-pulse" />
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          <div className="flex flex-col gap-2">
            {Array.from({ length: LEFT_COUNT }, (_, i) => (
              <SlotSkeleton key={`l${i}`} />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: RIGHT_COUNT }, (_, i) => (
              <SlotSkeleton key={`r${i}`} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {Array.from({ length: BOTTOM_COUNT }, (_, i) => (
            <SlotSkeleton key={`b${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
