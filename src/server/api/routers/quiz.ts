import { z } from "zod";
import { eq, sql, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { questions, quizAttempts, users, topics } from "~/server/db/schema";
import { env } from "~/env";

const JWT_EXPIRES_IN = "7d";

interface JwtPayload {
  userId: number;
  email: string;
  role: "user" | "admin";
}

function getJwtSecret(): string {
  return env.JWT_SECRET as string;
}

export const quizRouter = createTRPCRouter({
  // Get all topics from topics table
  getTopics: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.select().from(topics).orderBy(topics.name);
    return result.map((r) => r.name);
  }),

  // Get all topics with full details
  getAllTopics: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(topics).orderBy(topics.name);
  }),

  // Create a new topic (admin only)
  createTopic: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        userId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (user[0]?.role !== "admin") {
        throw new Error("Unauthorized: Admin role required");
      }

      const { userId: _userId, ...topicData } = input;

      const result = await ctx.db.insert(topics).values(topicData).returning();
      return result[0];
    }),

  // Delete a topic (admin only)
  deleteTopic: publicProcedure
    .input(
      z.object({
        id: z.number(),
        userId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (user[0]?.role !== "admin") {
        throw new Error("Unauthorized: Admin role required");
      }

      await ctx.db.delete(topics).where(eq(topics.id, input.id));
      return { success: true };
    }),

  // Get questions by topics (for taking a quiz)
  getQuestions: publicProcedure
    .input(
      z.object({
        topics: z.array(z.string()).optional(),
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.topics && input.topics.length > 0) {
        const result = await ctx.db
          .select()
          .from(questions)
          .where(inArray(questions.topic, input.topics))
          .orderBy(sql`RANDOM()`)
          .limit(input.limit);
        return result;
      }

      const result = await ctx.db
        .select()
        .from(questions)
        .orderBy(sql`RANDOM()`)
        .limit(input.limit);
      return result;
    }),

  // Get all questions (for admin)
  getAllQuestions: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(questions).orderBy(questions.createdAt);
  }),

  // Get a single question by ID
  getQuestion: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(questions)
        .where(eq(questions.id, input.id));
      return result[0] ?? null;
    }),

  // Create a new question (admin only)
  createQuestion: publicProcedure
    .input(
      z.object({
        topic: z.string(),
        type: z.enum(["multiple_choice", "true_false", "open_ended"]),
        question: z.string().min(1),
        options: z.array(z.string()).optional(),
        correctAnswerIndex: z.number().optional(),
        correctAnswer: z.boolean().optional(),
        suggestedAnswer: z.string().optional(),
        userId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (user[0]?.role !== "admin") {
        throw new Error("Unauthorized: Admin role required");
      }

      const { userId, ...questionData } = input;

      const result = await ctx.db
        .insert(questions)
        .values({ ...questionData, createdById: userId })
        .returning();
      return result[0];
    }),

  // Update a question (admin only)
  updateQuestion: publicProcedure
    .input(
      z.object({
        id: z.number(),
        topic: z.string().optional(),
        type: z
          .enum(["multiple_choice", "true_false", "open_ended"])
          .optional(),
        question: z.string().min(1).optional(),
        options: z.array(z.string()).optional(),
        correctAnswerIndex: z.number().optional(),
        correctAnswer: z.boolean().optional(),
        suggestedAnswer: z.string().optional(),
        userId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (user[0]?.role !== "admin") {
        throw new Error("Unauthorized: Admin role required");
      }

      const { id, userId: _userId, ...updateData } = input;

      const result = await ctx.db
        .update(questions)
        .set(updateData)
        .where(eq(questions.id, id))
        .returning();
      return result[0];
    }),

  // Delete a question (admin only)
  deleteQuestion: publicProcedure
    .input(
      z.object({
        id: z.number(),
        userId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (user[0]?.role !== "admin") {
        throw new Error("Unauthorized: Admin role required");
      }

      await ctx.db.delete(questions).where(eq(questions.id, input.id));
      return { success: true };
    }),

  // Submit quiz attempt
  submitQuizAttempt: publicProcedure
    .input(
      z.object({
        visitorId: z.string().optional(),
        userId: z.number().optional(),
        topics: z.array(z.string()),
        totalQuestions: z.number(),
        correctAnswers: z.number(),
        percentage: z.number(),
        answers: z.array(
          z.object({
            questionId: z.number(),
            userAnswer: z.union([z.string(), z.number(), z.boolean()]),
            isCorrect: z.boolean(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(quizAttempts)
        .values(input)
        .returning();
      return result[0];
    }),

  // Get quiz attempts for a visitor or user
  getAttempts: publicProcedure
    .input(
      z.object({
        visitorId: z.string().optional(),
        userId: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.userId) {
        return ctx.db
          .select()
          .from(quizAttempts)
          .where(eq(quizAttempts.userId, input.userId))
          .orderBy(sql`${quizAttempts.createdAt} DESC`);
      }
      if (input.visitorId) {
        return ctx.db
          .select()
          .from(quizAttempts)
          .where(eq(quizAttempts.visitorId, input.visitorId))
          .orderBy(sql`${quizAttempts.createdAt} DESC`);
      }
      return [];
    }),

  // Get stats
  getStats: publicProcedure
    .input(
      z.object({
        visitorId: z.string().optional(),
        userId: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      let attempts: (typeof quizAttempts.$inferSelect)[] = [];

      if (input.userId) {
        attempts = await ctx.db
          .select()
          .from(quizAttempts)
          .where(eq(quizAttempts.userId, input.userId));
      } else if (input.visitorId) {
        attempts = await ctx.db
          .select()
          .from(quizAttempts)
          .where(eq(quizAttempts.visitorId, input.visitorId));
      }

      const totalAttempts = attempts.length;
      const totalQuestions = attempts.reduce(
        (sum, a) => sum + a.totalQuestions,
        0,
      );
      const totalCorrect = attempts.reduce(
        (sum, a) => sum + a.correctAnswers,
        0,
      );
      const averageScore =
        totalQuestions > 0
          ? Math.round((totalCorrect / totalQuestions) * 100)
          : 0;

      return {
        totalAttempts,
        totalQuestions,
        totalCorrect,
        averageScore,
      };
    }),

  // Login user
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (!user[0]) {
        throw new Error("Invalid credentials");
      }

      // Compare password with bcrypt
      const isValidPassword = await bcrypt.compare(
        input.password,
        user[0].password,
      );
      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user[0].id,
          email: user[0].email,
          role: user[0].role as "user" | "admin",
        } satisfies JwtPayload,
        getJwtSecret(),
        { expiresIn: JWT_EXPIRES_IN },
      );

      return {
        id: user[0].id,
        email: user[0].email,
        role: user[0].role,
        token,
      };
    }),

  // Register user
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["user", "admin"]).default("user"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const existing = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existing[0]) {
        throw new Error("User already exists");
      }

      // Hash the password with bcrypt
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const result = await ctx.db
        .insert(users)
        .values({
          email: input.email,
          password: hashedPassword,
          role: input.role,
        })
        .returning();

      const newUser = result[0]!;

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: newUser.id,
          email: newUser.email,
          role: newUser.role as "user" | "admin",
        } satisfies JwtPayload,
        getJwtSecret(),
        { expiresIn: JWT_EXPIRES_IN },
      );

      return {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        token,
      };
    }),

  // Get current user
  getUser: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!user[0]) return null;

      return {
        id: user[0].id,
        email: user[0].email,
        role: user[0].role,
      };
    }),

  // Verify JWT token and return user data
  verifyToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const decoded = jwt.verify(input.token, getJwtSecret()) as JwtPayload;

        // Verify user still exists in database
        const user = await ctx.db
          .select()
          .from(users)
          .where(eq(users.id, decoded.userId))
          .limit(1);

        if (!user[0]) {
          return null;
        }

        return {
          id: user[0].id,
          email: user[0].email,
          role: user[0].role,
        };
      } catch {
        return null;
      }
    }),
});
