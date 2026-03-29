import { Link } from 'react-router-dom'
import CallToAction from '../components/CallToAction'

const PROJECTS = [
  {
    number:  '01',
    status:  'live',
    name:    'Bullseye',
    nameHL:  'Scanner',
    desc:    'Full-stack URL security scanner that analyzes links using VirusTotal API and a custom crawler. Designed backend workflow to process scans, store results in MongoDB, capture screenshots via Cloudinary, and serve filtered scan history with real-time results.',
    stack:   [
      { label: 'React',       hl: true  },
      { label: 'Node.js',     hl: true  },
      { label: 'MongoDB',     hl: true  },
      { label: 'Cloudinary',  hl: false },
      { label: 'VirusTotal',  hl: false },
      { label: 'Crawler',     hl: false },
    ],
    links: [
      { label: 'Live Demo →', href: 'https://bullseye-n9jz.onrender.com/', primary: true },
      { label: 'GitHub',      href: 'https://github.com/KRITHIKus/safelink', primary: false },
    ],
  },

  {
    number:  '02',
    status:  'live',
    name:    'A2D Blog',
    nameHL:  'Blog',
    desc:    'Full-stack blogging platform with admin-controlled publishing, authentication, and interactive features like comments and likes. Built REST APIs with role-based access and optimized MongoDB queries for efficient content management.',
    stack:   [
      { label: 'React',    hl: true  },
      { label: 'Node.js',  hl: true  },
      { label: 'MongoDB',  hl: true  },
      { label: 'Express',  hl: false },
      { label: 'Firebase', hl: false },
      { label: 'Redux',    hl: false },
      { label: 'Vite',     hl: false },
    ],
    links: [
      { label: 'Live Demo →', href: '#', primary: true },
      { label: 'GitHub',      href: 'https://github.com/KRITHIKus/mern-blog', primary: false },
    ],
  },

  {
    number:  '03',
    status:  'live',
    name:    'AI Farming Web Service',
    nameHL:  'AI',
    desc:    'AI-powered web application that recommends crops using a trained Random Forest model based on soil and weather inputs. Integrated real-time weather APIs and visualized market price trends to support data-driven farming decisions.',
    stack:   [
      { label: 'React',        hl: true  },
      { label: 'Flask',        hl: true  },
      { label: 'TensorFlow',   hl: true  },
      { label: 'Chart.js',     hl: false },
      { label: 'OpenWeather',  hl: false },
      { label: 'Kaggle Data',  hl: false },
    ],
    links: [
      { label: 'Live Demo →', href: 'https://farmer-ai-x2hw.onrender.com/', primary: true },
      { label: 'GitHub',      href: 'https://github.com/KRITHIKus/project24', primary: false },
    ],
  },

  {
    number:  '04',
    status:  'live',
    name:    'Dev Portfolio',
    nameHL:  'Portfolio',
    desc:    'Responsive developer portfolio built with React, focused on performance, clean UI, and structured component design. Deployed on Render with optimized loading and smooth user experience.',
    stack:   [
      { label: 'React',  hl: true  },
      { label: 'CSS',    hl: false },
      { label: 'Render', hl: false },
    ],
    links: [
      { label: 'View Site →', href: 'https://krithik01.onrender.com', primary: true },
      { label: 'GitHub',      href: 'https://github.com/KRITHIKus', primary: false },
    ],
  },
];

