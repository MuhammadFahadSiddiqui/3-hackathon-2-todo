// T015, T016: TaskSkeleton component with animate-pulse
interface TaskSkeletonProps {
  count?: number;
}

export function TaskSkeleton({ count = 3 }: TaskSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 shadow-sm"
        >
          <div className="flex items-center gap-4 animate-pulse">
            <div className="h-6 w-6 flex-shrink-0 rounded-lg bg-[var(--card-border)]" />
            <div className="flex-1 space-y-2">
              <div
                className="h-4 rounded-full bg-[var(--card-border)]"
                style={{ width: `${60 + Math.random() * 30}%` }}
              />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-9 rounded-lg bg-[var(--card-border)]" />
              <div className="h-9 w-9 rounded-lg bg-[var(--card-border)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
