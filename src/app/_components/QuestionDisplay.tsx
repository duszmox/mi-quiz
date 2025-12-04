"use client";

import { useState } from "react";

interface QuestionDisplayProps {
  question: {
    id: number;
    topic: string;
    type: string;
    question: string;
    options?: string[] | null;
    correctAnswerIndex?: number | null;
    correctAnswer?: boolean | null;
  };
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string | number | boolean, isCorrect: boolean) => void;
  showResult?: boolean;
  existingAnswer?: {
    questionId: number;
    userAnswer: string | number | boolean;
    isCorrect: boolean;
  };
}

export function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  existingAnswer,
}: QuestionDisplayProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<
    string | number | boolean | null
  >(existingAnswer?.userAnswer ?? null);
  const [hasAnswered, setHasAnswered] = useState(!!existingAnswer);

  const handleAnswer = (answer: string | number | boolean) => {
    if (hasAnswered) return;

    setSelectedAnswer(answer);
    setHasAnswered(true);

    let isCorrect = false;
    if (question.type === "multiple_choice") {
      isCorrect = answer === question.correctAnswerIndex;
    } else if (question.type === "true_false") {
      isCorrect = answer === question.correctAnswer;
    } else {
      // Open ended questions are always marked as "submitted"
      isCorrect = true;
    }

    onAnswer(answer, isCorrect);
  };

  const getButtonClass = (index: number) => {
    const baseClass = "w-full rounded-lg border px-4 py-3 text-left transition";

    if (!hasAnswered) {
      return `${baseClass} border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-600 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/30`;
    }

    if (index === question.correctAnswerIndex) {
      return `${baseClass} border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400`;
    }

    if (index === selectedAnswer && index !== question.correctAnswerIndex) {
      return `${baseClass} border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400`;
    }

    return `${baseClass} border-gray-200 opacity-50 dark:border-gray-600`;
  };

  const getTrueFalseClass = (value: boolean) => {
    const baseClass =
      "flex-1 rounded-lg border px-6 py-4 text-center font-medium transition";

    if (!hasAnswered) {
      return `${baseClass} border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-600 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/30`;
    }

    if (value === question.correctAnswer) {
      return `${baseClass} border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400`;
    }

    if (value === selectedAnswer && value !== question.correctAnswer) {
      return `${baseClass} border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400`;
    }

    return `${baseClass} border-gray-200 opacity-50 dark:border-gray-600`;
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
          {question.topic}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {question.question}
        </h2>
      </div>

      {/* Answers */}
      <div className="space-y-3">
        {question.type === "multiple_choice" && question.options && (
          <>
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={hasAnswered}
                className={getButtonClass(index)}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium dark:bg-gray-700">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </>
        )}

        {question.type === "true_false" && (
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer(true)}
              disabled={hasAnswered}
              className={getTrueFalseClass(true)}
            >
              True
            </button>
            <button
              onClick={() => handleAnswer(false)}
              disabled={hasAnswered}
              className={getTrueFalseClass(false)}
            >
              False
            </button>
          </div>
        )}

        {question.type === "open_ended" && (
          <div className="space-y-3">
            <textarea
              className="w-full rounded-lg border border-gray-200 p-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              rows={4}
              placeholder="Type your answer here..."
              disabled={hasAnswered}
              onChange={(e) => setSelectedAnswer(e.target.value)}
            />
            {!hasAnswered && (
              <button
                onClick={() => handleAnswer((selectedAnswer as string) || "")}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
              >
                Submit Answer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Result feedback */}
      {hasAnswered && question.type !== "open_ended" && (
        <div
          className={`rounded-lg p-4 ${
            selectedAnswer === question.correctAnswerIndex ||
            selectedAnswer === question.correctAnswer
              ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {selectedAnswer === question.correctAnswerIndex ||
          selectedAnswer === question.correctAnswer ? (
            <p className="font-medium">✓ Correct!</p>
          ) : (
            <p className="font-medium">
              ✗ Incorrect.{" "}
              {question.type === "multiple_choice" &&
                question.options &&
                question.correctAnswerIndex !== null &&
                question.correctAnswerIndex !== undefined && (
                  <span>
                    The correct answer is:{" "}
                    {question.options[question.correctAnswerIndex]}
                  </span>
                )}
              {question.type === "true_false" && (
                <span>
                  The correct answer is:{" "}
                  {question.correctAnswer ? "True" : "False"}
                </span>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