export default function Projects() {
  return (
    <>
      <style>{`
        .projects-page {
          min-height: 100vh;
          background: var(--bg);
          padding: 52px 28px 60px;
        }
        @media(max-width:560px){ .projects-page { padding: 36px 16px 48px; } }

        /* ── HERO HEADER ── */
        .proj-hero-lbl {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--text-muted); margin-bottom: 10px;
          display: flex; align-items: center; gap: 6px;
        }
        .proj-hero-lbl::before { content: '//'; color: var(--accent); opacity: 0.5; }
        .proj-hero-title {
          font-family: 'Orbitron', monospace;
          font-size: clamp(24px, 3.5vw, 38px);
          font-weight: 900; color: var(--text);
          margin-bottom: 10px; letter-spacing: -0.01em; line-height: 1.1;
        }
        .proj-hero-title span {
          color: var(--accent);
          text-shadow: 0 0 20px rgba(0,229,255,0.35);
        }
        .proj-hero-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: var(--text-muted);
          margin-bottom: 40px; letter-spacing: 0.03em;
          max-width: 480px; line-height: 1.8;
        }
        .proj-hero-sub .cmd { color: var(--accent); opacity: 0.5; }

        /* ── GRID ── */
        .proj-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1px; background: var(--border);
          border: 1px solid var(--border); border-radius: 4px;
          overflow: hidden; max-width: 1000px;
        }
        @media(max-width:700px){
          .proj-grid { grid-template-columns: 1fr; }
        }

        /* ── CARD ── */
        .proj-card {
          background: var(--surface); padding: 28px;
          position: relative; overflow: hidden;
          display: flex; flex-direction: column;
          transition: background 0.15s;
        }
        .proj-card::after {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: var(--accent);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.25s ease;
        }
        .proj-card:hover { background: var(--surface2); }
        .proj-card:hover::after { transform: scaleX(1); }

        .proj-number {
          font-family: 'Orbitron', monospace; font-size: 11px;
          font-weight: 700; color: var(--accent); opacity: 0.25;
          margin-bottom: 14px; letter-spacing: 0.12em;
        }

        /* status badge */
        .proj-status {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: 'JetBrains Mono', monospace; font-size: 8px;
          letter-spacing: 0.12em; text-transform: uppercase;
          margin-bottom: 14px;
        }
        .proj-status.live { color: var(--green); }
        .proj-status.live::before {
          content: ''; width: 5px; height: 5px; border-radius: 50%;
          background: var(--green); box-shadow: 0 0 5px var(--green);
          animation: lp 2s ease-in-out infinite;
        }
        .proj-status.wip  { color: var(--yellow); }
        .proj-status.wip::before {
          content: ''; width: 5px; height: 5px; border-radius: 50%;
          background: var(--yellow);
        }
        @keyframes lp { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .proj-name {
          font-family: 'Orbitron', monospace;
          font-size: 22px; font-weight: 900; color: var(--text);
          line-height: 1.2; margin-bottom: 12px; letter-spacing: -0.01em;
        }
        .proj-name span { color: var(--accent); }

        .proj-desc {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: var(--text-muted);
          line-height: 1.8; margin-bottom: 20px; letter-spacing: 0.02em;
          flex: 1;
        }

        /* stack */
        .proj-stack { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 24px; }
        .proj-tech {
          font-family: 'JetBrains Mono', monospace; font-size: 8px;
          letter-spacing: 0.1em; text-transform: uppercase;
          background: var(--surface2); border: 1px solid var(--border);
          color: var(--text-muted); padding: 3px 8px; border-radius: 2px;
        }
        .proj-tech.hl {
          border-color: rgba(0,229,255,0.25); color: var(--accent);
          background: var(--accent-dim);
        }

        /* links */
        .proj-links { display: flex; gap: 10px; }
        .proj-link {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: 'Orbitron', monospace; font-size: 9px;
          font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          padding: 9px 18px; border-radius: 2px; text-decoration: none;
          transition: box-shadow 0.15s, transform 0.1s;
        }
        .proj-link.primary {
          background: var(--accent); color: var(--bg);
        }
        .proj-link.primary:hover {
          box-shadow: 0 0 18px var(--accent-glow); transform: translateY(-1px);
        }
        .proj-link.ghost {
          background: transparent;
          border: 1px solid var(--border2); color: var(--text-muted);
        }
        .proj-link.ghost:hover { border-color: var(--accent); color: var(--accent); }

        /* ── BOTTOM CTA ── */
        .proj-cta-wrap {
          max-width: 1000px; margin-top: 32px;
        }

        /* ── BOTTOM MORE CTA ── */
        .proj-more-cta {
          max-width: 1000px; margin-top: 16px;
          border: 1px solid var(--border); border-radius: 4px;
          background: var(--surface); padding: 22px 28px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 20px;
          flex-wrap: wrap; position: relative; overflow: hidden;
        }
        .proj-more-cta::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, var(--accent), transparent);
          opacity: 0.35;
        }
        .proj-more-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; color: var(--text-muted); line-height: 1.7;
        }
        .proj-more-text strong { color: var(--text); font-weight: 500; }
      `}</style>

      <div className="projects-page">

        {/* ── HEADER ── */}
        <div className="proj-hero-lbl">selected_work</div>
        <h1 className="proj-hero-title">
          Projects &<br /><span>Portfolio</span>
        </h1>
        <p className="proj-hero-sub">
          <span className="cmd">$ </span>
           Building scalable web applications with a focus on backend systems and APIs.
        </p>

        {/* ── CARDS ── */}
        <div className="proj-grid">
          {PROJECTS.map(p => (
            <div key={p.number} className="proj-card">
              <div className="proj-number">{p.number}</div>
              <div className={`proj-status ${p.status}`}>
                {p.status === 'live' ? 'LIVE' : 'IN PROGRESS'}
              </div>
              <div className="proj-name">
                {p.name.replace(p.nameHL, '')}
                <span>{p.nameHL}</span>
              </div>
              <p className="proj-desc">{p.desc}</p>
              <div className="proj-stack">
                {p.stack.map(t => (
                  <span key={t.label} className={`proj-tech ${t.hl ? 'hl' : ''}`}>
                    {t.label}
                  </span>
                ))}
              </div>
 {p.number !== '02' && (
  <div className="proj-links">
    {p.links.map(l => (
      <a
        key={l.label}
        href={l.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`proj-link ${l.primary ? 'primary' : 'ghost'}`}
      >
        {l.label}
      </a>
    ))}
  </div>
)}
            </div>
          ))}
        </div>

        {/* ── RESOURCE CTA ── */}
        <div className="proj-cta-wrap">
          <CallToAction />
        </div>

        {/* ── COLLABORATE CTA ── */}
        <div className="proj-more-cta">
          <div className="proj-more-text">
            <strong>Want to collaborate or hire?</strong><br />
            Reach out via LinkedIn or check the portfolio for more work.
          </div>
          <a
            href="https://www.linkedin.com/in/krithik-u-s-a545a4326/"
            target="_blank"
            rel="noopener noreferrer"
            className="proj-link primary"
            style={{ whiteSpace: 'nowrap' }}
          >
            Get In Touch →
          </a>
        </div>

      </div>
    </>
  )
}