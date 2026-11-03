
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./QuestionBank.css";
import { PlusCircle, Pencil, Trash2, RefreshCw } from "lucide-react";

const emptyQuestion = {
  class_name: "",
  topic: "",
  question_text: "",
  options: ["", "", "", ""],
  correct_option: "0",
  explanation: "",
};

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(emptyQuestion);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("questions")
      .select("id, class_name, topic, question_text, options, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setQuestions(data || []);
    }

    setLoading(false);
  }

  function updateOption(index, value) {
    setForm((previous) => {
      const options = [...previous.options];
      options[index] = value;
      return { ...previous, options };
    });
  }

  function startNew() {
    setForm(emptyQuestion);
    setEditingId(null);
    setShowForm(true);
    setMessage("");
  }

  async function startEdit(question) {
    const { data, error } = await supabase
      .from("question_keys")
      .select("correct_option, explanation")
      .eq("question_id", question.id)
      .single();

    if (error) {
      setMessage("Could not load answer key: " + error.message);
      return;
    }

    setForm({
      class_name: question.class_name || "",
      topic: question.topic || "",
      question_text: question.question_text || "",
      options: Array.isArray(question.options)
        ? question.options.map((option) => option.text || "")
        : ["", "", "", ""],
      correct_option: String(data.correct_option),
      explanation: data.explanation || "",
    });

    setEditingId(question.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveQuestion(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please sign in again.");
      setSaving(false);
      return;
    }

    if (form.options.some((option) => !option.trim())) {
      setMessage("Please fill in all four options.");
      setSaving(false);
      return;
    }

    const questionData = {
      class_name: form.class_name.trim(),
      topic: form.topic.trim() || null,
      question_text: form.question_text.trim(),
      options: form.options.map((text) => ({ text: text.trim() })),
      created_by: user.id,
    };

    let questionId = editingId;
    let questionError = null;

    if (editingId) {
      const result = await supabase
        .from("questions")
        .update(questionData)
        .eq("id", editingId);

      questionError = result.error;
    } else {
      const result = await supabase
        .from("questions")
        .insert(questionData)
        .select("id")
        .single();

      questionError = result.error;
      questionId = result.data?.id;
    }

    if (questionError) {
      setMessage(questionError.message);
      setSaving(false);
      return;
    }

    const answerData = {
      question_id: questionId,
      correct_option: Number(form.correct_option),
      explanation: form.explanation.trim() || null,
    };

    const { error: keyError } = await supabase
      .from("question_keys")
      .upsert(answerData, { onConflict: "question_id" });

    if (keyError) {
      setMessage(
        "Question saved, but answer key could not be saved: " +
        keyError.message
      );
      setSaving(false);
      await loadQuestions();
      return;
    }

    setMessage(editingId ? "Question updated." : "Question created.");
    setForm(emptyQuestion);
    setEditingId(null);
    setShowForm(false);
    await loadQuestions();
    setSaving(false);
  }

  async function deleteQuestion(question) {
    const confirmed = window.confirm(
      "Delete this question? It may also be used in examinations."
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", question.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Question deleted.");
      await loadQuestions();
    }
  }

  const filteredQuestions = questions.filter((question) => {
    const text = [
      question.question_text,
      question.class_name,
      question.topic,
    ].join(" ").toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <main className="question-bank">
      <header className="qb-header">
        <div>
          <p className="eyebrow">PHYSICS UNPLUGGED</p>
          <h1>Question Bank</h1>
          <p>Create and manage reusable MCQ questions.</p>
        </div>

        <button className="primary-button" onClick={startNew}>
          <PlusCircle size={18} /> Add question
        </button>
      </header>

      <div className="qb-summary">
        <strong>{questions.length}</strong>
        <span>Total questions</span>
      </div>

      {message && <p className="message">{message}</p>}

      {showForm && (
        <section className="qb-form-card">
          <h2>{editingId ? "Edit question" : "Create MCQ"}</h2>

          <form onSubmit={saveQuestion} className="qb-form">
            <label>
              Class
              <input
                value={form.class_name}
                onChange={(e) =>
                  setForm({ ...form, class_name: e.target.value })
                }
                placeholder="Example: Class 9"
                required
              />
            </label>

            <label>
              Topic
              <input
                value={form.topic}
                onChange={(e) =>
                  setForm({ ...form, topic: e.target.value })
                }
                placeholder="Example: Laws of Motion"
              />
            </label>

            <label>
              Question
              <textarea
                value={form.question_text}
                onChange={(e) =>
                  setForm({ ...form, question_text: e.target.value })
                }
                rows="4"
                placeholder="Enter your question..."
                required
              />
            </label>

            <h3>Answer options</h3>

            {form.options.map((option, index) => (
              <label key={index}>
                Option {String.fromCharCode(65 + index)}
                <input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                  required
                />
              </label>
            ))}

            <label>
              Correct answer
              <select
                value={form.correct_option}
                onChange={(e) =>
                  setForm({ ...form, correct_option: e.target.value })
                }
              >
                <option value="0">Option A</option>
                <option value="1">Option B</option>
                <option value="2">Option C</option>
                <option value="3">Option D</option>
              </select>
            </label>

            <label>
              Detailed explanation
              <textarea
                value={form.explanation}
                onChange={(e) =>
                  setForm({ ...form, explanation: e.target.value })
                }
                rows="4"
                placeholder="Explain why the correct answer is right..."
              />
            </label>

            <div className="qb-actions">
              <button className="primary-button" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update question" : "Save question"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyQuestion);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="qb-list-section">
        <div className="qb-list-heading">
          <h2>All questions</h2>
          <button className="refresh-button" onClick={loadQuestions}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <input
          className="qb-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by question, class or topic..."
        />

        {loading ? (
          <p>Loading questions...</p>
        ) : filteredQuestions.length === 0 ? (
          <div className="empty-state">
            <h3>No questions found</h3>
            <p>Add your first MCQ to the Question Bank.</p>
          </div>
        ) : (
          <div className="qb-list">
            {filteredQuestions.map((question) => (
              <article className="qb-card" key={question.id}>
                <div>
                  <span className="qb-topic">
                    {question.class_name}
                    {question.topic ? ` · ${question.topic}` : ""}
                  </span>
                  <h3>{question.question_text}</h3>

                  <ol type="A">
                    {(question.options || []).map((option, index) => (
                      <li key={index}>{option.text}</li>
                    ))}
                  </ol>
                </div>

                <div className="qb-card-actions">
                  <button onClick={() => startEdit(question)} title="Edit">
                    <Pencil size={17} />
                  </button>
                  <button
                    onClick={() => deleteQuestion(question)}
                    title="Delete"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
