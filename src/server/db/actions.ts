"use server";

import { db } from ".";
import { questionCollections } from "./schema";
import { createCollectionSchema } from "./zod-schemas";
import { getServerAuthSession } from "../auth";
import { userResponse } from "../user-response";
import type { z } from "zod";
import { and, eq, ilike, or } from "drizzle-orm";

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
    const a = await db
      .insert(questionCollections)
      .values({
        userId: session.user.id,
        language: "en",
        title: collectionData.title,
        description: collectionData.description,
        createdAt: new Date(),
        updatedAt: new Date(),
        cards: collectionData.cards,
      })
      .returning({ insertedId: questionCollections.id });
    console.log(a);

    return userResponse("sucess");
  } catch (error) {
    console.error(error);
    return userResponse("error");
  }
}

export async function deleteCollection(id: number) {
  try {
    const session = await getServerAuthSession();

    if (!session)
      return userResponse(
        "error",
        "You must be logged in to create a collection",
      );
    const user = session.user;

    await db
      .delete(questionCollections)
      .where(
        and(
          eq(questionCollections.id, id),
          eq(questionCollections.userId, user.id),
        ),
      );
  } catch (error) {
    return userResponse("error");
  }
}

export async function updateCollection(
  input: Partial<Exclude<z.infer<typeof createCollectionSchema>, "id">>,
  id: number,
) {
  const collectionData = createCollectionSchema.optional().parse(input);
  const session = await getServerAuthSession();

  if (!session)
    return userResponse(
      "error",
      "You must be logged in to create a collection",
    );

  try {
    await db
      .update(questionCollections)
      .set({
        description: collectionData?.description,
        title: collectionData?.title,
        cards: collectionData?.cards,
        updatedAt: new Date(),
      })
      .where(eq(questionCollections.id, id));

    return userResponse("sucess");
  } catch (error) {
    console.error(error);
    return userResponse("error");
  }
}

export async function getCollesctions(
  query: string,
  pagination: {
    page: number;
    limit: number;
  },
) {
  try {
    const collections = await db
      .select()
      .from(questionCollections)
      .where(
        or(
          ilike(questionCollections.title, `%${query}%`),
          ilike(questionCollections.description, `%${query}%`),
        ),
      )
      .limit(pagination.limit);

    return userResponse("sucess", collections);
  } catch (error) {
    console.error(error);
    return userResponse("error");
  }
}
