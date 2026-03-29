import { Link } from 'react-router-dom'
import CallToAction from '../components/CallToAction'
import { useEffect, useState, useRef } from 'react'
import PostCard from '../components/PostCard'
import { useSelector } from 'react-redux'
import * as THREE from 'three'
import { useStats } from '../utility/stats'
// ── COUNT-UP HOOK ─────────────────────────────────────────────
function useCountUp(target, duration = 1400, trigger = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!trigger || target === 0) return
    const startTime = Date.now()
    const tick = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1)
      const ease     = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(ease * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, trigger])
  return count
}

// ── THEME CONFIGS ─────────────────────────────────────────────
const DARK_CONFIG = {
  heroBg:      '#070709',
  maskBg:      'linear-gradient(90deg, rgba(7,7,9,0.94) 0%, rgba(7,7,9,0.72) 48%, rgba(7,7,9,0.18) 100%)',
  titleColor:  '#dddde8',
  accentColor: '#00e5ff',
  accentShadow:'0 0 28px rgba(0,229,255,0.42)',
  subColor:    '#52526e',
  cmdColor:    '#00e5ff',
  sysColor:    '#52526e',
  hlColor:     '#39ff8a',
  outlineBorder:'#2a2a3a',
  outlineColor: '#52526e',
  outlineHover: '#dddde8',
  statsBorder:  '#1f1f2e',
  statsBg:      'rgba(14,14,18,0.6)',
  statVal:      '#00e5ff',
  statValShadow:'0 0 12px rgba(0,229,255,0.35)',
  statLbl:      '#52526e',
  greenVal:     '#39ff8a',
  greenShadow:  '0 0 12px rgba(57,255,138,0.35)',
  // Three.js
  icoColor:    0x00ccee,
  icoOpacity:  0.25,
  innerOpacity:0.15,
  ringColor:   0x00ccee,
  ring1Opacity:0.15,
  ring2Opacity:0.08,
  ptColor:     0x00ccee,
  ptOpacity:   0.50,
  gridColor:   0x00ccee,
  gridOpacity: 0.025,
}

const LIGHT_CONFIG = {
  heroBg:      '#f4f4f8',
  maskBg:      'linear-gradient(90deg, rgba(244,244,248,0.96) 0%, rgba(244,244,248,0.78) 48%, rgba(244,244,248,0.10) 100%)',
  titleColor:  '#0f0f1a',
  accentColor: '#0099bb',
  accentShadow:'0 0 20px rgba(0,153,187,0.3)',
  subColor:    '#6b6b88',
  cmdColor:    '#0099bb',
  sysColor:    '#a0a0b8',
  hlColor:     '#00a854',
  outlineBorder:'#cacad8',
  outlineColor: '#6b6b88',
  outlineHover: '#0f0f1a',
  statsBorder:  '#e0e0ea',
  statsBg:      'rgba(255,255,255,0.8)',
  statVal:      '#0099bb',
  statValShadow:'none',
  statLbl:      '#a0a0b8',
  greenVal:     '#00a854',
  greenShadow:  'none',
  // Three.js — blueprint / CAD drawing aesthetic
  icoColor:    0x0a0a2a,
  icoOpacity:  0.55,
  innerOpacity:0.35,
  ringColor:   0x0099bb,
  ring1Opacity:0.28,
  ring2Opacity:0.14,
  ptColor:     0x0077aa,
  ptOpacity:   0.55,
  gridColor:   0x0099bb,
  gridOpacity: 0.045,
}

