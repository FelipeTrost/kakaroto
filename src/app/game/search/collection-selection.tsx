"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/lib/hooks";
import { Card } from "@/components/ui/card";
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
  const resetGameStore = useGameStateStore.use.reset()

  const trigger = (
    <Card className="sticky bottom-4 mt-4 flex w-full items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
      {selectedCollections > 0 ? (
        <>
          <div>{selectedCollections} selected</div>

          <Button variant="link" className="text-primary-foreground" onMouseDown={() => {
            // reset previous game
            resetGameStore();
            router.push("/game");
          }}>
            Start 🍺
          </Button>
        </>
      ) : (
        <>
          No collections selected
          <Button variant="link" className="w-0"></Button>
        </>
      )}
    </Card>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
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
      <DrawerTrigger asChild>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      </DrawerTrigger>
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
          />
        ))}
      </div>
    </ScrollArea>
  );
}
