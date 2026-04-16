import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../Componets/CSS/StaffLogin.css';
import { useTheme } from "../ThemeContext";
import "../Componets/CSS/theme-decorations.css";
import AppHeader from "../Componets/AppHeader";
import { THEMES } from "../ThemeContext";

const SEASONAL_GREETINGS = {
  [THEMES.RAMADAN]: "Ramadan Mubarak!",
  [THEMES.CHRISTMAS]: "Merry Christmas!",
  [THEMES.NEWYEAR]: "Happy New Year!",
  [THEMES.PONGAL]: "Happy Pongal!"
};

// --- Particle System ---
function Particles({ containerRef }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particles = useRef([]);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    let W = canvas.width = container.offsetWidth;
    let H = canvas.height = container.offsetHeight;

    const NUM = 80;
    const initParticles = () => {
      particles.current = Array.from({ length: NUM }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.2,
        color: `hsl(${Math.random() * 60 + 200}, 100%, 75%)`,
      }));
    };
    initParticles();

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const ps = particles.current;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      ps.forEach(p => {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = Math.max(0, 120 - dist) / 120;

        p.x += p.vx + force * (dx / dist || 0) * 1.5;
        p.y += p.vy + force * (dy / dist || 0) * 1.5;

        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha + force * 0.4;
        ctx.fill();
      });

      // Draw connecting lines near mouse
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            const distFromMouse = Math.sqrt(
              Math.pow((ps[i].x + ps[j].x) / 2 - mx, 2) +
              Math.pow((ps[i].y + ps[j].y) / 2 - my, 2)
            );
            if (distFromMouse < 180) {
              ctx.beginPath();
              ctx.moveTo(ps[i].x, ps[i].y);
              ctx.lineTo(ps[j].x, ps[j].y);
              ctx.strokeStyle = `rgba(130, 180, 255, ${(1 - d / 90) * 0.35})`;
              ctx.globalAlpha = 1;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      W = canvas.width = container.offsetWidth;
      H = canvas.height = container.offsetHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [containerRef]);

  // Expose mouse ref through container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onMove = (e) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 }; };
    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);
    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
    };
  }, [containerRef]);

  return <canvas ref={canvasRef} className="staff-particle-canvas" />;
}

