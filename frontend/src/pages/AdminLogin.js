import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import '../Componets/CSS/AdminLogin.css';
import '../Componets/CSS/theme-decorations.css';
import AppHeader from '../Componets/AppHeader';

/* ─── Animated Gear SVG ─────────────────────────────────── */
function GearIcon({ size = 40, className = '', style = {} }) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
    >
      <path
        d="M24 16a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"
        fill="url(#gearCenter)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.1 4.3a2 2 0 0 1 7.8 0l.9 3.3a14 14 0 0 1 3.4 2l3.3-.9a2 2 0 0 1 2.3 1.1l1.9 3.3a2 2 0 0 1-.5 2.6l-2.7 2a14 14 0 0 1 0 4l2.7 2a2 2 0 0 1 .5 2.6l-1.9 3.3a2 2 0 0 1-2.3 1.1l-3.3-.9a14 14 0 0 1-3.4 2l-.9 3.3a2 2 0 0 1-7.8 0l-.9-3.3a14 14 0 0 1-3.4-2l-3.3.9a2 2 0 0 1-2.3-1.1L8.3 27a2 2 0 0 1 .5-2.6l2.7-2a14 14 0 0 1 0-4l-2.7-2A2 2 0 0 1 8.3 14l1.9-3.3a2 2 0 0 1 2.3-1.1l3.3.9a14 14 0 0 1 3.4-2l.9-3.2zM24 16a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"
        fill="url(#gearOuter)"
        opacity="0.9"
      />
      <defs>
        <linearGradient id="gearCenter" x1="16" y1="16" x2="32" y2="32">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="gearOuter" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Background Gear (decorative) ─────────────────────── */
function BgGear({ size, top, left, right, bottom, opacity, speed, direction }) {
  return (
    <div
      className="admin-bg-gear"
      style={{
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        opacity,
        animation: `admin-gear-spin${direction === 'ccw' ? '-ccw' : ''} ${speed}s linear infinite`,
      }}
    >
      <GearIcon size={size} />
    </div>
  );
}

