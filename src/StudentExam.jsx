
import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  Flag,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Trophy,
} from "lucide-react";
import "./StudentExam.css";

export default function StudentExam({ exam, onExit, onRegisterAutoSubmit, onUnregisterAutoSubmit }) {
  const [started, setStarted] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [visited, setVisited] = useState({});
  const [marked, setMarked] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [attemptNumber, setAttemptNumber] = useState(null);

  useEffect(() => {
    if (!started || result) return;

    const timer = setInterval(() => {
      setSecondsLeft(previous => Math.max(previous - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [started, result]);

  useEffect(() => {
    if (started && secondsLeft === 0 && !result && !loading) {
      submitExam(false);
    }
  }, [started, secondsLeft, result, loading]);

  useEffect(() => {
    if (started && questions[current]) {
      setVisited(previous => ({
        ...previous,
        [questions[current].id]: true
      }));
    }
  }, [started, current, questions]);

  // ── Auto-submit registration ──────────────────────────────────────────────
  // When exam is live, register a silent submit fn so App.jsx can call it
  // if the student tries to sign out mid-exam.
  useEffect(() => {
    if (started && !result && attemptId) {
      onRegisterAutoSubmit?.(() => submitExam(false));
    } else {
      onUnregisterAutoSubmit?.();
    }
    // Cleanup on unmount (exam finished, navigated away, etc.)
    return () => { onUnregisterAutoSubmit?.(); };
  }, [started, result, attemptId]);


async function startExam() {
  setLoading(true);
  setMessage("");

  const { data, error } = await supabase.rpc("start_exam", {
    p_exam_id: exam.id
  });

  if (error) {
    setMessage(error.message);
    setLoading(false);
    return;
  }

  // Store the attempt details returned by the database.
  setAttemptId(data.attempt_id);
  setAttemptNumber(data.attempt_number ?? 1);

  // Restore exam questions.
  setQuestions(data.questions || []);

  // Restore previously saved answers.
  setAnswers(data.answers || {});

  // Restore the original remaining time.
  // Fall back to full duration for compatibility.
  const remainingTime = data.remaining_seconds !== undefined
    ? Number(data.remaining_seconds)
    : Number(data.duration_minutes || exam.duration_minutes) * 60;

  setSecondsLeft(Math.max(0, remainingTime));

  // Reset temporary navigation state.
  setCurrent(0);
  setVisited({});
  setMarked({});

  setStarted(true);

  if (data.resumed) {
    setMessage(`Your previous attempt (${data.attempt_number ?? 1}) has been restored.`);
  } else {
    setMessage(`Attempt ${data.attempt_number ?? 1} of ${data.max_attempts ?? exam.max_attempts ?? 1} started.`);
  }

  setLoading(false);
}


  async function selectAnswer(questionId, optionIndex) {
    setAnswers(previous => ({
      ...previous,
      [questionId]: optionIndex
    }));

    const { error } = await supabase.rpc("save_exam_answer", {
      p_attempt_id: attemptId,
      p_question_id: questionId,
      p_selected_option: optionIndex
    });

    if (error) {
      setMessage("Answer could not be saved: " + error.message);
    } else {
      setMessage("");
    }
  }

  async function submitExam(askConfirmation = true) {
    if (loading || result) return;

    if (askConfirmation) {
      const confirmed = window.confirm(
        "Are you sure you want to submit your examination?"
      );

      if (!confirmed) return;
    }

    setLoading(true);
    setMessage("");

    const submittedAnswers = Object.entries(answers).map(
      ([questionId, selectedOption]) => ({
        question_id: questionId,
        selected_option: selectedOption
      })
    );

    const { data, error } = await supabase.rpc("submit_exam", {
      p_attempt_id: attemptId,
      p_answers: submittedAnswers
    });

    if (error) {
      setMessage(error.message);
    } else {
      setResult(data);
    }

    setLoading(false);
  }

  function goToQuestion(index) {
    if (index >= 0 && index < questions.length) {
      setCurrent(index);
    }
  }

  function toggleMark() {
    const questionId = questions[current]?.id;
    if (!questionId) return;

    setMarked(previous => ({
      ...previous,
      [questionId]: !previous[questionId]
    }));
  }
function markForReviewAndNext() {
  const questionId = questions[current]?.id;
  if (!questionId) return;

  setMarked(previous => ({
    ...previous,
    [questionId]: true
  }));

  if (current < questions.length - 1) {
    setCurrent(current + 1);
  }
}
async function clearResponse() {
  const questionId = questions[current]?.id;
  if (!questionId) return;

  const { error } = await supabase.rpc("clear_exam_answer", {
    p_attempt_id: attemptId,
    p_question_id: questionId
  });

  if (error) {
    setMessage("Could not clear answer: " + error.message);
    return;
  }

  setAnswers(previous => {
    const updated = { ...previous };
    delete updated[questionId];
    return updated;
  });

  setMessage("");
}

  function getQuestionStatus(question) {
    if (marked[question.id]) return "marked";
    if (answers[question.id] !== undefined) return "answered";
    if (visited[question.id]) return "not-answered";
    return "not-visited";
  }

  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(marked).filter(Boolean).length;
  const notAnsweredCount = questions.filter(
    q => visited[q.id] && answers[q.id] === undefined
  ).length;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  if (!started) {
    return (
      <main className="student-exam">
        <button onClick={onExit}>
          <ArrowLeft size={15} /> Back to dashboard
        </button>

        <section className="exam-instructions">
          <h1>{exam.title}</h1>
          <p>{exam.description || "Physics examination"}</p>

          <div className="instruction-item">
            <Clock size={18} />
            Duration: {exam.duration_minutes} minutes
          </div>

          <h3>Instructions</h3>
          <ul>
            <li>Read every question carefully.</li>
            <li>Select one answer for each question.</li>
            <li>Use the question palette to navigate.</li>
            <li>You can mark questions for review.</li>
            <li>You may attempt this examination up to {exam.max_attempts ?? 1} time(s).</li>
            <li>If you leave before submitting, your unfinished attempt can be resumed with its saved answers and remaining time.</li>
          </ul>

          {message && <p className="message">{message}</p>}

          <button
            className="primary-button"
            onClick={startExam}
            disabled={loading}
          >
            {loading ? "Starting..." : "Start / Resume Examination"}
          </button>
        </section>
      </main>
    );
  }

  if (result) {
    const pct = result.max_marks > 0
      ? Math.round((result.score / result.max_marks) * 100)
      : 0;

    return (
      <main className="student-exam">
        <section className="exam-instructions">
          {/* Score ring */}
          <div
            className="result-score-ring"
            style={{ "--score-pct": pct }}
          >
            <div className="result-score-inner">
              <strong>{result.score}/{result.max_marks}</strong>
              <span>Score</span>
            </div>
          </div>

          <h1 style={{
            textAlign: "center",
            fontSize: "1.55rem",
            margin: "10px 0 4px",
            color: "#fff",
            fontFamily: "var(--font-sans)",
          }}>
            Examination Complete
          </h1>
          <p style={{
            textAlign: "center",
            color: "var(--ex-muted)",
            fontSize: "0.85rem",
            margin: "0 0 20px",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.04em",
          }}>
            {exam.title} · {pct}% Score
          </p>

          {/* Stats grid */}
          <div className="result-stats-grid">
            <div className="result-stat correct">
              <strong>{result.correct_count}</strong>
              <span>Correct</span>
            </div>
            <div className="result-stat wrong">
              <strong>{result.wrong_count}</strong>
              <span>Wrong</span>
            </div>
            <div className="result-stat skipped">
              <strong>{result.unanswered_count}</strong>
              <span>Skipped</span>
            </div>
          </div>

          {result.time_expired && (
            <div className="result-expired-banner">
              <AlertTriangle size={16} />
              Time expired — examination was auto-submitted.
            </div>
          )}

          <button className="primary-button" onClick={onExit}>
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>
        </section>
      </main>
    );
  }

  const question = questions[current];

  if (!question) {
    return (
      <main className="student-exam">
        <p>No questions are available in this examination.</p>
        <button className="primary-button" onClick={() => submitExam()}>
          Submit Examination
        </button>
      </main>
    );
  }

  return (
    <main className="cbt-exam">

      <header className="cbt-header">
        <div className="cbt-brand">
          <div className="cbt-logo">PU</div>
          <div>
            <strong>PHYSICS UNPLUGGED</strong>
            <small>Computer Based Examination</small>
          </div>
        </div>

        <div className="cbt-exam-title">
          <strong>{exam.title}</strong>
          <small>Online Examination</small>
        </div>

<div className={`cbt-timer${secondsLeft <= 300 && secondsLeft > 0 ? " warning" : ""}`}>
  <Clock size={22} />
  <div>
    <small>TIME REMAINING</small>
    <strong>{formattedTime}</strong>
  </div>
</div>
      </header>

      <div className="cbt-body">

        <section className="cbt-main">

          <div className="cbt-question-toolbar">
            <span>Question {current + 1} of {questions.length}</span>
            <span className="cbt-marks">
              Maximum Marks: {exam.positive_marks || 1}
            </span>
          </div>

          <article className="cbt-question-card">
            <div className="cbt-question-heading">
              <h3>Question {current + 1}</h3>
              {marked[question.id] && (
                <span className="cbt-mark-label">
                  <Flag size={14} /> Marked for Review
                </span>
              )}
            </div>

<p className="cbt-question-text">
  {question.question_text}
</p>

{question.image_url && (
  <div className="cbt-question-image-container">
    <img
      src={question.image_url}
      alt="Question diagram"
      className="cbt-question-image"
    />
  </div>
)}

<div className="cbt-options">
              {(question.options || []).map((option, index) => (
                <label
                  key={index}
                  className={
                    answers[question.id] === index
                      ? "cbt-option selected"
                      : "cbt-option"
                  }
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={answers[question.id] === index}
                    onChange={() => selectAnswer(question.id, index)}
                  />

                  <span className="cbt-option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span className="cbt-option-text">
                    {typeof option === "string" ? option : option.text}
                  </span>
                </label>
              ))}
            </div>
          </article>

          {message && <p className="message">{message}</p>}


<div className="cbt-action-bar">
  <button
    className="cbt-review-button"
    onClick={markForReviewAndNext}
  >
    <Bookmark size={17} />
    Mark for Review & Next
  </button>

  <button
    className="cbt-clear-button"
    onClick={clearResponse}
    disabled={answers[question.id] === undefined}
  >
    Clear Response
  </button>

  <button
    className="cbt-previous-button"
    onClick={() => goToQuestion(current - 1)}
    disabled={current === 0}
  >
    <ChevronLeft size={17} />
    Previous
  </button>

  {current < questions.length - 1 ? (
    <button
      className="cbt-next-button"
      onClick={() => goToQuestion(current + 1)}
    >
      Save & Next
      <ChevronRight size={17} />
    </button>
  ) : (
    <button
      className="cbt-next-button"
      onClick={() => submitExam()}
      disabled={loading}
    >
      <Send size={17} />
      Submit
    </button>
  )}
</div>

        </section>

        <aside className="cbt-sidebar">

          <div className="cbt-profile">
            <div className="cbt-profile-avatar">S</div>
            <div>
              <strong>Candidate</strong>
              <small>Examination in Progress</small>
            </div>
          </div>

          <div className="cbt-palette-card">
            <h3>Question Palette</h3>

            <div className="cbt-legend">
              <span><i className="legend-answered" /> Answered</span>
              <span><i className="legend-not-answered" /> Not Answered</span>
              <span><i className="legend-not-visited" /> Not Visited</span>
              <span><i className="legend-marked" /> Marked for Review</span>
            </div>

            <div className="cbt-palette">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  className={[
                    "cbt-palette-button",
                    getQuestionStatus(q),
                    current === index ? "active" : ""
                  ].join(" ")}
                  onClick={() => goToQuestion(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="cbt-summary">
              <div>
                <span>Answered</span>
                <strong>{answeredCount}</strong>
              </div>
              <div>
                <span>Not Answered</span>
                <strong>{notAnsweredCount}</strong>
              </div>
              <div>
                <span>Marked</span>
                <strong>{markedCount}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>{questions.length}</strong>
              </div>
            </div>
          </div>

          <button
            className="cbt-submit-button"
            onClick={() => submitExam()}
            disabled={loading}
          >
            <CheckCircle2 size={18} />
            {loading ? "Submitting..." : "Submit Examination"}
          </button>

        </aside>
      </div>

      <footer className="cbt-footer">
        <span>Physics Unplugged Examination Portal</span>
        <span>Do not refresh or close this window during the examination.</span>
      </footer>

    </main>
  );
}
