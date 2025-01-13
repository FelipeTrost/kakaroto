import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useState, useEffect } from "react";
import { displayQuestion, parseQuestion } from "./game/parser";
import { type z } from "zod";
import {
  type cardSchema,
  type createCollectionSchema,
} from "@/server/db/zod-schemas";

type Collection = z.infer<typeof createCollectionSchema> & { id: string };
type Card = z.infer<typeof cardSchema>;

type GameState = "started" | "finished" | "none";
type GameStateStore = {
  state: GameState;
  roundNumber: number;
  totalRounds: number;
  selectedCollections: Collection[];
  players: string[];
  addPlayer: (name: string) => void;
  removePlayer: (name: string) => void;
  setChallenges: (challenges: Collection[]) => void;
  addChallenge: (challenges: Collection) => void;
  deleteChallenge: (id: Collection["id"]) => void;
  _gameCards: Card[];
  nextRound: () => void;
  _hydrated: boolean;
  setGameState: (s: GameState) => void | string;
  playedChallenges: Collection[];
  nextChallenge: () => void;
  currentChallenge: (Card & { challengeDisplay: string }) | undefined;
  ongoingChallenges: (Exclude<Card, { type: "normal" }> & {
    endRound: number;
    endDisplay: string;
  })[];
  reset: () => void;
};

function noop(...args: unknown[]) {
  args;
}
const defaultGameState = {
  state: "none",
  roundNumber: 0,
  totalRounds: 0,
  selectedCollections: [],
  players: [],
  addPlayer: noop,
  removePlayer: noop,
  setChallenges: noop,
  addChallenge: noop,
  deleteChallenge: noop,
  nextRound: noop,
  _hydrated: false,
  setGameState: noop,
  playedChallenges: [],
  nextChallenge: noop,
  currentChallenge: undefined,
  ongoingChallenges: [],
  _gameCards: [],
  reset: noop,
} satisfies GameStateStore;

const gameStateStore = create<GameStateStore>()(
  persist(
    (set, get) => ({
      _gameCards: [],
      state: "none",
      roundNumber: 0,
      totalRounds: 0,
      selectedCollections: [],
      players: [],
      addPlayer: (name) =>
        set((prev) => {
          if (prev.players.includes(name)) return prev;
          return { players: prev.players.concat(name) };
        }),
      removePlayer: (name) =>
        set((prev) => ({ players: prev.players.filter((p) => p !== name) })),
      setChallenges: (challenges) => set({ selectedCollections: challenges }),
      addChallenge: (challenge) =>
        set((prev) => {
          if (prev.selectedCollections.some((c) => c.id === challenge.id))
            return prev;
          return {
            selectedCollections: prev.selectedCollections.concat(challenge),
          };
        }),
      deleteChallenge: (id) =>
        set((prev) => {
          return {
            selectedCollections: prev.selectedCollections.filter(
              (c) => c.id !== id,
            ),
          };
        }),
      nextRound: () => set(() => ({ roundNumber: get().roundNumber + 1 })),
      _hydrated: false,
      setGameState: (s) => {
        if (s === "started") {
          const compatibleChallenges = [];
          const nPlayers = get().players.length;

          if (nPlayers < 2) return "Not enough players to start the game.";

          for (const collection of get().selectedCollections) {
            for (const card of collection.cards) {
              if (parseQuestion(card.question).nPlayers <= nPlayers)
                compatibleChallenges.push(card);
            }
          }

          set({
            state: "started",
            _gameCards: compatibleChallenges,
          });
          get().nextChallenge();
        } else {
          set({ state: s });
        }
      },
      playedChallenges: [],
      nextChallenge: () => {
        const state = get();

        let endedChallengeIdx;
        for (let i = 0; i < state.ongoingChallenges.length; i++) {
          if (state.ongoingChallenges[i]!.endRound >= state.roundNumber) {
            endedChallengeIdx = i;
            break;
          }
        }

        // TODO: use ended challenge


        // Pick random card
        const _gameCards = state._gameCards;
        const ch_idx = Math.floor(_gameCards.length * Math.random());
        const challenge = _gameCards[ch_idx];
        // take a challenge end if there arent more cards available
        if ((!challenge && state.ongoingChallenges.length > 0))
          endedChallengeIdx = 0;

        // Ongoing challenge ended
        if (endedChallengeIdx !== undefined) {
          const endedChallenge = state.ongoingChallenges[endedChallengeIdx]!;
          set({
            currentChallenge: { ...endedChallenge, challengeDisplay: endedChallenge.endDisplay, },
            ongoingChallenges: state.ongoingChallenges.toSpliced(endedChallengeIdx, 1),
            roundNumber: state.roundNumber + 1
          })
          return true
        }


        // no more cards
        if (!challenge) {
          state.reset();
          set({ state: "finished" });
          return false;
        }

        // normal challenge
        if (challenge.type === "normal") {
          const challengeDisplay = displayQuestion([challenge.question], state.players)[0]!;
          set({ currentChallenge: { ...challenge, challengeDisplay }, roundNumber: state.roundNumber + 1 });
          return true;
        }

        // ongoing challenge
        const challengeDisplay = displayQuestion([challenge.question, challenge.questionEnd], state.players)

        const challengeMinRounds = 5;
        const challengeMaxounds = 12;
        let roundsToChallengeEnd =
          Math.floor(
            Math.random() * (challengeMaxounds - challengeMinRounds),
          ) + challengeMinRounds;
        roundsToChallengeEnd = Math.min(roundsToChallengeEnd, state._gameCards.length / 1.5);

        set({
          currentChallenge: { ...challenge, challengeDisplay: challengeDisplay[0]! },
          _gameCards: state._gameCards.toSpliced(ch_idx, 1),
          roundNumber: state.roundNumber + 1,
          ongoingChallenges: state.ongoingChallenges.concat({
            ...challenge,
            endRound: state.roundNumber + roundsToChallengeEnd,
            endDisplay: challengeDisplay[1]!
          })
        });

        return true;
      },
      ongoingChallenges: [],
      currentChallenge: undefined,
      reset: () => {
        set({
          players: [],
          selectedCollections: [],
          ongoingChallenges: [],
          state: "none",
          currentChallenge: undefined,
        });
      },
    }),
    {
      name: "kakaroto-game-state-v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useGameStateStore(): GameStateStore;
export function useGameStateStore<U>(selector: (state: GameStateStore) => U): U;

export function useGameStateStore<U>(selector?: (state: GameStateStore) => U) {
  //@ts-expect-error for some reason this throws
  const storeValues = gameStateStore(selector ?? ((store) => store));

  const defaultValues = selector
    ? selector(defaultGameState)
    : defaultGameState;

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
    gameStateStore.setState({ _hydrated: true });
  }, [hydrated]);

  return hydrated ? storeValues : defaultValues;
}

useGameStateStore.getState = gameStateStore.getState;
useGameStateStore.setState = gameStateStore.setState;

useGameStateStore.use = {} as {
  [K in keyof GameStateStore]: () => GameStateStore[K];
};

const storeKeys = Object.keys(
  defaultGameState,
) as unknown as keyof GameStateStore;

for (const _preference of storeKeys) {
  const preference = _preference as keyof GameStateStore;
  //@ts-expect-error cannot get this to work
  useGameStateStore.use[preference] = () => {
    return gameStateStore(
      (store) => store[preference] as GameStateStore[typeof preference],
    );
  };
}
