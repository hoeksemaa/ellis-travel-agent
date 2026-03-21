import { useState, useEffect, type FormEvent } from "react";
import { api, type Quiz, type QuestionAnswer, type QuizSubmission } from "../api";

interface QuizScreenProps {
  code: string;
  username: string;
  quizId: "persona" | "preferences";
  onDone: () => void;
}

export default function QuizScreen({ code, username, quizId, onDone }: QuizScreenProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getQuizzes().then(({ quizzes }) => {
      const q = quizzes.find((q) => q.id === quizId)!;
      setQuiz(q);
    });
  }, [quizId]);

  function selectOption(questionId: string, option: string, isMulti: boolean) {
    setAnswers((prev) => {
      const existing = prev[questionId];
      if (isMulti) {
        const selected = (existing?.selected as string[]) || [];
        const next = selected.includes(option)
          ? selected.filter((s) => s !== option)
          : [...selected, option];
        return { ...prev, [questionId]: { questionId, selected: next } };
      }
      return { ...prev, [questionId]: { questionId, selected: option } };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!quiz) return;

    const allAnswered = quiz.questions.every((q) => {
      const a = answers[q.id];
      if (!a) return false;
      if (Array.isArray(a.selected)) return a.selected.length > 0;
      return a.selected !== "";
    });

    if (!allAnswered) {
      setError("Please answer all questions.");
      return;
    }

    setLoading(true);
    setError("");

    const submission: QuizSubmission = {
      quizId,
      answers: Object.values(answers),
    };

    try {
      await api.submitQuiz(code, username, submission);
      onDone();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!quiz) {
    return (
      <div className="card__content">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="card__content card__content--scroll">
      <h2 className="heading">{quiz.title}</h2>
      <p className="subtitle">{quiz.description}</p>

      <form className="quiz-form" onSubmit={handleSubmit}>
        {quiz.questions.map((q) => {
          const isMulti = q.type === "multi-select";
          const answer = answers[q.id];
          const selected = answer?.selected;

          return (
            <div key={q.id} className="quiz-question">
              <p className="quiz-question__text">{q.question}</p>
              <div className="quiz-options">
                {q.options?.map((opt) => {
                  const isSelected = isMulti
                    ? (selected as string[] | undefined)?.includes(opt)
                    : selected === opt;

                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`quiz-option ${isSelected ? "quiz-option--selected" : ""}`}
                      onClick={() => selectOption(q.id, opt, isMulti)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {error && <p className="form__error">{error}</p>}

        <button className="form__button" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
