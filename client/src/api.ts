const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

export interface Quiz {
  id: "persona" | "preferences";
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "select" | "multi-select" | "text";
  options?: string[];
  hasDetails: boolean;
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
  | "waiting"
  | "generating"
  | "voting"
  | "complete";

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
  users: { user1?: SessionUser; user2?: SessionUser };
  options?: Option[];
  result?: Option;
  error?: string;
}

export const api = {
  getQuizzes: () =>
    request<{ quizzes: Quiz[] }>("/quizzes"),

  createSession: (username: string, solo: boolean = false) =>
    request<{ code: string; session: Session }>("/session", {
      method: "POST",
      body: JSON.stringify({ username, solo }),
    }),

  joinSession: (code: string, username: string) =>
    request<{ session: Session }>(`/session/${code}/join`, {
      method: "POST",
      body: JSON.stringify({ username }),
    }),

  getStatus: (code: string) =>
    request<{ session: Session }>(`/session/${code}/status`),

  submitQuiz: (code: string, username: string, submission: QuizSubmission) =>
    request<{ session: Session }>(`/session/${code}/submit`, {
      method: "POST",
      body: JSON.stringify({ username, submission }),
    }),

  submitVotes: (code: string, username: string, votes: UserVotes) =>
    request<{ session: Session }>(`/session/${code}/vote`, {
      method: "POST",
      body: JSON.stringify({ username, votes }),
    }),

  getResult: (code: string) =>
    request<{ result: Option }>(`/session/${code}/result`),
};
