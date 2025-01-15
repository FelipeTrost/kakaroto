import { type questionCollections } from "@/server/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

export default function Collection({
  collection,
  rightNode,
  cardProps,
}: {
  collection: typeof questionCollections.$inferSelect;
  rightNode?: React.ReactNode;
  cardProps?: React.ComponentProps<typeof Card>;
}) {
  return (
    <Card className="max-w-[85ch]" {...cardProps}>
      <CardHeader className="flex flex-row justify-between gap-4">
        <div className="flex-1 min-w-0">
          <CardTitle className="truncate text-xl">
            {collection.title}
          </CardTitle>
          <p className="text-slate-500 truncate">
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
