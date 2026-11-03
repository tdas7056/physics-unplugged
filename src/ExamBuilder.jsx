
import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import "./ExamBuilder.css";
export default function ExamBuilder() {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
const [missingKeys, setMissingKeys] = useState(0);
  const [previewQuestions, setPreviewQuestions] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    setMessage("");

    const [examResult, questionResult] = await Promise.all([
      supabase.from("exams")
        .select("id, title, class_name, positive_marks, negative_marks, allow_reattempt, is_published")
        .order("created_at", { ascending: false }),
      supabase.from("questions")
        .select("id, class_name, topic, question_text, options")
        .order("created_at", { ascending: false })
    ]);

    if (examResult.error || questionResult.error) {
      setMessage(
        examResult.error?.message || questionResult.error?.message
      );
    } else {
      setExams(examResult.data || []);
      setQuestions(questionResult.data || []);
    }

    setLoading(false);
  }

  async function loadAssignedQuestions(examId) {
    if (!examId) {
      setAssigned([]);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("exam_questions")
      .select("question_id, position")
      .eq("exam_id", examId)
      .order("position", { ascending: true });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const ids = (data || []).map(item => item.question_id);
const { count, error: keyError } = await supabase
  .from("question_keys")
  .select("question_id", { count: "exact", head: true })
  .in("question_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);

if (keyError) {
  setMessage(keyError.message);
} else {
  setMissingKeys(ids.length - (count || 0));
}
    if (ids.length === 0) {
      setAssigned([]);
      setLoading(false);
      return;
    }

    const { data: questionData, error: questionError } = await supabase
      .from("questions")
      .select("id, class_name, topic, question_text, options")
      .in("id", ids);

    if (questionError) {
      setMessage(questionError.message);
    } else {
      const ordered = data.map(item => ({
        ...questionData.find(q => q.id === item.question_id),
        position: item.position
      })).filter(item => item.id);

      setAssigned(ordered);
    }

    setLoading(false);
  }
async function updateReattemptSetting(checked) {
  if (!selectedExam) return;

  setLoading(true);
  setMessage("");

  const { error } = await supabase
    .from("exams")
    .update({ allow_reattempt: checked })
    .eq("id", selectedExam);

  if (error) {
    setMessage(error.message);
  } else {
    setExams((prev) =>
      prev.map((exam) =>
        exam.id === selectedExam
          ? { ...exam, allow_reattempt: checked }
          : exam
      )
    );

    setMessage(
      checked
        ? "Re-attempts enabled for this examination."
        : "Re-attempts disabled for this examination."
    );
  }

  setLoading(false);
}
  async function previewExam() {
    if (!selectedExam || assigned.length === 0) {
      setMessage("Add questions before previewing the examination.");
      return;
    }
    setPreviewLoading(true);
    setMessage("");
    const ids = assigned.map((q) => q.id);
    const { data, error } = await supabase
      .from("question_keys")
      .select("question_id, correct_option, explanation")
      .in("question_id", ids);
    if (error) {
      setMessage("Could not load answer key preview: " + error.message);
    } else {
      const keys = new Map((data || []).map((item) => [item.question_id, item]));
      setPreviewQuestions(assigned.map((q) => ({
        ...q,
        correct_option: keys.get(q.id)?.correct_option ?? null,
        explanation: keys.get(q.id)?.explanation || ""
      })));
    }
    setPreviewLoading(false);
  }

  async function updatePublishStatus(publish) {
    if (!selectedExam) return;
    if (publish && (assigned.length === 0 || missingKeys > 0)) {
      setMessage("Add questions and complete every answer key before publishing.");
      return;
    }
    const confirmText = publish
      ? "Publish this examination? Students will be able to see it."
      : "Move this examination to draft? Students will no longer see it.";
    if (!window.confirm(confirmText)) return;
    setLoading(true);
    setMessage("");
    const { error } = await supabase
      .from("exams")
      .update({ is_published: publish })
      .eq("id", selectedExam);
    if (error) {
      setMessage(error.message);
    } else {
      setExams((previous) => previous.map((exam) =>
        exam.id === selectedExam ? { ...exam, is_published: publish } : exam
      ));
      setMessage(publish ? "Examination published successfully." : "Examination moved to draft.");
    }
    setLoading(false);
  }

  async function handleExamChange(examId) {
    setSelectedExam(examId);
    setSelectedQuestions([]);
    setMessage("");
    await loadAssignedQuestions(examId);
  }

  function toggleQuestion(questionId) {
    setSelectedQuestions(previous =>
      previous.includes(questionId)
        ? previous.filter(id => id !== questionId)
        : [...previous, questionId]
    );
  }

  async function addQuestions() {
    if (!selectedExam) {
      setMessage("Please select an examination first.");
      return;
    }

    if (selectedQuestions.length === 0) {
      setMessage("Please select at least one question.");
      return;
    }

    const alreadyAdded = new Set(assigned.map(q => q.id));
    const newIds = selectedQuestions.filter(id => !alreadyAdded.has(id));

    if (newIds.length === 0) {
      setMessage("All selected questions are already in this examination.");
      return;
    }

    setLoading(true);
    setMessage("");

    const startPosition = assigned.length;

    const rows = newIds.map((questionId, index) => ({
      exam_id: selectedExam,
      question_id: questionId,
      position: startPosition + index + 1
    }));

    const { error } = await supabase
      .from("exam_questions")
      .insert(rows);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(`${newIds.length} question(s) added successfully.`);
      setSelectedQuestions([]);
      await loadAssignedQuestions(selectedExam);
    }

    setLoading(false);
  }

  async function removeQuestion(questionId) {
    if (!window.confirm("Remove this question from the examination?")) {
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("exam_questions")
      .delete()
      .eq("exam_id", selectedExam)
      .eq("question_id", questionId);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Question removed from the examination.");
      await loadAssignedQuestions(selectedExam);
    }

    setLoading(false);
  }

  async function moveQuestion(index, direction) {
    const newList = [...assigned];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= newList.length) return;

    [newList[index], newList[targetIndex]] =
      [newList[targetIndex], newList[index]];

    const updates = newList.map((question, i) => ({
      exam_id: selectedExam,
      question_id: question.id,
      position: i + 1
    }));

    setLoading(true);

    const { error } = await supabase
      .from("exam_questions")
      .upsert(updates, { onConflict: "exam_id,question_id" });

    if (error) {
      setMessage(error.message);
    } else {
      setAssigned(newList.map((q, i) => ({ ...q, position: i + 1 })));
      setMessage("Question order updated.");
    }

    setLoading(false);
  }

  const availableQuestions = useMemo(() => {
    const assignedIds = new Set(assigned.map(q => q.id));
    const exam = exams.find(item => item.id === selectedExam);

    return questions.filter(question => {
const matchesExamClass = true;

      const text = [
        question.question_text,
        question.topic,
        question.class_name
      ].join(" ").toLowerCase();

      return (
        !assignedIds.has(question.id) &&
        text.includes(search.toLowerCase())
      );
    });
  }, [questions, assigned, exams, selectedExam, search]);

  return (
    <div className="exam-builder">
      <h2>Exam Builder</h2>
      <p>Select an examination and add questions from your question bank.</p>

      {message && <p className="builder-message">{message}</p>}

      <label>Select Examination</label>
      <select
        value={selectedExam}
        onChange={e => handleExamChange(e.target.value)}
      >
        <option value="">-- Choose an examination --</option>
        {exams.map(exam => (
          <option key={exam.id} value={exam.id}>
            {exam.title} ({exam.class_name})
          </option>
        ))}
      </select>

      {selectedExam && (
        <>
          <section className="builder-section exam-control-panel">
            <h3>Exam Preview & Publishing</h3>
            <p>Review the complete question paper and answer key before making it available to students.</p>
            <div className="exam-control-actions">
              <button type="button" className="exam-preview-button" onClick={previewExam} disabled={previewLoading || loading || assigned.length === 0}>
                {previewLoading ? "Preparing preview..." : "Preview Exam Questions"}
              </button>
              {(() => {
                const published = Boolean(exams.find((exam) => exam.id === selectedExam)?.is_published);
                return (
                  <button
                    type="button"
                    className={published ? "exam-draft-button" : "exam-publish-button"}
                    onClick={() => updatePublishStatus(!published)}
                    disabled={loading || assigned.length === 0 || (!published && missingKeys > 0)}
                  >
                    {published ? "Move to Draft" : "Publish Exam"}
                  </button>
                );
              })()}
              <span className={exams.find((exam) => exam.id === selectedExam)?.is_published ? "exam-status published" : "exam-status draft"}>
                {exams.find((exam) => exam.id === selectedExam)?.is_published ? "Published" : "Draft"}
              </span>
            </div>
            {missingKeys > 0 && <small className="publish-warning">{missingKeys} answer key(s) still need to be completed before publishing.</small>}
          </section>

          <section className="builder-section">
  <h3>Attempt Settings</h3>

  <label>
    <input
      type="checkbox"
      checked={Boolean(
        exams.find((exam) => exam.id === selectedExam)?.allow_reattempt
      )}
      onChange={(e) => updateReattemptSetting(e.target.checked)}
      disabled={loading}
    />
    Allow students to re-attempt this examination
  </label>

  <p>
    When enabled, students can start another attempt.
    Previous results remain saved.
  </p>
</section>
          <section className="builder-section">
            <h3>Questions in this examination ({assigned.length})</h3>
            <div className="exam-readiness">
  {assigned.length === 0 ? (
    <p>⚠️ Not ready: No questions added.</p>
  ) : missingKeys > 0 ? (
    <p>⚠️ Not ready: {missingKeys} question(s) missing answer keys.</p>
  ) : (
    <p>✅ Ready: All {assigned.length} question(s) have answer keys.</p>
  )}
</div>
<div className="exam-total-marks">
  <strong>Total Questions: {assigned.length}</strong>
  <strong>
    Maximum Marks: {
      assigned.length *
      (Number(exams.find(e => e.id === selectedExam)?.positive_marks) || 1)
    }
  </strong>
</div>
            {assigned.length === 0 && (
              <p>No questions have been added yet.</p>
            )}

            {assigned.map((question, index) => (
              <div className="builder-question" key={question.id}>
                <div>
                  <strong>{index + 1}. {question.question_text}</strong>
                  <small>{question.topic || "General"} · {question.class_name}</small>
                </div>

                <div className="builder-actions">
                  <button
                    type="button"
                    disabled={index === 0 || loading}
                    onClick={() => moveQuestion(index, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === assigned.length - 1 || loading}
                    onClick={() => moveQuestion(index, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => removeQuestion(question.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section className="builder-section">
            <h3>Add Questions from Question Bank</h3>

            <input
              type="text"
              placeholder="Search by question, topic or class..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <p>
              {availableQuestions.length} available question(s)
              {" · "}
              {selectedQuestions.length} selected
            </p>
<button
  type="button"
  onClick={() => {
    const allIds = availableQuestions.map(q => q.id);
    const allSelected = allIds.every(id =>
      selectedQuestions.includes(id)
    );

    setSelectedQuestions(previous =>
      allSelected
        ? previous.filter(id => !allIds.includes(id))
        : [...new Set([...previous, ...allIds])]
    );
  }}
>
  {availableQuestions.length > 0 &&
  availableQuestions.every(q => selectedQuestions.includes(q.id))
    ? "Clear Selection"
    : "Select All Questions"}
</button>
{availableQuestions.map(question => (
  <div className="builder-question" key={question.id}>
    <label>
      <input
        type="checkbox"
        checked={selectedQuestions.includes(question.id)}
        onChange={() => toggleQuestion(question.id)}
      />
      <strong>{question.question_text}</strong>
      <small>{question.topic || "General"} · {question.class_name}</small>
    </label>

    <details className="question-preview">
      <summary>Preview options</summary>
      <ol type="A">
        {(question.options || []).map((option, index) => (
          <li key={index}>
            {typeof option === "string" ? option : option.text}
          </li>
        ))}
      </ol>
    </details>
  </div>
))}
            {availableQuestions.length === 0 && (
              <p>No available questions found. Check the examination class or search term.</p>
            )}

            <button
              type="button"
              onClick={addQuestions}
              disabled={loading || selectedQuestions.length === 0}
            >
              {loading ? "Please wait..." : `Add ${selectedQuestions.length} Selected Question(s)`}
            </button>
          </section>
        </>
      )}

      {previewQuestions && (
        <div className="exam-preview-overlay" role="dialog" aria-modal="true" aria-label="Examination preview">
          <div className="exam-preview-modal">
            <div className="exam-preview-header">
              <div>
                <h3>Examination Preview</h3>
                <p>{exams.find((exam) => exam.id === selectedExam)?.title} · {previewQuestions.length} questions</p>
              </div>
              <button type="button" className="exam-preview-close" onClick={() => setPreviewQuestions(null)}>Close</button>
            </div>
            {previewQuestions.map((question, index) => (
              <article className="exam-preview-question" key={question.id}>
                <h4>{index + 1}. {question.question_text}</h4>
                <ol type="A">
                  {(question.options || []).map((option, optionIndex) => {
                    const optionText = typeof option === "string" ? option : option.text;
                    const correct = question.correct_option === optionIndex;
                    return <li key={optionIndex} className={correct ? "preview-correct-option" : ""}>{optionText}{correct ? " — Correct answer" : ""}</li>;
                  })}
                </ol>
                {question.correct_option === null && <p className="preview-missing-key">Answer key missing</p>}
                {question.explanation && <div className="preview-explanation"><strong>Explanation:</strong> {question.explanation}</div>}
              </article>
            ))}
            <button type="button" className="exam-preview-bottom-close" onClick={() => setPreviewQuestions(null)}>Close Preview</button>
          </div>
        </div>
      )}

      {loading && <p>Loading...</p>}
    </div>
  );
}
