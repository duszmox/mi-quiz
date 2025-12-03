"use client";

interface StatsCardProps {
  stats: {
    totalAttempts: number;
    totalQuestions: number;
    totalCorrect: number;
    averageScore: number;
  };
}

export function StatsCard({ stats }: StatsCardProps) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg dark:from-indigo-600 dark:to-purple-700">
      <h3 className="mb-4 text-lg font-semibold">Your Statistics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-white/20 p-3 dark:bg-white/10">
          <p className="text-2xl font-bold">{stats.totalAttempts}</p>
          <p className="text-sm opacity-80">Quizzes Taken</p>
        </div>
        <div className="rounded-lg bg-white/20 p-3 dark:bg-white/10">
          <p className="text-2xl font-bold">{stats.averageScore}%</p>
          <p className="text-sm opacity-80">Average Score</p>
        </div>
        <div className="rounded-lg bg-white/20 p-3 dark:bg-white/10">
          <p className="text-2xl font-bold">{stats.totalCorrect}</p>
          <p className="text-sm opacity-80">Correct Answers</p>
        </div>
        <div className="rounded-lg bg-white/20 p-3 dark:bg-white/10">
          <p className="text-2xl font-bold">{stats.totalQuestions}</p>
          <p className="text-sm opacity-80">Total Questions</p>
        </div>
      </div>
    </div>
  );
}
