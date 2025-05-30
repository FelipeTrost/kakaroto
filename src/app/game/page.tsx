"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { GameStateStore, useGameStateStore } from "@/lib/game-state-store";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useState,
  useEffect,
  useRef,
  useMemo,
  ReactNode,
} from "react";
import { IoCloseOutline } from "react-icons/io5";
import { AnimatePresence } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import BouncyDiv from "@/components/kakaroto/bouncy-div";
import { ArrowLeft } from "lucide-react";
import { MdPeople } from "react-icons/md";
import { captureEvent, eventTypes } from "@/components/analytics-provider";
import { displayChallenge } from "@/lib/game/parser";

function PlayerManagement({ inGameClose }: { inGameClose?: () => void }) {
  const [playerInput, setPlayerInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const players = useGameStateStore.use.players();
  const addGamePlayer = useGameStateStore.use.addPlayer();
  const removePlayer = useGameStateStore.use.removePlayer();
  const setGameState = useGameStateStore.use.setGameState();
  const checkPlayersAndSetCards =
    useGameStateStore.use.checkPlayersAndSetCards();

  useEffect(() => {
    if (!inGameClose) inputRef.current?.focus();
  }, [inGameClose]);

  function addPlayer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const player = playerInput.trim();
    if (!player) return submitPlayers();

    addGamePlayer(player);

    setPlayerInput("");
    inputRef.current?.focus();
  }

  function submitPlayers() {
    if (inGameClose) {
      const message = checkPlayersAndSetCards();
      if (message)
        return toast({
          description: message,
          title: "Error",
        });
      inGameClose();
    } else {
      captureEvent(eventTypes.gameStartedWithNCollections, {
        [eventTypes.gameStartedWithNCollections_n]:
          useGameStateStore.getState().selectedCollections.length,
      });

      const message = setGameState("started");
      if (message)
        return toast({
          description: message,
          title: "Error",
        });
    }
  }

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className="flex-1">
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

        <div className="mb-8 flex flex-col flex-wrap gap-2">
          {players.map((player) => (
            <Badge
              variant="secondary"
              key={player.name}
              className="flex w-fit flex-grow-0 items-center px-4 py-2 text-lg"
            >
              <span>{player.name}</span>
              <button
                onClick={() => removePlayer(player.name)}
                className="ml-2"
              >
                <IoCloseOutline />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="sticky bottom-4 my-4 flex items-center gap-2">
        {!inGameClose && (
          <Button
            onClick={() => router.push("/game/search")}
            variant="secondary"
          >
            <ArrowLeft /> Back to collections{" "}
          </Button>
        )}
        <Button onClick={submitPlayers}>
          {inGameClose ? "Back to the game" : "Start game 🍺"}
        </Button>
      </div>
    </div>
  );
}

function DisplayChallenge({
  challenge,
}: {
  challenge: NonNullable<GameStateStore["currentChallenge"]>;
}) {
  const [currentSegment, setCurrentSegment] = useState(0);

  const [segments, segmentIndexes] = useMemo(() => {
    const displayParts = displayChallenge(
      [challenge.question],
      challenge.selectedPlayers,
    )[0]!;

    const segments: ReactNode[] = [];
    const segmentIndexes: number[] = [];

    for (let i = 0; i < displayParts.length; i++) {
      const part = displayParts[i];

      if (typeof part == "string") {
        const partsBetweenSplits = part.split("....");

        if (partsBetweenSplits.length > 1) {
          for (let j = 0; j < partsBetweenSplits.length; j++) {
            if (partsBetweenSplits[j] !== "")
              segments.push(partsBetweenSplits[j]);

            if (j < partsBetweenSplits.length - 1)
              segmentIndexes.push(segments.length);
          }

          continue;
        }
      }

      segments.push(part);
    }

    // This only doesn't kick in if the question ends with a "...."
    // In that case the last segmentIndex will be the end
    if (segmentIndexes.at(-1)! !== segments.length)
      segmentIndexes.push(segments.length);

    return [segments, segmentIndexes];
  }, [challenge]);

  useEffect(() => {
    setCurrentSegment(0);
  }, [segments, segmentIndexes]);

  return (
    <div className="flex flex-col justify-start gap-4">
      <span className="m-0 max-w-full break-words text-xl">
        {segments.slice(0, segmentIndexes[currentSegment]).map((segment, i) => (
          <span key={i} className="animate-fade-in">
            {segment}
          </span>
        ))}
      </span>
      {currentSegment < segmentIndexes.length - 1 && (
        <Button
          onClick={() => setCurrentSegment((s) => s + 1)}
          variant="outline"
          className="w-min flex-grow-0"
        >
          Next Part
        </Button>
      )}
    </div>
  );
}

function Game({ openPlayerManagement }: { openPlayerManagement: () => void }) {
  const currentChallenge = useGameStateStore.use.currentChallenge();
  const nextChallenge = useGameStateStore.use.nextChallenge();
  const skipOngoingChallenge = useGameStateStore.use.skipOngoingChallenge();

  return (
    <section className="flex flex-grow flex-col justify-between">
      <div className="flex flex-grow items-center">
        <AnimatePresence>
          <BouncyDiv key={currentChallenge?.id} className="w-full">
            <Card className="w-full p-0">
              <CardContent className="px-4 py-10 md:px-14">
                {currentChallenge && (
                  <DisplayChallenge
                    challenge={currentChallenge}
                    key={currentChallenge.id}
                  />
                )}
              </CardContent>
            </Card>
          </BouncyDiv>
        </AnimatePresence>
      </div>

      <div className="flex gap-2 py-4">
        <Button variant="secondary" onClick={openPlayerManagement}>
          <MdPeople className="mr-2" /> Players
        </Button>
        {currentChallenge?.type === "ongoing" && (
          <Button
            onClick={() => {
              skipOngoingChallenge();
              nextChallenge();
            }}
          >
            Skip
          </Button>
        )}
        <Button onClick={nextChallenge}>Next card</Button>
      </div>
    </section>
  );
}

function FinishedScreen() {
  return (
    <div className="flex h-[100svh] items-center justify-center">
      <div className="prose mt-[-15%] text-center">
        <h1 className="text-3xl font-bold text-foreground">That's it 🎉</h1>
        <p className="text-muted-foreground">Hope you had fun</p>
        <Link href="/game/search">
          <Button variant="default">New Game</Button>
        </Link>
      </div>
    </div>
  );
}

export default function GamePage() {
  const state = useGameStateStore.use.state();
  const router = useRouter();
  const [inGamePlayerManagement, setInGamePlayerManagement] = useState(false);

  useEffect(() => {
    const state = useGameStateStore.getState();

    if (state.state === "none" && state.selectedCollections.length === 0)
      return router.push("/game/search");

    if (state.state === "started" && state.players.length < 2)
      setInGamePlayerManagement(true);
  }, [router]);

  if (inGamePlayerManagement)
    return (
      <PlayerManagement inGameClose={() => setInGamePlayerManagement(false)} />
    );

  if (state === "none") return <PlayerManagement />;
  if (state === "finished") return <FinishedScreen />;
  else if (state === "started")
    return (
      <Game openPlayerManagement={() => setInGamePlayerManagement(true)} />
    );
}
