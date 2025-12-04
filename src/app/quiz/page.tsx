"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import { useAuth } from "~/hooks/useAuth";
import { TopicSelector } from "~/app/_components/TopicSelector";
import { QuestionDisplay } from "~/app/_components/QuestionDisplay";
import { QuizResults } from "~/app/_components/QuizResults";

function QuizContent() {
  const searchParams = useSearchParams();
  const { user, visitorId } = useAuth();

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Array<{
      questionId: number;
      userAnswer: string | number | boolean;
      isCorrect: boolean;
    }>
  >([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [questionLimit, setQuestionLimit] = useState(10);

  // Parse initial topics from URL
  useEffect(() => {
    const topicsParam = searchParams.get("topics");
    if (topicsParam) {
      setSelectedTopics(topicsParam.split(",").map(decodeURIComponent));
    }
  }, [searchParams]);

  const {
    data: questions,
    isLoading,
    refetch,
  } = api.quiz.getQuestions.useQuery(
    {
      topics: selectedTopics.length > 0 ? selectedTopics : undefined,
      limit: questionLimit === 0 ? undefined : questionLimit,
    },
    {
      enabled: quizStarted,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
    },
  );

  const submitAttemptMutation = api.quiz.submitQuizAttempt.useMutation();

  const startQuiz = () => {
    if (selectedTopics.length === 0) {
      alert("Please select at least one topic");
      return;
    }
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setQuizCompleted(false);
    void refetch();
  };

  const handleAnswer = (
    answer: string | number | boolean,
    isCorrect: boolean,
  ) => {
    const currentQuestion = questions?.[currentQuestionIndex];
    if (!currentQuestion) return;

    // Check if already answered this question
    const alreadyAnswered = answers.some(
      (a) => a.questionId === currentQuestion.id,
    );
    if (alreadyAnswered) return;

    const newAnswers = [
      ...answers,
      {
        questionId: currentQuestion.id,
        userAnswer: answer,
        isCorrect,
      },
    ];
    setAnswers(newAnswers);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setQuizCompleted(false);
  };

  if (quizCompleted && questions) {
    const correctCount = answers.filter((a) => a.isCorrect).length;
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <QuizResults
          totalQuestions={questions.length}
          correctAnswers={correctCount}
          topics={selectedTopics}
          onRetry={resetQuiz}
        />
      </div>
    );
  }

  if (quizStarted && isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-400" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading questions...
          </p>
        </div>
      </div>
    );
  }

  if (quizStarted && questions && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    const existingAnswer = answers.find(
      (a) => a.questionId === currentQuestion.id,
    );
    const canGoBack = currentQuestionIndex > 0;
    const canGoForward = currentQuestionIndex < questions.length - 1;
    const allAnswered = answers.length === questions.length;

    const handleFinishQuiz = () => {
      const correctCount = answers.filter((a) => a.isCorrect).length;
      const percentage = Math.round((correctCount / answers.length) * 100);

      submitAttemptMutation.mutate({
        visitorId: visitorId || undefined,
        userId: user?.id,
        topics: selectedTopics,
        totalQuestions: answers.length,
        correctAnswers: correctCount,
        percentage,
        answers: answers,
      });

      setQuizCompleted(true);
    };

    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <QuestionDisplay
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          existingAnswer={existingAnswer}
          key={currentQuestion.id}
        />

        {/* Navigation buttons */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            disabled={!canGoBack}
            className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </button>

          {allAnswered && (
            <button
              onClick={handleFinishQuiz}
              className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
            >
              Finish Quiz
            </button>
          )}

          <button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            disabled={!canGoForward}
            className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Forward
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (quizStarted && questions?.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm dark:bg-gray-800 dark:shadow-gray-900/50">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
            No Questions Found
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            There are no questions available for the selected topics. Try
            selecting different topics or wait for more questions to be added.
          </p>
          <button
            onClick={resetQuiz}
            className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Start a Quiz
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select the topics you want to be tested on
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/50">
        <TopicSelector
          selectedTopics={selectedTopics}
          onTopicsChange={setSelectedTopics}
        />

        <div className="mt-8 border-t pt-6 dark:border-gray-700">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Number of Questions
            </label>
            <select
              value={questionLimit}
              onChange={(e) => setQuestionLimit(Number(e.target.value))}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value={5}>5 questions</option>
              <option value={10}>10 questions</option>
              <option value={20}>20 questions</option>
              <option value={30}>30 questions</option>
              <option value={50}>50 questions</option>
              <option value={0}>All questions</option>
            </select>
          </div>

          <button
            onClick={startQuiz}
            disabled={selectedTopics.length === 0}
            className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Start Quiz ({selectedTopics.length} topic
            {selectedTopics.length !== 1 ? "s" : ""} selected)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-400" />
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
