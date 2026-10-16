import { Link } from 'react-router-dom'
import { BsGithub, BsLinkedin } from 'react-icons/bs'
import { HiOutlineExternalLink } from 'react-icons/hi'
import Brand from './Brand'
import { EXTERNAL_LINKS, PRIMARY_NAV } from './navigation'

const CONNECT = [
  { href: EXTERNAL_LINKS.github, label: 'GitHub', icon: <BsGithub /> },
  { href: EXTERNAL_LINKS.linkedin, label: 'LinkedIn', icon: <BsLinkedin /> },
  { href: EXTERNAL_LINKS.portfolio, label: 'Portfolio', icon: <HiOutlineExternalLink /> },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="shell-footer">
      <div className="ui-container shell-footer__inner">
        <div className="shell-footer__about">
          <Brand />
          <p className="shell-footer__signoff">Engineering ideas, <em>written clearly.</em></p>
          <p className="shell-footer__tagline">
            Articles on software, systems and the technology behind them.
          </p>
        </div>

        <nav aria-label="Footer" className="shell-footer__group">
          <h2 className="ui-text-eyebrow shell-footer__heading">Explore</h2>
          <ul className="shell-footer__links">
            {PRIMARY_NAV.map(item => (
              <li key={item.to}><Link to={item.to} className="shell-footer__link">{item.label}</Link></li>
            ))}
          </ul>
        </nav>

        <div className="shell-footer__group">
          <h2 className="ui-text-eyebrow shell-footer__heading">Connect</h2>
          <ul className="shell-footer__links">
            {CONNECT.map(link => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="shell-footer__link">
                  <span className="shell-footer__icon" aria-hidden="true">{link.icon}</span>
                  {link.label}
                  <span className="ui-visually-hidden"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ui-container shell-footer__bottom">
        <p>© {year} Krithik. All rights reserved.</p>
      </div>
    </footer>
  )
}
