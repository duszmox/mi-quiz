"use client";

import { api } from "~/trpc/react";

interface TopicSelectorProps {
  selectedTopics: string[];
  onTopicsChange: (topics: string[]) => void;
}

export function TopicSelector({
  selectedTopics,
  onTopicsChange,
}: TopicSelectorProps) {
  const { data: topics = [], isLoading } = api.quiz.getTopics.useQuery();

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      onTopicsChange(selectedTopics.filter((t) => t !== topic));
    } else {
      onTopicsChange([...selectedTopics, topic]);
    }
  };

  const selectAll = () => {
    onTopicsChange([...topics]);
  };

  const clearAll = () => {
    onTopicsChange([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Select Topics
        </h3>
        <div className="space-x-2">
          <button
            onClick={selectAll}
            className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Select All
          </button>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <button
            onClick={clearAll}
            className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => toggleTopic(topic)}
            className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
              selectedTopics.includes(topic)
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded border ${
                  selectedTopics.includes(topic)
                    ? "border-indigo-500 bg-indigo-500"
                    : "border-gray-300 dark:border-gray-500"
                }`}
              >
                {selectedTopics.includes(topic) && (
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span>{topic}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
