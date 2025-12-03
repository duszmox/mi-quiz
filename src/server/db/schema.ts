import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTableCreator,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Multi-project schema feature of Drizzle ORM.
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `mi-quiz_${name}`);

// Users table for authentication
export const users = createTable(
  "user",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    email: d.varchar({ length: 256 }).notNull().unique(),
    password: d.varchar({ length: 256 }).notNull(), // hashed password
    role: d.varchar({ length: 50 }).default("user").notNull(), // 'user' or 'admin'
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("user_email_idx").on(t.email)],
);

// Topics table
export const topics = createTable(
  "topic",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }).notNull().unique(),
    description: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("topic_name_idx").on(t.name)],
);

// Questions table
export const questions = createTable(
  "question",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    topic: d.varchar({ length: 256 }).notNull(),
    type: d.varchar({ length: 50 }).notNull(), // multiple_choice, true_false, open_ended
    question: d.text().notNull(),
    // For multiple choice
    options: d.jsonb().$type<string[]>(),
    correctAnswerIndex: d.integer(),
    // For true/false
    correctAnswer: d.boolean(),
    // For open ended
    suggestedAnswer: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    createdById: d.integer().references(() => users.id),
  }),
  (t) => [index("question_topic_idx").on(t.topic)],
);

// Quiz attempts table
export const quizAttempts = createTable(
  "quiz_attempt",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    visitorId: d.varchar({ length: 256 }), // For non-logged users
    userId: d.integer().references(() => users.id),
    topics: d.jsonb().$type<string[]>().notNull(),
    totalQuestions: d.integer().notNull(),
    correctAnswers: d.integer().notNull(),
    percentage: d.integer().notNull(),
    answers: d.jsonb().$type<
      Array<{
        questionId: number;
        userAnswer: string | number | boolean;
        isCorrect: boolean;
      }>
    >(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("quiz_attempt_user_idx").on(t.userId)],
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  questions: many(questions),
  quizAttempts: many(quizAttempts),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  createdBy: one(users, {
    fields: [questions.createdById],
    references: [users.id],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
}));
