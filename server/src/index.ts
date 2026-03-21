import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import express from "express";
import sessionRouter from "./routes/session.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(sessionRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
