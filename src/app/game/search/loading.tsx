import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-15 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
