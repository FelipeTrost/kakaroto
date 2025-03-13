import { type questionCollections } from "@/server/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { BsPinAngleFill } from "react-icons/bs";
import { cn } from "@/lib/utils";

export default function Collection({
  collection,
  rightNode,
  cardProps,
  compact
}: {
  collection: typeof questionCollections.$inferSelect & { pinned?: boolean };
  rightNode?: React.ReactNode;
  cardProps?: React.ComponentProps<typeof Card>;
  compact?: boolean;
}) {
  return (
    <Card className="max-w-[85ch]" {...cardProps}>
      <CardHeader className={cn("flex flex-row justify-between gap-4", { "py-3 px-4": compact })}>
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-xl">
            {collection.pinned && (
              <p className="flex items-center text-sm text-muted">
                <BsPinAngleFill className="mr-2 fill-green-600" /> pinned
              </p>
            )}
            {collection.title}
          </CardTitle>
          <p className="truncate text-slate-500">
            Updated {formatDistanceToNow(collection.updatedAt)} ago
          </p>
        </div>

        <div className="w-fit">{rightNode}</div>
      </CardHeader>

      <CardContent className={cn({ "pb-2 px-4": compact })}>
        <p>{collection.description}</p>
      </CardContent>
    </Card>
  );
}
