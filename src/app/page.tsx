"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import { useAuth } from "~/hooks/useAuth";
import { StatsCard } from "./_components/StatsCard";

export default function HomePage() {
  const { user, visitorId, isLoading: authLoading } = useAuth();

  const { data: stats, isLoading: statsLoading } = api.quiz.getStats.useQuery(
    { visitorId: visitorId || undefined, userId: user?.id },
    { enabled: !authLoading && (!!visitorId || !!user) },
  );

  const { data: questionCount } = api.quiz.getAllQuestions.useQuery();
  const { data: topics = [] } = api.quiz.getTopics.useQuery();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">
          Test Your{" "}
          <span className="text-indigo-600 dark:text-indigo-400">
            AI Knowledge
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Practice and master key concepts in Artificial Intelligence, from
          search algorithms to probabilistic reasoning.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/quiz"
            className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-indigo-700"
          >
            Start Quiz
          </Link>
          <Link
            href="/history"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            View History
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-12 grid gap-6 md:grid-cols-2">
        {!statsLoading && stats && <StatsCard stats={stats} />}

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {questionCount?.length ?? 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Questions Available
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {topics.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Topics to Study
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
          Available Topics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Link
              key={topic}
              href={`/quiz?topics=${encodeURIComponent(topic)}`}
              className="group dark:hover:bg-gray-750 rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md dark:bg-gray-800"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-900 dark:text-indigo-400">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 transition group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                {topic}
              </h3>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center text-white shadow-xl">
        <h2 className="mb-2 text-2xl font-bold">
          Ready to Test Your Knowledge?
        </h2>
        <p className="mb-6 opacity-90">
          Choose your topics and start a customized quiz now.
        </p>
        <Link
          href="/quiz"
          className="inline-block rounded-lg bg-white px-6 py-3 font-semibold text-indigo-600 transition hover:bg-gray-100"
        >
          Start Quiz Now
        </Link>
      </div>
    </div>
  );
}
