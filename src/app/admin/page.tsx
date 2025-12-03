"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useAuth } from "~/hooks/useAuth";

export default function AdminPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const utils = api.useUtils();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: topics = [] } = api.quiz.getTopics.useQuery();

  // Form state
  const [formData, setFormData] = useState({
    topic: "",
    type: "multiple_choice" as "multiple_choice" | "true_false" | "open_ended",
    question: "",
    options: ["", "", "", ""],
    correctAnswerIndex: 0,
    correctAnswer: true,
    suggestedAnswer: "",
  });

  // Set default topic when topics are loaded
  useEffect(() => {
    if (topics.length > 0 && !formData.topic) {
      setFormData((prev) => ({ ...prev, topic: topics[0]! }));
    }
  }, [topics, formData.topic]);

  const { data: questions, isLoading } = api.quiz.getAllQuestions.useQuery();

  const createMutation = api.quiz.createQuestion.useMutation({
    onSuccess: () => {
      void utils.quiz.getAllQuestions.invalidate();
      resetForm();
      setShowAddForm(false);
    },
  });

  const updateMutation = api.quiz.updateQuestion.useMutation({
    onSuccess: () => {
      void utils.quiz.getAllQuestions.invalidate();
      resetForm();
      setEditingId(null);
    },
  });

  const deleteMutation = api.quiz.deleteQuestion.useMutation({
    onSuccess: () => {
      void utils.quiz.getAllQuestions.invalidate();
    },
  });

  const resetForm = () => {
    setFormData({
      topic: topics[0] ?? "",
      type: "multiple_choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
      correctAnswer: true,
      suggestedAnswer: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const baseData = {
      topic: formData.topic,
      type: formData.type,
      question: formData.question,
      userId: user.id,
    };

    let data: typeof baseData & {
      options?: string[];
      correctAnswerIndex?: number;
      correctAnswer?: boolean;
      suggestedAnswer?: string;
    };

    if (formData.type === "multiple_choice") {
      data = {
        ...baseData,
        options: formData.options.filter((o) => o.trim() !== ""),
        correctAnswerIndex: formData.correctAnswerIndex,
      };
    } else if (formData.type === "true_false") {
      data = {
        ...baseData,
        correctAnswer: formData.correctAnswer,
      };
    } else {
      data = {
        ...baseData,
        suggestedAnswer: formData.suggestedAnswer,
      };
    }

    if (editingId) {
      updateMutation.mutate({ ...data, id: editingId });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (question: NonNullable<typeof questions>[number]) => {
    setFormData({
      topic: question.topic,
      type: question.type as "multiple_choice" | "true_false" | "open_ended",
      question: question.question,
      options: question.options ?? ["", "", "", ""],
      correctAnswerIndex: question.correctAnswerIndex ?? 0,
      correctAnswer: question.correctAnswer ?? true,
      suggestedAnswer: question.suggestedAnswer ?? "",
    });
    setEditingId(question.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: number) => {
    if (!user) return;
    if (confirm("Are you sure you want to delete this question?")) {
      deleteMutation.mutate({ id, userId: user.id });
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm dark:bg-gray-800 dark:shadow-gray-900/50">
          <div className="mb-4 text-6xl">🔒</div>
          <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
            Admin Access Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need admin privileges to access this page. Please sign in with
            an admin account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Admin Dashboard
        </h1>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (editingId) {
              resetForm();
              setEditingId(null);
            }
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {showAddForm ? "Cancel" : "Add Question"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/50">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            {editingId ? "Edit Question" : "Add New Question"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Topic
                </label>
                <select
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData({ ...formData, topic: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                >
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Question Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as typeof formData.type,
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="open_ended">Open Ended</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Question
              </label>
              <textarea
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>

            {formData.type === "multiple_choice" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Answer Options
                </label>
                {formData.options.map((option, index) => (
                  <div key={index} className="mb-2 flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formData.correctAnswerIndex === index}
                      onChange={() =>
                        setFormData({ ...formData, correctAnswerIndex: index })
                      }
                      className="h-4 w-4 text-indigo-600"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[index] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                    />
                  </div>
                ))}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select the radio button for the correct answer
                </p>
              </div>
            )}

            {formData.type === "true_false" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Correct Answer
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <input
                      type="radio"
                      name="trueFalse"
                      checked={formData.correctAnswer === true}
                      onChange={() =>
                        setFormData({ ...formData, correctAnswer: true })
                      }
                      className="h-4 w-4 text-indigo-600"
                    />
                    <span>True</span>
                  </label>
                  <label className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <input
                      type="radio"
                      name="trueFalse"
                      checked={formData.correctAnswer === false}
                      onChange={() =>
                        setFormData({ ...formData, correctAnswer: false })
                      }
                      className="h-4 w-4 text-indigo-600"
                    />
                    <span>False</span>
                  </label>
                </div>
              </div>
            )}

            {formData.type === "open_ended" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Suggested Answer (optional)
                </label>
                <textarea
                  value={formData.suggestedAnswer}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      suggestedAnswer: e.target.value,
                    })
                  }
                  rows={2}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                  setEditingId(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingId
                    ? "Update Question"
                    : "Add Question"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Questions List */}
      <div className="rounded-xl bg-white shadow-sm dark:bg-gray-800 dark:shadow-gray-900/50">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            All Questions ({questions?.length ?? 0})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-400" />
          </div>
        ) : questions && questions.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {questions.map((question) => (
              <div
                key={question.id}
                className="flex items-start justify-between p-6"
              >
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                      {question.topic}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      {question.type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200">
                    {question.question}
                  </p>
                  {question.type === "multiple_choice" && question.options && (
                    <div className="mt-2 space-y-1">
                      {question.options?.map((option, index) => (
                        <p
                          key={index}
                          className={`text-sm ${
                            index === question.correctAnswerIndex
                              ? "font-medium text-green-600 dark:text-green-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {String.fromCharCode(65 + index)}. {option}
                          {index === question.correctAnswerIndex && " ✓"}
                        </p>
                      ))}
                    </div>
                  )}
                  {question.type === "true_false" && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      Answer: {question.correctAnswer ? "True" : "False"}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(question)}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    disabled={deleteMutation.isPending}
                    className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            No questions yet. Add your first question above!
          </div>
        )}
      </div>
    </div>
  );
}
