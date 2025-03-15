"use client";

import { type questionCollections } from "@/server/db/schema";
import { useTransition } from "react";
import { deleteCollection as _deleteCollection } from "@/server/db/collection-actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeleteIcon, EditIcon } from "@/components/kakaroto/icons";

export default function CollectionActions({
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
    <div className="flex flex-row gap-4">
      <Link href={`/collections/${collection.id}`}>
        <Button variant="secondary">
          <EditIcon className="h-3 w-3" />
        </Button>
      </Link>
      <Button onClick={deleteCollection} disabled={deleting}>
        <DeleteIcon className="h-3 w-3" />
      </Button>
    </div>
  );
}
