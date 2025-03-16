"use client";

import { type questionCollections } from "@/server/db/schema";
import { useTransition } from "react";
import { deleteCollection as _deleteCollection } from "@/server/db/collection-actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { DeleteIcon, EditIcon } from "@/components/kakaroto/icons";
import {
  DialogTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/kakaroto/spinner";

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

      <Dialog>
        <DialogTrigger className={buttonVariants()} disabled={deleting}>
          <LoadingSpinner
            className={cn([
              "mr-0 inline-flex h-4 w-0 opacity-0 transition-all duration-300",
              { "opacity-1 mr-2 w-fit": deleting },
            ])}
          />
          <DeleteIcon className="h-3 w-3" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Collection?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose className={buttonVariants({ variant: "outline" })}>
              Cancel
            </DialogClose>
            <DialogClose
              className={buttonVariants({ variant: "destructive" })}
              onClick={deleteCollection}
            >
              Delete
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
