import { Skeleton } from "@/components/ui/skeleton";

export function VaultSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5">
      <Skeleton className="h-9 w-9 rounded-md" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3.5 w-24" />
      </div>
    </div>
  );
}
