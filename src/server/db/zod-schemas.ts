import { z } from "zod";

export const createCollectionSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(1_000),
  cards: z.array(z.object({ question: z.string().min(5).max(255) })).min(1),
});
