import { type questionCollections } from "@/server/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

export default function Collection({
  collection,
  rightNode,
}: {
  collection: typeof questionCollections.$inferSelect;
  rightNode?: React.ReactNode;
}) {
  return (
    <Card className="max-w-[85ch]">
      <CardHeader className="flex flex-row justify-between gap-4">
        <div>
          <CardTitle className="w-[20ch] truncate text-xl">
            {collection.title}
          </CardTitle>
          <p className="text-slate-500">
            Updated {formatDistanceToNow(collection.updatedAt)} ago
          </p>
        </div>

        {rightNode}
      </CardHeader>

      <CardContent>
        <p>{collection.description}</p>
      </CardContent>
    </Card>
  );
}