// ── THREE.JS BACKGROUND ───────────────────────────────────────
function ThreeBackground({ containerRef, theme }) {
  const canvasRef  = useRef(null)
  const sceneRef   = useRef(null)   // persists across theme changes
  const themeRef   = useRef(theme)

  // Keep themeRef current without re-mounting Three.js
  useEffect(() => {
    themeRef.current = theme
  }, [theme])

  useEffect(() => {
    const container = containerRef.current
    const canvas    = canvasRef.current
    if (!container || !canvas) return

    const W = container.clientWidth  || 800
    const H = container.clientHeight || 520

    // ── RENDERER ──
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
    camera.position.set(0, 0, 5)
    sceneRef.current = scene

    // ── BUILD SCENE OBJECTS ──
    // main ico
    const icoGeo = new THREE.IcosahedronGeometry(1.6, 1)
    const icoMat = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true })
    const ico    = new THREE.Mesh(icoGeo, icoMat)
    ico.position.set(2.2, 0, 0)
    scene.add(ico)

    // inner ico
    const innerGeo = new THREE.IcosahedronGeometry(1.0, 1)
    const innerMat = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true })
    const inner    = new THREE.Mesh(innerGeo, innerMat)
    inner.position.set(2.2, 0, 0)
    scene.add(inner)

    // ring 1
    const torusMat = new THREE.MeshBasicMaterial({ transparent: true })
    const torus    = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.012, 4, 80), torusMat)
    torus.position.set(2.2, 0, 0)
    torus.rotation.x = Math.PI / 2.5
    scene.add(torus)

    // ring 2
    const torus2Mat = new THREE.MeshBasicMaterial({ transparent: true })
    const torus2    = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.008, 4, 80), torus2Mat)
    torus2.position.set(2.2, 0, 0)
    torus2.rotation.x = Math.PI / 1.4
    torus2.rotation.z = Math.PI / 3
    scene.add(torus2)

    // particles
    const ptGeo = new THREE.BufferGeometry()
    const ptPos = new Float32Array(120 * 3)
    for (let i = 0; i < 120; i++) {
      ptPos[i * 3]     = (Math.random() - 0.5) * 12
      ptPos[i * 3 + 1] = (Math.random() - 0.5) * 8
      ptPos[i * 3 + 2] = (Math.random() - 0.5) * 6
    }
    ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPos, 3))
    const ptMat  = new THREE.PointsMaterial({ size: 0.035, transparent: true })
    const ptMesh = new THREE.Points(ptGeo, ptMat)
    scene.add(ptMesh)

    // grid
    const gridMat = new THREE.LineBasicMaterial({ transparent: true })
    const grid    = new THREE.GridHelper(20, 30)
    grid.material = gridMat
    grid.position.set(0, -2.4, 0)
    scene.add(grid)

    // ── APPLY THEME COLORS ──
    // called on init and whenever theme changes
    const applyTheme = (cfg) => {
      icoMat.color.setHex(cfg.icoColor)
      icoMat.opacity    = cfg.icoOpacity

      innerMat.color.setHex(cfg.icoColor)
      innerMat.opacity  = cfg.innerOpacity

      torusMat.color.setHex(cfg.ringColor)
      torusMat.opacity  = cfg.ring1Opacity

      torus2Mat.color.setHex(cfg.ringColor)
      torus2Mat.opacity = cfg.ring2Opacity

      ptMat.color.setHex(cfg.ptColor)
      ptMat.opacity     = cfg.ptOpacity

      gridMat.color.setHex(cfg.gridColor)
      gridMat.opacity   = cfg.gridOpacity
    }

    // init with current theme
    applyTheme(themeRef.current === 'dark' ? DARK_CONFIG : LIGHT_CONFIG)

    // ── MOUSE PARALLAX ──
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0
    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      targetX = ((e.clientX - rect.left)  / rect.width  - 0.5) *  0.6
      targetY = ((e.clientY - rect.top)   / rect.height - 0.5) * -0.4
    }
    const onMouseLeave = () => { targetX = 0; targetY = 0 }
    container.addEventListener('mousemove',  onMouseMove)
    container.addEventListener('mouseleave', onMouseLeave)

    // ── RESIZE ──
    const onResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // ── ANIMATE LOOP ──
    const clock = new THREE.Clock()
    let animId
    let lastTheme = themeRef.current

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t   = clock.getElapsedTime()
      const cfg = themeRef.current === 'dark' ? DARK_CONFIG : LIGHT_CONFIG

      // hot-swap colors when theme changes
      if (themeRef.current !== lastTheme) {
        applyTheme(cfg)
        lastTheme = themeRef.current
      }

      // smooth mouse lerp
      currentX += (targetX - currentX) * 0.04
      currentY += (targetY - currentY) * 0.04

      // rotations
      ico.rotation.x    =  t * 0.12 + currentY * 0.8
      ico.rotation.y    =  t * 0.18 + currentX * 0.8
      ico.rotation.z    =  t * 0.06
      inner.rotation.x  = -t * 0.20
      inner.rotation.y  = -t * 0.15 + currentX * 0.5
      inner.rotation.z  =  t * 0.08
      torus.rotation.y  =  t * 0.08
      torus.rotation.z  =  t * 0.04
      torus2.rotation.x =  t * 0.05
      torus2.rotation.y = -t * 0.07

      // gentle float
      const floatY      = Math.sin(t * 0.4) * 0.12
      ico.position.y    = floatY
      inner.position.y  = floatY
      torus.position.y  = floatY
      torus2.position.y = floatY

      // particles drift
      ptMesh.rotation.y = t * 0.02
      ptMesh.rotation.x = t * 0.008

      // camera parallax
      camera.position.x = currentX * 0.5
      camera.position.y = currentY * 0.5
      camera.lookAt(0, 0, 0)

      // pulse opacity — scaled to cfg base
      icoMat.opacity    = cfg.icoOpacity    + Math.sin(t * 0.8) * (cfg.icoOpacity    * 0.22)
      innerMat.opacity  = cfg.innerOpacity  + Math.sin(t * 1.1) * (cfg.innerOpacity  * 0.20)
      torusMat.opacity  = cfg.ring1Opacity  + Math.sin(t * 0.6) * (cfg.ring1Opacity  * 0.18)
      torus2Mat.opacity = cfg.ring2Opacity  + Math.sin(t * 0.9) * (cfg.ring2Opacity  * 0.15)

      renderer.render(scene, camera)
    }
    animate()

    // ── CLEANUP ──
    return () => {
      cancelAnimationFrame(animId)
      container.removeEventListener('mousemove',  onMouseMove)
      container.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      icoGeo.dispose();  icoMat.dispose()
      innerGeo.dispose(); innerMat.dispose()
      ptGeo.dispose();   ptMat.dispose()
    }
  }, []) // mount once — theme handled via ref + hot-swap

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}

