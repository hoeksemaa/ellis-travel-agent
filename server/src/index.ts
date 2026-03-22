import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import express from "express";
import sessionRouter from "./routes/session.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Validate API key on startup
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("[Server] WARNING: ANTHROPIC_API_KEY is not set. Claude API calls will fail.");
  console.warn("[Server] Add ANTHROPIC_API_KEY to your .env file in the project root.");
} else {
  console.log("[Server] ANTHROPIC_API_KEY is set");
}

app.use(express.json());
app.use(sessionRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});
