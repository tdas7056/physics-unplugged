
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import * as XLSX from "xlsx";
import { Trophy, RefreshCw, Download, Users } from "lucide-react";

export default function TeacherResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedExam, setSelectedExam] = useState("all");

 async function loadResults() {
  setLoading(true);
  setMessage("");

  const { data, error } = await supabase
    .from("attempts")
    .select(`
      id,
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

  useEffect(() => {
    loadResults();
  }, []);

  const examNames = [
    ...new Set(results.map((r) => r.exams?.title).filter(Boolean))
  ];

  const filteredResults =
    selectedExam === "all"
      ? results
      : results.filter((r) => r.exams?.title === selectedExam);

  function percentage(result) {
    if (!result.max_marks || result.max_marks <= 0) return 0;
    return Math.round((Number(result.score) / Number(result.max_marks)) * 100);
  }

  function downloadCSV() {
    const headers = [
      "Rank",
      "Student Name",
      "Examination",
      "Class",
      "Score",
      "Maximum Marks",
      "Percentage",
      "Correct",
      "Wrong",
      "Unanswered"
    ];

    const rows = filteredResults.map((r, index) => [
      index + 1,
      r.profiles?.display_name || "Student",
      r.exams?.title || "",
      r.exams?.class_name || "",
      r.score,
      r.max_marks,
      percentage(r) + "%",
      r.correct_count,
      r.wrong_count,
      r.unanswered_count
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) =>
          `"${String(value ?? "").replace(/"/g, '""')}"`
        ).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Physics-Unplugged-Results.csv";
    link.click();
    URL.revokeObjectURL(url);
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
        <select
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
        >
          <option value="all">All Examinations</option>
          {examNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <button onClick={downloadCSV} disabled={!filteredResults.length}>
          <Download size={16} /> Download CSV
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
