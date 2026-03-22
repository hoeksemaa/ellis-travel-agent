import { Router } from "express";
import {
  createSession,
  joinSession,
  getSession,
  submitQuiz,
  submitVote,
  setOptions,
  setSessionError,
  setResultSummary,
  getUserKey,
} from "../services/session.js";
import { generateOptions, generateResult } from "../services/claude.js";
import { PERSONA_QUIZ, PREFERENCES_QUIZ } from "../data/questions.js";
import type { QuizSubmission, UserVotes } from "../types.js";

const router = Router();

// Get both quizzes
router.get("/api/quizzes", (_req, res) => {
  console.log("[Route] GET /api/quizzes");
  res.json({ quizzes: [PERSONA_QUIZ, PREFERENCES_QUIZ] });
});

// Create session
router.post("/api/session", (req, res) => {
  const { username, solo } = req.body as { username?: string; solo?: boolean };
  if (!username || !username.trim()) {
    console.warn("[Route] POST /api/session — missing username");
    res.status(400).json({ error: "username is required" });
    return;
  }

  console.log(`[Route] POST /api/session — user: "${username}", solo: ${!!solo}`);
  const session = createSession(username.trim(), !!solo);
  res.json({ code: session.code, session });
});

// Join session
router.post("/api/session/:code/join", (req, res) => {
  const { code } = req.params;
  const { username } = req.body as { username?: string };
  if (!username || !username.trim()) {
    console.warn(`[Route] POST /api/session/${code}/join — missing username`);
    res.status(400).json({ error: "username is required" });
    return;
  }

  console.log(`[Route] POST /api/session/${code}/join — user: "${username}"`);
  try {
    const session = joinSession(code, username.trim());
    res.json({ session });
  } catch (err: any) {
    console.error(`[Route] Join session ${code} failed:`, err.message);
    if (err.message === "Session not found") {
      res.status(404).json({ error: err.message });
    } else {
      res.status(409).json({ error: err.message });
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
    console.warn(`[Route] POST /api/session/${code}/submit — missing fields`);
    res.status(400).json({ error: "username and submission are required" });
    return;
  }

  console.log(`[Route] POST /api/session/${code}/submit — user: "${username}", quiz: ${submission.quizId}`);

  try {
    const session = submitQuiz(code, username, submission);

    // If quizzes are done and status moved to "generating",
    // kick off Claude in the background
    if (session.status === "generating") {
      const u1 = session.users.user1!;
      const u2 = session.users.user2;

      console.log(`[Route] ${session.solo ? "Solo user" : "Both users"} submitted. Triggering Claude option generation for session ${code}`);

      generateOptions(u1.persona!, u1.preferences!, u2?.persona, u2?.preferences)
        .then((options) => {
          setOptions(code, options);
        })
        .catch((err) => {
          console.error(`[Route] Claude generateOptions failed for session ${code}:`, err.message);
          setSessionError(code, `Failed to generate options: ${err.message}`);
        });
    }

    res.json({ session });
  } catch (err: any) {
    console.error(`[Route] Submit quiz failed for session ${code}:`, err.message);
    if (err.message === "Session not found" || err.message === "User not in session") {
      res.status(404).json({ error: err.message });
    } else {
      res.status(409).json({ error: err.message });
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
    console.warn(`[Route] POST /api/session/${code}/vote — missing fields`);
    res.status(400).json({ error: "username and votes are required" });
    return;
  }

  console.log(`[Route] POST /api/session/${code}/vote — user: "${username}", votes:`, votes);

  try {
    const session = submitVote(code, username, votes);

    // If voting is complete and there's a result, generate detailed recommendation
    if (session.status === "complete" && session.result) {
      const u1 = session.users.user1!;
      const u2 = session.users.user2;

      console.log(`[Route] Voting complete. Generating result summary for session ${code}`);

      generateResult(
        session.result,
        u1.persona!,
        u1.preferences!,
        u2?.persona,
        u2?.preferences
      )
        .then((summary) => {
          setResultSummary(code, summary);
          // Also update the result description with the detailed summary
          const current = getSession(code);
          if (current?.result) {
            current.result.description = summary;
          }
        })
        .catch((err) => {
          console.error(`[Route] Claude generateResult failed for session ${code}:`, err.message);
          // Don't set error state here — the result still exists, just without detailed summary
        });
    }

    res.json({ session });
  } catch (err: any) {
    console.error(`[Route] Vote failed for session ${code}:`, err.message);
    if (err.message === "Session not found" || err.message === "User not in session") {
      res.status(404).json({ error: err.message });
    } else {
      res.status(409).json({ error: err.message });
    }
  }
});

// Get final result
router.get("/api/session/:code/result", (req, res) => {
  const { code } = req.params;
  const session = getSession(code);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  if (session.status === "error") {
    res.status(500).json({ error: session.error || "Unknown error" });
    return;
  }
  if (!session.result) {
    res.status(404).json({ error: "No result yet" });
    return;
  }
  console.log(`[Route] GET /api/session/${code}/result — returning: "${session.result.name}"`);
  res.json({ result: session.result });
});

export default router;
