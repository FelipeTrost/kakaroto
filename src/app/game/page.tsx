"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useGameStateStore } from "@/lib/game-state-store";
import { parseQuestion } from "@/lib/game/parser";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useEffect, useRef } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { AnimatePresence } from "motion/react"
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

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
            className="w-fit flex-grow-0 px-4"
          >
            {player}
            <Button onClick={() => removePlayer(player)} variant="secondary">
              <IoCloseOutline />
            </Button>
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

  const parsed = parseQuestion(currentChallenge.question);

  const divVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 120
      }
    },
    exit: {
      opacity: 0,
      scale: 0.5,
      y: 50,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <>
      <Button onClick={reset}>Reset</Button>
      <Button onClick={nextChallenge}>Next challenge</Button>
      <AnimatePresence>
        <motion.div
          key={currentChallenge?.challengeDisplay}
          variants={divVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Card>
            <CardContent>
              <h2>{currentChallenge?.type}</h2>
              <h2>{currentChallenge?.challengeDisplay}</h2>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>
  );
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
  if (state === "finished")
    return (
      <Button
        onClick={() => {
          useGameStateStore.getState().reset();
          router.push("/game/search");
        }}
      >
        New Game
      </Button>
    );
  else return <Game />;
}
