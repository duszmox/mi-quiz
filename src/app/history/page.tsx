"use client";

import { api } from "~/trpc/react";
import { useAuth } from "~/hooks/useAuth";

export default function HistoryPage() {
  const { user, visitorId, isLoading: authLoading } = useAuth();

  const { data: attempts, isLoading } = api.quiz.getAttempts.useQuery(
    { visitorId: visitorId || undefined, userId: user?.id },
    { enabled: !authLoading && (!!visitorId || !!user) },
  );

  const { data: stats } = api.quiz.getStats.useQuery(
    { visitorId: visitorId || undefined, userId: user?.id },
    { enabled: !authLoading && (!!visitorId || !!user) },
  );

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
        Quiz History
      </h1>

      {/* Stats Summary */}
      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/50">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.totalAttempts}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Quizzes
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/50">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.averageScore}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Average Score
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/50">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.totalCorrect}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Correct Answers
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/50">
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">
              {stats.totalQuestions}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Questions
            </p>
          </div>
        </div>
      )}

      {/* History List */}
      {!attempts || attempts.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm dark:bg-gray-800 dark:shadow-gray-900/50">
          <div className="mb-4 text-6xl">📝</div>
          <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
            No Quiz History Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Take your first quiz to start tracking your progress!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <div
              key={attempt.id}
              className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md dark:bg-gray-800 dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    {attempt.topics?.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(attempt.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <div
                    className={`text-3xl font-bold ${
                      attempt.percentage >= 80
                        ? "text-green-600 dark:text-green-400"
                        : attempt.percentage >= 60
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {attempt.percentage}%
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {attempt.correctAnswers}/{attempt.totalQuestions} correct
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-full transition-all ${
                    attempt.percentage >= 80
                      ? "bg-green-500"
                      : attempt.percentage >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${attempt.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
