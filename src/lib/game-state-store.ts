import { create, type StateCreator } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect } from "react";
import { selectPlayersForQuestion, parseQuestion } from "@/lib/game/parser";
import { type z } from "zod";
import {
  type cardSchema,
  type createCollectionSchema,
} from "@/server/db/zod-schemas";
import { type questionCollections } from "@/server/db/schema";
import { generateColors } from "./colors";

type Prettify<T> = T extends (infer L)[]
  ? Prettify<L>[]
  : { [K in keyof T]: T[K] } & {};

type Collection = typeof questionCollections.$inferSelect &
  z.infer<typeof createCollectionSchema>;
type Card = z.infer<typeof cardSchema>;
type CardOngoingEnd = Omit<Extract<Card, { type: "ongoing" }>, "type"> & {
  type: "ongoing-end";
};

type GameState = "started" | "finished" | "none";
export type GameStateStore = {
  state: GameState;
  roundNumber: number;
  totalRounds: number;
  selectedCollections: Collection[];
  players: { name: string; color: string }[];
  addPlayer: (name: string) => void;
  removePlayer: (name: string) => void;
  setChallenges: (challenges: Collection[]) => void;
  addChallenge: (challenges: Collection) => void;
  deleteChallenge: (id: Collection["id"]) => void;
  _gameCards: (Card & { id: number })[];
  cardsLeft: (Card & { id: number })[];
  playedCards: number[];
  nextRound: () => void;
  _hydrated: boolean;
  setGameState: (s: GameState) => void | string;
  checkPlayersAndSetCards: () => void | string;
  playedChallenges: Collection[];
  nextChallenge: () => void;
  skipOngoingChallenge: () => void;
  currentChallenge:
    | Prettify<
        (Card | CardOngoingEnd) & {
          selectedPlayers: ReturnType<typeof selectPlayersForQuestion>;
          id: number;
        }
      >
    | undefined;
  ongoingChallenges: (Exclude<Card, { type: "normal" }> & {
    endRound: number;
    selectedPlayers: ReturnType<typeof selectPlayersForQuestion>;
    id: number;
  })[];
  reset: () => void;
};

