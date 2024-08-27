import { Skeleton } from "@/components/ui/skeleton";

export default function CollectionSkeleton() {
  return (
    <div className="max-w-[85ch] space-y-2">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-15 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
