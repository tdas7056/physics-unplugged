
import React, { useMemo, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Orbit,
  Atom,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import "./DeskLampLogin.css";

export default function DeskLampLogin({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  studentName,
  setStudentName,
  showSignup,
  setShowSignup,
  handleLogin,
  handleSignup,
  handlePasswordReset,
  handleUpdatePassword,
  resetMode,
  busy,
  message,
  turnstileSiteKey,
  captchaWidgetKey,
  setCaptchaToken,
  captchaToken,
  setMessage,
  logo,
  SiteWatermark,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!password) return { percent: 0, label: "", color: "#ef4444" };

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1)
      return { percent: 20, label: "Weak", color: "#ef4444" };
    if (score === 2)
      return { percent: 45, label: "Fair", color: "#f59e0b" };
    if (score <= 4)
      return { percent: 75, label: "Good", color: "#3b82f6" };

    return { percent: 100, label: "Strong", color: "#10b981" };
  }, [password]);

  const switchMode = (signup) => {
    setShowSignup(signup);
    setMessage("");
    setCaptchaToken("");
  };

  const messageIsSuccess =
    message &&
    (message.toLowerCase().includes("success") ||
      message.toLowerCase().includes("sent") ||
      message.toLowerCase().includes("submitted"));

  return (
    <div className="cosmic-login-wrapper">

      {/* STATIC COSMIC BACKGROUND */}
      <div className="cosmic-background" />

      <div className="cosmic-nebula cosmic-nebula-one" />
      <div className="cosmic-nebula cosmic-nebula-two" />

      {/* PHYSICS FORMULAS */}
      <div className="cosmic-formulas">
        <span className="formula formula-one">E = mc²</span>
        <span className="formula formula-two">F = ma</span>
        <span className="formula formula-three">V = IR</span>
        <span className="formula formula-four">λ = h / p</span>
        <span className="formula formula-five">PV = nRT</span>
        <span className="formula formula-six">∇ × E = -∂B/∂t</span>
        <span className="formula formula-seven">G = 6.674 × 10⁻¹¹</span>
      </div>

      {/* STATIC STARS */}
      <div className="cosmic-stars" />

      {/* HEADER */}
      <header className="cosmic-header">
        <div className="cosmic-brand">
          <img
            src={logo}
            alt="Physics Unplugged"
            className="cosmic-logo"
          />

          <div>
            <h1>Physics Unplugged</h1>
            <span>EXAMINATION PORTAL</span>
          </div>
        </div>

        <div className="cosmic-header-tag">
          <span className="cosmic-status-dot" />
          SCIENCE • DISCOVERY • EXCELLENCE
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="cosmic-main">

        {/* LEFT: COSMIC VISUAL */}
        <section className="cosmic-visual">

          <div className="cosmic-visual-heading">
            <span className="cosmic-eyebrow">
              <Orbit size={15} />
              EXPLORE THE LAWS OF THE UNIVERSE
            </span>

            <h2>
              PHYSICS IS
              <br />
              <span>EVERYWHERE.</span>
            </h2>

            <p>
              Think beyond boundaries. Discover the universe.
              Master the science behind everything.
            </p>
          </div>

          {/* BLACK HOLE ILLUSTRATION */}
          <div className="cosmic-blackhole-area">
            <div className="cosmic-blackhole-glow" />

            <div className="cosmic-blackhole">
              <div className="blackhole-ring blackhole-ring-outer" />
              <div className="blackhole-ring blackhole-ring-middle" />
              <div className="blackhole-ring blackhole-ring-inner" />
              <div className="blackhole-core" />
            </div>

            {/* SMALL ROCKET */}
            <div className="cosmic-rocket">
              <Rocket size={42} strokeWidth={1.3} />
            </div>

            {/* ORBITAL DECORATION */}
            <div className="cosmic-orbit orbit-one" />
            <div className="cosmic-orbit orbit-two" />

            <div className="cosmic-distance-label">
              <Atom size={14} />
              BEYOND THE EVENT HORIZON
            </div>
          </div>

          {/* FORMULA STRIP */}
          <div className="cosmic-formula-strip">
            <div>
              <strong>E = mc²</strong>
              <span>RELATIVITY</span>
            </div>
            <div>
              <strong>F = ma</strong>
              <span>MECHANICS</span>
            </div>
            <div>
              <strong>V = IR</strong>
              <span>ELECTRICITY</span>
            </div>
          </div>

        </section>

        {/* RIGHT: LOGIN PANEL */}
        <section className="cosmic-auth-column">

          <div className="cosmic-auth-card">

            {/* LOGIN / SIGNUP TABS */}
            {!resetMode && (
              <div className="cosmic-tabs">
                <button
                  type="button"
                  className={!showSignup ? "active" : ""}
                  onClick={() => switchMode(false)}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  className={showSignup ? "active" : ""}
                  onClick={() => switchMode(true)}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* CARD HEADING */}
            <div className="cosmic-card-heading">

              <div className="cosmic-card-icon">
                <Atom size={25} />
              </div>

              <span className="cosmic-card-eyebrow">
                {resetMode
                  ? "ACCOUNT SECURITY"
                  : "TANMAY'S ADVANCED EXAMINATION PORTAL"}
              </span>

              <h2>
                {resetMode
                  ? "Set New Password"
                  : showSignup
                  ? "Join the Universe"
                  : "Welcome Back"}
              </h2>

              <p>
                {resetMode
                  ? "Create a new secure password for your account."
                  : showSignup
                  ? "Create your student account and start learning."
                  : "Sign in to access your tests and performance analytics."}
              </p>
            </div>

            {/* PASSWORD RECOVERY */}
            {resetMode ? (

              <form
                onSubmit={handleUpdatePassword}
                className="cosmic-form"
              >
                <div className="cosmic-form-group">
                  <label>NEW PASSWORD</label>

                  <div className="cosmic-input-wrap">
                    <Lock size={18} />

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />

                    <button
                      type="button"
                      className="cosmic-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="cosmic-form-group">
                  <label>CONFIRM PASSWORD</label>

                  <div className="cosmic-input-wrap">
                    <Lock size={18} />

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {message && (
                  <div className={`cosmic-message ${messageIsSuccess ? "success" : ""}`}>
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  className="cosmic-submit"
                  disabled={busy}
                >
                  {busy ? "Updating Password..." : "Update Password"}
                </button>
              </form>

            ) : (

              /* SIGN IN AND REGISTRATION */
              <form
                onSubmit={
                  showSignup
                    ? (e) => {
                        e.preventDefault();
                        handleSignup();
                      }
                    : handleLogin
                }
                className="cosmic-form"
              >

                {showSignup && (
                  <div className="cosmic-form-group">
                    <label>FULL NAME</label>

                    <div className="cosmic-input-wrap">
                      <GraduationCap size={18} />

                      <input
                        type="text"
                        placeholder="Your full name"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="cosmic-form-group">
                  <label>EMAIL ADDRESS</label>

                  <div className="cosmic-input-wrap">
                    <Mail size={18} />

                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="cosmic-form-group">

                  <div className="cosmic-label-row">
                    <label>PASSWORD</label>

                    {!showSignup && (
                      <button
                        type="button"
                        className="cosmic-forgot"
                        onClick={handlePasswordReset}
                        disabled={busy}
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>

                  <div className="cosmic-input-wrap">
                    <Lock size={18} />

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />

                    <button
                      type="button"
                      className="cosmic-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* PASSWORD STRENGTH */}
                  {showSignup && password.length > 0 && (
                    <div className="cosmic-strength">
                      <div className="cosmic-strength-track">
                        <div
                          style={{
                            width: `${passwordStrength.percent}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        />
                      </div>

                      <span style={{ color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* CLOUDFLARE TURNSTILE */}
                {turnstileSiteKey ? (
                  <div className="cosmic-captcha">
                    <Turnstile
                      key={captchaWidgetKey}
                      siteKey={turnstileSiteKey}
                      onSuccess={(token) => {
                        setCaptchaToken(token);
                        setMessage("");
                      }}
                      onExpire={() => setCaptchaToken("")}
                      onError={() => {
                        setCaptchaToken("");
                        setMessage("CAPTCHA failed to load. Please refresh.");
                      }}
                    />
                  </div>
                ) : (
                  <div className="cosmic-message">
                    CAPTCHA configuration missing. Please contact administrator.
                  </div>
                )}

                {/* FEEDBACK MESSAGE */}
                {message && (
                  <div
                    className={`cosmic-message ${messageIsSuccess ? "success" : ""}`}
                  >
                    {message}
                  </div>
                )}

                {/* SUBMIT */}
                <button
                  type="submit"
                  className="cosmic-submit"
                  disabled={busy || !captchaToken || !turnstileSiteKey}
                >
                  {busy
                    ? "Authenticating..."
                    : showSignup
                    ? "Create Student Account"
                    : "Sign In"}
                </button>

              </form>
            )}

            {/* SECURITY FOOTER */}
            <div className="cosmic-card-footer">
              <ShieldCheck size={15} />
              <span>
                Secure authentication powered by Supabase
              </span>
            </div>

          </div>

        </section>
      </main>

      {/* PAGE FOOTER */}
      <footer className="cosmic-footer">
        <span>PHYSICS UNPLUGGED © 2026</span>
        <span>DESIGNED BY TANMAY DAS</span>
        <span>EXPLORE • LEARN • EXCEL</span>
      </footer>

      {SiteWatermark && <SiteWatermark />}

    </div>
  );
}
