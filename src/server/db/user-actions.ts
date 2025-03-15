"use server";

import { db } from ".";
import {
  accounts,
  pinnedCollections,
  questionCollections,
  users,
} from "./schema";
import { getServerAuthSession } from "../auth";
import { userResponse } from "../user-response";
import { eq, sql } from "drizzle-orm";

export async function deleteUser() {
  const session = await getServerAuthSession();

  if (!session) return userResponse("error", "You must be logged in");
  const userId = session.user.id;

  try {
    const usersDeleted = await db.transaction(async (tx) => {
      await tx.execute(sql`
        DELETE FROM ${pinnedCollections}
        WHERE ${pinnedCollections.id} in 
        (SELECT ${questionCollections.id} FROM ${questionCollections} WHERE ${questionCollections.userId} = ${userId})
      `);

      await tx
        .delete(questionCollections)
        .where(eq(questionCollections.userId, userId));

      await tx.delete(accounts).where(eq(accounts.userId, userId));

      const userResult = await tx
        .delete(users)
        .where(eq(users.id, userId))
        .returning({ id: users.id });

      return userResult.length;
    });
    if (usersDeleted === 0) return userResponse("error", "User not found");
  } catch (error) {
    console.error(error);
    return userResponse("error", "Something went wrong");
  }
}