/* ─── Particle Canvas ───────────────────────────────────── */
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

    const initParticles = () => {
      particles.current = Array.from({ length: 70 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.4,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.4 + 0.1,
        // amber/gold palette for admin
        color: `hsl(${Math.random() * 30 + 35}, 90%, ${Math.random() * 20 + 65}%)`,
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
        const force = Math.max(0, 130 - dist) / 130;

        p.x += p.vx + force * (dx / (dist || 1)) * 1.6;
        p.y += p.vy + force * (dy / (dist || 1)) * 1.6;

        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha + force * 0.5;
        ctx.fill();
      });

      // Connection lines near mouse
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 85) {
            const midX = (ps[i].x + ps[j].x) / 2;
            const midY = (ps[i].y + ps[j].y) / 2;
            const distFromMouse = Math.sqrt((midX - mx) ** 2 + (midY - my) ** 2);
            if (distFromMouse < 180) {
              ctx.beginPath();
              ctx.moveTo(ps[i].x, ps[i].y);
              ctx.lineTo(ps[j].x, ps[j].y);
              ctx.strokeStyle = `rgba(251, 191, 36, ${(1 - d / 85) * 0.3})`;
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

  return <canvas ref={canvasRef} className="admin-particle-canvas" />;
}

/* ─── Main Component ────────────────────────────────────── */
function AdminLogin() {
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
  const cursorGearRef = useRef(null);
  const spinTimerRef = useRef(null);
  const navigate = useNavigate();

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

    // Gear cursor — tracks mouse with fixed positioning
    if (cursorGearRef.current) {
      cursorGearRef.current.style.left = `${e.clientX}px`;
      cursorGearRef.current.style.top = `${e.clientY}px`;
      cursorGearRef.current.style.opacity = '1';
      // Spin fast while moving
      cursorGearRef.current.classList.add('spinning');
      clearTimeout(spinTimerRef.current);
      spinTimerRef.current = setTimeout(() => {
        if (cursorGearRef.current) cursorGearRef.current.classList.remove('spinning');
      }, 300);
    }

    setCardVisible(true);

    if (card) {
      const cardRect = card.getBoundingClientRect();
      const cx = cardRect.left + cardRect.width / 2;
      const cy = cardRect.top + cardRect.height / 2;
      const rotX = ((e.clientY - cy) / (cardRect.height / 2)) * -7;
      const rotY = ((e.clientX - cx) / (cardRect.width / 2)) * 7;
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.025)`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (glowRef.current) glowRef.current.style.opacity = '0';
    if (cursorGearRef.current) cursorGearRef.current.style.opacity = '0';
    if (cardRef.current)
      cardRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8070/admin/login", { email, password });
      setMessage(`Welcome back, ${response.data.username}!`);
      setAlertType("success");
      sessionStorage.setItem("token", response.data.token);
      const isServiceAgent = email.toLowerCase().includes("service");
      const dashboardPath = isServiceAgent ? "/service-agent-dash" : "/Admindash";
      navigate(dashboardPath, {
        state: { message: `Welcome, ${response.data.username}!`, alertType: "success" },
      });
    } catch (err) {
      setMessage(err?.response?.data?.error || "Admin login failed!");
      setAlertType("danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="admin-login-root"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ flexDirection: 'column', justifyContent: 'flex-start' }}
    >
      {/* Header */}
      <AppHeader appName="Bird Nest" tagline="Admin Login" />

      {/* Particle field */}
      <Particles containerRef={containerRef} />

      {/* Mouse spotlight — amber/gold tint */}
      <div className="admin-spotlight" ref={glowRef} />

      {/* Gear cursor */}
      <div className="admin-cursor-gear" ref={cursorGearRef}>
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd" clipRule="evenodd"
            d="M20.1 4.3a2 2 0 0 1 7.8 0l.9 3.3a14 14 0 0 1 3.4 2l3.3-.9a2 2 0 0 1 2.3 1.1l1.9 3.3a2 2 0 0 1-.5 2.6l-2.7 2a14 14 0 0 1 0 4l2.7 2a2 2 0 0 1 .5 2.6l-1.9 3.3a2 2 0 0 1-2.3 1.1l-3.3-.9a14 14 0 0 1-3.4 2l-.9 3.3a2 2 0 0 1-7.8 0l-.9-3.3a14 14 0 0 1-3.4-2l-3.3.9a2 2 0 0 1-2.3-1.1L8.3 27a2 2 0 0 1 .5-2.6l2.7-2a14 14 0 0 1 0-4l-2.7-2A2 2 0 0 1 8.3 14l1.9-3.3a2 2 0 0 1 2.3-1.1l3.3.9a14 14 0 0 1 3.4-2l.9-3.2zM24 16a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"
            fill="url(#gcl)"
          />
          <defs>
            <linearGradient id="gcl" x1="0" y1="0" x2="48" y2="48">
              <stop offset="0%" stopColor="#fde68a"/>
              <stop offset="50%" stopColor="#f59e0b"/>
              <stop offset="100%" stopColor="#b45309"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Ambient orbs */}
      <div className="admin-orb admin-orb-1" />
      <div className="admin-orb admin-orb-2" />
      <div className="admin-orb admin-orb-3" />

      {/* Decorative background gears */}
      <BgGear size={220} top="-60px" left="-60px"  opacity={0.06} speed={40} />
      <BgGear size={160} top="10%"  right="-40px"  opacity={0.07} speed={28} direction="ccw" />
      <BgGear size={300} bottom="-100px" right="5%" opacity={0.05} speed={55} />
      <BgGear size={100} bottom="20%" left="4%"     opacity={0.08} speed={20} direction="ccw" />
      <BgGear size={70}  top="45%"  left="12%"      opacity={0.09} speed={15} />
      <BgGear size={55}  top="20%"  left="38%"      opacity={0.07} speed={12} direction="ccw" />

      {/* Hint */}
      {!cardVisible && (
        <div className="admin-hint" style={{ top: '50%' }}>
          <span className="admin-hint-icon">⚙</span>
          <p>Move your cursor to access</p>
          <span className="admin-hint-icon">⚙</span>
        </div>
      )}

      {/* Login Card Wrapper */}
      <div style={{ flex: 1, display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        {/* Login Card */}
        <div
          className={`admin-card ${cardVisible ? 'admin-card--visible' : ''}`}
          ref={cardRef}
        >
          <div className="admin-card-glow-border" />

        {/* Header */}
        <div className="admin-card-header">
          <div className="admin-logo-ring">
            <GearIcon size={34} className="admin-logo-gear" />
          </div>
          <h1 className="admin-card-title">Admin Control</h1>
          <p className="admin-card-subtitle">Authorized personnel only</p>
          {/* Access badge */}
          <div className="admin-access-badge">
            <span className="admin-access-dot" />
            SYSTEM ACCESS
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleAdminLogin} className="admin-form">
          <div className="admin-field">
            <label htmlFor="admin-email" className="admin-label">Email Address</label>
            <div className="admin-input-wrapper">
              <span className="admin-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                id="admin-email"
                type="email"
                className="admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@birднest.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="admin-password" className="admin-label">Password</label>
            <div className="admin-input-wrapper">
              <span className="admin-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                className="admin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter secure password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin-toggle-pw"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            <div className="admin-forgot-row">
              <Link to="/forgot-password" className="admin-forgot-link">Forgot password?</Link>
            </div>
          </div>

          {message && (
            <div className={`admin-alert admin-alert--${alertType}`}>
              {alertType === 'success' ? '✓' : '✕'} {message}
            </div>
          )}

          <button type="submit" className="admin-btn" disabled={loading}>
            {loading ? (
              <span className="admin-btn-loading">
                <GearIcon size={18} className="admin-btn-gear-spin" />
                Authenticating...
              </span>
            ) : (
              <span className="admin-btn-content">
                <GearIcon size={18} className="admin-btn-gear" />
                Access System
              </span>
            )}
          </button>
        </form>

        <div className="admin-card-footer">
          <span>Not an admin? </span>
          <Link to="/StaffLogin" className="admin-footer-link">Staff Login</Link>
        </div>

        {/* Bottom security label */}
        <div className="admin-security-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Secured connection · Bird Nest {new Date().getFullYear()}
        </div>
      </div>
      </div>
    </div>
  );
}

export default AdminLogin;