import { Router } from "express";
import {
  createSession,
  joinSession,
  getSession,
  submitQuiz,
  submitVote,
  setOptions,
  getUserKey,
} from "../services/session.js";
import { generateOptions, generateResult } from "../services/claude.js";
import { PERSONA_QUIZ, PREFERENCES_QUIZ } from "../data/questions.js";
import type { QuizSubmission, UserVotes } from "../types.js";

const router = Router();

// Get both quizzes
router.get("/api/quizzes", (_req, res) => {
  res.json({ quizzes: [PERSONA_QUIZ, PREFERENCES_QUIZ] });
});

// Create session
router.post("/api/session", (req, res) => {
  const { username } = req.body as { username?: string };
  if (!username) {
    res.status(400).json({ error: "username is required" });
    return;
  }

  const session = createSession(username);
  res.json({ code: session.code, session });
});

// Join session
router.post("/api/session/:code/join", (req, res) => {
  const { code } = req.params;
  const { username } = req.body as { username?: string };
  if (!username) {
    res.status(400).json({ error: "username is required" });
    return;
  }

  try {
    const session = joinSession(code, username);
    res.json({ session });
  } catch (err: any) {
    const msg = err.message as string;
    if (msg === "Session not found") {
      res.status(404).json({ error: msg });
    } else {
      res.status(409).json({ error: msg });
    }
  }
});

// Poll session status
router.get("/api/session/:code/status", (req, res) => {
  const session = getSession(req.params.code);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  res.json({ session });
});

// Submit quiz
router.post("/api/session/:code/submit", (req, res) => {
  const { code } = req.params;
  const { username, submission } = req.body as {
    username?: string;
    submission?: QuizSubmission;
  };

  if (!username || !submission) {
    res.status(400).json({ error: "username and submission are required" });
    return;
  }

  try {
    const session = submitQuiz(code, username, submission);

    // If both preference quizzes are in and status moved to "generating",
    // kick off Claude in the background
    if (session.status === "generating") {
      const u1 = session.users.user1!;
      const u2 = session.users.user2!;

      generateOptions(u1.persona!, u1.preferences!, u2.persona!, u2.preferences!)
        .then((options) => {
          setOptions(code, options);
          console.log(`Options generated for session ${code}`);
        })
        .catch((err) => {
          console.error(`Failed to generate options for session ${code}:`, err);
          const current = getSession(code);
          if (current) {
            current.error = `Failed to generate options: ${err.message}`;
          }
        });
    }

    res.json({ session });
  } catch (err: any) {
    const msg = err.message as string;
    if (msg === "Session not found") {
      res.status(404).json({ error: msg });
    } else if (msg === "User not in session") {
      res.status(404).json({ error: msg });
    } else {
      res.status(409).json({ error: msg });
    }
  }
});

// Submit votes
router.post("/api/session/:code/vote", (req, res) => {
  const { code } = req.params;
  const { username, votes } = req.body as {
    username?: string;
    votes?: UserVotes;
  };

  if (!username || !votes) {
    res.status(400).json({ error: "username and votes are required" });
    return;
  }

  try {
    const session = submitVote(code, username, votes);

    // If voting is complete and there's a result, generate detailed recommendation
    if (session.status === "complete" && session.result) {
      const u1 = session.users.user1!;
      const u2 = session.users.user2!;

      generateResult(
        session.result,
        u1.persona!,
        u1.preferences!,
        u2.persona!,
        u2.preferences!
      )
        .then((details) => {
          // Attach the detailed description to the result
          const current = getSession(code);
          if (current?.result) {
            current.result.description = details;
          }
          console.log(`Result details generated for session ${code}`);
        })
        .catch((err) => {
          console.error(
            `Failed to generate result for session ${code}:`,
            err
          );
        });
    }

    res.json({ session });
  } catch (err: any) {
    const msg = err.message as string;
    if (msg === "Session not found") {
      res.status(404).json({ error: msg });
    } else if (msg === "User not in session") {
      res.status(404).json({ error: msg });
    } else {
      res.status(409).json({ error: msg });
    }
  }
});

// Get final result
router.get("/api/session/:code/result", (req, res) => {
  const session = getSession(req.params.code);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  if (!session.result) {
    res.status(404).json({ error: "No result yet" });
    return;
  }
  res.json({ result: session.result });
});

export default router;
