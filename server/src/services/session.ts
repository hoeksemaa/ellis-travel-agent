import type { Session, QuizSubmission, UserVotes, Option } from "../types.js";

const sessions = new Map<string, Session>();

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getUserKey(
  code: string,
  username: string
): "user1" | "user2" | null {
  const session = sessions.get(code);
  if (!session) return null;
  if (session.users.user1?.username === username) return "user1";
  if (session.users.user2?.username === username) return "user2";
  return null;
}

export function createSession(username: string): Session {
  let code = generateCode();
  while (sessions.has(code)) {
    code = generateCode();
  }

  const session: Session = {
    code,
    status: "lobby",
    users: {
      user1: { username },
    },
    createdAt: Date.now(),
  };

  sessions.set(code, session);
  return session;
}

export function joinSession(code: string, username: string): Session {
  const session = sessions.get(code);
  if (!session) throw new Error("Session not found");
  if (session.users.user2) throw new Error("Session is full");
  if (session.users.user1?.username === username)
    throw new Error("Cannot join your own session with the same username");

  session.users.user2 = { username };
  session.status = "persona_quiz";
  return session;
}

export function getSession(code: string): Session | undefined {
  return sessions.get(code);
}

export function submitQuiz(
  code: string,
  username: string,
  submission: QuizSubmission
): Session {
  const session = sessions.get(code);
  if (!session) throw new Error("Session not found");

  const userKey = getUserKey(code, username);
  if (!userKey) throw new Error("User not in session");

  const user = session.users[userKey]!;

  if (submission.quizId === "persona") {
    if (user.persona) throw new Error("Persona quiz already submitted");
    user.persona = submission;

    const otherKey = userKey === "user1" ? "user2" : "user1";
    if (session.users[otherKey]?.persona) {
      session.status = "preference_quiz";
    }
  } else if (submission.quizId === "preferences") {
    if (user.preferences) throw new Error("Preferences quiz already submitted");
    user.preferences = submission;

    const otherKey = userKey === "user1" ? "user2" : "user1";
    if (session.users[otherKey]?.preferences) {
      session.status = "generating";
    }
  }

  return session;
}

export function submitVote(
  code: string,
  username: string,
  votes: UserVotes
): Session {
  const session = sessions.get(code);
  if (!session) throw new Error("Session not found");

  const userKey = getUserKey(code, username);
  if (!userKey) throw new Error("User not in session");

  session.users[userKey]!.votes = votes;

  const otherKey = userKey === "user1" ? "user2" : "user1";
  if (session.users[otherKey]?.votes) {
    // Both voted — determine result
    const user1Votes = session.users.user1!.votes!;
    const user2Votes = session.users.user2!.votes!;

    // Find options where both thumbs up
    const mutuallyLiked = session.options?.filter(
      (opt) => user1Votes[opt.id] && user2Votes[opt.id]
    );

    if (mutuallyLiked && mutuallyLiked.length > 0) {
      session.result = mutuallyLiked[0];
    } else {
      // Pick option with most agreement (both liked or both disliked counts as agreement)
      let bestOption = session.options?.[0];
      let bestScore = -Infinity;

      for (const opt of session.options || []) {
        let score = 0;
        if (user1Votes[opt.id]) score++;
        if (user2Votes[opt.id]) score++;
        if (score > bestScore) {
          bestScore = score;
          bestOption = opt;
        }
      }

      session.result = bestOption;
    }

    session.status = "complete";
  }

  return session;
}

export function setOptions(code: string, options: Option[]): Session {
  const session = sessions.get(code);
  if (!session) throw new Error("Session not found");

  session.options = options;
  session.status = "voting";
  return session;
}

export function setResult(code: string, result: Option): Session {
  const session = sessions.get(code);
  if (!session) throw new Error("Session not found");

  session.result = result;
  session.status = "complete";
  return session;
}
