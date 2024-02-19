import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useState, useEffect } from "react";

type GameStateStore = {
  started: boolean;
  roundNumber: number;
  totalRounds: number;
  questions: unknown[];
  setQuestions: (questions: unknown[]) => void;
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
  questions: [],
  setQuestions: noop,
  nextRound: noop,
  _hydrated: false,
} satisfies GameStateStore;

const gameStateStore = create<GameStateStore>()(
  persist(
    (set, get) => ({
      started: false,
      roundNumber: 0,
      totalRounds: 0,
      questions: [],
      setQuestions: (questions) => set({ questions }),
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

type keys = ["started", "roundNumber", "totalRounds", "questions", "_hydrated"];
const storeKeys = Object.keys(defaultGameState) as keys;

for (const preference of storeKeys) {
  //@ts-expect-error cannot get this to work
  useGameStateStore.use[preference] = () =>
    gameStateStore((store) => store[preference]);
}
