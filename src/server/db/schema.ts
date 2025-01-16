import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  varchar,
  pgTableCreator,
  timestamp,
  serial,
  json,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

export const createTable = pgTableCreator((name) => `kakaroto_${name}`);

/** --------------
 * NextAuth tables
 * --------------- */
export const users = createTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
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
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: varchar("refresh_token"),
    access_token: varchar("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: varchar("id_token"),
    session_state: varchar("session_state", { length: 255 }),
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

// export const sessions = createTable(
//   "session",
//   {
//     sessionToken: varchar("sessionToken", { length: 255 })
//       .notNull()
//       .primaryKey(),
//     userId: varchar("userId", { length: 255 })
//       .notNull()
//       .references(() => users.id),
//     expires: timestamp("expires", {
//       mode: "date",
//       withTimezone: true,
//     }).notNull(),
//   },
//   (session) => ({
//     userIdIdx: index("session_userId_idx").on(session.userId),
//   }),
// );
//
// export const sessionsRelations = relations(sessions, ({ one }) => ({
//   user: one(users, { fields: [sessions.userId], references: [users.id] }),
// }));

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
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
    id: serial("id").primaryKey(),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description", { length: 1_000 }),
    language: varchar("language", { length: 1_000 }).notNull(),
    cards: json("questions"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
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

// export const questions = createTable(
//   "question",
//   {
//     id: serial("id").primaryKey(),
//     question: varchar("question", { length: 256 }).notNull(),
//     questionEnd: varchar("question_end", { length: 256 }),
//     type: varchar("type", { enum: ["normal", "ongoing"] }).notNull(),
//     collectionId: integer("collectionId")
//       .notNull()
//       .references(() => questionCollections.id),
//     createdAt: timestamp("created_at", {
//       mode: "date",
//       withTimezone: true,
//     })
//       .default(sql`CURRENT_TIMESTAMP`)
//       .notNull(),
//     updatedAt: timestamp("updated_at", {
//       mode: "date",
//       withTimezone: true,
//     }).default(sql`CURRENT_TIMESTAMP`),
//   },
//   (question) => ({
//     questionCollectionIdIdx: index("question_collection_id_idx").on(
//       question.collectionId,
//     ),
//   }),
// );
