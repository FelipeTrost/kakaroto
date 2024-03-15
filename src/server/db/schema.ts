import { relations, sql } from "drizzle-orm";
import {
  index,
  int,
  primaryKey,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core";
import { type AdapterAccount } from "next-auth/adapters";

export const createTable = sqliteTableCreator((name) => `kakaroto_${name}`);

/** --------------
 * NextAuth tables
 * --------------- */
export const users = createTable("user", {
  id: text("id", { length: 255 }).notNull().primaryKey(),
  name: text("name", { length: 255 }),
  email: text("email", { length: 255 }).notNull(),
  emailVerified: int("emailVerified", {
    mode: "timestamp",
  }).default(sql`CURRENT_TIMESTAMP`),
  image: text("image", { length: 255 }),
});

export const usersAuthRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  questionCollections: many(questionCollections),
}));
// export const usersRelations = relations(users, ({ many }) => ({
//   questionCollections: many(questionCollections),
// }));

export const accounts = createTable(
  "account",
  {
    userId: text("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: text("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: text("provider", { length: 255 }).notNull(),
    providerAccountId: text("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: text("token_type", { length: 255 }),
    scope: text("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: text("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: text("sessionToken", { length: 255 }).notNull().primaryKey(),
    userId: text("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: text("identifier", { length: 255 }).notNull(),
    token: text("token", { length: 255 }).notNull(),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

/** --------------
 * Questions tables
 * --------------- */

export const questionCollections = createTable(
  "question_collection",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    userId: text("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    title: text("title", { length: 255 }).notNull(),
    description: text("description", { length: 1_000 }),
    language: text("language", { length: 1_000 }).notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).notNull(),
  },
  (questionCollection) => ({
    questionCollectionUserIdIdx: index("question_collection_user_id_idx").on(
      questionCollection.userId,
    ),
    title: index("question_collection_title_idx").on(questionCollection.title),
  }),
);

export const questionCollectiionsRelations = relations(
  questionCollections,
  ({ one }) => ({
    user: one(users, {
      fields: [questionCollections.userId],
      references: [users.id],
    }),
  }),
);

export const questions = createTable(
  "question",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    question: text("question", { length: 256 }),
    collectionId: int("collectionId", { mode: "number" })
      .notNull()
      .references(() => questionCollections.id),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: int("updatedAt", { mode: "timestamp" }),
  },
  (question) => ({
    questionCollectionIdIdx: index("question_collection_id_idx").on(
      question.collectionId,
    ),
  }),
);
