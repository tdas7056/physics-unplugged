
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./TeacherResults.css";
import * as XLSX from "xlsx";
import { Trophy, RefreshCw, Download, Users } from "lucide-react";

export default function TeacherResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedExam, setSelectedExam] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
const [detailQuestions, setDetailQuestions] = useState([]);
const [detailLoading, setDetailLoading] = useState(false);

 async function loadResults() {
  setLoading(true);
  setMessage("");

  const { data, error } = await supabase
.from("attempts")
.select(`
  id,
  exam_id,
  student_id,
  score,
      max_marks,
      correct_count,
      wrong_count,
      unanswered_count,
      started_at,
      submitted_at,
      exams (
        title,
        class_name
      )
    `)
    .not("submitted_at", "is", null)
    .order("score", { ascending: false });

  if (error) {
    setMessage(error.message);
    setLoading(false);
    return;
  }

  const studentIds = [
    ...new Set((data || []).map((r) => r.student_id))
  ];

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", studentIds);

  if (profileError) {
    setMessage(profileError.message);
    setLoading(false);
    return;
  }

  const profileMap = Object.fromEntries(
    (profiles || []).map((p) => [p.id, p])
  );

  const finalResults = (data || []).map((r) => ({
    ...r,
    profiles: profileMap[r.student_id] || {
      display_name: "Student"
    }
  }));

  setResults(finalResults);
  setLoading(false);
}

async function openResultDetails(result) {
  setSelectedResult(result);
  setDetailQuestions([]);
  setDetailLoading(true);
  setMessage("");

  const { data: examQuestions, error: examError } = await supabase
    .from("exam_questions")
    .select("question_id, position, questions(id, question_text, options)")
    .eq("exam_id", result.exam_id)
    .order("position", { ascending: true });

  if (examError) {
    setMessage(examError.message);
    setDetailLoading(false);
    return;
  }

  const questionIds = (examQuestions || []).map(
    (item) => item.question_id
  );

  if (questionIds.length === 0) {
    setDetailLoading(false);
    return;
  }

  const { data: answerKeys, error: keyError } = await supabase
    .from("question_keys")
    .select("question_id, correct_option, explanation")
    .in("question_id", questionIds);

  if (keyError) {
    setMessage(keyError.message);
    setDetailLoading(false);
    return;
  }

  const { data: studentAnswers, error: answerError } = await supabase
    .from("attempt_answers")
    .select("question_id, selected_option")
    .eq("attempt_id", result.id)
    .in("question_id", questionIds);

  if (answerError) {
    setMessage(answerError.message);
    setDetailLoading(false);
    return;
  }

  const keyMap = Object.fromEntries(
    (answerKeys || []).map((item) => [item.question_id, item])
  );

  const answerMap = Object.fromEntries(
    (studentAnswers || []).map((item) => [
      item.question_id,
      item.selected_option
    ])
  );

  const details = (examQuestions || []).map((item) => {
    const question = item.questions || {};
    const key = keyMap[item.question_id] || {};

    return {
      id: item.question_id,
      position: item.position,
      question_text: question.question_text || "Question unavailable",
      options: question.options || [],
      selected_option: answerMap[item.question_id] ?? null,
      correct_option: key.correct_option ?? null,
      explanation: key.explanation || ""
    };
  });

  setDetailQuestions(details);
  setDetailLoading(false);
}

  useEffect(() => {
    loadResults();
  }, []);

  const examNames = [
    ...new Set(results.map((r) => r.exams?.title).filter(Boolean))
  ];

const filteredResults = results.filter((r) => {
  const matchesExam =
    selectedExam === "all" ||
    r.exams?.title === selectedExam;

  const search = searchTerm.trim().toLowerCase();

  const matchesSearch =
    !search ||
    (r.profiles?.display_name || "").toLowerCase().includes(search) ||
    (r.exams?.title || "").toLowerCase().includes(search);

  return matchesExam && matchesSearch;
});

  function percentage(result) {
    if (!result.max_marks || result.max_marks <= 0) return 0;
    return Math.round((Number(result.score) / Number(result.max_marks)) * 100);
  }

const averagePercentage = filteredResults.length
  ? Math.round(
      filteredResults.reduce((sum, r) => sum + percentage(r), 0) /
      filteredResults.length
    )
  : 0;

const highestPercentage = filteredResults.length
  ? Math.max(...filteredResults.map(percentage))
  : 0;

const lowestPercentage = filteredResults.length
  ? Math.min(...filteredResults.map(percentage))
  : 0;

const passedCount = filteredResults.filter(
  (r) => percentage(r) > 80
).length;

const passPercentage = filteredResults.length
  ? Math.round((passedCount / filteredResults.length) * 100)
  : 0;

const topStudents = [...filteredResults]
  .sort((a, b) => Number(b.score) - Number(a.score))
  .slice(0, 10);

