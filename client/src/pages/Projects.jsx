import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HiArrowRight, HiOutlineExternalLink } from 'react-icons/hi'
import { BsGithub } from 'react-icons/bs'
import { Container } from '../components/ui'
import Reveal from '../components/motion/Reveal'
import { PROJECTS } from '../constants/projects'
import { EXTERNAL_LINKS } from '../components/shell/navigation'

function ProjectLink({ link }) {
  if (link.to) {
    return (
      <Link to={link.to} className="case-study__link">
        {link.label} <HiArrowRight aria-hidden="true" />
      </Link>
    )
  }
  const isSource = link.label === 'Source'
  return (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className="case-study__link">
      {isSource && <BsGithub aria-hidden="true" />}
      {link.label}
      {!isSource && <HiOutlineExternalLink aria-hidden="true" />}
      <span className="ui-visually-hidden"> (opens in a new tab)</span>
    </a>
  )
}

export default function Projects() {
  const { hash } = useLocation()

  // Deep links from Home (/projects#id): the shell scrolls to top on route
  // change, so scroll to the requested case study after render.
  useEffect(() => {
    if (!hash) return undefined
    const id = requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' }))
    return () => cancelAnimationFrame(id)
  }, [hash])

  return (
    <div className="projects">
      <header className="page-header">
        <Container>
          <p className="page-kicker">Projects</p>
          <h1 className="page-title">Systems built alongside the writing</h1>
          <p className="page-lead">
            Engineering projects behind many of the articles on A2D — what each one does, how it
            was built, and where to see it.
          </p>
        </Container>
      </header>

      <Container className="projects__list">
        {PROJECTS.map((project, i) => (
          <Reveal as="article" key={project.id} id={project.id} className={i === 0 ? 'case-study case-study--lead' : 'case-study'}>
            <div className="case-study__head">
              <span className="case-study__index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <p className="case-study__area">{project.area}</p>
              <h2 className="case-study__name">{project.name}</h2>
            </div>

            <div className="case-study__body">
              <p className="case-study__summary">{project.summary}</p>
              <h3 className="case-study__label">How it was built</h3>
              <p className="case-study__built">{project.built}</p>
              <ul className="case-study__stack" aria-label="Technologies">
                {project.stack.map(tech => <li key={tech}>{tech}</li>)}
              </ul>
              <div className="case-study__links">
                {project.links.map(link => <ProjectLink key={link.label} link={link} />)}
              </div>
            </div>
          </Reveal>
        ))}
      </Container>

      <Container className="projects__more">
        <p>
          More experiments live on{' '}
          <a href={EXTERNAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="text-link text-link--inline">GitHub</a>
          {' '}— and the thinking behind them is in the{' '}
          <Link to="/search?category=projects" className="text-link text-link--inline">Projects &amp; Builds</Link> articles.
        </p>
      </Container>
    </div>
  )
}
