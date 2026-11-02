import TeacherDashboard from "./TeacherDashboard";
import StudentExam from "./StudentExam";
import { useEffect, useState } from "react";
import {
  BookOpen,
  GraduationCap,
  LogOut,
  Mail,
  Lock,
  RefreshCw,
  Trophy,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "./supabase";

export default function App() {
  const [session, setSession] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) loadExams();
  }, [session]);

  async function loadExams() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("exams")
      .select("id, title, description, duration_minutes")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setExams(data || []);
    }

    setLoading(false);
  }

  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setMessage(error.message);
    setBusy(false);
  }

  async function handleSignup() {
    setBusy(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setMessage(
      error
        ? error.message
        : "Registration submitted. Check your email if confirmation is required."
    );

    setBusy(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setExams([]);
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="setup-screen">
        <div className="setup-card">
          <GraduationCap size={42} />
          <h1>Physics Unplugged</h1>
          <p>Your online physics examination portal.</p>
          <div className="notice">
            Supabase connection details are not configured yet.
          </div>
          <p>
            The next setup step is to add your Supabase Project URL and
            publishable key as environment variables in your deployment
            settings.
          </p>
        </div>
      </main>
    );
  }

  if (loading && !session) {
    return <main className="loading">Loading Physics Unplugged...</main>;
  }
if (session && session.user.email === "tdas66142@gmail.com") {
  return <TeacherDashboard />;
}
  if (session && selectedExam) {
  return (
    <StudentExam
      exam={selectedExam}
      onExit={() => setSelectedExam(null)}
    />
  );
}
  if (!session) {
    return (
      <main className="login-screen">
        <section className="login-card">
          <div className="brand-icon">
            <GraduationCap size={32} />
          </div>

          <p className="eyebrow">YOUR PHYSICS EXAMINATION PORTAL</p>
          <h1>Physics Unplugged</h1>
          <p className="subtitle">
            Learn, practise and test your understanding.
          </p>

          <form onSubmit={handleLogin}>
            <label>Email address</label>
            <div className="input-wrap">
              <Mail size={18} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <label>Password</label>
            <div className="input-wrap">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {message && <p className="message">{message}</p>}

            <button className="primary-button" disabled={busy}>
              {busy ? "Please wait..." : "Sign in"}
            </button>
          </form>

          <button
            className="secondary-button"
            onClick={handleSignup}
            disabled={busy || !email || password.length < 6}
          >
            Create student account
          </button>

          <p className="footer-note">
            Secure student access powered by Supabase.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div className="brand">
          <GraduationCap size={27} />
          <span>Physics Unplugged</span>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={17} />
          Sign out
        </button>
      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">STUDENT DASHBOARD</p>
          <h1>Welcome back!</h1>
          <p>{session.user.email}</p>
        </div>
        <div className="welcome-icon">
          <BookOpen size={42} />
        </div>
      </section>

      <section className="section-heading">
        <div>
          <h2>Available examinations</h2>
          <p>Choose a published examination to get started.</p>
        </div>
        <button className="refresh-button" onClick={loadExams}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </section>

      {message && <p className="message">{message}</p>}

      {loading ? (
        <p className="loading">Loading examinations...</p>
      ) : exams.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={35} />
          <h3>No examinations available</h3>
          <p>Published examinations will appear here.</p>
        </div>
      ) : (
        <div className="exam-grid">
          {exams.map((exam) => (
            <article className="exam-card" key={exam.id}>
              <div className="exam-icon">
                <BookOpen size={23} />
              </div>
              <h3>{exam.title}</h3>
              <p>{exam.description || "Physics examination"}</p>
              <div className="exam-meta">
                <span>{exam.duration_minutes} minutes</span>
              </div>
<button
  className="primary-button"
  onClick={() => {
    setMessage("");
    setSelectedExam(exam);
  }}
>
  Start Examination
</button>
            </article>
          ))}
        </div>
      )}

      <footer className="dashboard-footer">
        <Trophy size={17} />
        Keep learning. Keep questioning. Keep improving.
      </footer>
    </main>
  );
}
