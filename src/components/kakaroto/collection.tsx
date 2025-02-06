import { type questionCollections } from "@/server/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { BsPinAngleFill } from "react-icons/bs";

export default function Collection({
  collection,
  rightNode,
  cardProps,
}: {
  collection: typeof questionCollections.$inferSelect & { pinned?: boolean };
  rightNode?: React.ReactNode;
  cardProps?: React.ComponentProps<typeof Card>;
}) {
  return (
    <Card className="max-w-[85ch]" {...cardProps}>
      <CardHeader className="flex flex-row justify-between gap-4">
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

      <CardContent>
        <p>{collection.description}</p>
      </CardContent>
    </Card>
  );
}
