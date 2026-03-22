import type { Session, QuizSubmission, UserVotes, Option } from "../types.js";

const sessions = new Map<string, Session>();

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
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

export function createSession(username: string, solo: boolean = false): Session {
  let code = generateCode();
  while (sessions.has(code)) {
    code = generateCode();
  }

  const session: Session = {
    code,
    status: solo ? "persona_quiz" : "lobby",
    solo,
    users: {
      user1: { username },
    },
    createdAt: Date.now(),
  };

  sessions.set(code, session);
  console.log(`[Session] Created ${solo ? "solo" : "paired"} session ${code} for user: ${username}`);
  return session;
}

export function joinSession(code: string, username: string): Session {
  const session = sessions.get(code);
  if (!session) throw new Error("Session not found");
  if (session.solo) throw new Error("Cannot join a solo session");
  if (session.users.user2) throw new Error("Session is full");
  if (session.users.user1?.username === username)
    throw new Error("Cannot join your own session with the same username");

  session.users.user2 = { username };
  session.status = "persona_quiz";
  console.log(`[Session] User "${username}" joined session ${code}. Status → persona_quiz`);
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
  if (session.status === "error") throw new Error("Session is in error state");

  const userKey = getUserKey(code, username);
  if (!userKey) throw new Error("User not in session");

  const user = session.users[userKey]!;

  if (submission.quizId === "persona") {
    if (user.persona) throw new Error("Persona quiz already submitted");
    user.persona = submission;

    if (session.solo) {
      // Solo: move straight to preference_quiz
      session.status = "preference_quiz";
      console.log(`[Session] Solo user ${username} submitted persona (session ${code}). Status → preference_quiz`);
    } else {
      const otherKey = userKey === "user1" ? "user2" : "user1";
      const bothDone = !!session.users[otherKey]?.persona;
      console.log(`[Session] ${username} submitted persona quiz (session ${code}). Partner done: ${bothDone}`);
      if (bothDone) {
        session.status = "preference_quiz";
        console.log(`[Session] Session ${code} status → preference_quiz`);
      }
    }
  } else if (submission.quizId === "preferences") {
    // Allow preferences submission as long as this user has submitted their persona
    if (!user.persona) throw new Error("Must submit persona quiz before preferences");
    if (user.preferences) throw new Error("Preferences quiz already submitted");
    user.preferences = submission;

    if (session.solo) {
      // Solo: move straight to generating
      session.status = "generating";
      console.log(`[Session] Solo user ${username} submitted preferences (session ${code}). Status → generating`);
    } else {
      const otherKey = userKey === "user1" ? "user2" : "user1";
      const otherUser = session.users[otherKey];
      const bothDone = !!otherUser?.preferences;
      console.log(`[Session] ${username} submitted preferences quiz (session ${code}). Partner done: ${bothDone}`);
      if (bothDone) {
        session.status = "generating";
        console.log(`[Session] Session ${code} status → generating`);
      }
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
  if (session.status !== "voting") throw new Error(`Cannot vote in ${session.status} state`);

  const userKey = getUserKey(code, username);
  if (!userKey) throw new Error("User not in session");

  session.users[userKey]!.votes = votes;
  console.log(`[Session] ${username} submitted votes (session ${code})`);

  if (session.solo) {
    // Solo: user1's votes are the only ones needed
    const user1Votes = session.users.user1!.votes!;

    // Pick the first option they liked, or the first option if none liked
    const liked = session.options?.filter((opt) => user1Votes[opt.id]);
    session.result = liked && liked.length > 0 ? liked[0] : session.options?.[0];
    session.status = "complete";
    console.log(`[Session] Solo session ${code}: picked "${session.result?.name}". Status → complete`);
  } else {
    const otherKey = userKey === "user1" ? "user2" : "user1";
    console.log(`[Session] Partner voted: ${!!session.users[otherKey]?.votes}`);

    if (session.users[otherKey]?.votes) {
      const user1Votes = session.users.user1!.votes!;
      const user2Votes = session.users.user2!.votes!;

      // Find options where both thumbs up
      const mutuallyLiked = session.options?.filter(
        (opt) => user1Votes[opt.id] && user2Votes[opt.id]
      );

      if (mutuallyLiked && mutuallyLiked.length > 0) {
        session.result = mutuallyLiked[0];
        console.log(`[Session] Session ${code}: mutual match — "${mutuallyLiked[0].name}"`);
      } else {
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
        console.log(`[Session] Session ${code}: best agreement — "${bestOption?.name}"`);
      }

      session.status = "complete";
      console.log(`[Session] Session ${code} status → complete`);
    }
  }

  return session;
}

export function setOptions(code: string, options: Option[]): Session {
  const session = sessions.get(code);
  if (!session) throw new Error("Session not found");

  session.options = options;
  session.status = "voting";
  console.log(`[Session] Session ${code}: ${options.length} options set. Status → voting`);
  return session;
}

export function setSessionError(code: string, error: string): Session | null {
  const session = sessions.get(code);
  if (!session) return null;

  session.status = "error";
  session.error = error;
  console.error(`[Session] Session ${code} status → error: ${error}`);
  return session;
}

export function setResultSummary(code: string, summary: string): Session | null {
  const session = sessions.get(code);
  if (!session) return null;
  session.resultSummary = summary;
  console.log(`[Session] Session ${code}: result summary set (${summary.length} chars)`);
  return session;
}
