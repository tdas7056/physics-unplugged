
import { Turnstile } from "@marsidev/react-turnstile";
import TeacherDashboard from "./TeacherDashboard";
import DeskLampLogin from "./DeskLampLogin";
import StudentDashboard from "./StudentDashboard";
import StudentExam from "./StudentExam";
import logo from "./physics-unplugged-logo.png";
import "./StudentDashboard.css";

import { useEffect, useState, useRef } from "react";

import {
  GraduationCap,
  LogOut,
  AlertTriangle,
} from "lucide-react";

import { supabase, isSupabaseConfigured } from "./supabase";


/* ─────────────────────────────────────────────
   GLOBAL SIGN OUT BUTTON
───────────────────────────────────────────── */

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


/* ─────────────────────────────────────────────
   EXAM AUTO-SUBMIT WARNING MODAL
───────────────────────────────────────────── */

function ExamSignOutModal({
  examTitle,
  onSubmitAndExit,
  onCancel,
  submitting,
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "rgba(4, 5, 10, 0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "36px 32px",
          background: "rgba(10, 12, 24, 0.95)",
          border: "1px solid rgba(251, 191, 36, 0.3)",
          borderRadius: "20px",
          boxShadow:
            "0 24px 56px rgba(0,0,0,0.7), 0 0 48px rgba(251,191,36,0.08)",
          fontFamily: "'Space Grotesk', -apple-system, sans-serif",
          color: "#e2e8f0",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "10%",
            width: "80%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(251,191,36,0.6), transparent)",
          }}
        />

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "58px",
            height: "58px",
            borderRadius: "16px",
            background: "rgba(251, 191, 36, 0.1)",
            border: "1px solid rgba(251, 191, 36, 0.25)",
            color: "#fbbf24",
            marginBottom: "20px",
          }}
        >
          <AlertTriangle size={28} />
        </div>

        <h2
          style={{
            margin: "0 0 8px",
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#fff",
          }}
        >
          Exam Still In Progress
        </h2>

        <p
          style={{
            margin: "0 0 6px",
            fontSize: "0.85rem",
            color: "#94a3b8",
            lineHeight: 1.6,
          }}
        >
          You are currently attempting:
        </p>

        <p
          style={{
            margin: "0 0 20px",
            fontSize: "0.92rem",
            fontWeight: 600,
            color: "#fbbf24",
          }}
        >
          {examTitle}
        </p>

        <div
          style={{
            padding: "14px 16px",
            borderRadius: "12px",
            background: "rgba(251, 191, 36, 0.07)",
            border: "1px solid rgba(251, 191, 36, 0.18)",
            marginBottom: "24px",
            textAlign: "left",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.82rem",
              color: "#fde68a",
              lineHeight: 1.6,
            }}
          >
            ⚠️ Signing out now will{" "}
            <strong>automatically submit</strong> your exam with all answers
            saved so far. You cannot re-attempt this exam.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <button
            onClick={onSubmitAndExit}
            disabled={submitting}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              padding: "13px 20px",
              border: "none",
              borderRadius: "12px",
              background: submitting
                ? "rgba(239,68,68,0.4)"
                : "linear-gradient(135deg, rgba(239,68,68,0.9), rgba(220,38,38,0.75))",
              color: "#fff",
              fontFamily: "inherit",
              fontSize: "0.92rem",
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.75 : 1,
            }}
          >
            {submitting ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: "15px",
                    height: "15px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.65s linear infinite",
                  }}
                />
                Submitting & Signing Out...
              </>
            ) : (
              <>
                <LogOut size={16} />
                Submit Exam & Sign Out
              </>
            )}
          </button>

          <button
            onClick={onCancel}
            disabled={submitting}
            style={{
              width: "100%",
              padding: "12px 20px",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.04)",
              color: "#94a3b8",
              fontFamily: "inherit",
              fontSize: "0.88rem",
              fontWeight: 500,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            Continue Exam
          </button>
        </div>

        <style>
          {`@keyframes spin { to { transform: rotate(360deg); } }`}
        </style>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────
   MAIN APPLICATION
───────────────────────────────────────────── */

export default function App() {
  const [session, setSession] = useState(null);

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);

  // Active examination sign-out protection
  const examSubmitRef = useRef(null);

  const [showExamSignOutModal, setShowExamSignOutModal] =
    useState(false);

  const [examSignOutBusy, setExamSignOutBusy] = useState(false);

  // Authentication fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [studentName, setStudentName] = useState("");
  const [profileName, setProfileName] = useState("");

  // Examination history and review
  const [attemptHistory, setAttemptHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Login and registration
  const [showSignup, setShowSignup] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  // Cloudflare Turnstile CAPTCHA
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaWidgetKey, setCaptchaWidgetKey] = useState(0);

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;


  /* ─────────────────────────────────────────
     AUTHENTICATION AND SESSION
  ───────────────────────────────────────── */

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


  /* ─────────────────────────────────────────
     LOAD EXAMS AND HISTORY
  ───────────────────────────────────────── */

  useEffect(() => {
    if (session) {
      loadExams();
      loadAttemptHistory();
    } else {
      setAttemptHistory([]);
      setSelectedReview(null);
    }
  }, [session]);


  /* ─────────────────────────────────────────
     LOAD STUDENT PROFILE
  ───────────────────────────────────────── */

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

      setProfileName(data?.display_name || "");
    }

    loadStudentProfile();
  }, [session]);


  /* ─────────────────────────────────────────
     LOAD PUBLISHED EXAMINATIONS
  ───────────────────────────────────────── */

  async function loadExams() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("exams")
      .select("id, title, description, duration_minutes, max_attempts")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setExams(data || []);
    }

    setLoading(false);
  }


  /* ─────────────────────────────────────────
     LOAD STUDENT EXAM HISTORY
  ───────────────────────────────────────── */

  async function loadAttemptHistory() {
    if (!session?.user?.id) return;

    setHistoryLoading(true);

    const { data, error } = await supabase
      .from("attempts")
      .select(
        "id, exam_id, submitted_at, score, max_marks, correct_count, wrong_count, unanswered_count, exams(title)"
      )
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


  /* ─────────────────────────────────────────
     OPEN ANSWER REVIEW
  ───────────────────────────────────────── */

  async function openAttemptReview(attemptId) {
    setReviewLoading(true);
    setSelectedReview(null);

    const { data, error } = await supabase.rpc("get_attempt_review", {
      p_attempt_id: attemptId,
    });

    console.log("EXAM REVIEW DATA:", data);
    console.log("EXAM REVIEW TYPE:", typeof data);
    console.log("IS ARRAY:", Array.isArray(data));

    if (error) {
      console.error("Review error:", error);
      setMessage("Could not load answer review: " + error.message);
    } else {
      setSelectedReview(data);
      setMessage("");
    }

    setReviewLoading(false);
  }


  /* ─────────────────────────────────────────
     STUDENT LOGIN
  ───────────────────────────────────────── */

  async function handleLogin(event) {
    event.preventDefault();

    if (!captchaToken) {
      setMessage("Please complete the CAPTCHA verification.");
      return;
    }

    setBusy(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken,
      },
    });

    setCaptchaToken("");
    setCaptchaWidgetKey((key) => key + 1);

    if (error) {
      setMessage(error.message);
    }

    setBusy(false);
  }


  /* ─────────────────────────────────────────
     PASSWORD RESET REQUEST
  ───────────────────────────────────────── */

  async function handlePasswordReset() {
    if (!email.trim()) {
      setMessage("Please enter your registered email address.");
      return;
    }

    if (!captchaToken) {
      setMessage("Please complete the CAPTCHA verification.");
      return;
    }

    setBusy(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: window.location.origin + "/",
        captchaToken,
      }
    );

    setMessage(
      error
        ? error.message
        : "Password reset email sent. Please check your inbox."
    );

    setCaptchaToken("");
    setCaptchaWidgetKey((key) => key + 1);

    setBusy(false);
  }


  /* ─────────────────────────────────────────
     UPDATE PASSWORD
  ───────────────────────────────────────── */

  async function handleUpdatePassword(event) {
    event.preventDefault();

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setBusy(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
      setBusy(false);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setResetMode(false);

    await supabase.auth.signOut();

    setMessage("Password updated successfully. Please sign in again.");
    setBusy(false);
  }


  /* ─────────────────────────────────────────
     STUDENT REGISTRATION
  ───────────────────────────────────────── */

  async function handleSignup() {
    if (!studentName.trim()) {
      setMessage("Please enter your full name.");
      return;
    }

    if (!captchaToken) {
      setMessage("Please complete the CAPTCHA verification.");
      return;
    }

    setBusy(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken,
        data: {
          full_name: studentName.trim(),
        },
      },
    });

    setCaptchaToken("");
    setCaptchaWidgetKey((key) => key + 1);

    setMessage(
      error
        ? error.message
        : "Registration submitted. Check your email if confirmation is required."
    );

    setBusy(false);
  }


  /* ─────────────────────────────────────────
     SIGN OUT
  ───────────────────────────────────────── */

  async function handleLogout() {
    if (examSubmitRef.current) {
      setShowExamSignOutModal(true);
      return;
    }

    await supabase.auth.signOut();
    setExams([]);
  }


  /* ─────────────────────────────────────────
     SUBMIT ACTIVE EXAM AND SIGN OUT
  ───────────────────────────────────────── */

  async function handleExamSignOutConfirm() {
    setExamSignOutBusy(true);

    try {
      if (examSubmitRef.current) {
        await examSubmitRef.current();
      }
    } catch (_) {
      // Continue sign-out even if exam submission fails.
    }

    examSubmitRef.current = null;

    setShowExamSignOutModal(false);
    setExamSignOutBusy(false);

    await supabase.auth.signOut();

    setExams([]);
    setSelectedExam(null);
  }


  /* ─────────────────────────────────────────
     SUPABASE CONFIGURATION CHECK
  ───────────────────────────────────────── */

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
            Add your Supabase Project URL and publishable key as
            environment variables in your deployment settings.
          </p>
        </div>
      </main>
    );
  }


  /* ─────────────────────────────────────────
     INITIAL LOADING SCREEN
  ───────────────────────────────────────── */

  if (loading && !session) {
    return (
      <main className="loading">
        Loading Physics Unplugged...
      </main>
    );
  }


  /* ─────────────────────────────────────────
     PASSWORD RECOVERY SCREEN
  ───────────────────────────────────────── */

  if (resetMode) {
    return (
      <DeskLampLogin
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        studentName={studentName}
        setStudentName={setStudentName}
        showSignup={showSignup}
        setShowSignup={setShowSignup}
        handleLogin={handleLogin}
        handleSignup={handleSignup}
        handlePasswordReset={handlePasswordReset}
        handleUpdatePassword={handleUpdatePassword}
        resetMode={true}
        busy={busy}
        message={message}
        turnstileSiteKey={turnstileSiteKey}
        captchaWidgetKey={captchaWidgetKey}
        setCaptchaToken={setCaptchaToken}
        captchaToken={captchaToken}
        setMessage={setMessage}
        logo={logo}
      />
    );
  }


  /* ─────────────────────────────────────────
     TEACHER DASHBOARD
  ───────────────────────────────────────── */

  if (session && session.user.email === "tdas66142@gmail.com") {
    return (
      <>
        <TeacherDashboard />
        <GlobalSignOut onClick={handleLogout} />
      </>
    );
  }


  /* ─────────────────────────────────────────
     STUDENT EXAMINATION SCREEN
  ───────────────────────────────────────── */

  if (session && selectedExam) {
    return (
      <>
        <StudentExam
          exam={selectedExam}
          onExit={() => {
            examSubmitRef.current = null;
            setSelectedExam(null);
            loadAttemptHistory();
          }}
          onRegisterAutoSubmit={(fn) => {
            examSubmitRef.current = fn;
          }}
          onUnregisterAutoSubmit={() => {
            examSubmitRef.current = null;
          }}
        />

        <GlobalSignOut onClick={handleLogout} />

        {showExamSignOutModal && (
          <ExamSignOutModal
            examTitle={selectedExam.title}
            submitting={examSignOutBusy}
            onSubmitAndExit={handleExamSignOutConfirm}
            onCancel={() => setShowExamSignOutModal(false)}
          />
        )}
      </>
    );
  }


  /* ─────────────────────────────────────────
     LOGIN AND REGISTRATION SCREEN
  ───────────────────────────────────────── */

  if (!session) {
    return (
      <DeskLampLogin
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        studentName={studentName}
        setStudentName={setStudentName}
        showSignup={showSignup}
        setShowSignup={setShowSignup}
        handleLogin={handleLogin}
        handleSignup={handleSignup}
        handlePasswordReset={handlePasswordReset}
        handleUpdatePassword={handleUpdatePassword}
        resetMode={false}
        busy={busy}
        message={message}
        turnstileSiteKey={turnstileSiteKey}
        captchaWidgetKey={captchaWidgetKey}
        setCaptchaToken={setCaptchaToken}
        captchaToken={captchaToken}
        setMessage={setMessage}
        logo={logo}
      />
    );
  }


  /* ─────────────────────────────────────────
     COSMIC STUDENT DASHBOARD
  ───────────────────────────────────────── */

  return (
    <>
      <StudentDashboard
        profileName={profileName}
        email={session?.user?.email}
        exams={exams}
        loading={loading}
        message={message}
        loadExams={loadExams}
        setSelectedExam={(exam) => {
          setMessage("");
          setSelectedExam(exam);
        }}
        attemptHistory={attemptHistory}
        historyLoading={historyLoading}
        loadAttemptHistory={loadAttemptHistory}
        openAttemptReview={openAttemptReview}
        reviewLoading={reviewLoading}
        selectedReview={selectedReview}
        setSelectedReview={setSelectedReview}
      />

      <GlobalSignOut onClick={handleLogout} />
    </>
  );
}
