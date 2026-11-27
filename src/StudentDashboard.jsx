
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
                  </div>
                  <button
                    className="cosmic-close-review"
                    onClick={() => setSelectedReview(null)}
                  >
                    <X size={19} />
                  </button>
                </div>

                {Array.isArray(selectedReview) &&
                  selectedReview.map((answer, index) => (
                    <div className="cosmic-answer-item" key={index}>
                      <strong>
                        Question {index + 1}:{" "}
                        {answer.question_text || answer.question || ""}
                      </strong>
                      {answer.explanation && (
                        <p>{answer.explanation}</p>
                      )}
                    </div>
                  ))}

                {!Array.isArray(selectedReview) && (
                  <pre className="cosmic-review-data">
                    {JSON.stringify(selectedReview, null, 2)}
                  </pre>
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
