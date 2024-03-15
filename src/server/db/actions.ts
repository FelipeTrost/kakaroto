"use server";

import { db } from ".";
import { questionCollections, questions } from "./schema";
import { createCollectionSchema } from "./zod-schemas";
import { getServerAuthSession } from "../auth";
import { userResponse } from "../user-response";
import type { z } from "zod";
import { eq } from "drizzle-orm";

export async function createColection(
  input: z.infer<typeof createCollectionSchema>,
) {
  const collectionData = createCollectionSchema.parse(input);
  const session = await getServerAuthSession();

  if (!session)
    return userResponse(
      "error",
      "You must be logged in to create a collection",
    );

  try {
    const createdCollections = await db
      .insert(questionCollections)
      .values({
        userId: session.user.id,
        language: "en",
        title: collectionData.title,
        description: collectionData.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await db.insert(questions).values(
      collectionData.cards.map((question) => ({
        ...question,
        collectionId: createdCollections[0]!.id,
      })),
    );

    return userResponse("sucess");
  } catch (error) {
    console.error(error);
    return userResponse("error");
  }
}

export async function deleteCollection(id: number) {
  const session = await getServerAuthSession();

  if (!session)
    return userResponse(
      "error",
      "You must be logged in to create a collection",
    );
  const user = session.user;

  const collection = await db
    .select()
    .from(questionCollections)
    .where(eq(questionCollections.id, id));

  if (collection.length === 0)
    return userResponse("error", "Collection not found");
  if (collection[0]?.userId !== user.id)
    return userResponse("error", "Collection doesn't belong to you");

  await db.delete(questions).where(eq(questions.collectionId, id));
  await db.delete(questionCollections).where(eq(questionCollections.id, id));
}
