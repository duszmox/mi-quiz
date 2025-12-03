export type QuestionType = "multiple_choice" | "true_false" | "open_ended";

// Base question interface
export interface BaseQuestion {
  id: number;
  topic: string;
  type: QuestionType;
  question: string;
  createdAt: Date;
}

// Multiple choice question
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice";
  options: string[];
  correctAnswerIndex: number;
}

// True/False question
export interface TrueFalseQuestion extends BaseQuestion {
  type: "true_false";
  correctAnswer: boolean;
}

// Open ended question
export interface OpenEndedQuestion extends BaseQuestion {
  type: "open_ended";
  suggestedAnswer?: string;
}

// Discriminated union for all question types
export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | OpenEndedQuestion;

// Quiz data structure
export interface QuizData {
  topics: string[];
  questions: Question[];
}

// Quiz attempt for storing results
export interface QuizAttempt {
  id: string;
  date: Date;
  topics: string[];
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: number;
  userAnswer: string | number | boolean;
  isCorrect: boolean;
}