const createGameStateStore = ((set, get) => ({
  _gameCards: [],
  cardsLeft: [],
  playedCards: [],
  state: "none",
  roundNumber: 0,
  totalRounds: 0,
  selectedCollections: [],
  players: [],
  addPlayer: (name) =>
    set((prev) => {
      if (prev.players.find((entry) => entry.name === name)) return prev;

      // recompute colors
      const colors = [...generateColors(prev.players.length + 1)];
      for (let i = 0; i < prev.players.length; i++) {
        const colorIdx = Math.floor(Math.random() * colors.length);
        prev.players[i]!.color = colors[colorIdx]!;
        colors.splice(colorIdx, 1);
      }

      return { players: prev.players.concat({ name, color: colors[0]! }) };
    }),
  removePlayer: (name) =>
    set((prev) => ({
      players: prev.players.filter((p) => p.name !== name),
    })),
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
  /**
   * Checks players and sets game cards to what is feasible
   *
   * TODO: this drops cards, and we should maybe add them back once more players are available again
   */
  checkPlayersAndSetCards() {
    const state = get();
    const nPlayers = state.players.length;

    if (nPlayers < 2) return "Not enough players to start the game.";

    // get game cards
    let gameCards = state._gameCards;
    if (state.state !== "started") {
      gameCards = [];
      let id = 0;

      const cards = [];
      for (const collection of state.selectedCollections)
        for (const card of collection.cards) cards.push({ ...card, id: id++ });

      cards.sort(() => Math.random() - 0.5);

      for (const card of cards) gameCards.push({ ...card, id: id++ });

      set({ selectedCollections: [], _gameCards: gameCards });
    }

    const compatibleChallenges = [];
    for (const card of gameCards) {
      if (
        !state.playedCards.find((n) => n === card.id) &&
        parseQuestion(card.question).nPlayers <= nPlayers
      )
        compatibleChallenges.push(card);
    }

    set({
      cardsLeft: compatibleChallenges,
      selectedCollections: [],
    });
  },
  setGameState: (s) => {
    if (s === "started") {
      const error = get().checkPlayersAndSetCards();
      if (error) return error;
      set({ state: "started" });
      get().nextChallenge();
    } else {
      set({ state: s });
    }
  },
  playedChallenges: [],
  nextChallenge: () => {
    const state = get();

    // Check if a challenge ended
    let endedChallengeIdx;
    for (let i = 0; i < state.ongoingChallenges.length; i++) {
      if (state.ongoingChallenges[i]!.endRound <= state.roundNumber) {
        endedChallengeIdx = i;
        break;
      }
    }

    // Pick random card
    const cardsLeft = state.cardsLeft;
    const ch_idx = Math.floor(cardsLeft.length * Math.random());
    const challenge = cardsLeft[ch_idx];
    // take a challenge end if there aren't more cards available
    if (!challenge && state.ongoingChallenges.length > 0) endedChallengeIdx = 0;

    // Ongoing challenge ended
    if (endedChallengeIdx !== undefined) {
      const endedChallenge = state.ongoingChallenges[endedChallengeIdx]!;
      set({
        currentChallenge: {
          ...endedChallenge,
          type: "ongoing-end",
        },
        ongoingChallenges: state.ongoingChallenges.toSpliced(
          endedChallengeIdx,
          1,
        ),
        roundNumber: state.roundNumber + 1,
      });
      return true;
    }

    // no more cards
    if (!challenge) {
      set({ state: "finished" });
      return false;
    }

    //remove selected card
    set({
      cardsLeft: state.cardsLeft.toSpliced(ch_idx, 1),
    });
    state.playedCards.push(challenge.id);

    // normal challenge
    if (challenge.type === "normal") {
      const selectedPlayers = selectPlayersForQuestion(
        [challenge.question],
        state.players,
      );

      set({
        currentChallenge: {
          ...challenge,
          selectedPlayers,
        },
        roundNumber: state.roundNumber + 1,
      });
      return true;
    }

    // ongoing challenge
    const selectedPlayers = selectPlayersForQuestion(
      [challenge.question, challenge.questionEnd],
      state.players,
    );

    const challengeMinRounds = 5;
    const challengeMaxounds = 12;
    let roundsToChallengeEnd =
      Math.floor(Math.random() * (challengeMaxounds - challengeMinRounds)) +
      challengeMinRounds;
    roundsToChallengeEnd = Math.min(
      roundsToChallengeEnd,
      state.cardsLeft.length / 1.5,
    );

    set({
      currentChallenge: {
        ...challenge,
        selectedPlayers: selectedPlayers,
      },
      roundNumber: state.roundNumber + 1,
      ongoingChallenges: state.ongoingChallenges.concat({
        ...challenge,
        endRound: state.roundNumber + roundsToChallengeEnd,
        selectedPlayers,
      }),
    });

    return true;
  },
  skipOngoingChallenge() {
    const state = get();
    if (state.currentChallenge?.type !== "ongoing")
      throw new Error("Tried to skip a challenge that wasn't ongoing");

    const ongoingIdx = state.ongoingChallenges.findIndex(
      (challenge) => challenge.id === state?.currentChallenge?.id,
    );
    if (ongoingIdx === -1)
      throw new Error(
        "Couldn't find challenge that should be on ongoingChallenges",
      );
    set({
      ongoingChallenges: state.ongoingChallenges.toSpliced(ongoingIdx, 1),
    });
  },
  ongoingChallenges: [],
  currentChallenge: undefined,
  reset: () => {
    set({
      players: [],
      ongoingChallenges: [],
      state: "none",
      currentChallenge: undefined,
      playedCards: [],
      _gameCards: [],
      cardsLeft: [],
    });
  },
})) as StateCreator<GameStateStore>;

const usePersistedGameStateStore = create<GameStateStore>()(
  persist(createGameStateStore, {
    name: "kakaroto-game-state-v1",
    storage: createJSONStorage(() => localStorage),
  }),
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function noop(...args: unknown[]): any {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  args;
}

// @ts-expect-error no store api used
const initialState = createGameStateStore(noop, noop);
const useMounted = create(() => false);

export function useGameStateStore<U>(selector: (state: GameStateStore) => U) {
  const store = usePersistedGameStateStore(selector);
  const mounted = useMounted();

  useEffect(() => {
    if (!mounted) {
      useMounted.setState(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
}
useGameStateStore.getState = usePersistedGameStateStore.getState;
useGameStateStore.setState = usePersistedGameStateStore.setState;

type CapitalizeFirstLetter<S extends string> =
  S extends `${infer First}${infer Rest}` ? `${Uppercase<First>}${Rest}` : S;

type QuickUse = {
  [T in keyof GameStateStore as `use${CapitalizeFirstLetter<T>}`]: () => GameStateStore[T];
};

useGameStateStore.use = {} as QuickUse;

const storeKeys = Object.keys(initialState) as unknown as keyof GameStateStore;

function hookKey(key: string) {
  return "use" + key.charAt(0).toUpperCase() + key.slice(1);
}

for (const key of storeKeys) {
  //@ts-expect-error cannot get this to work
  useGameStateStore.use[hookKey(key)] = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useGameStateStore((store) => store[key as keyof GameStateStore]);
  };
}