function downloadExcel() {
  const rows = filteredResults.map((r, index) => ({
    Rank: index + 1,
    "Student Name": r.profiles?.display_name || "Student",
    Examination: r.exams?.title || "",
    Class: r.exams?.class_name || "",
    Score: Number(r.score),
    "Maximum Marks": Number(r.max_marks),
    Percentage: percentage(r) + "%",
    Correct: r.correct_count,
    Wrong: r.wrong_count,
    Unanswered: r.unanswered_count
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Student Results"
  );

  XLSX.writeFile(
    workbook,
    "Physics-Unplugged-Results.xlsx"
  );
}

  return (
    <main className="teacher-results">
      <div className="results-heading">
        <div>
          <h1>Student Results</h1>
          <p>Examination performance and student rankings.</p>
        </div>

        <button onClick={loadResults}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="results-summary">
        <div>
          <Users size={22} />
          <span>Total Submissions</span>
          <strong>{results.length}</strong>
        </div>

        <div>
          <Trophy size={22} />
          <span>Examinations</span>
          <strong>{examNames.length}</strong>
        </div>
      </div>

      <div className="results-toolbar">
        <input
  type="text"
  className="results-search-input"
  placeholder="Search student name or examination..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
        <select
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
        >
          <option value="all">All Examinations</option>
          {examNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

<button onClick={downloadExcel} disabled={!filteredResults.length}>
  <Download size={16} /> Download Excel
</button>
      </div>

      {message && <p className="message">{message}</p>}

      {loading ? (
        <p>Loading results...</p>
      ) : filteredResults.length === 0 ? (
        <p>No submitted results found.</p>
      ) : (
        <div className="results-table-wrap">
          <table className="results-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>Examination</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Correct</th>
                <th>Wrong</th>
                <th>Unanswered</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {filteredResults.map((r, index) => (
                <tr key={r.id}>
                  <td>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                  </td>
                  <td>{r.profiles?.display_name || "Student"}</td>
                  <td>{r.exams?.title || "—"}</td>
                  <td>{r.score} / {r.max_marks}</td>
                  <td>{percentage(r)}%</td>
                  <td>{r.correct_count}</td>
                  <td>{r.wrong_count}</td>
                  <td>{r.unanswered_count}</td>
                  <td>
  <button
    className="view-details-button"
    onClick={() => openResultDetails(r)}
  >
    View Details
  </button>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
{selectedResult && (
  <section className="result-detail-panel">
    <div className="result-detail-heading">
      <div>
        <h2>Attempt Details</h2>
        <p>
          {selectedResult.profiles?.display_name || "Student"} —{" "}
          {selectedResult.exams?.title || "Examination"}
        </p>
      </div>

      <button
        className="close-details-button"
        onClick={() => setSelectedResult(null)}
      >
        Close
      </button>
    </div>

    <div className="result-detail-summary">
      <div>
        <span>Score</span>
        <strong>
          {selectedResult.score} / {selectedResult.max_marks}
        </strong>
      </div>

      <div>
        <span>Percentage</span>
        <strong>{percentage(selectedResult)}%</strong>
      </div>

      <div>
        <span>Correct</span>
        <strong>{selectedResult.correct_count}</strong>
      </div>

      <div>
        <span>Wrong</span>
        <strong>{selectedResult.wrong_count}</strong>
      </div>
    </div>

    {detailLoading ? (
      <p>Loading question details...</p>
    ) : detailQuestions.length === 0 ? (
      <p>No question details found.</p>
    ) : (
      <div className="result-detail-questions">
        {detailQuestions.map((question, index) => {
          const options = Array.isArray(question.options)
            ? question.options
            : [];

          return (
            <article className="result-detail-question" key={question.id}>
              <h3>
                Question {index + 1}
              </h3>

              <p className="detail-question-text">
                {question.question_text}
              </p>

              <div className="detail-options">
                {options.map((option, optionIndex) => {
                  const isSelected =
                    question.selected_option === optionIndex;

                  const isCorrect =
                    question.correct_option === optionIndex;

                  return (
                    <div
                      key={optionIndex}
                      className={[
                        "detail-option",
                        isSelected ? "selected-option" : "",
                        isCorrect ? "correct-option" : "",
                        isSelected && !isCorrect ? "wrong-option" : ""
                      ].join(" ")}
                    >
                      <span>
                        {String.fromCharCode(65 + optionIndex)}.
                      </span>{" "}
                      {option}

                      {isCorrect && <strong> — Correct Answer</strong>}

                      {isSelected && <strong> — Student's Answer</strong>}
                    </div>
                  );
                })}
              </div>

              {question.selected_option === null && (
                <p className="unanswered-label">
                  Student did not answer this question.
                </p>
              )}

              {question.explanation && (
                <div className="detail-explanation">
                  <strong>Explanation</strong>
                  <p>{question.explanation}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    )}
  </section>
)}

    </main>
  );
}
