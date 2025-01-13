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
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import BouncyDiv from "@/components/kakaroto/bouncy-div";
import { ArrowLeft } from "lucide-react";
import { MdPeople } from "react-icons/md";

function PlayerManagement({ inGameClose }: { inGameClose?: () => void }) {
  const [playerInput, setPlayerInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const players = useGameStateStore.use.players();
  const addGamePlayer = useGameStateStore.use.addPlayer();
  const removePlayer = useGameStateStore.use.removePlayer();
  const setGameState = useGameStateStore.use.setGameState();
  const checkPlayersAndSetCards = useGameStateStore.use.checkPlayersAndSetCards();

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

      <div className="flex flex-col flex-wrap gap-2 mb-8">
        {players.map((player) => (
          <Badge
            variant="secondary"
            key={player}
            className="w-fit flex-grow-0 px-4 text-lg py-2 flex items-center"
          >
            <span>{player}</span>
            <button onClick={() => removePlayer(player)} className="ml-2">
              <IoCloseOutline />
            </button>
          </Badge>
        ))}
      </div>

      <div className="flex gap-2 items-center sticky bottom-4 my-4">
        {inGameClose ?
          <Button onClick={() => {
            const message = checkPlayersAndSetCards();
            if (message)
              return toast({
                description: message,
                title: "Error",
              });
            inGameClose();
          }}>Back to the game</Button>
          :
          (<>
            <Button onClick={() => router.replace("/game/search")} variant="secondary"><ArrowLeft /> Back to collections </Button>
            <Button
              onClick={() => {
                const message = setGameState("started");
                if (message)
                  toast({
                    description: message,
                    title: "Error",
                  });
              }}
            >
              Start game 🍺
            </Button>
          </>)}
      </div>
    </>
  );
}

function Game({ openPlayerManagement }: { openPlayerManagement: () => void }) {
  const currentChallenge = useGameStateStore.use.currentChallenge();
  const nextChallenge = useGameStateStore.use.nextChallenge();

  return (
    <section className="flex flex-col justify-between flex-grow">
      <div className="flex items-center flex-grow">
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
        </AnimatePresence>
      </div>

      <div className="flex gap-2 py-4">
        <Button variant="secondary" onClick={openPlayerManagement}><MdPeople className="mr-2" /> Players</Button>
        <Button onClick={nextChallenge}>Next card</Button>
      </div>
    </section>
  );
}

function FinishedScreen() {
  return (
    <div className="h-[100svh] flex items-center justify-center">
      <div className="text-center prose mt-[-15%]">
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
  const [inGamePlayerManagement, setInGamePlayerManagement] = useState(false);

  useEffect(() => {
    const state = useGameStateStore.getState();
    if (state.state === "none") {
      if (state.selectedCollections.length === 0)
        return router.push("/game/search");
    }
  }, [router]);

  if (inGamePlayerManagement) return <PlayerManagement inGameClose={() => setInGamePlayerManagement(false)} />

  if (state === "none") return <PlayerManagement />;
  if (state === "finished") return <FinishedScreen />;
  else return <Game openPlayerManagement={() => setInGamePlayerManagement(true)} />;
}
