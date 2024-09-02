import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useState, useEffect } from "react";
import { type InferSelectModel } from "drizzle-orm";
import { type questionCollections } from "@/server/db/schema";

type Challenge = InferSelectModel<typeof questionCollections>;

type GameStateStore = {
  started: boolean;
  roundNumber: number;
  totalRounds: number;
  challenges: Challenge[];
  setChallenges: (challenges: Challenge[]) => void;
  addChallenge: (challenges: Challenge) => void;
  deleteChallenge: (id: Challenge["id"]) => void;
  nextRound: () => void;
  _hydrated: boolean;
};

function noop(...args: unknown[]) {
  args;
}
const defaultGameState = {
  started: false,
  roundNumber: 0,
  totalRounds: 0,
  challenges: [],
  setChallenges: noop,
  addChallenge: noop,
  deleteChallenge: noop,
  nextRound: noop,
  _hydrated: false,
} satisfies GameStateStore;

const gameStateStore = create<GameStateStore>()(
  persist(
    (set, get) => ({
      started: false,
      roundNumber: 0,
      totalRounds: 0,
      challenges: [],
      setChallenges: (challenges) => set({ challenges }),
      addChallenge: (challenge) =>
        set((prev) => {
          if (prev.challenges.some((c) => c.id === challenge.id)) return prev;
          return { challenges: prev.challenges.concat(challenge) };
        }),
      deleteChallenge: (id) =>
        set((prev) => {
          return { challenges: prev.challenges.filter((c) => c.id !== id) };
        }),
      nextRound: () => set(() => ({ roundNumber: get().roundNumber + 1 })),
      _hydrated: false,
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
useGameStateStore.setState = gameStateStore.getState;

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
