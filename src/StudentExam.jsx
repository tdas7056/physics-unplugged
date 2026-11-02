
import { useState } from "react";
import { supabase } from "./supabase";
import { Clock, ChevronLeft, ChevronRight, Send } from "lucide-react";

export default function StudentExam({ exam, onExit }) {
  const [started, setStarted] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function startExam() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.rpc("start_exam", {
      p_exam_id: exam.id
    });

    if (error) {
      setMessage(error.message);
    } else {
      setAttemptId(data.attempt_id);
      setQuestions(data.questions || []);
      setStarted(true);
    }

    setLoading(false);
  }

  function selectAnswer(questionId, optionIndex) {
    setAnswers(previous => ({
      ...previous,
      [questionId]: optionIndex
    }));
  }

async function submitExam() {
  const confirmed = window.confirm(
    "Are you sure you want to submit your examination?"
  );

  if (!confirmed) return;

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
  setMessage("Examination submitted successfully!");
}

  setLoading(false);
}

  if (!started) {
    return (
      <main className="student-exam">
        <button onClick={onExit}>← Back to dashboard</button>

        <section className="exam-instructions">
          <h1>{exam.title}</h1>
          <p>{exam.description || "Physics examination"}</p>

          <div className="instruction-item">
            <Clock size={20} />
            Duration: {exam.duration_minutes} minutes
          </div>

          <h3>Instructions</h3>
          <ul>
            <li>Read every question carefully.</li>
            <li>Select one answer for each question.</li>
            <li>You can navigate between questions.</li>
            <li>Submit your examination when finished.</li>
            <li>You can attempt this examination only once.</li>
          </ul>

          {message && <p className="message">{message}</p>}

          <button
            className="primary-button"
            onClick={startExam}
            disabled={loading}
          >
            {loading ? "Starting..." : "Start Examination"}
          </button>
        </section>
      </main>
    );
  }

  const question = questions[current];

  return (
    <main className="student-exam">
      <header className="student-exam-header">
        <h2>{exam.title}</h2>
        <span>
          Question {current + 1} of {questions.length}
        </span>
      </header>

      {question && (
        <section className="exam-question-card">
          <h3>
            Question {current + 1}
          </h3>

          <p className="exam-question-text">
            {question.question_text}
          </p>

          <div className="exam-options">
            {(question.options || []).map((option, index) => (
              <label
                key={index}
                className={
                  answers[question.id] === index
                    ? "exam-option selected"
                    : "exam-option"
                }
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={answers[question.id] === index}
                  onChange={() => selectAnswer(question.id, index)}
                />
                <span>
                  {String.fromCharCode(65 + index)}.
                  {" "}
                  {typeof option === "string" ? option : option.text}
                </span>
              </label>
            ))}
          </div>
        </section>
      )}

      <div className="question-palette">
        {questions.map((q, index) => (
          <button
            key={q.id}
            className={[
              current === index ? "current" : "",
              answers[q.id] !== undefined ? "answered" : ""
            ].join(" ")}
            onClick={() => setCurrent(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <footer className="exam-navigation">
        <button
          onClick={() => setCurrent(current - 1)}
          disabled={current === 0}
        >
          <ChevronLeft size={17} />
          Previous
        </button>

        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent(current + 1)}>
            Next
            <ChevronRight size={17} />
          </button>
        ) : (
          <button onClick={submitExam} disabled={loading}>
            <Send size={17} />
            Submit Examination
          </button>
        )}
      </footer>

      <p>
        Answered: {Object.keys(answers).length} / {questions.length}
      </p>
    </main>
  );
}
