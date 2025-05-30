import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type CreateCollectionSchema } from "@/server/db/zod-schemas";

type FormStore = {
  state: CreateCollectionSchema;
  setState: (state: Partial<CreateCollectionSchema>) => void;
  resetState: () => void;
  hasState: () => boolean;
};

export const persistFormStateStore = create<FormStore>()(
  persist(
    (set, get) => ({
      state: {
        cards: [],
        title: "",
        description: null,
      },
      setState: (state: Partial<CreateCollectionSchema>) => {
        set({ state: { ...get().state, ...state } });
      },
      resetState: () => {
        set({
          state: {
            cards: [],
            title: "",
            description: null,
          },
        });
      },
      hasState: () => {
        const state = get().state;
        return !!state.title || !!state.description || state.cards.length > 0;
      },
    }),
    {
      name: "kakaroto-create-collection-state-v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
