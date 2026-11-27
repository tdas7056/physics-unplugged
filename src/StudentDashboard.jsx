
import { useMemo, useState } from "react";
import {
  Atom,
  LayoutDashboard,
  ClipboardList,
  History,
  BarChart3,
  Trophy,
  BookOpen,
  UserRound,
  Bell,
  Search,
  RefreshCw,
  Play,
  ChevronRight,
  Target,
  Award,
  Clock3,
  Menu,
  X,
  AlertTriangle,
} from "lucide-react";

export default function StudentDashboard({
  profileName,
  email,
  exams = [],
  loading,
  message,
  loadExams,
  setSelectedExam,
  attemptHistory = [],
  historyLoading,
  loadAttemptHistory,
  openAttemptReview,
  reviewLoading,
  selectedReview,
  setSelectedReview,
}) {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = useMemo(() => {
    const completed = attemptHistory.length;

    const totalScore = attemptHistory.reduce(
      (sum, item) => sum + Number(item.score || 0),
      0
    );

    const totalMaximum = attemptHistory.reduce(
      (sum, item) => sum + Number(item.max_marks || 0),
      0
    );

    const average =
      totalMaximum > 0
        ? Math.round((totalScore / totalMaximum) * 100)
        : 0;

    const highest = attemptHistory.reduce((best, item) => {
      const max = Number(item.max_marks || 0);
      const score = Number(item.score || 0);
      const percentage = max > 0 ? (score / max) * 100 : 0;
      return Math.max(best, percentage);
    }, 0);

    return {
      completed,
      average,
      highest: Math.round(highest),
      available: exams.length,
    };
  }, [attemptHistory, exams]);

  const navigation = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "exams", label: "Available Exams", icon: ClipboardList },
    { id: "history", label: "Exam History", icon: History },
    { id: "performance", label: "Performance", icon: BarChart3 },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "resources", label: "Study Resources", icon: BookOpen },
    { id: "profile", label: "My Profile", icon: UserRound },
  ];

  const goToSection = (id) => {
    setActiveSection(id);
    setSidebarOpen(false);

    const section = document.getElementById(`section-${id}`);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const recentAttempts = [...attemptHistory].slice(0, 5);

const reviewData = useMemo(() => {
  if (!selectedReview) return null;

  let data = selectedReview;

  // Handle JSON returned as a string
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return null;
    }
  }

  // Handle possible nested response structures
  if (data?.data) {
    data = data.data;
  }

  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return null;
    }
  }

  // The expected response is an object containing questions
  if (Array.isArray(data)) {
    return { questions: data };
  }

  if (data && typeof data === "object") {
    return data;
  }

  return null;
}, [selectedReview]);

  return (
    <div className="cosmic-dashboard">
      {sidebarOpen && (
        <button
          className="cosmic-sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`cosmic-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="cosmic-brand">
          <div className="cosmic-brand-icon">
            <Atom size={25} />
          </div>
          <div>
            <strong>PHYSICS</strong>
            <span>UNPLUGGED</span>
          </div>
          <button
            className="cosmic-close-sidebar"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="cosmic-nav-label">LEARNING SPACE</div>

        <nav className="cosmic-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`cosmic-nav-item ${
                  activeSection === item.id ? "active" : ""
                }`}
                onClick={() => goToSection(item.id)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {activeSection === item.id && (
                  <span className="cosmic-nav-indicator" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="cosmic-sidebar-bottom">
          <div className="cosmic-sidebar-quote">
            <Atom size={22} />
            <p>Explore the universe, one concept at a time.</p>
            <span>KEEP LEARNING</span>
          </div>

          <div className="cosmic-sidebar-user">
            <div className="cosmic-avatar">
              {(profileName || email || "S").charAt(0).toUpperCase()}
            </div>
            <div className="cosmic-user-details">
              <strong>{profileName || "Student"}</strong>
              <span>Student Account</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="cosmic-main">
        <header className="cosmic-topbar">
          <div className="cosmic-topbar-left">
            <button
              className="cosmic-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <span className="cosmic-breadcrumb">STUDENT PORTAL</span>
              <h2>Learning Dashboard</h2>
            </div>
          </div>

          <div className="cosmic-topbar-right">
            <div className="cosmic-online-status">
              <span />
              Online
            </div>
            <button className="cosmic-icon-button" title="Notifications">
              <Bell size={19} />
            </button>
            <div className="cosmic-topbar-avatar">
              {(profileName || email || "S").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="cosmic-content">
          <section id="section-overview" className="cosmic-hero">
            <div className="cosmic-hero-content">
              <span className="cosmic-eyebrow">
                <Atom size={15} /> YOUR LEARNING UNIVERSE
              </span>
              <h1>
                Welcome back,
                <br />
                <span>{profileName || "Explorer"}!</span>
              </h1>
              <p>
                Every great discovery begins with a question. Continue your
                journey through the fascinating world of physics.
              </p>
              <button
                className="cosmic-hero-button"
                onClick={() => goToSection("exams")}
              >
                Explore Examinations <ChevronRight size={18} />
              </button>
            </div>

            <div className="cosmic-hero-visual">
              <div className="cosmic-orbit orbit-one" />
              <div className="cosmic-orbit orbit-two" />
              <div className="cosmic-planet">
                <Atom size={76} strokeWidth={1.1} />
              </div>
              <div className="cosmic-planet-dot dot-one" />
              <div className="cosmic-planet-dot dot-two" />
            </div>
          </section>

          <section className="cosmic-stats-grid">
            <div className="cosmic-stat-card">
              <div className="cosmic-stat-icon orange">
                <ClipboardList size={21} />
              </div>
              <span>Exams Attempted</span>
              <strong>{stats.completed}</strong>
              <small>Your completed examinations</small>
            </div>

            <div className="cosmic-stat-card">
              <div className="cosmic-stat-icon cyan">
                <Target size={21} />
              </div>
              <span>Average Score</span>
              <strong>{stats.average}%</strong>
              <small>Based on total marks earned</small>
            </div>

            <div className="cosmic-stat-card">
              <div className="cosmic-stat-icon purple">
                <Award size={21} />
              </div>
              <span>Highest Score</span>
              <strong>{stats.highest}%</strong>
              <small>Your best percentage</small>
            </div>

            <div className="cosmic-stat-card">
              <div className="cosmic-stat-icon green">
                <BookOpen size={21} />
              </div>
              <span>Available Exams</span>
              <strong>{stats.available}</strong>
              <small>Published examinations</small>
            </div>
          </section>

          <section id="section-exams" className="cosmic-section">
            <div className="cosmic-section-heading">
              <div>
                <span className="cosmic-eyebrow">TEST YOUR KNOWLEDGE</span>
                <h2>Available Examinations</h2>
                <p>Choose an examination and challenge yourself.</p>
              </div>

              <button
                className="cosmic-refresh-button"
                onClick={loadExams}
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? "spinning" : ""} />
                Refresh
              </button>
            </div>

            {message && (
              <div className="cosmic-message">{message}</div>
            )}

            {loading ? (
              <div className="cosmic-empty-state">
                <RefreshCw size={27} className="spinning" />
                <p>Discovering available examinations...</p>
              </div>
            ) : exams.length === 0 ? (
              <div className="cosmic-empty-state">
                <BookOpen size={35} />
                <h3>No examinations available</h3>
                <p>New examinations will appear here when published.</p>
              </div>
            ) : (
              <div className="cosmic-exam-grid">
                {exams.map((exam) => (
                  <article className="cosmic-exam-card" key={exam.id}>
                    <div className="cosmic-exam-card-top">
                      <div className="cosmic-exam-icon">
                        <Atom size={24} />
                      </div>
                      <span className="cosmic-exam-status">AVAILABLE</span>
                    </div>

                    <h3>{exam.title}</h3>
                    <p>
                      {exam.description ||
                        "Test your understanding and strengthen your physics concepts."}
                    </p>

                    <div className="cosmic-exam-meta">
                      <span>
                        <Clock3 size={15} />
                        {exam.duration_minutes} minutes
                      </span>
                    </div>

                    <button
                      className="cosmic-start-button"
                      onClick={() => setSelectedExam(exam)}
                    >
                      <Play size={16} fill="currentColor" />
                      Start Examination
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section id="section-history" className="cosmic-section">
            <div className="cosmic-section-heading">
              <div>
                <span className="cosmic-eyebrow">YOUR JOURNEY SO FAR</span>
                <h2>Examination History</h2>
                <p>Review your previous examination results.</p>
              </div>

              <button
                className="cosmic-refresh-button"
                onClick={loadAttemptHistory}
                disabled={historyLoading}
              >
                <RefreshCw
                  size={16}
                  className={historyLoading ? "spinning" : ""}
                />
                Refresh
              </button>
            </div>

            {historyLoading ? (
              <div className="cosmic-empty-state">
                <RefreshCw size={25} className="spinning" />
                <p>Loading your examination history...</p>
              </div>
            ) : attemptHistory.length === 0 ? (
              <div className="cosmic-empty-state">
                <History size={34} />
                <h3>No examination history yet</h3>
                <p>Your completed examinations will appear here.</p>
              </div>
            ) : (
              <div className="cosmic-history-list">
                {attemptHistory.map((attempt) => (
                  <div className="cosmic-history-card" key={attempt.id}>
                    <div className="cosmic-history-icon">
                      <ClipboardList size={20} />
                    </div>

                    <div className="cosmic-history-info">
                      <strong>
                        {attempt.exams?.title || "Physics Examination"}
                      </strong>
                      <span>
                        {attempt.submitted_at
                          ? new Date(attempt.submitted_at).toLocaleString()
                          : "Completed examination"}
                      </span>
                    </div>

                    <div className="cosmic-history-score">
                      <strong>
                        {attempt.score ?? 0}/{attempt.max_marks ?? 0}
                      </strong>
                      <span>Score</span>
                    </div>

                    <button
                      className="cosmic-review-button"
                      onClick={() => openAttemptReview(attempt.id)}
                      disabled={reviewLoading}
                    >
                      Review <ChevronRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}



{selectedReview && (
  <div className="cosmic-review-panel">
    <div className="cosmic-review-heading">
      <div>
        <span className="cosmic-eyebrow">ANSWER REVIEW</span>
        <h3>Examination Solutions</h3>
        <p>Check your answers and learn from every question.</p>
      </div>

      <button
        className="cosmic-close-review"
        onClick={() => setSelectedReview(null)}
        aria-label="Close review"
      >
        <X size={19} />
      </button>
    </div>

    {!reviewData ? (
      <div className="cosmic-empty-state">
        <AlertTriangle size={28} />
        <p>Unable to read the examination review data.</p>
      </div>
    ) : (
      <>
        <div className="cosmic-review-score">
          <div>
            <span>Your Score</span>
            <strong>
              {reviewData.score ?? 0}/{reviewData.max_marks ?? 0}
            </strong>
          </div>

          <div>
            <span>Total Questions</span>
            <strong>
              {reviewData.questions?.length ?? 0}
            </strong>
          </div>
        </div>

        {Array.isArray(reviewData.questions) &&
          reviewData.questions.map((question, index) => {
            const correctIndex = Number(question.correct_option);

            const selectedIndex =
              question.selected_option === null ||
              question.selected_option === undefined
                ? null
                : Number(question.selected_option);

            const isUnanswered = selectedIndex === null;
            const isCorrect =
              !isUnanswered && selectedIndex === correctIndex;

            return (
              <article
                className="cosmic-answer-item"
                key={question.question_id || index}
              >
                <div className="cosmic-question-top">
                  <span className="cosmic-question-number">
                    QUESTION {index + 1}
                  </span>

                  <span
                    className={`cosmic-answer-status ${
                      isUnanswered
                        ? "unanswered"
                        : isCorrect
                        ? "correct"
                        : "incorrect"
                    }`}
                  >
                    {isUnanswered
                      ? "Unanswered"
                      : isCorrect
                      ? "Correct"
                      : "Incorrect"}
                  </span>
                </div>

                <h4>{question.question_text}</h4>

                {question.image_url && (
                  <img
                    src={question.image_url}
                    alt={`Question ${index + 1}`}
                    className="cosmic-question-image"
                  />
                )}

                <div className="cosmic-review-options">
                  {Array.isArray(question.options) &&
                    question.options.map((option, optionIndex) => {
                      const optionText =
                        typeof option === "string"
                          ? option
                          : option?.text || "";

                      const isRight = optionIndex === correctIndex;
                      const isSelected = optionIndex === selectedIndex;

                      return (
                        <div
                          key={optionIndex}
                          className={`cosmic-review-option ${
                            isRight
                              ? "correct-option"
                              : isSelected
                              ? "wrong-option"
                              : ""
                          }`}
                        >
                          <span className="cosmic-option-letter">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>

                          <span className="cosmic-option-text">
                            {optionText}
                          </span>

                          <span className="cosmic-option-label">
                            {isRight
                              ? "Correct Answer"
                              : isSelected
                              ? "Your Answer"
                              : ""}
                          </span>
                        </div>
                      );
                    })}
                </div>

                <div className="cosmic-question-result">
                  <span>
                    Marks obtained:{" "}
                    <strong>{question.marks ?? 0}</strong>
                  </span>

                  <span>
                    Correct option:{" "}
                    <strong>
                      {Number.isInteger(correctIndex) &&
                      correctIndex >= 0 &&
                      correctIndex <= 3
                        ? String.fromCharCode(65 + correctIndex)
                        : "N/A"}
                    </strong>
                  </span>
                </div>

                {question.explanation && (
                  <div className="cosmic-explanation">
                    <strong>
                      <BookOpen size={16} />
                      Explanation
                    </strong>
                    <p>{question.explanation}</p>
                  </div>
                )}
              </article>
            );
          })}

        {(!Array.isArray(reviewData.questions) ||
          reviewData.questions.length === 0) && (
          <div className="cosmic-empty-state">
            <BookOpen size={30} />
            <p>No question details are available.</p>
          </div>
        )}
      </>
    )}
  </div>
)}


          </section>

          <section id="section-performance" className="cosmic-section">
            <div className="cosmic-section-heading">
              <div>
                <span className="cosmic-eyebrow">TRACK YOUR PROGRESS</span>
                <h2>Performance Overview</h2>
                <p>A quick look at your examination performance.</p>
              </div>
            </div>

            <div className="cosmic-performance-card">
              <div className="cosmic-performance-summary">
                <div>
                  <span>Overall Average</span>
                  <strong>{stats.average}%</strong>
                </div>
                <div>
                  <span>Best Result</span>
                  <strong>{stats.highest}%</strong>
                </div>
                <div>
                  <span>Completed</span>
                  <strong>{stats.completed}</strong>
                </div>
              </div>

              <div className="cosmic-performance-note">
                <BarChart3 size={23} />
                <p>
                  Your performance summary is calculated from your completed
                  examination records. Complete more exams to build your
                  progress history.
                </p>
              </div>
            </div>

            <div className="cosmic-section-heading cosmic-recent-heading">
              <div>
                <h3>Recent Results</h3>
                <p>Your five most recent examination records.</p>
              </div>
            </div>

            {recentAttempts.length > 0 ? (
              <div className="cosmic-recent-list">
                {recentAttempts.map((attempt, index) => {
                  const max = Number(attempt.max_marks || 0);
                  const score = Number(attempt.score || 0);
                  const percentage =
                    max > 0 ? Math.round((score / max) * 100) : 0;

                  return (
                    <div className="cosmic-recent-row" key={attempt.id || index}>
                      <span>{attempt.exams?.title || "Physics Exam"}</span>
                      <div className="cosmic-progress-track">
                        <div
                          className="cosmic-progress-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <strong>{percentage}%</strong>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="cosmic-muted-text">
                No performance records are available yet.
              </p>
            )}
          </section>

          <section id="section-leaderboard" className="cosmic-section">
            <div className="cosmic-placeholder-card">
              <Trophy size={28} />
              <div>
                <h3>Leaderboard</h3>
                <p>
                  Leaderboard rankings are not connected yet. This section can
                  be enabled when ranking data is available.
                </p>
              </div>
            </div>
          </section>

          <section id="section-resources" className="cosmic-section">
            <div className="cosmic-placeholder-card">
              <BookOpen size={28} />
              <div>
                <h3>Study Resources</h3>
                <p>
                  A dedicated study-resource library can be added in a future
                  update.
                </p>
              </div>
            </div>
          </section>

          <section id="section-profile" className="cosmic-section">
            <div className="cosmic-profile-card">
              <div className="cosmic-profile-avatar">
                {(profileName || email || "S").charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="cosmic-eyebrow">STUDENT PROFILE</span>
                <h3>{profileName || "Student"}</h3>
                <p>{email}</p>
              </div>
            </div>
          </section>

          <footer className="cosmic-footer">
            <Atom size={17} />
            <span>Physics Unplugged</span>
            <span>Explore. Learn. Discover.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