// --- Main Component ---
function StaffLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);

  const containerRef = useRef(null);
  const glowRef = useRef(null);
  const cardRef = useRef(null);
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const navigate = useNavigate();

  const { theme } = useTheme();

  const handleMouseMove = useCallback((e) => {
    const container = containerRef.current;
    const glow = glowRef.current;
    const card = cardRef.current;
    if (!container || !glow) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Spotlight glow
    glow.style.left = `${x}px`;
    glow.style.top = `${y}px`;
    glow.style.opacity = '1';

    // Precise cursor dot — fixed positioning for exact targeting
    if (cursorDotRef.current) {
      cursorDotRef.current.style.left = `${e.clientX}px`;
      cursorDotRef.current.style.top = `${e.clientY}px`;
      cursorDotRef.current.style.opacity = '1';
    }
    if (cursorRingRef.current) {
      cursorRingRef.current.style.left = `${e.clientX}px`;
      cursorRingRef.current.style.top = `${e.clientY}px`;
      cursorRingRef.current.style.opacity = '1';
    }

    setCardVisible(true);

    // 3D tilt effect on card
    if (card) {
      const cardRect = card.getBoundingClientRect();
      const cx = cardRect.left + cardRect.width / 2;
      const cy = cardRect.top + cardRect.height / 2;
      const rotX = ((e.clientY - cy) / (cardRect.height / 2)) * -8;
      const rotY = ((e.clientX - cx) / (cardRect.width / 2)) * 8;
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (glowRef.current) glowRef.current.style.opacity = '0';
    if (cursorDotRef.current) cursorDotRef.current.style.opacity = '0';
    if (cursorRingRef.current) cursorRingRef.current.style.opacity = '0';
    if (cardRef.current) cardRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
  }, []);

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8070/employee/login", { email, password });
      setMessage(`Welcome back, ${response.data.username}!`);
      setAlertType("success");
      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("staffEmail", email);
      sessionStorage.setItem("staffName", response.data.username);
      sessionStorage.setItem("staffRole", response.data.role);
      // Redirect based on role
      if (response.data.role === "Service_Agent") {
        navigate("/service-agent-dash", {
          state: { message: `Welcome, ${response.data.username}!`, alertType: "success" },
        });
      } else {
        navigate("/StaffDashboard", {
          state: { message: `Welcome, ${response.data.username}!`, alertType: "success" },
        });
      }
    } catch (err) {
      setMessage(err?.response?.data?.error || "Staff login failed!");
      setAlertType("danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`staff-login-root theme-${theme || ''}`}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ flexDirection: 'column', justifyContent: 'flex-start' }}
    >
      {/* Header */}
      <AppHeader appName="Bird Nest" tagline="Staff Portal" />

      {/* Particle canvas */}
      <Particles containerRef={containerRef} />

      {/* Mouse spotlight */}
      <div className="staff-spotlight" ref={glowRef} />

      {/* Precise custom cursor */}
      <div className="staff-cursor-dot" ref={cursorDotRef} style={{ opacity: 0 }} />
      <div className="staff-cursor-ring" ref={cursorRingRef} style={{ opacity: 0 }} />

      {/* Ambient glowing orbs */}
      <div className="staff-orb staff-orb-1" />
      <div className="staff-orb staff-orb-2" />
      <div className="staff-orb staff-orb-3" />

      {/* Hint text before interaction */}
      {!cardVisible && (
        <div className="staff-hint" style={{ top: '50%' }}>
          <span className="staff-hint-icon">✦</span>
          <p>Move your cursor to reveal</p>
          <span className="staff-hint-icon">✦</span>
        </div>
      )}

      {/* Login Card Wrapper */}
      <div style={{ flex: 1, display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        {/* Login Card */}
        <div
          className={`staff-card ${cardVisible ? 'staff-card--visible' : ''}`}
          ref={cardRef}
        >
        {/* Card inner glow border */}
        <div className="staff-card-glow-border" />

        {/* Header */}
        <div className="staff-card-header">
          <div className="staff-logo-ring">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="17" stroke="url(#lg1)" strokeWidth="2"/>
              <path d="M10 18 L18 10 L26 18 L18 26 Z" fill="url(#lg2)" opacity="0.9"/>
              <defs>
                <linearGradient id="lg1" x1="0" y1="0" x2="36" y2="36">
                  <stop offset="0%" stopColor="#a78bfa"/>
                  <stop offset="100%" stopColor="#38bdf8"/>
                </linearGradient>
                <linearGradient id="lg2" x1="0" y1="0" x2="36" y2="36">
                  <stop offset="0%" stopColor="#c4b5fd"/>
                  <stop offset="100%" stopColor="#7dd3fc"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="staff-card-title">Staff Portal</h1>
          <p className="staff-card-subtitle">Sign in to your Bird Nest account</p>
          {SEASONAL_GREETINGS[theme] && (
            <div className="staff-seasonal-greeting" style={{ marginTop: '1rem', padding: '0.4rem 0.8rem', background: 'rgba(167, 139, 250, 0.15)', borderRadius: '12px', color: '#a78bfa', fontWeight: '500', display: 'inline-block', fontSize: '0.9rem' }}>
              {SEASONAL_GREETINGS[theme]}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleStaffLogin} className="staff-form">
          <div className="staff-field">
            <label htmlFor="staff-email" className="staff-label">Email</label>
            <div className="staff-input-wrapper">
              <span className="staff-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                id="staff-email"
                type="email"
                className="staff-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="staff-field">
            <label htmlFor="staff-password" className="staff-label">Password</label>
            <div className="staff-input-wrapper">
              <span className="staff-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="staff-password"
                type={showPassword ? "text" : "password"}
                className="staff-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="staff-toggle-pw"
                onClick={() => setShowPassword(p => !p)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {message && (
            <div className={`staff-alert staff-alert--${alertType}`}>
              {alertType === 'success' ? '✓' : '✕'} {message}
            </div>
          )}

          <button type="submit" className="staff-btn" disabled={loading}>
            {loading ? (
              <span className="staff-btn-loading">
                <span className="staff-spinner" />
                Signing in...
              </span>
            ) : (
              <span>Sign In <span className="staff-btn-arrow">→</span></span>
            )}
          </button>
        </form>

        <div className="staff-card-footer">
          <span>Not a staff member? </span>
          <a href="/AdminLogin" className="staff-footer-link">Admin Login</a>
          <br />
        </div>
      </div>
      </div>
    </div>
  );
}

export default StaffLogin;
