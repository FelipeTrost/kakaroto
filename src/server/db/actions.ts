"use server";

import { db } from ".";
import { questionCollections } from "./schema";
import { createCollectionSchema } from "./zod-schemas";
import { getServerAuthSession } from "../auth";
import { userResponse } from "../user-response";
import { type z } from "zod";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import type { PgRelationalQuery } from "drizzle-orm/pg-core/query-builders/query";

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
    await db.insert(questionCollections).values({
      userId: session.user.id,
      language: "en",
      title: collectionData.title,
      description: collectionData.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      cards: collectionData.cards,
    });

    return userResponse("success");
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

    return userResponse("success");
  } catch (error) {
    console.error(error);
    return userResponse("error");
  }
}

/** Indexing starts at 1 */
export async function getCollesctions(
  query: string,
  pagination: {
    page: number;
    limit: number;
  },
) {
  // 1 <= limit <= 30
  const limit = Math.min(Math.max(pagination.limit, 1), 30);
  const page = Math.max(pagination.page, 1);

  const offset = Math.max(page - 1, 0) * limit;

  try {
    let pinnedQuery:
      | PgRelationalQuery<
        {
          id: number;
          pinnedCollections: {
            id: number;
            description: string | null;
            userId: string;
            title: string;
            language: string;
            cards: unknown;
            createdAt: Date;
            updatedAt: Date;
          };
        }[]
      >
      | undefined = undefined;

    if (query === "" && page === 1)
      pinnedQuery = db.query.pinnedCollections.findMany({
        with: {
          pinnedCollections: true,
        },
      });

    const collectionsQuery = db
      .select({
        collection: questionCollections,
        count: sql`count(*) OVER()`,
      })
      .from(questionCollections)
      .where(
        and(
          or(
            ilike(questionCollections.title, `%${query}%`),
            ilike(questionCollections.description, `%${query}%`),
          ),
          sql`NOT EXISTS (
            SELECT id FROM kakaroto_pinned_collections
            WHERE id = ${questionCollections.id}
          )`,
        ),
      )
      .offset(offset)
      .limit(limit);

    const [collections, pinned] = await Promise.all([
      collectionsQuery,
      pinnedQuery ?? [],
    ]);

    return userResponse("success", {
      collections: [
        ...pinned.map((p) => ({ ...p.pinnedCollections, pinned: true })),
        ...collections.map((c) => ({ ...c.collection, pinned: false })),
      ],
      count: (collections[0]?.count as number) ?? 0,
    });
  } catch (error) {
    console.error(error);
    return userResponse("error");
  }
}
