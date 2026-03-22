export interface QuizQuestion {
  id: string;
  question: string;
  type: "select" | "multi-select" | "text";
  options?: string[];
  hasDetails: boolean;
}

export interface Quiz {
  id: "persona" | "preferences";
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export interface QuestionAnswer {
  questionId: string;
  selected: string | string[];
  details?: string;
}

export interface QuizSubmission {
  quizId: "persona" | "preferences";
  answers: QuestionAnswer[];
}

export interface Option {
  id: string;
  name: string;
  description: string;
  matchReason: string;
}

export interface UserVotes {
  [optionId: string]: boolean;
}

export type SessionStatus =
  | "lobby"
  | "persona_quiz"
  | "preference_quiz"
  | "generating"
  | "voting"
  | "complete"
  | "error";

export interface SessionUser {
  username: string;
  persona?: QuizSubmission;
  preferences?: QuizSubmission;
  votes?: UserVotes;
}

export interface Session {
  code: string;
  status: SessionStatus;
  solo: boolean;
  users: {
    user1?: SessionUser;
    user2?: SessionUser;
  };
  options?: Option[];
  result?: Option;
  resultSummary?: string;
  error?: string;
  createdAt: number;
}
