import React, { useState, useEffect, useRef, useMemo } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";
import "./DeskLampLogin.css";

// Procedural Web Audio Synthesizer (Zero external audio assets)
class ProceduralAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playCordDrag(intensity = 0.5) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(600 + Math.random() * 300, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.setValueAtTime(4, now);

    gain.gain.setValueAtTime(0.06 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  playSwitchClick(turningOn = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Mechanical metal snap
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = "square";
    osc1.frequency.setValueAtTime(turningOn ? 1800 : 1200, now);
    osc1.frequency.exponentialRampToValueAtTime(120, now + 0.035);

    gain1.gain.setValueAtTime(0.22, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.045);

    // 2. Metallic spring ping
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    const filter2 = this.ctx.createBiquadFilter();

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(turningOn ? 3200 : 2200, now + 0.005);
    osc2.frequency.exponentialRampToValueAtTime(turningOn ? 700 : 500, now + 0.09);

    filter2.type = "bandpass";
    filter2.frequency.setValueAtTime(turningOn ? 2800 : 1800, now);
    filter2.Q.setValueAtTime(8, now);

    gain2.gain.setValueAtTime(0.16, now + 0.005);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc2.connect(filter2);
    filter2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.005);
    osc2.stop(now + 0.13);

    // 3. Filament warm surge
    if (turningOn) {
      const osc3 = this.ctx.createOscillator();
      const gain3 = this.ctx.createGain();
      osc3.type = "triangle";
      osc3.frequency.setValueAtTime(65, now);
      osc3.frequency.linearRampToValueAtTime(110, now + 0.15);

      gain3.gain.setValueAtTime(0.001, now);
      gain3.gain.linearRampToValueAtTime(0.1, now + 0.08);
      gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc3.connect(gain3);
      gain3.connect(this.ctx.destination);
      osc3.start(now);
      osc3.stop(now + 0.45);
    }
  }

  playThemeChime(hue = 40) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const baseFreq = 440 + (hue % 360) * 1.5;

    [1, 1.5, 2].forEach((ratio, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq * ratio, now + i * 0.03);
      gain.gain.setValueAtTime(0.08 / (i + 1), now + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.03 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.03);
      osc.stop(now + i * 0.03 + 0.45);
    });
  }

  playKeyTick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(800 + Math.random() * 400, now);
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.025);
  }

  playToggleClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.03);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.045);
  }
}