// ── SMART GRID COLUMNS ────────────────────────────────────────
function getGridCols(count) {
  if (count <= 1) return '1fr'
  if (count === 2) return 'repeat(2, 1fr)'
  if (count === 4) return 'repeat(2, 1fr)'
  return 'repeat(3, 1fr)'
}

// ── HOME PAGE ─────────────────────────────────────────────────
export default function Home() {
  const { theme } = useSelector(state => state.theme)

  const [posts,         setPosts]         = useState([])
  const [loading,       setLoading]       = useState(true)
  const [statsVisible,  setStatsVisible]  = useState(false)
  const [sessionTime,   setSessionTime]   = useState('00:00:00')
  const {stats} = useStats();
  const heroRef  = useRef(null)
  const statsRef = useRef(null)
  const startRef = useRef(Date.now())

  const cPosts    = useCountUp(stats.posts,    1200, statsVisible)
  const cUsers    = useCountUp(stats.users,    1600, statsVisible)
  const cComments = useCountUp(stats.comments, 1800, statsVisible)

  // resolve config based on current theme
  const cfg = theme === 'dark' ? DARK_CONFIG : LIGHT_CONFIG

  // ── FETCH POSTS ──
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res  = await fetch('/api/post/getposts')
        const data = await res.json()
        setPosts(data.posts || [])
      
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
    console.log("homepage")
  }, [])


  // ── INTERSECTION OBSERVER ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  // ── LIVE SESSION CLOCK ──
  useEffect(() => {
    const id = setInterval(() => {
      const s   = Math.floor((Date.now() - startRef.current) / 1000)
      const fmt = n => String(n).padStart(2, '0')
      setSessionTime(
        `${fmt(Math.floor(s / 3600))}:${fmt(Math.floor((s % 3600) / 60))}:${fmt(s % 60)}`
      )
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <style>{`
        .home-wrap { position: relative; min-height: 100vh; }

        /* ── HERO ── */
        .home-hero {
          position: relative; overflow: hidden;
          min-height: 520px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center;
          transition: background 0.35s ease;
        }
        .hero-mask {
          position: absolute; inset: 0; z-index: 1;
          pointer-events: none;
          transition: background 0.35s ease;
        }
        .hero-content {
          position: relative; z-index: 2;
          padding: 72px 36px 64px;
          max-width: 660px;
        }

        /* sys line */
        .home-sys-line {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
          margin-bottom: 24px;
          transition: color 0.3s;
        }

        /* title */
        .home-hero-title {
          font-family: 'Orbitron', monospace;
          font-size: clamp(30px, 4.5vw, 52px);
          font-weight: 900; line-height: 1.08;
          letter-spacing: -0.02em;
          margin-bottom: 20px;
          transition: color 0.3s;
        }
        .hero-title-accent {
          display: block;
          transition: color 0.3s, text-shadow 0.3s;
        }

        /* sub */
        .home-hero-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; max-width: 440px;
          line-height: 1.9; margin-bottom: 32px;
          letter-spacing: 0.02em;
          transition: color 0.3s;
        }

        /* actions */
        .home-hero-actions {
          display: flex; align-items: center; gap: 12px;
          flex-wrap: wrap; margin-bottom: 48px;
        }
        .hero-btn-primary {
          font-family: 'Orbitron', monospace; font-size: 10px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 11px 26px; border: none; border-radius: 2px;
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          transition: box-shadow 0.15s, transform 0.1s, background 0.3s, color 0.3s;
        }
        .hero-btn-primary:hover { transform: translateY(-1px); }
        .hero-btn-outline {
          background: transparent;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; padding: 10px 22px; border-radius: 2px;
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center;
          transition: border-color 0.15s, color 0.15s;
        }

/* stats bar */
.home-stats-bar {
  display: inline-flex; flex-wrap: wrap;
  border-radius: 3px; overflow: hidden;
  transition: border-color 0.3s;
  width: 100%;          /* take full width on mobile */
  max-width: fit-content; /* shrink on desktop */
}
.home-stat {
  padding: 14px 26px;
  transition: background 0.3s, border-color 0.3s;
  flex: 1;              /* equal width distribution */
  min-width: 0;         /* prevent overflow */
}
.home-stat:last-child { border-right: none !important; }
.home-stat-val {
  font-family: 'Orbitron', monospace;
  font-size: 20px; font-weight: 700;
  line-height: 1; display: block; margin-bottom: 4px;
  transition: color 0.3s, text-shadow 0.3s;
  white-space: nowrap;
}
.home-stat-lbl {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase;
  transition: color 0.3s;
  white-space: nowrap;
}
.home-stat-session {
  font-size: 13px; padding-top: 3px; display: block;
  font-family: 'Orbitron', monospace; font-weight: 700;
  line-height: 1; margin-bottom: 4px;
  transition: color 0.3s, text-shadow 0.3s;
  white-space: nowrap;
}

@media (max-width: 560px) {
  .home-stats-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;  /* 2x2 grid on mobile */
    width: 100%;
    max-width: 100%;
  }
  .home-stat {
    padding: 12px 14px;
    border-right: 1px solid var(--border) !important;
  }
  .home-stat:nth-child(2n) {
    border-right: none !important;   /* remove right border on even items */
  }
  .home-stat:nth-child(3),
  .home-stat:nth-child(4) {
    border-top: 1px solid var(--border); /* add top border for second row */
  }
  .home-stat-val    { font-size: 16px; }
  .home-stat-session{ font-size: 11px; }
}

        /* ── BELOW HERO — theme aware ── */
        .home-section      { padding: 40px 28px; }
        .home-section-wide { padding: 40px 28px; max-width: 1200px; margin: 0 auto; }

        .home-posts-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 22px;
        }
        .home-posts-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--text-muted);
          display: flex; align-items: center; gap: 7px;
        }
        .home-posts-label::before { content: '//'; color: var(--accent); opacity: 0.5; }
        .home-view-all {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--text-muted); text-decoration: none;
          display: flex; align-items: center; gap: 4px;
          transition: color 0.15s;
        }
        .home-view-all:hover { color: var(--accent); }
        .home-view-all::after { content: '→'; transition: transform 0.15s; }
        .home-view-all:hover::after { transform: translateX(3px); }

        .home-posts-grid {
          gap: 1px; background: var(--border);
          border: 1px solid var(--border);
          border-radius: 4px; overflow: hidden; display: grid;
        }
        .home-posts-grid .post-card { border-radius: 0; border: none; }

        @media (max-width: 900px) {
          .home-posts-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .home-posts-grid { grid-template-columns: 1fr !important; }
          .home-hero-title  { font-size: 28px; }
          .home-stat        { padding: 11px 16px; }
          .home-stat-val    { font-size: 17px; }
          .home-section, .home-section-wide { padding: 28px 16px; }
          .hero-content     { padding: 52px 20px 48px; }
        }

        /* ── SKELETON ── */
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .skeleton {
          background: linear-gradient(
            90deg, var(--surface) 25%, var(--surface2) 50%, var(--surface) 75%
          );
          background-size: 400px 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 3px;
        }
        .skeleton-card {
          background: var(--surface); padding: 20px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .sk-img   { height: 185px; }
        .sk-line  { height: 10px; }
        .sk-short { width: 38%; }
        .sk-long  { width: 82%; }
        .sk-mid   { width: 58%; }

        .home-posts-footer {
          display: flex; justify-content: center; padding-top: 28px;
        }
        .home-view-all-btn {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--text-muted); text-decoration: none;
          background: var(--surface); border: 1px solid var(--border);
          padding: 10px 28px; border-radius: 2px;
          transition: border-color 0.15s, color 0.15s, box-shadow 0.15s;
        }
        .home-view-all-btn:hover {
          border-color: var(--accent); color: var(--accent);
          box-shadow: 0 0 10px var(--accent-dim);
        }

        .home-empty {
          padding: 52px 28px; text-align: center;
          border: 1px solid var(--border); border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: var(--text-muted); letter-spacing: 0.08em;
        }
        .home-empty-code {
          font-family: 'Orbitron', monospace; font-size: 13px;
          color: var(--accent); opacity: 0.5; margin-bottom: 10px;
        }
      `}</style>

      <div className="home-wrap">

        {/* ══ HERO — theme-aware ══ */}
        <section
          className="home-hero"
          ref={heroRef}
          style={{ background: cfg.heroBg }}
        >
          {/* Three.js — receives theme, hot-swaps colors via ref */}
          <ThreeBackground containerRef={heroRef} theme={theme} />

          {/* gradient mask — adapts per theme */}
          <div className="hero-mask" style={{ background: cfg.maskBg }} />

          <div className="hero-content">

            {/* sys status line */}
            <div className="home-sys-line" style={{ color: cfg.sysColor }}>
              <span
                className="live-dot"
                style={{ background: cfg.hlColor, boxShadow: `0 0 6px ${cfg.hlColor}` }}
              />
              <span>SYSTEM ONLINE</span>
              &nbsp;·&nbsp; SYS://A2D.BLOG &nbsp;·&nbsp;
              <span style={{ color: cfg.hlColor }}>{sessionTime}</span>
            </div>

            {/* title */}
            <h1
              className="home-hero-title"
              style={{ color: cfg.titleColor }}
            >
              Build things.<br />
              <span
                className="hero-title-accent glitch-text"
                data-text="Write clearly."
                style={{ color: cfg.accentColor, textShadow: cfg.accentShadow }}
              >
                Write clearly.
              </span>
            </h1>

            {/* subtitle */}
           <p className="home-hero-sub" style={{ color: cfg.subColor }}>
  <span style={{ color: cfg.cmdColor, opacity: 0.6 }}>$ </span>
  Articles and insights on technology<br />
  from real world systems to digital understanding.
</p>

            {/* CTA buttons */}
            <div className="home-hero-actions">
              <Link
                to="/search"
                className="hero-btn-primary"
                style={{
                  background: cfg.accentColor,
                  color: theme === 'dark' ? '#070709' : '#ffffff',
                  boxShadow: theme === 'dark'
                    ? '0 0 0 rgba(0,229,255,0)'
                    : '0 0 0 rgba(0,153,187,0)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = theme === 'dark'
                    ? '0 0 22px rgba(0,229,255,0.45)'
                    : '0 0 18px rgba(0,153,187,0.4)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 0 0 transparent'
                }}
              >
                ▶ Browse Posts
              </Link>
              <Link
                to="/about"
                className="hero-btn-outline"
                style={{
                  border: `1px solid ${cfg.outlineBorder}`,
                  color: cfg.outlineColor,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = cfg.outlineColor
                  e.currentTarget.style.color = cfg.outlineHover
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = cfg.outlineBorder
                  e.currentTarget.style.color = cfg.outlineColor
                }}
              >
                about.exe →
              </Link>
            </div>

            {/* stats bar */}
            <div
              className="home-stats-bar"
              ref={statsRef}
              style={{ border: `1px solid ${cfg.statsBorder}` }}
            >
              {[
                { val: String(cPosts).padStart(2, '0'),    lbl: 'Articles' },
                { val: String(cUsers).padStart(3, '0'),    lbl: 'Readers'  },
                { val: String(cComments).padStart(3, '0'), lbl: 'Comments' },
              ].map(({ val, lbl }) => (
                <div
                  key={lbl}
                  className="home-stat"
                  style={{ borderRight: `1px solid ${cfg.statsBorder}`, background: cfg.statsBg }}
                >
                  <span
                    className="home-stat-val"
                    style={{ color: cfg.statVal, textShadow: cfg.statValShadow }}
                  >
                    {val}
                  </span>
                  <span className="home-stat-lbl" style={{ color: cfg.statLbl }}>{lbl}</span>
                </div>
              ))}

              {/* session clock — green always */}
              <div
                className="home-stat"
                style={{ background: cfg.statsBg }}
              >
                <span
                  className="home-stat-session"
                  style={{ color: cfg.greenVal, textShadow: cfg.greenShadow }}
                >
                  {sessionTime}
                </span>
                <span className="home-stat-lbl" style={{ color: cfg.statLbl }}>Session</span>
              </div>
            </div>

          </div>
        </section>

        {/* ══ CALL TO ACTION ══ */}
        <div className="sec-divider">
          <div className="sec-divider-label">resources</div>
          <div className="sec-divider-right">
            <span className="live-badge">LIVE</span>
            krithik01.onrender.com
          </div>
        </div>
        <div className="home-section">
          <CallToAction />
        </div>

        {/* ══ RECENT POSTS ══ */}
        <div className="sec-divider">
          <div className="sec-divider-label">recent_posts</div>
          <div className="sec-divider-right">
            <span className="live-badge">LIVE</span>
            fetched on load
          </div>
        </div>

        <div className="home-section-wide">
          <div className="home-posts-header">
            <span className="home-posts-label">RECENT TRANSMISSIONS</span>
            <Link to="/search" className="home-view-all">VIEW ALL</Link>
          </div>

          {/* skeleton */}
          {loading && (
            <div className="home-posts-grid"
              style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton sk-img" />
                  <div className="skeleton sk-line sk-short" />
                  <div className="skeleton sk-line sk-long" />
                  <div className="skeleton sk-line sk-mid" />
                </div>
              ))}
            </div>
          )}

          {/* posts */}
          {!loading && posts.length > 0 && (
            <>
              <div
                className="home-posts-grid"
                style={{ gridTemplateColumns: getGridCols(posts.length) }}
              >
                {posts.map(post => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
              <div className="home-posts-footer">
                <Link to="/search" className="home-view-all-btn">
                  View all posts →
                </Link>
              </div>
            </>
          )}

          {/* empty */}
          {!loading && posts.length === 0 && (
            <div className="home-empty">
              <div className="home-empty-code">// 404</div>
              NO POSTS FOUND — CHECK BACK SOON
            </div>
          )}
        </div>

      </div>
    </>
  )
}