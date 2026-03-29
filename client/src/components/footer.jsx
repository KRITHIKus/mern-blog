import { Link } from 'react-router-dom'
import { BsGithub, BsLinkedin, BsPersonFill } from 'react-icons/bs'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <>
      <style>{`
        .a2d-footer {
          border-top: 1px solid var(--border);
          background: var(--surface);
          position: relative;
        }
        .a2d-footer::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          opacity: 0.2;
        }
        .footer-inner {
          max-width: 1100px; margin: 0 auto;
          padding: 40px 28px 28px;
        }
        .footer-top {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 32px; flex-wrap: wrap;
          padding-bottom: 28px; border-bottom: 1px solid var(--border);
          margin-bottom: 20px;
        }
        .footer-brand {}
        .footer-logo {
          font-family: 'Orbitron', monospace; font-size: 13px; font-weight: 900;
          letter-spacing: 0.2em; color: var(--accent); text-decoration: none;
          display: inline-block; margin-bottom: 10px;
        }
        .footer-logo:hover { animation: logoGlitch 0.4s steps(2) forwards; }
        .footer-logo-bracket { color: var(--text-muted); font-size: 11px; }
        .footer-tagline {
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          color: var(--text-muted); letter-spacing: 0.06em; line-height: 1.7;
          max-width: 200px;
        }
        .footer-tagline span { color: var(--accent); opacity: 0.7; }

        .footer-cols {
          display: flex; gap: 48px; flex-wrap: wrap;
        }
        .footer-col {}
        .footer-col-title {
          font-family: 'JetBrains Mono', monospace; font-size: 9px;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--text-muted); margin-bottom: 14px;
          display: flex; align-items: center; gap: 6px;
        }
        .footer-col-title::before { content: '//'; color: var(--accent); opacity: 0.4; }
        .footer-col-links {
          display: flex; flex-direction: column; gap: 8px; list-style: none;
        }
        .footer-col-link {
          font-family: 'JetBrains Mono', monospace; font-size: 11px;
          color: var(--text-muted); text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.15s; display: flex; align-items: center; gap: 5px;
        }
        .footer-col-link::before { content: '→'; font-size: 9px; opacity: 0; transition: opacity 0.15s; }
        .footer-col-link:hover { color: var(--accent); }
        .footer-col-link:hover::before { opacity: 1; }

        .footer-bottom {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
        }
        .footer-copy {
          font-family: 'JetBrains Mono', monospace; font-size: 9px;
          color: var(--text-faint); letter-spacing: 0.08em;
        }
        .footer-copy span { color: var(--text-muted); }

        .footer-socials { display: flex; gap: 8px; }
        .footer-social-btn {
          display: flex; align-items: center; justify-content: center;
          width: 30px; height: 30px;
          background: var(--surface2); border: 1px solid var(--border);
          border-radius: 3px; color: var(--text-muted); text-decoration: none;
          transition: border-color 0.15s, color 0.15s, box-shadow 0.15s;
        }
        .footer-social-btn:hover {
          border-color: var(--accent); color: var(--accent);
          box-shadow: 0 0 8px var(--accent-dim);
        }

        .footer-stack {
          font-family: 'JetBrains Mono', monospace; font-size: 9px;
          color: var(--text-faint); letter-spacing: 0.06em;
          display: flex; align-items: center; gap: 6px;
        }
        .footer-stack-dot {
          width: 3px; height: 3px; border-radius: 50%;
          background: var(--border2);
        }

        @media (max-width: 600px) {
          .footer-top { flex-direction: column; }
          .footer-cols { gap: 28px; }
          .footer-bottom { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <footer className="a2d-footer">
        <div className="footer-inner">
          <div className="footer-top">

            {/* Brand */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <span className="footer-logo-bracket">[</span>A2D<span className="footer-logo-bracket">]</span>
              </Link>
              <p className="footer-tagline">
                <span>// </span>Engineering ideas,<br />written clearly.
              </p>
            </div>

            {/* Columns */}
            <div className="footer-cols">
              <div className="footer-col">
                <div className="footer-col-title">About</div>
                <ul className="footer-col-links">
                  <li>
                    <a
                      href="https://krithik01.onrender.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-col-link"
                    >
                      Portfolio
                    </a>
                  </li>
                  <li>
                    <Link to="/about" className="footer-col-link">A2D Blog</Link>
                  </li>
                </ul>
              </div>

              <div className="footer-col">
                <div className="footer-col-title">Connect</div>
                <ul className="footer-col-links">
                  <li>
                    <a
                      href="https://github.com/KRITHIKus"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-col-link"
                    >
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.linkedin.com/in/krithik-u-s-a545a4326/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-col-link"
                    >
                      LinkedIn
                    </a>
                  </li>
                </ul>
              </div>

              <div className="footer-col">
                <div className="footer-col-title">Legal</div>
                <ul className="footer-col-links">
                  <li><a href="#" className="footer-col-link">Privacy Policy</a></li>
                  <li><a href="#" className="footer-col-link">Terms & Conditions</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="footer-bottom">
            <span className="footer-copy">
              © {year} <span>Krithik</span> — All rights reserved
            </span>


            <div className="footer-socials">
              <a
                href="https://github.com/KRITHIKus"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="GitHub"
              >
                <BsGithub size={13} />
              </a>
              <a
                href="https://www.linkedin.com/in/krithik-u-s-a545a4326/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="LinkedIn"
              >
                <BsLinkedin size={13} />
              </a>
              <a
                href="https://krithik.onrender.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Portfolio"
              >
                <BsPersonFill size={13} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}