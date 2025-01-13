"use client"

import BouncyDiv from "@/components/kakaroto/bouncy-div";
import { buttonVariants } from "@/components/ui/button";
import { useGameStateStore } from "@/lib/game-state-store"
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ReturnToGameButton() {
  const gameState = useGameStateStore.use.state();
  if (gameState === "started")
    return (
      <BouncyDiv>
        <Link
          href="/game"
          className={`w-[10rem] ${cn(buttonVariants({ size: "lg", variant: "default" }))}`}
        >
          Return to game
        </Link>
      </BouncyDiv>
    )
}
