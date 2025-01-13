"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useGameStateStore } from "@/lib/game-state-store";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useEffect, useRef } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { AnimatePresence } from "motion/react"
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import BouncyDiv from "@/components/kakaroto/bouncy-div";

function PlayerManagement() {
  const [playerInput, setPlayerInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const players = useGameStateStore.use.players();
  const addGamePlayer = useGameStateStore.use.addPlayer();
  const removePlayer = useGameStateStore.use.removePlayer();
  const setGameState = useGameStateStore.use.setGameState();

  function addPlayer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const player = playerInput.trim();
    if (!player) return;
    addGamePlayer(player);
    setPlayerInput("");

    inputRef.current?.focus();
  }

  return (
    <>
      <section className="bg-background">
        <h2 className="mt-4">Add players</h2>
        <form className="mb-8 flex gap-4" onSubmit={addPlayer}>
          <Input
            name="name"
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
            ref={inputRef}
          />
          <Button>Add</Button>
        </form>
      </section>

      <div className="flex flex-col flex-wrap gap-2">
        {players.map((player) => (
          <Badge
            variant="secondary"
            key={player}
            className="w-fit flex-grow-0 px-4 text-2xl flex items-center"
          >
            <span>{player}</span>
            <button onClick={() => removePlayer(player)} className="ml-2">
              <IoCloseOutline />
            </button>
          </Badge>
        ))}
      </div>

      <Button
        className="sticky bottom-4 my-4"
        onClick={() => {
          const message = setGameState("started");
          if (message)
            toast({
              description: message,
              title: "Error",
            });
        }}
      >
        Start game
      </Button>
    </>
  );
}

function Game() {
  const currentChallenge = useGameStateStore.use.currentChallenge();
  const nextChallenge = useGameStateStore.use.nextChallenge();
  const reset = useGameStateStore.use.reset();

  if (!currentChallenge) return <>
    <Button onClick={reset}>Reset</Button>
    <h1>No more challenges</h1></>;

  return (
    <div className="h-[100svh] flex flex-col justify-between">
      <div className="h-[70%] flex items-center">
        <AnimatePresence>
          <BouncyDiv
            key={currentChallenge?.challengeDisplay}
            className="w-full"
          >
            <Card className="w-full p-10">
              <CardContent>
                <span className="text-xl m-0">{currentChallenge?.challengeDisplay}</span>
              </CardContent>
            </Card>
          </BouncyDiv>
        </AnimatePresence></div>

      <div className="flex gap-2 py-4">
        <Button onClick={nextChallenge}>Next card</Button>
      </div>
    </div>
  );
}

function FinishedScreen() {
  return (
    <div className="h-[100svh] flex items-center justify-center">
      <div className="text-center prose">
        <h1 className="text-3xl font-bold text-foreground">That's it 🎉</h1>
        <p className="text-muted-foreground">Hope you had fun</p>
        <Link href="/game/search">
          <Button variant="default">New Game</Button>
        </Link>
      </div>
    </div>
  )
}

export default function GamePage() {
  const state = useGameStateStore.use.state();
  const router = useRouter();

  useEffect(() => {
    const state = useGameStateStore.getState();
    if (state.state === "none") {
      if (state.selectedCollections.length === 0)
        return router.push("/game/search");
    }
  }, [router]);

  if (state === "none") return <PlayerManagement />;
  if (state === "finished") return <FinishedScreen />;
  else return <Game />;
}
