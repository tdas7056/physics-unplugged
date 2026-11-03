import TeacherDashboard from "./TeacherDashboard";
import logo from "./physics-unplugged-logo.png";
import "./StudentDashboard.css";
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
  const [studentName, setStudentName] = useState("");
  const [profileName, setProfileName] = useState("");
const [showSignup, setShowSignup] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetMode, setResetMode] = useState(false);

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
    } = supabase.auth.onAuthStateChange((event, newSession) => {
  setSession(newSession);

  if (event === "PASSWORD_RECOVERY") {
    setResetMode(true);
    setMessage("Enter your new password.");
  }
});

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) loadExams();
  }, [session]);
useEffect(() => {
  async function loadStudentProfile() {
    if (!session) {
      setProfileName("");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Profile loading error:", error);
      setMessage("Profile error: " + error.message);
      return;
    }

    console.log("Student profile:", data);
    setProfileName(data?.display_name || "");
  }

  loadStudentProfile();
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
async function handlePasswordReset() {
  if (!email.trim()) {
    setMessage("Please enter your registered email address.");
    return;
  }
async function handleUpdatePassword() {
  if (password.length < 6) {
    setMessage("Password must be at least 6 characters.");
    return;
  }

  setBusy(true);
  setMessage("");

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    setMessage(error.message);
  } else {
    setMessage("Password updated successfully. Please sign in again.");
    setPassword("");
    setResetMode(false);
    await supabase.auth.signOut();
  }

  setBusy(false);
}
  setBusy(true);
  setMessage("");

  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim(),
    {
      redirectTo: "https://physics-unplugged-zuu6.vercel.app/"
    }
  );

  setMessage(
    error
      ? error.message
      : "Password reset email sent. Please check your inbox."
  );

  setBusy(false);
}
async function handleSignup() {
  if (!studentName.trim()) {
    setMessage("Please enter your full name.");
    return;
  }

  setBusy(true);
  setMessage("");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: studentName.trim()
      }
    }
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
 if (resetMode) {
  return (
    <main className="login-screen">
      <section className="login-card">
        <h2>Reset Your Password</h2>
        <p>Enter your new password below.</p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleUpdatePassword();
          }}
        >
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
          />

          {message && <p>{message}</p>}

          <button type="submit" disabled={busy}>
            {busy ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>
    </main>
  );
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

    <form
  onSubmit={showSignup ? (e) => {
    e.preventDefault();
    handleSignup();
  } : handleLogin}
>
  {showSignup && (
    <>
      <label>Full Name</label>
      <div className="input-wrap">
        <GraduationCap size={18} />
        <input
          type="text"
          placeholder="Enter your full name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          required
        />
      </div>
    </>
  )}
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
              {!showSignup && (
  <button
    type="button"
    className="forgot-password-link"
    onClick={handlePasswordReset}
    disabled={busy}
  >
    Forgot Password?
  </button>
)}
            </div>

            {message && <p className="message">{message}</p>}
<button className="primary-button" disabled={busy}>
  {busy ? "Please wait..." : showSignup ? "Create Account" : "Sign in"}
</button>
          </form>

<button
  type="button"
  className="secondary-button"
  onClick={() => {
    setShowSignup(!showSignup);
    setMessage("");
  }}
>
  {showSignup ? "Back to Sign in" : "Create student account"}
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
    <h1>Welcome back, {profileName || "Student"}!</h1>
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
