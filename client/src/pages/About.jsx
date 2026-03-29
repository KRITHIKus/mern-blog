import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useStats } from '../utility/stats'

// ── TYPING HOOK ───────────────────────────────────────────────
function useTyping(words, typeSpeed = 100, deleteSpeed = 60, pause = 1400) {
  const [displayed, setDisplayed] = useState('')
  const [wordIdx,   setWordIdx]   = useState(0)
  const [deleting,  setDeleting]  = useState(false)
  const [charIdx,   setCharIdx]   = useState(0)

  useEffect(() => {
    const word = words[wordIdx]
    let timeout

    if (!deleting && charIdx <= word.length) {
      timeout = setTimeout(() => {
        setDisplayed(word.slice(0, charIdx))
        setCharIdx(c => c + 1)
      }, typeSpeed)
    } else if (!deleting && charIdx > word.length) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && charIdx >= 0) {
      timeout = setTimeout(() => {
        setDisplayed(word.slice(0, charIdx))
        setCharIdx(c => c - 1)
      }, deleteSpeed)
    } else {
      setDeleting(false)
      setWordIdx(i => (i + 1) % words.length)
    }
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, wordIdx, words, typeSpeed, deleteSpeed, pause])

  return displayed
}

const TYPING_WORDS = ['U S', '— Developer', '— Blogger', '— Builder', '— Engineer']

