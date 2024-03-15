"use client";

import { type questionCollections } from "@/server/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MdDelete, MdEdit } from "react-icons/md";
import { Button } from "../ui/button";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useTransition } from "react";
import { deleteCollection as _deleteCollection } from "@/server/db/actions";
import { useRouter } from "next/navigation";

export default function Collection({
  collection,
}: {
  collection: typeof questionCollections.$inferSelect;
}) {
  const router = useRouter();
  const [deleting, startDeletingTransition] = useTransition();

  function deleteCollection() {
    startDeletingTransition(async () => {
      await _deleteCollection(collection.id);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between gap-4">
        <div>
          <CardTitle className="text-xl">{collection.title}</CardTitle>
          {formatDistanceToNow(collection.updatedAt)}
        </div>

        <div className="flex flex-row gap-4">
          <Button variant="secondary">
            <MdEdit className="h-3 w-3" />
          </Button>
          <Button onClick={deleteCollection}>
            <MdDelete className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p>{collection.description}</p>
      </CardContent>
    </Card>
  );
}
