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
  ClipboardList,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "./supabase";
function SiteWatermark() {
  return (
    <div className="site-watermark">
      <img src={logo} alt="" />
      <span>Physics Unplugged by Tanmay</span>
    </div>
  );
}
function GlobalSignOut({ onClick }) {
  return (
    <button
      type="button"
      className="global-signout"
      onClick={onClick}
    >
      <LogOut size={15} />
      <span>Sign out</span>
    </button>
  );
}
export default function App() {
  const [session, setSession] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentName, setStudentName] = useState("");
  const [profileName, setProfileName] = useState("");
  const [attemptHistory, setAttemptHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
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
    if (session) {
      loadExams();
      loadAttemptHistory();
    } else {
      setAttemptHistory([]);
      setSelectedReview(null);
    }
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

  async function loadAttemptHistory() {
    if (!session?.user?.id) return;

    setHistoryLoading(true);
    const { data, error } = await supabase
      .from("attempts")
      .select("id, exam_id, submitted_at, score, max_marks, correct_count, wrong_count, unanswered_count, exams(title)")
      .eq("student_id", session.user.id)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Attempt history error:", error);
      setMessage("Could not load exam history: " + error.message);
    } else {
      setAttemptHistory(data || []);
    }
    setHistoryLoading(false);
  }

  async function openAttemptReview(attemptId) {
    setReviewLoading(true);
    setSelectedReview(null);

    const { data, error } = await supabase.rpc("get_attempt_review", {
      p_attempt_id: attemptId
    });

    if (error) {
      setMessage("Could not load answer review: " + error.message);
    } else {
      setSelectedReview(data);
      setMessage("");
    }
    setReviewLoading(false);
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

  <div className="login-brand">
    <img
      src={logo}
      alt="Physics Unplugged Logo"
      className="login-logo"
    />
    <h1>Physics Unplugged</h1>
    <p>Learn Physics. Think Beyond.</p>
  </div>

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
      <SiteWatermark />
    </main>
  );
}
if (session && session.user.email === "tdas66142@gmail.com") {
  return (
    <>
      <TeacherDashboard />
      <GlobalSignOut onClick={handleLogout} />
      <SiteWatermark />
    </>
  );
}
if (session && selectedExam) {
  return (
    <>
      <StudentExam
        exam={selectedExam}
        onExit={() => setSelectedExam(null)}
      />
      <GlobalSignOut onClick={handleLogout} />
      <SiteWatermark />
    </>
  );
}
  if (!session) {
    return (
      <main className="login-screen">
        <section className="login-card">
          <div className="login-brand">
            <img src={logo} alt="Physics Unplugged Logo" className="login-logo" />
            <p className="login-eyebrow">TANMAY'S ADVANCED EXAMINATION PORTAL</p>
            <h1>Physics Unplugged</h1>
          </div>

          <div className="login-welcome">
            <h2>{showSignup ? "Create your account" : "Welcome"}</h2>
            <p>{showSignup ? "Register to access your examinations" : "Sign in to your account"}</p>
          </div>

          <form
            onSubmit={showSignup ? (e) => {
              e.preventDefault();
              handleSignup();
            } : handleLogin}
          >
            {showSignup && (
              <>
                <label>FULL NAME</label>
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

            <label>EMAIL ADDRESS</label>
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

            <div className="login-password-heading">
              <label>PASSWORD</label>
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
              {busy ? "Please wait..." : showSignup ? "Create Account" : "Sign In"}
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
            {showSignup ? "Back to Sign In" : "Create Student Account"}
          </button>

          <p className="footer-note">Secure student access powered by Supabase.</p>
        </section>
        <SiteWatermark />
      </main>
    );
  }
return (
  <>
    <main className="dashboard">
      <header className="topbar">
        <div className="brand">
          <GraduationCap size={27} />
          <span>Physics Unplugged</span>
        </div>

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

      <section className="history-section">
        <div className="section-heading">
          <div>
            <h2><ClipboardList size={21} /> My Exam History</h2>
            <p>Review your submitted examinations, answers and explanations.</p>
          </div>
          <button className="refresh-button" onClick={loadAttemptHistory} disabled={historyLoading}>
            <RefreshCw size={16} />
            {historyLoading ? "Loading..." : "Refresh history"}
          </button>
        </div>

        {historyLoading ? (
          <p className="loading">Loading your exam history...</p>
        ) : attemptHistory.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={32} />
            <h3>No submitted examinations yet</h3>
            <p>Your completed exam attempts will appear here.</p>
          </div>
        ) : (
          <div className="history-list">
            {attemptHistory.map((attempt) => (
              <article className="history-card" key={attempt.id}>
                <div className="history-card-main">
                  <div>
                    <h3>{attempt.exams?.title || "Physics examination"}</h3>
                    <p>{attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString() : ""}</p>
                  </div>
                  <div className="history-score">
                    <strong>{attempt.score ?? 0} / {attempt.max_marks ?? 0}</strong>
                    <span>{attempt.correct_count ?? 0} correct · {attempt.wrong_count ?? 0} wrong · {attempt.unanswered_count ?? 0} unanswered</span>
                  </div>
                </div>
                <button
                  className="history-review-button"
                  onClick={() => openAttemptReview(attempt.id)}
                  disabled={reviewLoading}
                >
                  View answers and explanations
                </button>
              </article>
            ))}
          </div>
        )}

        {reviewLoading && <p className="loading">Loading answer review...</p>}

        {selectedReview && (
          <div className="review-panel">
            <div className="review-panel-heading">
              <div>
                <h3>{selectedReview.exam_title}</h3>
                <p>Score: <strong>{selectedReview.score} / {selectedReview.max_marks}</strong></p>
              </div>
              <button className="history-close-button" onClick={() => setSelectedReview(null)}>
                Close review
              </button>
            </div>

            {(selectedReview.questions || []).map((question, index) => {
              const options = Array.isArray(question.options) ? question.options : [];
              const selected = question.selected_option;
              const correct = question.correct_option;
              return (
                <article className="review-question" key={question.question_id}>
                  <h4>Q{index + 1}. {question.question_text}</h4>
                  {question.image_url && (
                    <img className="review-question-image" src={question.image_url} alt="Question" />
                  )}
                  <div className="review-options">
                    {options.map((option, optionIndex) => {
                      const optionText = typeof option === "string" ? option : option?.text || "";
                      const isCorrect = optionIndex === correct;
                      const isSelected = optionIndex === selected;
                      return (
                        <div
                          className={`review-option ${isCorrect ? "correct" : ""} ${isSelected && !isCorrect ? "incorrect" : ""}`}
                          key={optionIndex}
                        >
                          <span>{String.fromCharCode(65 + optionIndex)}. {optionText}</span>
                          {isCorrect && <strong>Correct answer</strong>}
                          {isSelected && <small>Your answer</small>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="review-question-footer">
                    <span className={question.marks > 0 ? "marks-positive" : question.marks < 0 ? "marks-negative" : "marks-neutral"}>
                      Marks: {question.marks > 0 ? "+" : ""}{question.marks}
                    </span>
                    <span>{selected === null ? "Not answered" : selected === correct ? "Correct" : "Incorrect"}</span>
                  </div>
                  {question.explanation && (
                    <div className="review-explanation">
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

      <footer className="dashboard-footer">
        <Trophy size={17} />
        Keep learning. Keep questioning. Keep improving.
      </footer>
    </main>
    <GlobalSignOut onClick={handleLogout} />
    <SiteWatermark />
  </>
  );
}
