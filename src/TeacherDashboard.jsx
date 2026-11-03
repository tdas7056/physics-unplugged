
import { useEffect, useState } from "react";
import {
  PlusCircle,
  BookOpen,
  Pencil,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  LayoutDashboard,
  ClipboardList,
  Users,
  Trophy,
  GraduationCap,
  Settings,
  LogOut,
  X,
  Clock,
  FilePlus2,
  ChartNoAxesCombined,
} from "lucide-react";
import { supabase } from "./supabase";
import QuestionBank from "./QuestionBank";
import TeacherResults from "./TeacherResults";
import ExamBuilder from "./ExamBuilder";
const emptyExam = {
  title: "",
  class_name: "",
  description: "",
  duration_minutes: 30,
  positive_marks: 1,
  negative_marks: 0,
  is_published: false,
};

export default function TeacherDashboard() {
  const [exams, setExams] = useState([]);
  const [activeTab, setActiveTab] = useState("exams");
  const [form, setForm] = useState(emptyExam);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadExams();
  }, []);

  async function loadExams() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setExams(data || []);
    }

    setLoading(false);
  }

  function changeField(event) {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function startEdit(exam) {
    setForm({
      title: exam.title || "",
      class_name: exam.class_name || "",
      description: exam.description || "",
      duration_minutes: exam.duration_minutes || 30,
      positive_marks: exam.positive_marks ?? 1,
      negative_marks: exam.negative_marks ?? 0,
      is_published: exam.is_published || false,
    });
    setEditingId(exam.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNew() {
    setForm(emptyExam);
    setEditingId(null);
    setShowForm(true);
  }

  async function saveExam(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please sign in again.");
      setSaving(false);
      return;
    }

    const examData = {
      title: form.title.trim(),
      class_name: form.class_name.trim(),
      description: form.description.trim() || null,
      duration_minutes: Number(form.duration_minutes),
      positive_marks: Number(form.positive_marks),
      negative_marks: Number(form.negative_marks),
      is_published: form.is_published,
    };

    let result;

    if (editingId) {
      result = await supabase
        .from("exams")
        .update(examData)
        .eq("id", editingId);
    } else {
      result = await supabase
        .from("exams")
        .insert({
          ...examData,
          created_by: user.id,
        });
    }

    if (result.error) {
      setMessage(result.error.message);
    } else {
      setMessage(editingId ? "Examination updated." : "Examination created.");
      setForm(emptyExam);
      setEditingId(null);
      setShowForm(false);
      await loadExams();
    }

    setSaving(false);
  }

  async function togglePublish(exam) {
    const { error } = await supabase
      .from("exams")
      .update({ is_published: !exam.is_published })
      .eq("id", exam.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        exam.is_published
          ? "Examination unpublished."
          : "Examination published."
      );
      await loadExams();
    }
  }

  async function deleteExam(exam) {
    const confirmed = window.confirm(
      `Delete "${exam.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("exams")
      .delete()
      .eq("id", exam.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Examination deleted.");
      await loadExams();
    }
  }

return (
    <main className="teacher-dashboard">
 <nav className="teacher-tabs">
  <button
    className={activeTab === "exams" ? "active" : ""}
    onClick={() => setActiveTab("exams")}
  >
    <LayoutDashboard size={18} />
    <span>Dashboard</span>
  </button>

  <button
    className={activeTab === "questions" ? "active" : ""}
    onClick={() => setActiveTab("questions")}
  >
    <BookOpen size={18} />
    <span>Question Bank</span>
  </button>

  <button
    className={activeTab === "builder" ? "active" : ""}
    onClick={() => setActiveTab("builder")}
  >
    <FilePlus2 size={18} />
    <span>Exam Builder</span>
  </button>

  <button
    className={activeTab === "results" ? "active" : ""}
    onClick={() => setActiveTab("results")}
  >
    <Trophy size={18} />
    <span>Student Results</span>
  </button>
</nav>

{activeTab === "questions" ? (
  <QuestionBank />
) : activeTab === "builder" ? (
  <ExamBuilder />
) : activeTab === "results" ? (
  <TeacherResults />
) : (
  <>
    <header className="teacher-header">
  <div className="teacher-welcome">
    <p className="eyebrow">
      <GraduationCap size={16} />
      PHYSICS UNPLUGGED · TEACHER PORTAL
    </p>

    <h1>Welcome to your Dashboard</h1>
    <p>Manage examinations, build question papers, and track student performance.</p>
  </div>

  <button className="primary-button new-exam-button" onClick={startNew}>
    <PlusCircle size={19} />
    <span>Create New Exam</span>
  </button>
</header>
     <section className="teacher-stats">
  <div className="teacher-stat stat-total">
    <div className="stat-icon">
      <BookOpen size={23} />
    </div>
    <div className="stat-info">
      <strong>{exams.length}</strong>
      <span>Total Examinations</span>
    </div>
  </div>

  <div className="teacher-stat stat-published">
    <div className="stat-icon">
      <Eye size={23} />
    </div>
    <div className="stat-info">
      <strong>{exams.filter((e) => e.is_published).length}</strong>
      <span>Published Examinations</span>
    </div>
  </div>

  <div className="teacher-stat stat-draft">
    <div className="stat-icon">
      <EyeOff size={23} />
    </div>
    <div className="stat-info">
      <strong>{exams.filter((e) => !e.is_published).length}</strong>
      <span>Draft Examinations</span>
    </div>
  </div>
</section>

      {message && <p className="message">{message}</p>}

      {showForm && (
        <section className="teacher-form-card">
          <h2>{editingId ? "Edit examination" : "Create examination"}</h2>

          <form onSubmit={saveExam} className="teacher-form">
            <label>
              Examination title
              <input
                name="title"
                value={form.title}
                onChange={changeField}
                placeholder="Example: Class 9 Physics Test"
                required
              />
            </label>

            <label>
              Class / Subject / Topic
              <input
                name="class_name"
                value={form.class_name}
                onChange={changeField}
                placeholder="Example: Motion and Laws of Motion"
                required
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={changeField}
                placeholder="Enter examination instructions or details"
                rows="3"
              />
            </label>

            <div className="teacher-form-grid">
              <label>
                Duration (minutes)
                <input
                  type="number"
                  name="duration_minutes"
                  min="1"
                  value={form.duration_minutes}
                  onChange={changeField}
                  required
                />
              </label>

              <label>
                Positive marks
                <input
                  type="number"
                  name="positive_marks"
                  min="0"
                  step="0.25"
                  value={form.positive_marks}
                  onChange={changeField}
                  required
                />
              </label>

              <label>
                Negative marks
                <input
                  type="number"
                  name="negative_marks"
                  min="0"
                  step="0.25"
                  value={form.negative_marks}
                  onChange={changeField}
                  required
                />
              </label>
            </div>

            <label className="publish-checkbox">
              <input
                type="checkbox"
                name="is_published"
                checked={form.is_published}
                onChange={changeField}
              />
              Publish this examination
            </label>

            <div className="teacher-form-actions">
              <button className="primary-button" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update examination" : "Save examination"}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyExam);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="teacher-exams">
        <div className="teacher-list-heading">
          <div>
            <h2>Your examinations</h2>
            <p>Create, edit and publish your tests.</p>
          </div>
          <button className="refresh-button" onClick={loadExams}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {loading ? (
          <p className="loading">Loading examinations...</p>
        ) : exams.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={35} />
            <h3>No examinations created yet</h3>
            <p>Create your first physics examination.</p>
          </div>
        ) : (
          <div className="teacher-exam-list">
            {exams.map((exam) => (
              <article className="teacher-exam-card" key={exam.id}>
                <div className="teacher-exam-info">
                  <span className={exam.is_published ? "status published" : "status draft"}>
                    {exam.is_published ? "Published" : "Draft"}
                  </span>
                  <h3>{exam.title}</h3>
                  <p>{exam.class_name}</p>
                  <div className="teacher-exam-meta">
                    {exam.duration_minutes} minutes · +{exam.positive_marks} marks · -{exam.negative_marks} marks
                  </div>
                </div>

                <div className="teacher-exam-actions">
                  <button onClick={() => startEdit(exam)} title="Edit">
                    <Pencil size={17} />
                  </button>
                  <button onClick={() => togglePublish(exam)} title="Publish status">
                    {exam.is_published ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                  <button onClick={() => deleteExam(exam)} title="Delete">
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
        </>
      )}
    </main>
  );
}
