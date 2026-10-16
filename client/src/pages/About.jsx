import { Link } from 'react-router-dom'
import { HiArrowRight, HiOutlineExternalLink } from 'react-icons/hi'
import { BsGithub, BsLinkedin } from 'react-icons/bs'
import { Button, Container } from '../components/ui'
import Reveal from '../components/motion/Reveal'
import { CATEGORIES } from '../constants/categories'
import { SITE } from '../constants/site'
import { EXTERNAL_LINKS } from '../components/shell/navigation'

const COVERAGE = [
  {
    title: 'Backend & APIs',
    body: 'Node.js, Express and MongoDB in practice — data modelling, authentication, and the trade-offs behind real APIs.',
    category: 'backend',
  },
  {
    title: 'System design',
    body: 'How the pieces fit together: architecture decisions, scaling concerns and the reasoning behind them.',
    category: 'system-design',
  },
  {
    title: 'The web & React',
    body: 'Front-end engineering with React and the modern JavaScript ecosystem, from components to state.',
    category: 'reactjs',
  },
  {
    title: 'Builds & debugging',
    body: 'Write-ups from shipping real projects — what broke, how it was fixed and what it taught.',
    category: 'projects',
  },
]

const PRINCIPLES = [
  ['Practical over theoretical', 'Insights come from building and exploring real technology.'],
  ['More than tutorials', 'A collection of ideas, learnings and approaches to solving problems.'],
  ['Built to last', 'A focus on writing better code and building reliable systems.'],
]

export default function About() {
  return (
    <div className="about">
      <header className="page-header page-header--about">
        <Container size="reading">
          <p className="page-kicker">About {SITE.name}</p>
          <h1 className="page-title page-title--xl">{SITE.tagline}</h1>
          <p className="page-lead">
            {SITE.name} is an independent technology publication about building software. It
            shares practical insights from building and exploring technology — not only
            tutorials, but ideas, lessons and approaches to solving real problems, with a focus
            on writing better code and building reliable systems.
          </p>
        </Container>
      </header>

      <Reveal as="section" className="about-section" aria-labelledby="coverage-heading">
        <Container>
          <h2 id="coverage-heading" className="ui-text-section about-section__title">What you’ll find here</h2>
          <div className="coverage-grid">
            {COVERAGE.map((item, i) => (
              <article key={item.title} className="coverage-card reveal-item" style={{ '--i': i }}>
                <h3 className="coverage-card__title">
                  <Link to={`/search?category=${item.category}`} className="pc__link">{item.title}</Link>
                </h3>
                <p className="coverage-card__body">{item.body}</p>
                <HiArrowRight className="pc__arrow" aria-hidden="true" />
              </article>
            ))}
          </div>
          <p className="about-section__note">
            Plus {CATEGORIES.length - COVERAGE.length} more topics, from DevOps and AI to tech history —{' '}
            <Link to="/search" className="text-link text-link--inline">browse the archive</Link>.
          </p>
        </Container>
      </Reveal>

      <Reveal as="section" className="about-section" aria-labelledby="approach-heading">
        <Container size="reading">
          <h2 id="approach-heading" className="ui-text-section about-section__title">How it’s written</h2>
          <dl className="principles">
            {PRINCIPLES.map(([term, desc]) => (
              <div key={term} className="principles__item">
                <dt>{term}</dt>
                <dd>{desc}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Reveal>

      <Reveal as="section" className="about-section about-section--last" aria-labelledby="publisher-heading">
        <Container size="reading">
          <div className="publisher">
            <span className="publisher__avatar" aria-hidden="true">{SITE.author[0]}</span>
            <div>
              <h2 id="publisher-heading" className="publisher__title">Published by {SITE.author}</h2>
              <p className="publisher__body">
                {SITE.name} is written and edited by {SITE.author}, a full-stack developer working
                mostly on the backend — Node.js, Express, MongoDB and React. Every article
                documents something learned while building.
              </p>
              <div className="publisher__links">
                <Button as="a" href={EXTERNAL_LINKS.github} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm">
                  <BsGithub aria-hidden="true" /> GitHub
                </Button>
                <Button as="a" href={EXTERNAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm">
                  <BsLinkedin aria-hidden="true" /> LinkedIn
                </Button>
                <Button as="a" href={EXTERNAL_LINKS.portfolio} target="_blank" rel="noopener noreferrer" variant="ghost" size="sm">
                  Portfolio <HiOutlineExternalLink aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Reveal>
    </div>
  )
}
