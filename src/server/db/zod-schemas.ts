import { z } from "zod";

export const cardSchema = z.discriminatedUnion("type", [
  z.object({
    question: z.string().min(5).max(255),
    type: z.literal("normal"),
  }),
  z.object({
    question: z.string().min(5).max(255),
    questionEnd: z.string().min(5).max(255),
    type: z.literal("ongoing"),
  }),
]);

export const createCollectionSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(1_000).nullable().catch(null),
  cards: z.array(cardSchema).min(1),
});
export type CreateCollectionSchema = z.infer<typeof createCollectionSchema>;
