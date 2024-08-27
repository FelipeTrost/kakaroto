"use client";

import { type questionCollections } from "@/server/db/schema";
import { MdDelete, MdEdit } from "react-icons/md";
import { useTransition } from "react";
import { deleteCollection as _deleteCollection } from "@/server/db/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
          <MdEdit className="h-3 w-3" />
        </Button>
      </Link>
      <Button onClick={deleteCollection} disabled={deleting}>
        <MdDelete className="h-3 w-3" />
      </Button>
    </div>
  );
}
