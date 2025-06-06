import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type CreateCollectionSchema } from "@/server/db/zod-schemas";

type FormStore = {
  state: Record<number, Partial<CreateCollectionSchema>>;
  setState: (state: Partial<CreateCollectionSchema>, id?: number) => void;
  resetState: (id?: number) => void;
  hasState: (id?: number) => boolean;
};

export const persistFormStateStore = create<FormStore>()(
  persist(
    (set, get) => ({
      state: {
        [-1]: {
          cards: [],
          title: "",
          description: null,
        },
      },
      setState: (state: Partial<CreateCollectionSchema>, id) => {
        const prev = get().state;
        id = id ?? -1;

        set({
          state: {
            ...prev,
            [id]: {
              ...prev[id],
              ...state,
            },
          },
        });
      },
      resetState: (id) => {
        const prev = get().state;
        delete prev[id ?? -1];

        set({
          state: { ...prev },
        });
      },
      hasState: (id) => {
        const state = get().state[id ?? -1];

        return (
          !!state &&
          (!!state.title ||
            !!state.description ||
            (!!state.cards && state.cards.length > 0))
        );
      },
    }),
    {
      name: "kakaroto-create-collection-state-v2",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