const THEMES = [
  {
    id: "amber",
    name: "Warm Amber",
    hex: "#ffaa40",
    rgb: { r: 255, g: 170, b: 64 },
    glow: "rgba(255, 170, 64, 0.45)",
    beamGradient:
      "linear-gradient(135deg, rgba(255, 180, 75, 0.55) 0%, rgba(255, 140, 40, 0.22) 45%, rgba(255, 120, 20, 0.03) 100%)",
    cardHighlight: "rgba(255, 180, 80, 0.28)",
    ambientBg:
      "radial-gradient(circle at 35% 35%, rgba(60, 40, 25, 0.4) 0%, #0d0f14 100%)",
    hue: 35,
  },
  {
    id: "cyan",
    name: "Cyber Cyan",
    hex: "#00f2fe",
    rgb: { r: 0, g: 242, b: 254 },
    glow: "rgba(0, 242, 254, 0.45)",
    beamGradient:
      "linear-gradient(135deg, rgba(0, 242, 254, 0.52) 0%, rgba(79, 172, 254, 0.22) 45%, rgba(0, 100, 250, 0.03) 100%)",
    cardHighlight: "rgba(0, 242, 254, 0.28)",
    ambientBg:
      "radial-gradient(circle at 35% 35%, rgba(15, 45, 65, 0.45) 0%, #0a0e17 100%)",
    hue: 190,
  },
  {
    id: "emerald",
    name: "Emerald Mint",
    hex: "#10b981",
    rgb: { r: 16, g: 185, b: 129 },
    glow: "rgba(16, 185, 129, 0.45)",
    beamGradient:
      "linear-gradient(135deg, rgba(52, 211, 153, 0.52) 0%, rgba(16, 185, 129, 0.22) 45%, rgba(5, 150, 105, 0.03) 100%)",
    cardHighlight: "rgba(16, 185, 129, 0.28)",
    ambientBg:
      "radial-gradient(circle at 35% 35%, rgba(15, 55, 40, 0.45) 0%, #09120e 100%)",
    hue: 155,
  },
  {
    id: "sunset",
    name: "Sunset Magenta",
    hex: "#f43f5e",
    rgb: { r: 244, g: 63, b: 94 },
    glow: "rgba(244, 63, 94, 0.45)",
    beamGradient:
      "linear-gradient(135deg, rgba(251, 113, 133, 0.52) 0%, rgba(225, 29, 72, 0.22) 45%, rgba(168, 85, 247, 0.03) 100%)",
    cardHighlight: "rgba(244, 63, 94, 0.28)",
    ambientBg:
      "radial-gradient(circle at 35% 35%, rgba(65, 20, 35, 0.45) 0%, #120b14 100%)",
    hue: 340,
  },
  {
    id: "white",
    name: "Solar White",
    hex: "#f1f5f9",
    rgb: { r: 241, g: 245, b: 249 },
    glow: "rgba(241, 245, 249, 0.45)",
    beamGradient:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(226, 232, 240, 0.22) 45%, rgba(148, 163, 184, 0.03) 100%)",
    cardHighlight: "rgba(255, 255, 255, 0.32)",
    ambientBg:
      "radial-gradient(circle at 35% 35%, rgba(45, 50, 60, 0.45) 0%, #0d1016 100%)",
    hue: 210,
  },
];

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
  const [lampOn, setLampOn] = useState(true);
  const [themeIndex, setThemeIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lampBounce, setLampBounce] = useState(false);

  const audioRef = useRef(null);
  if (!audioRef.current) {
    audioRef.current = new ProceduralAudio();
  }

  const canvasRef = useRef(null);
  const cardRef = useRef(null);
  const glareRef = useRef(null);
  const cordLineRef = useRef(null);
  const cordHandleRef = useRef(null);
  const lampHeadRef = useRef(null);
  const bulbRef = useRef(null);
  const beamRef = useRef(null);

  // Physics drag variables
  const dragRef = useRef({
    isDragging: false,
    startY: 0,
    currentPull: 0,
    springVelocity: 0,
    animFrame: null,
  });

  // Tilt variables
  const tiltRef = useRef({
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
  });

  const currentTheme = THEMES[themeIndex];

  // Apply theme custom properties to root wrapper
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--lamp-color", currentTheme.hex);
    root.style.setProperty("--lamp-glow", currentTheme.glow);
    root.style.setProperty(
      "--lamp-rgb",
      `${currentTheme.rgb.r}, ${currentTheme.rgb.g}, ${currentTheme.rgb.b}`
    );
    root.style.setProperty("--lamp-beam-gradient", currentTheme.beamGradient);
    root.style.setProperty("--card-highlight", currentTheme.cardHighlight);
    root.style.setProperty("--ambient-bg", currentTheme.ambientBg);
  }, [currentTheme]);

  // Particle Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const particles = [];
    const sparks = [];
    const maxParticles = 100;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        baseVy: -0.15 - Math.random() * 0.3,
        size: 1 + Math.random() * 2,
        baseAlpha: 0.15 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    const mouse = { x: -1000, y: -1000 };
    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    const isInsideBeam = (px, py) => {
      if (!lampOn) return false;
      const beamEl = beamRef.current;
      if (!beamEl) return false;
      const rect = beamEl.getBoundingClientRect();
      return (
        px >= rect.left - 40 &&
        px <= rect.right + 80 &&
        py >= rect.top &&
        py <= rect.bottom + 50
      );
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Ambient motes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.phase += p.pulseSpeed;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120;
          p.x += (dx / dist) * force * 3;
          p.y += (dy / dist) * force * 3;
        }

        p.x += p.vx;
        p.y += p.vy;

        const inBeam = isInsideBeam(p.x, p.y);
        if (inBeam) {
          p.y += p.baseVy;
        }

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        const pulse = (Math.sin(p.phase) + 1) * 0.5;
        let drawAlpha, drawSize, drawColor;

        if (lampOn && inBeam) {
          drawAlpha = 0.5 + pulse * 0.5;
          drawSize = p.size * (1.2 + pulse * 0.4);
          drawColor = `rgba(${currentTheme.rgb.r}, ${currentTheme.rgb.g}, ${currentTheme.rgb.b}, ${drawAlpha})`;
        } else if (lampOn) {
          drawAlpha = p.baseAlpha * 0.6;
          drawSize = p.size;
          drawColor = `rgba(${currentTheme.rgb.r}, ${currentTheme.rgb.g}, ${currentTheme.rgb.b}, ${drawAlpha})`;
        } else {
          drawAlpha = p.baseAlpha * 0.3;
          drawSize = p.size * 0.8;
          drawColor = `rgba(180, 200, 240, ${drawAlpha})`;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, drawSize, 0, Math.PI * 2);
        ctx.fillStyle = drawColor;
        ctx.fill();
      }

      // Transient sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.94;
        s.vy *= 0.94;
        s.alpha -= 0.015;

        if (s.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.alpha, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${currentTheme.rgb.r}, ${currentTheme.rgb.g}, ${currentTheme.rgb.b}, ${s.alpha})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [lampOn, currentTheme]);

  // 3D Card Tilt Effect
  useEffect(() => {
    let animId;
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card) return;

    const handlePointerMove = (e) => {
      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - cardCenterX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - cardCenterY) / (window.innerHeight / 2);

      const clampedX = Math.max(-1, Math.min(1, deltaX));
      const clampedY = Math.max(-1, Math.min(1, deltaY));

      tiltRef.current.targetY = clampedX * 10;
      tiltRef.current.targetX = -clampedY * 10;

      if (glare) {
        const glareX = ((e.clientX - rect.left) / rect.width) * 100;
        const glareY = ((e.clientY - rect.top) / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.04) 40%, transparent 70%)`;
      }
    };

    window.addEventListener("mousemove", handlePointerMove);

    const updateTilt = () => {
      const { currentX, currentY, targetX, targetY } = tiltRef.current;
      tiltRef.current.currentX += (targetX - currentX) * 0.08;
      tiltRef.current.currentY += (targetY - currentY) * 0.08;

      card.style.transform = `perspective(1000px) rotateX(${tiltRef.current.currentX.toFixed(
        2
      )}deg) rotateY(${tiltRef.current.currentY.toFixed(2)}deg)`;

      animId = requestAnimationFrame(updateTilt);
    };

    animId = requestAnimationFrame(updateTilt);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handlePointerMove);
    };
  }, []);

  // Cord dragging & spring back physics
  const updateCordVisual = (pull) => {
    if (cordLineRef.current) {
      cordLineRef.current.setAttribute("y2", 285 + pull);
    }
    if (cordHandleRef.current) {
      cordHandleRef.current.style.transform = `translateY(${pull}px)`;
    }
  };

  const animateSpringBack = () => {
    const drag = dragRef.current;
    const target = 0;
    const force = (target - drag.currentPull) * 0.28;
    drag.springVelocity = (drag.springVelocity + force) * 0.82;
    drag.currentPull += drag.springVelocity;

    updateCordVisual(drag.currentPull);

    if (
      Math.abs(drag.currentPull) > 0.3 ||
      Math.abs(drag.springVelocity) > 0.3
    ) {
      drag.animFrame = requestAnimationFrame(animateSpringBack);
    } else {
      drag.currentPull = 0;
      updateCordVisual(0);
    }
  };

  const toggleLamp = () => {
    setLampOn((prev) => {
      const next = !prev;
      audioRef.current.playSwitchClick(next);
      return next;
    });
    setLampBounce(true);
    setTimeout(() => setLampBounce(false), 500);
  };

  const triggerClickPull = () => {
    const drag = dragRef.current;
    cancelAnimationFrame(drag.animFrame);
    let progress = 0;
    const start = performance.now();
    const duration = 140;

    const tugStep = (now) => {
      const elapsed = now - start;
      progress = Math.min(1, elapsed / duration);
      drag.currentPull = Math.sin(progress * Math.PI) * 34;
      updateCordVisual(drag.currentPull);

      if (progress < 1) {
        requestAnimationFrame(tugStep);
      } else {
        toggleLamp();
        drag.springVelocity = 0;
        animateSpringBack();
      }
    };
    requestAnimationFrame(tugStep);
  };

  const startDrag = (clientY) => {
    const drag = dragRef.current;
    drag.isDragging = true;
    drag.startY = clientY;
    cancelAnimationFrame(drag.animFrame);
    audioRef.current.init();
  };

  const moveDrag = (clientY) => {
    const drag = dragRef.current;
    if (!drag.isDragging) return;
    const deltaY = clientY - drag.startY;
    if (deltaY > 0) {
      const resistance = 1 / (1 + deltaY * 0.015);
      drag.currentPull = Math.min(60, deltaY * resistance);
      updateCordVisual(drag.currentPull);
      if (Math.random() < 0.25) {
        audioRef.current.playCordDrag(drag.currentPull / 60);
      }
    }
  };

  const endDrag = () => {
    const drag = dragRef.current;
    if (!drag.isDragging) return;
    drag.isDragging = false;
    if (drag.currentPull >= 24) {
      toggleLamp();
    }
    drag.springVelocity = 0;
    animateSpringBack();
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (dragRef.current.isDragging) moveDrag(e.clientY);
    };
    const onMouseUp = () => endDrag();
    const onTouchMove = (e) => {
      if (dragRef.current.isDragging && e.touches.length > 0) {
        moveDrag(e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => endDrag();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [lampOn]);

  // Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") {
        if (
          !["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(e.key)
        ) {
          audioRef.current.playKeyTick();
        }
        return;
      }

      if (e.code === "Space" || e.code === "KeyL") {
        e.preventDefault();
        triggerClickPull();
      }

      if (e.code === "KeyM") {
        const muted = audioRef.current.toggleMute();
        setIsMuted(muted);
      }

      if (["Digit1", "Digit2", "Digit3", "Digit4", "Digit5"].includes(e.code)) {
        const idx = parseInt(e.key, 10) - 1;
        if (THEMES[idx]) {
          setThemeIndex(idx);
          audioRef.current.playThemeChime(THEMES[idx].hue);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { percent: 0, label: "", color: "#ef4444" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { percent: 20, label: "Weak", color: "#ef4444" };
    if (score === 2) return { percent: 45, label: "Fair", color: "#f59e0b" };
    if (score === 3 || score === 4)
      return { percent: 75, label: "Good", color: "#3b82f6" };
    return { percent: 100, label: "Strong", color: "#10b981" };
  }, [password]);

  return (
    <div className={`lamp-login-wrapper ${lampOn ? "lamp-on" : "lamp-off"}`}>
      {/* Background Particle Canvas */}
      <canvas ref={canvasRef} className="lamp-particle-canvas" />

      {/* Ambient Room Glow */}
      <div className="lamp-ambient-glow" />

      {/* Top Header */}
      <header className="lamp-header">
        <div className="lamp-brand">
          <img src={logo} alt="Physics Unplugged" className="lamp-brand-logo" />
          <div className="lamp-brand-text">
            <h1>Physics Unplugged</h1>
            <span>Examination Portal</span>
          </div>
        </div>

        <div className="lamp-header-controls">
          <div className="lamp-status-badge">
            <span className="lamp-status-dot" />
            <span>{lampOn ? "Lamp: ON" : "Lamp: OFF"}</span>
          </div>

          <button
            type="button"
            className="lamp-icon-btn"
            title={isMuted ? "Unmute Sound [M]" : "Mute Sound [M]"}
            onClick={() => {
              const muted = audioRef.current.toggleMute();
              setIsMuted(muted);
            }}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </header>

      {/* Main Desk Stage */}
      <main className="lamp-desk-stage">
        {/* Desk Surface Sheen */}
        <div className="lamp-desk-surface">
          <div className="lamp-desk-reflection" />
        </div>

        {/* Light Beam Cone */}
        <div ref={beamRef} className="lamp-light-beam">
          <div className="lamp-beam-radial" />
        </div>

        {/* Left Column: Interactive Lamp & Theme Swatches */}
        <div className="lamp-column">
          <div className="lamp-svg-box">
            <svg
              className={`lamp-svg-element ${lampBounce ? "lamp-bounce" : ""}`}
              viewBox="0 0 460 560"
              width="100%"
              height="100%"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="pup-base-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1e2430" />
                  <stop offset="20%" stopColor="#3a4454" />
                  <stop offset="50%" stopColor="#4f5b70" />
                  <stop offset="75%" stopColor="#2a323f" />
                  <stop offset="100%" stopColor="#141820" />
                </linearGradient>

                <linearGradient id="pup-rod-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2c3440" />
                  <stop offset="40%" stopColor="#5a687d" />
                  <stop offset="70%" stopColor="#7e8da3" />
                  <stop offset="100%" stopColor="#1e2430" />
                </linearGradient>

                <linearGradient id="pup-brass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="45%" stopColor="#fbbf24" />
                  <stop offset="80%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#78350f" />
                </linearGradient>

                <linearGradient id="pup-shade-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#384556" />
                  <stop offset="35%" stopColor="#1e293b" />
                  <stop offset="70%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>

                <radialGradient id="pup-inner-glow" cx="45%" cy="50%" r="55%">
                  <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.95" />
                  <stop
                    offset="35%"
                    stopColor={currentTheme.hex}
                    stopOpacity="0.8"
                  />
                  <stop
                    offset="75%"
                    stopColor={currentTheme.hex}
                    stopOpacity="0.3"
                  />
                  <stop offset="100%" stopColor="#1e293b" stopOpacity="0.1" />
                </radialGradient>

                <radialGradient id="pup-filament-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="30%" stopColor="#fff8db" />
                  <stop offset="65%" stopColor={currentTheme.hex} />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                <linearGradient id="pup-bead-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e2e8f0" />
                  <stop offset="50%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
              </defs>

              {/* Lamp Ground Shadow */}
              <ellipse
                cx="140"
                cy="510"
                rx="90"
                ry="18"
                fill="rgba(0,0,0,0.55)"
              />

              {/* Base */}
              <path
                d="M 60 500 Q 140 514 220 500 L 222 505 Q 140 520 58 505 Z"
                fill="#0f172a"
              />
              <path
                d="M 60 495 C 60 475 220 475 220 495 L 220 502 C 220 514 60 514 60 502 Z"
                fill="url(#pup-base-grad)"
              />
              <ellipse
                cx="140"
                cy="485"
                rx="72"
                ry="14"
                fill="#2a323f"
                stroke="#475569"
                strokeWidth="1.5"
              />
              <path
                d="M 124 485 L 124 455 C 124 450 156 450 156 455 L 156 485 Z"
                fill="url(#pup-base-grad)"
                stroke="#334155"
                strokeWidth="1"
              />
              <circle
                cx="140"
                cy="460"
                r="10"
                fill="url(#pup-brass-grad)"
                stroke="#78350f"
                strokeWidth="1.5"
              />

              {/* Lower Arm (Angled more forward across desk) */}
              <line
                x1="135"
                y1="460"
                x2="230"
                y2="300"
                stroke="url(#pup-rod-grad)"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <line
                x1="145"
                y1="460"
                x2="242"
                y2="300"
                stroke="url(#pup-rod-grad)"
                strokeWidth="7"
                strokeLinecap="round"
              />

              {/* Elbow Joint (Positioned at 236, 300) */}
              <circle
                cx="236"
                cy="300"
                r="14"
                fill="url(#pup-base-grad)"
                stroke="#64748b"
                strokeWidth="2"
              />
              <circle
                cx="236"
                cy="300"
                r="8"
                fill="url(#pup-brass-grad)"
                stroke="#78350f"
                strokeWidth="1.5"
              />

              {/* Upper Arm (Reaching cleanly to 310, 170) */}
              <line
                x1="232"
                y1="300"
                x2="305"
                y2="170"
                stroke="url(#pup-rod-grad)"
                strokeWidth="6.5"
                strokeLinecap="round"
              />
              <line
                x1="240"
                y1="300"
                x2="315"
                y2="170"
                stroke="url(#pup-rod-grad)"
                strokeWidth="6.5"
                strokeLinecap="round"
              />

              {/* Wrist Swivel Pivot */}
              <circle
                cx="310"
                cy="170"
                r="11"
                fill="url(#pup-brass-grad)"
                stroke="#78350f"
                strokeWidth="1.5"
              />

              {/* Lamp Head Group */}
              <g ref={lampHeadRef}>
                {/* Mount Collar */}
                <path
                  d="M 305 170 L 328 152 L 336 162 L 315 178 Z"
                  fill="url(#pup-base-grad)"
                  stroke="#475569"
                  strokeWidth="1"
                />

                {/* Symmetrical Circular Cap Outer Shell */}
                <path
                  d="M 285 220 
                     A 62 62 0 1 1 385 165 
                     C 375 195 330 235 285 220 Z"
                  fill="url(#pup-shade-grad)"
                  stroke="#475569"
                  strokeWidth="2"
                />

                {/* Smooth Circular Inner Reflector Opening */}
                <path
                  d="M 285 220 
                     C 330 235 375 195 385 165 
                     C 365 190 320 220 285 220 Z"
                  fill={lampOn ? "url(#pup-inner-glow)" : "#1e293b"}
                />

                {/* Bulb & Filament */}
                <g>
                  <circle
                    cx="336"
                    cy="200"
                    r="22"
                    fill="rgba(255, 255, 255, 0.15)"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1.5"
                  />
                  <circle
                    ref={bulbRef}
                    cx="336"
                    cy="200"
                    r="20"
                    fill={lampOn ? "url(#pup-filament-glow)" : "transparent"}
                    opacity={lampOn ? 1 : 0.05}
                  />
                  <path
                    d="M 328 190 L 333 200 L 339 190 L 344 200"
                    fill="none"
                    stroke={lampOn ? "#ffffff" : "#334155"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </g>

                {/* Interactive Pull Cord */}
                <g className="lamp-interactive-cord">
                  <rect
                    x="296"
                    y="210"
                    width="8"
                    height="6"
                    rx="2"
                    fill="url(#pup-brass-grad)"
                  />
                  <line
                    ref={cordLineRef}
                    x1="300"
                    y1="216"
                    x2="300"
                    y2="285"
                    stroke="#94a3b8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="2,3.5"
                  />

                  <g
                    ref={cordHandleRef}
                    className="cord-handle-group"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      startDrag(e.clientY);
                    }}
                    onTouchStart={(e) => {
                      if (e.touches.length > 0) startDrag(e.touches[0].clientY);
                    }}
                    onClick={() => {
                      if (Math.abs(dragRef.current.currentPull) < 5) {
                        triggerClickPull();
                      }
                    }}
                  >
                    <circle cx="300" cy="287" r="18" fill="transparent" />
                    <path
                      d="M 296 283 L 304 283 L 305 293 C 305 298 295 298 295 293 Z"
                      fill="url(#pup-bead-grad)"
                      stroke="#334155"
                      strokeWidth="1.2"
                    />
                    <circle cx="300" cy="281" r="3" fill="url(#pup-brass-grad)" />
                    <circle cx="300" cy="291" r="2.5" fill="#cbd5e1" />
                    <circle
                      className="cord-pulse"
                      cx="300"
                      cy="290"
                      r="14"
                      fill="none"
                      stroke={currentTheme.hex}
                      strokeWidth="1.5"
                    />
                  </g>
                </g>
              </g>
            </svg>

            {/* Pull Cord Tooltip */}
            <div className="lamp-cord-tooltip">
              <span className="lamp-cord-tooltip-dot" />
              <span>Pull Cord ↕</span>
            </div>
          </div>

          {/* Theme Color Picker Dock */}
          <div className="lamp-theme-dock">
            <span className="lamp-theme-title">Theme Hue:</span>
            <div className="lamp-theme-swatches">
              {THEMES.map((t, idx) => (
                <button
                  key={t.id}
                  type="button"
                  className={`lamp-swatch ${idx === themeIndex ? "active" : ""}`}
                  style={{ backgroundColor: t.hex }}
                  title={t.name}
                  onClick={() => {
                    setThemeIndex(idx);
                    audioRef.current.playThemeChime(t.hue);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 3D Login Card */}
        <div className="lamp-card-column">
          <section ref={cardRef} className="lamp-auth-card">
            {/* Specular Glare */}
            <div ref={glareRef} className="lamp-card-glare" />

            <div className="lamp-card-header">
              {!resetMode && (
                <div className="lamp-tabs-pill">
                  <div
                    className="lamp-tab-slider"
                    style={{
                      transform: showSignup
                        ? "translateX(100%)"
                        : "translateX(0%)",
                    }}
                  />
                  <button
                    type="button"
                    className={`lamp-tab-btn ${!showSignup ? "active" : ""}`}
                    onClick={() => {
                      if (showSignup) {
                        setShowSignup(false);
                        setMessage("");
                        audioRef.current.playToggleClick();
                      }
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className={`lamp-tab-btn ${showSignup ? "active" : ""}`}
                    onClick={() => {
                      if (!showSignup) {
                        setShowSignup(true);
                        setMessage("");
                        audioRef.current.playToggleClick();
                      }
                    }}
                  >
                    Create Account
                  </button>
                </div>
              )}

              <span className="lamp-card-eyebrow">
                {resetMode
                  ? "Password Recovery"
                  : "Tanmay's Advanced Examination Portal"}
              </span>

              <h2 className="lamp-card-title">
                {resetMode
                  ? "Set New Password"
                  : showSignup
                  ? "Student Registration"
                  : "Welcome Back"}
              </h2>

              <p className="lamp-card-subtitle">
                {resetMode
                  ? "Enter and confirm your new secure password"
                  : showSignup
                  ? "Register to access your online physics examinations"
                  : "Sign in to access your tests and performance analytics"}
              </p>
            </div>

            {/* Authentication Form */}
            {resetMode ? (
              // Reset Password Form
              <form onSubmit={handleUpdatePassword} className="lamp-form">
                <div className="lamp-form-group">
                  <label className="lamp-label">NEW PASSWORD</label>
                  <div className="lamp-input-wrap">
                    <span className="lamp-input-icon">
                      <Lock size={18} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="lamp-input"
                    />
                    <button
                      type="button"
                      className="lamp-pwd-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="lamp-form-group">
                  <label className="lamp-label">CONFIRM PASSWORD</label>
                  <div className="lamp-input-wrap">
                    <span className="lamp-input-icon">
                      <Lock size={18} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="lamp-input"
                    />
                  </div>
                </div>

                {message && (
                  <div
                    className={`lamp-message-banner ${
                      message.includes("success") ? "success" : ""
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  className="lamp-submit-btn"
                  disabled={busy}
                >
                  {busy && <span className="lamp-btn-spinner" />}
                  <span>{busy ? "Updating Password..." : "Update Password"}</span>
                </button>
              </form>
            ) : (
              // Main Login & Signup Form
              <form
                onSubmit={
                  showSignup
                    ? (e) => {
                        e.preventDefault();
                        handleSignup();
                      }
                    : handleLogin
                }
                className="lamp-form"
              >
                {showSignup && (
                  <div className="lamp-form-group">
                    <label className="lamp-label">FULL NAME</label>
                    <div className="lamp-input-wrap">
                      <span className="lamp-input-icon">
                        <GraduationCap size={18} />
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. Alex Sharma"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        required
                        className="lamp-input"
                      />
                    </div>
                  </div>
                )}

                <div className="lamp-form-group">
                  <label className="lamp-label">EMAIL ADDRESS</label>
                  <div className="lamp-input-wrap">
                    <span className="lamp-input-icon">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="lamp-input"
                    />
                  </div>
                </div>

                <div className="lamp-form-group">
                  <div className="lamp-label-row">
                    <label className="lamp-label">PASSWORD</label>
                    {!showSignup && (
                      <button
                        type="button"
                        className="lamp-forgot-btn"
                        onClick={handlePasswordReset}
                        disabled={busy}
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="lamp-input-wrap">
                    <span className="lamp-input-icon">
                      <Lock size={18} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="lamp-input"
                    />
                    <button
                      type="button"
                      className="lamp-pwd-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password Strength Meter on Signup */}
                  {showSignup && password.length > 0 && (
                    <div className="lamp-strength-box">
                      <div className="lamp-strength-track">
                        <div
                          className="lamp-strength-bar"
                          style={{
                            width: `${passwordStrength.percent}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        />
                      </div>
                      <span
                        className="lamp-strength-label"
                        style={{ color: passwordStrength.color }}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Cloudflare Turnstile CAPTCHA */}
                {turnstileSiteKey ? (
                  <div className="lamp-captcha-box">
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
                  <div className="lamp-message-banner">
                    CAPTCHA configuration missing. Please contact administrator.
                  </div>
                )}

                {/* Notification/Feedback Message */}
                {message && (
                  <div
                    className={`lamp-message-banner ${
                      message.includes("sent") ||
                      message.includes("submitted") ||
                      message.includes("success")
                        ? "success"
                        : ""
                    }`}
                  >
                    {message}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="lamp-submit-btn"
                  disabled={busy || !captchaToken || !turnstileSiteKey}
                >
                  {busy && <span className="lamp-btn-spinner" />}
                  <span>
                    {busy
                      ? "Authenticating..."
                      : showSignup
                      ? "Create Student Account"
                      : "Sign In"}
                  </span>
                </button>
              </form>
            )}

            <p className="lamp-card-footer-note">
              Secure authentication powered by Supabase • Physics Unplugged
            </p>
          </section>
        </div>
      </main>

      {/* Footer Controls & Hints */}
      <footer className="lamp-footer">
        <div className="lamp-footer-tips">
          <span className="lamp-tip-badge">Controls</span>
          <span>
            <kbd className="lamp-kbd">Pull Cord</kbd> or{" "}
            <kbd className="lamp-kbd">Space</kbd> /{" "}
            <kbd className="lamp-kbd">L</kbd> : Toggle Light
          </span>
          <span>•</span>
          <span>
            <kbd className="lamp-kbd">1</kbd> - <kbd>5</kbd> : Switch Theme
          </span>
          <span>•</span>
          <span>
            <kbd className="lamp-kbd">M</kbd> : Sound Mute
          </span>
        </div>
      </footer>

      {SiteWatermark && <SiteWatermark />}
    </div>
  );
}