export default function About() {
  const typed      = useTyping(TYPING_WORDS)
  const [termLines, setTermLines] = useState(Array(6).fill(false))
  const startRef   = useRef(Date.now())
  const [uptime,   setUptime]    = useState('00:00:00')
const{stats}=useStats()

   const cPosts=stats.posts
   const cUsers=stats.users
   const cComments=stats.comments
  
  // terminal stagger
  useEffect(() => {
    Array(6).fill(0).forEach((_, i) => {
      setTimeout(() => {
        setTermLines(prev => {
          const n = [...prev]; n[i] = true; return n
        })
      }, 300 + i * 400)
    })
  }, [])

  // live uptime
  useEffect(() => {
    const id = setInterval(() => {
      const s = Math.floor((Date.now() - startRef.current) / 1000)
      const f = n => String(n).padStart(2, '0')
      setUptime(`${f(Math.floor(s/3600))}:${f(Math.floor((s%3600)/60))}:${f(s%60)}`)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const stack = [
    { label: 'React',    featured: true  },
    { label: 'Node.js',  featured: true  },
    { label: 'MongoDB',  featured: true  },
    { label: 'Express',  featured: false },
    { label: 'Firebase', featured: false },
    { label: 'Redux',    featured: false },
    { label: 'Vite',     featured: false },
    { label: 'Tailwind', featured: false },
  ]

  const terminalData = [
    { prompt: '$',  text: 'profile.load()',      cls: ''    },
    { prompt: '→',  text: 'name: Krithik U S',   cls: 'ok'  },
    { prompt: '→',  text: 'role: Full-Stack Dev', cls: 'ok'  },
    { prompt: '→',  text: `posts: ${cPosts} published`,  cls: 'warn'},
    { prompt: '→',  text: 'exp:  1 years',       cls: ''    },
    { prompt: '_',  text: '',                      cls: 'cur' },
  ]

  const links = [
    {
      href:    'https://github.com/KRITHIKus',
      label:   'GitHub',
      sub:     'KRITHIKus',
      featured: false,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
        </svg>
      ),
    },
    {
      href:    'https://www.linkedin.com/in/krithik-u-s-a545a4326/',
      label:   'LinkedIn',
      sub:     'krithik-u-s',
      featured: false,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
          <rect x="2" y="9" width="4" height="12"/>
          <circle cx="4" cy="4" r="2"/>
        </svg>
      ),
    },
    {
      href:    'https://krithik01.onrender.com',
      label:   'Portfolio',
      sub:     'krithik01.onrender.com',
      featured: true,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
  ]

  return (
    <>
      <style>{`
        .about-page { min-height: 100vh; background: var(--bg); }

        /* ── HERO ── */
        .about-hero {
          position: relative; overflow: hidden;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 56px 28px 48px;
        }
        .about-grid-bg {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(var(--accent-dim) 1px, transparent 1px),
            linear-gradient(90deg, var(--accent-dim) 1px, transparent 1px);
          background-size: 32px 32px; opacity: 0.45;
          animation: gridPulse 10s ease-in-out infinite;
        }
        @keyframes gridPulse { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
        .about-glow {
          position: absolute; top: -80px; right: -80px;
          width: 400px; height: 400px; pointer-events: none;
          background: radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 65%);
        }
        .about-hero-grid {
          position: relative; z-index: 1;
          display: grid; grid-template-columns: 1.4fr 1fr;
          gap: 40px; max-width: 1100px; align-items: center;
        }
        @media(max-width:768px){
          .about-hero-grid { grid-template-columns: 1fr; }
          .about-term-wrap  { display: none; }
        }

        /* sys tag */
        .about-sys-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--text-muted); margin-bottom: 20px;
          display: flex; align-items: center; gap: 6px;
        }
        .about-sys-tag::before { content: '//'; color: var(--accent); opacity: 0.5; }

        /* name + typing */
        .about-name {
          font-family: 'Orbitron', monospace;
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 900; line-height: 1.1;
          color: var(--text); letter-spacing: -0.02em;
          margin-bottom: 14px;
        }
        .about-name-accent {
          color: var(--accent);
          text-shadow: 0 0 22px rgba(0,229,255,0.4);
        }
        .typing-cursor {
          display: inline-block; width: 3px; height: 0.85em;
          background: var(--accent); margin-left: 2px;
          animation: blink 1s step-end infinite; vertical-align: middle;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* role */
        .about-role {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px; color: var(--text-muted);
          margin-bottom: 22px; letter-spacing: 0.04em;
        }
        .about-role-hl { color: var(--accent); opacity: 0.8; }

        /* stack tags */
        .about-stack { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 24px; }
        .about-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
          background: var(--surface2); border: 1px solid var(--border);
          color: var(--text-muted); padding: 4px 10px; border-radius: 2px;
          transition: border-color 0.15s, color 0.15s; cursor: default;
        }
        .about-tag:hover { border-color: var(--accent); color: var(--accent); }
        .about-tag.hl {
          border-color: rgba(0,229,255,0.28); color: var(--accent);
          background: var(--accent-dim);
        }

        /* status */
        .about-status {
          display: flex; align-items: center; gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: var(--text-muted);
        }
        .about-status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--green); box-shadow: 0 0 6px var(--green);
          animation: lp 2s ease-in-out infinite;
        }
        @keyframes lp { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .about-status-ok { color: var(--green); }

        /* terminal */
        .about-term-wrap {}
        .about-term {
          border: 1px solid var(--border); border-radius: 3px;
          background: rgba(5,5,8,0.92); overflow: hidden;
          box-shadow: 0 0 24px rgba(0,229,255,0.04);
        }
        .about-term-header {
          background: var(--surface2); padding: 6px 12px;
          display: flex; align-items: center; gap: 6px;
          border-bottom: 1px solid var(--border);
        }
        .term-dot { width: 8px; height: 8px; border-radius: 50%; }
        .term-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px; color: var(--text-muted); margin-left: auto;
          letter-spacing: 0.1em;
        }
        .about-term-body { padding: 12px 14px; font-size: 10px; line-height: 2; }
        .about-tl {
          display: flex; align-items: center; gap: 8px;
          opacity: 0; transition: opacity 0.3s, transform 0.3s;
          transform: translateX(-4px);
          font-family: 'JetBrains Mono', monospace;
        }
        .about-tl.show { opacity: 1; transform: none; }
        .t-prompt { color: var(--accent); opacity: 0.4; }
        .t-out    { color: var(--text); }
        .t-ok     { color: var(--green); }
        .t-warn   { color: var(--yellow); }
        .t-cursor {
          display: inline-block; width: 6px; height: 11px;
          background: var(--accent); opacity: 0.8;
          animation: blink 1s step-end infinite; vertical-align: middle;
        }

        /* ── BODY LAYOUT ── */
        .about-body {
          display: grid; grid-template-columns: 2fr 1fr;
          max-width: 1100px;
          border-bottom: 1px solid var(--border);
        }
        @media(max-width:768px){
          .about-body { grid-template-columns: 1fr; }
          .about-sidebar-col { border-top: 1px solid var(--border); }
        }
        .about-main-col {
          padding: 40px 28px;
          border-right: 1px solid var(--border);
        }
        .about-sidebar-col { padding: 40px 24px; }

        /* section title */
        .about-sec-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--text-muted); margin-bottom: 16px;
          display: flex; align-items: center; gap: 6px;
        }
        .about-sec-title::before { content: '//'; color: var(--accent); opacity: 0.5; }

        /* paragraph */
        .about-para {
          font-family: 'Inter', sans-serif;
          font-size: 14px; color: var(--text);
          line-height: 1.85; margin-bottom: 1rem;
        }
        .about-para-hl { color: var(--accent); }

        /* stats */
        .about-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: var(--border);
          border: 1px solid var(--border); border-radius: 4px;
          overflow: hidden; margin-top: 28px;
        }
        .about-stat {
          background: var(--surface); padding: 16px 18px;
        }
        .about-stat-val {
          font-family: 'Orbitron', monospace;
          font-size: 22px; font-weight: 700; color: var(--accent);
          text-shadow: 0 0 10px rgba(0,229,255,0.3);
          display: block; line-height: 1; margin-bottom: 4px;
        }
        .about-stat-lbl {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: var(--text-muted);
          letter-spacing: 0.1em; text-transform: uppercase;
        }

        /* sidebar links */
        .about-link-item {
          display: flex; align-items: center; gap: 12px;
          padding: 13px 0; border-bottom: 1px solid var(--border);
          text-decoration: none; cursor: pointer;
          transition: background 0.15s;
        }
        .about-link-item:last-child { border-bottom: none; }
        .about-link-item:hover .about-link-arrow { transform: translateX(3px); }
        .about-link-icon {
          width: 34px; height: 34px; border-radius: 2px;
          background: var(--surface2); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; color: var(--text-muted);
          transition: border-color 0.15s, color 0.15s;
        }
        .about-link-item:hover .about-link-icon {
          border-color: var(--accent); color: var(--accent);
        }
        .about-link-item.featured .about-link-icon {
          border-color: rgba(0,229,255,0.28); color: var(--accent);
          background: var(--accent-dim);
        }
        .about-link-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: var(--text); font-weight: 500;
        }
        .about-link-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: var(--text-muted); margin-top: 2px;
        }
        .about-link-arrow {
          margin-left: auto; color: var(--accent); font-size: 11px;
          opacity: 0.6; transition: transform 0.2s;
        }

        /* uptime */
        .about-uptime {
          margin-top: 24px; padding: 12px 14px;
          background: var(--surface2); border: 1px solid var(--border);
          border-radius: 3px;
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          color: var(--text-muted); letter-spacing: 0.06em;
        }
        .about-uptime-val {
          font-family: 'Orbitron', monospace; font-size: 13px;
          font-weight: 700; color: var(--green);
          text-shadow: 0 0 8px rgba(57,255,138,0.3);
          display: block; margin-top: 4px;
        }
      `}</style>

      <div className="about-page">

        {/* ── HERO ── */}
        <div className="about-hero">
          <div className="about-grid-bg" />
          <div className="about-glow" />

          <div className="about-hero-grid">
            {/* left */}
            <div>
              <div className="about-sys-tag">engineer · blogger · builder</div>

              <div className="about-name">
                Krithik&nbsp;
                <span className="about-name-accent">
                  {typed}
                </span>
                <span className="typing-cursor" />
              </div>

              <div className="about-role">
                Full-Stack Developer &nbsp;·&nbsp;
                <span className="about-role-hl">MERN Stack</span>
              </div>

              <div className="about-stack">
                {stack.map(s => (
                  <span key={s.label} className={`about-tag ${s.featured ? 'hl' : ''}`}>
                    {s.label}
                  </span>
                ))}
              </div>

              <div className="about-status">
                <span className="about-status-dot" />
                <span className="about-status-ok">Available for opportunities</span>
                &nbsp;·&nbsp; Based in India
              </div>
            </div>

            {/* right — terminal */}
            <div className="about-term-wrap">
              <div className="about-term">
                <div className="about-term-header">
                  <div className="term-dot" style={{ background: '#ff5f57' }} />
                  <div className="term-dot" style={{ background: '#febc2e' }} />
                  <div className="term-dot" style={{ background: '#28c840' }} />
                  <div className="term-title">krithik.profile</div>
                </div>
                <div className="about-term-body">
                  {terminalData.map((line, i) => (
                    <div key={i} className={`about-tl ${termLines[i] ? 'show' : ''}`}>
                      <span className="t-prompt">{line.prompt}</span>
                      {line.cls === 'cur'
                        ? <span className="t-cursor" />
                        : <span className={`t-out ${line.cls === 'ok' ? 't-ok' : line.cls === 'warn' ? 't-warn' : ''}`}>
                            {line.text}
                          </span>
                      }
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="about-body">

          {/* main */}
          <div className="about-main-col">
            <div className="about-sec-title">about_the_blog</div>

          <p className="about-para">
  Welcome to <span className="about-para-hl">A2D Blog</span> — a space where I share
  practical insights from building and exploring technology. This blog is a
  personal project where I document my journey as a backend-focused developer
  and my continuous learning in software engineering.
</p>

<p className="about-para">
  You’ll find content around <span className="about-para-hl">Node.js</span>,{' '}
  <span className="about-para-hl">Express</span>,{' '}
  <span className="about-para-hl">MongoDB</span>, and{' '}
  <span className="about-para-hl">React</span>, along with system design concepts,
  real-world debugging experiences, and interesting technologies I come across
  while learning and building.
</p>

<p className="about-para">
  This isn’t limited to tutorials — it’s a collection of ideas, learnings, and
  practical approaches to solving problems, with a focus on writing better code
  and building reliable systems.
</p>

            <div className="about-stats">
              {[
                { val: `${cPosts}`,  lbl: 'Articles'  },
                { val: `${cUsers}`, lbl: 'Readers'   },
                { val: `${cComments}`, lbl: 'Comments'  },
              ].map(s => (
                <div key={s.lbl} className="about-stat">
                  <span className="about-stat-val">{s.val}</span>
                  <span className="about-stat-lbl">{s.lbl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* sidebar */}
          <div className="about-sidebar-col">
            <div className="about-sec-title">links</div>

            {links.map(l => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`about-link-item ${l.featured ? 'featured' : ''}`}
              >
                <div className="about-link-icon">{l.icon}</div>
                <div>
                  <div className="about-link-label">{l.label}</div>
                  <div className="about-link-sub">{l.sub}</div>
                </div>
                <span className="about-link-arrow">→</span>
              </a>
            ))}

            <div className="about-uptime">
              <span>Session uptime</span>
              <span className="about-uptime-val">{uptime}</span>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}