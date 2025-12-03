"use client";

import Link from "next/link";

interface QuizResultsProps {
  totalQuestions: number;
  correctAnswers: number;
  topics: string[];
  onRetry?: () => void;
}

export function QuizResults({
  totalQuestions,
  correctAnswers,
  topics,
  onRetry,
}: QuizResultsProps) {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  const getGradeColor = () => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getGradeMessage = () => {
    if (percentage >= 90) return "Excellent! 🎉";
    if (percentage >= 80) return "Great job! 🌟";
    if (percentage >= 70) return "Good work! 👍";
    if (percentage >= 60) return "Not bad! 📚";
    return "Keep studying! 💪";
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Score card */}
      <div className="rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-gray-800 dark:shadow-gray-900/50">
        <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-gray-100">
          Quiz Complete!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{getGradeMessage()}</p>

        <div className="my-8">
          <div className="relative mx-auto h-40 w-40">
            <svg className="h-full w-full -rotate-90 transform">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke={
                  percentage >= 80
                    ? "#22c55e"
                    : percentage >= 60
                      ? "#eab308"
                      : "#ef4444"
                }
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentage / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${getGradeColor()}`}>
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {correctAnswers}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Correct</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {totalQuestions - correctAnswers}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Incorrect
            </p>
          </div>
        </div>
      </div>

      {/* Topics covered */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/50">
        <h3 className="mb-3 font-semibold text-gray-800 dark:text-gray-100">
          Topics Covered
        </h3>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-1 rounded-lg border border-indigo-600 px-4 py-3 font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950"
          >
            Try Again
          </button>
        )}
        <Link
          href="/"
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
