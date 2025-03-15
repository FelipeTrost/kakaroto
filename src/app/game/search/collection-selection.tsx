"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/lib/hooks";
import Collection from "@/components/kakaroto/collection";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGameStateStore } from "@/lib/game-state-store";
import { DeleteIcon } from "@/components/kakaroto/icons";
import { useRouter } from "next/navigation";

export function CollectionSelectionDrawer() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const selectedCollections = useGameStateStore(
    (state) => state.selectedCollections.length,
  );
  const resetGameStore = useGameStateStore.use.reset();

  const trigger = (
    <button
      onMouseDown={() => setOpen(true)}
      className="sticky bottom-4 mt-4 flex w-full items-center justify-between rounded-xl bg-primary px-4 py-2 text-primary-foreground"
    >
      {selectedCollections > 0 ? (
        <>
          <div>{selectedCollections} selected</div>

          <Button
            variant="link"
            className="text-primary-foreground"
            onMouseDown={(e) => {
              e.stopPropagation();
              resetGameStore();
              router.push("/game");
            }}
          >
            Start 🍺
          </Button>
        </>
      ) : (
        <>
          No collections selected
          <Button variant="link" className="w-0"></Button>
        </>
      )}
    </button>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selected Collections</DialogTitle>
            <DialogDescription>
              These are the collections you've selected
            </DialogDescription>
          </DialogHeader>
          <SelectedColections />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {trigger}
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Selected Collections</DrawerTitle>
          <DrawerDescription>
            These are the collections you've selected
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <SelectedColections />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function SelectedColections() {
  const data = useGameStateStore((state) => state.selectedCollections);
  const deleteChallenge = useGameStateStore.use.deleteChallenge();

  return (
    <ScrollArea className="h-auto max-h-[30vh] overflow-y-auto">
      <div className="flex flex-col gap-2 pb-1">
        {data.map((collection) => (
          <Collection
            key={collection.id}
            collection={collection}
            rightNode={
              <Button onClick={() => deleteChallenge(collection.id)}>
                <DeleteIcon className="h-3 w-3" />
              </Button>
            }
            compact
          />
        ))}
      </div>
    </ScrollArea>
  );
}
