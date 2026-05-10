// Reusable shimmering skeleton placeholders for loading states.
// Individual bars use `animate-pulse` (built into Tailwind) so there's no extra
// animation dependency. Compose them into screen-specific layouts as needed.

export function SkeletonBar({ className = "" }: { className?: string }) {
  return <div className={`bg-[#E9EAEE] rounded-md animate-pulse ${className}`} />;
}

export function SkeletonCircle({ className = "" }: { className?: string }) {
  return <div className={`bg-[#E9EAEE] rounded-full animate-pulse ${className}`} />;
}

// Stacked placeholder card for money/trip overview feeds.
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white rounded-[18px] p-5 shadow-[var(--shadow-apple-1)] ${className}`}
      aria-hidden
    >
      <SkeletonBar className="h-3.5 w-20 mb-3" />
      <SkeletonBar className="h-7 w-32 mb-2" />
      <SkeletonBar className="h-3 w-40" />
    </div>
  );
}

// Drop-in shell for the Money screen while the trip query is loading.
// Mirrors the real layout so there's no content-jump when data lands.
export function MoneyScreenSkeleton() {
  return (
    <div className="pb-6 animate-in" role="status" aria-live="polite" aria-label="Loading trip…">
      <div className="px-6 pt-14 pb-2">
        <SkeletonBar className="h-5 w-20 mb-3" />
        <SkeletonBar className="h-8 w-40 mb-1.5" />
        <SkeletonBar className="h-3 w-48" />
      </div>

      <div className="px-4 space-y-3 mt-4">
        <div className="bg-white rounded-[20px] p-5 shadow-[var(--shadow-apple-1)]">
          <SkeletonBar className="h-3 w-24 mb-2" />
          <SkeletonBar className="h-8 w-32 mb-4" />
          <div className="flex gap-2">
            <SkeletonBar className="h-6 w-20 rounded-full" />
            <SkeletonBar className="h-6 w-24 rounded-full" />
          </div>
        </div>

        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

// Trip overview skeleton — used by TripDashboard while loading.
export function TripOverviewSkeleton() {
  return (
    <div className="pb-20 animate-in" role="status" aria-live="polite" aria-label="Loading trip…">
      <div className="px-6 pt-14 pb-2">
        <SkeletonBar className="h-5 w-16 mb-3" />
        <SkeletonBar className="h-9 w-48 mb-2" />
        <SkeletonBar className="h-3 w-32" />
      </div>

      <div className="px-4 mt-4 space-y-3">
        <div className="flex items-center gap-3 bg-white rounded-[18px] p-4 shadow-[var(--shadow-apple-1)]">
          <SkeletonCircle className="size-10" />
          <div className="flex-1 space-y-2">
            <SkeletonBar className="h-3 w-24" />
            <SkeletonBar className="h-3 w-32" />
          </div>
        </div>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
