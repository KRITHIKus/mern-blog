import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HiOutlineDocumentText, HiOutlinePlus, HiOutlineSearch, HiOutlineTrash } from 'react-icons/hi'
import { toggleTheme } from '../../redux/theme/themeSlice'
import {
  Alert, Badge, Button, Card, Container, EmptyState, Field, Input, Modal,
  SectionHeader, Select, Skeleton, Spinner, Textarea,
} from '../../components/ui'

// Dev-only reference for the design foundation (route /__ui, not in production builds).

const COLOR_TOKENS = [
  'bg', 'bg-subtle', 'surface', 'surface-elevated', 'surface-hover', 'surface-sunken',
  'border', 'border-strong', 'text-primary', 'text-secondary', 'text-muted',
  'accent', 'accent-hover', 'accent-subtle', 'success', 'warning', 'danger', 'info', 'focus',
]

const TYPE_ROLES = [
  ['ui-text-hero', 'Hero — Build things, write clearly'],
  ['ui-text-page', 'Page heading'],
  ['ui-text-section', 'Section heading'],
  ['ui-text-card', 'Card heading'],
  ['ui-text-lead', 'Lead — introductory paragraph for an article or page.'],
  ['ui-text-body', 'Body — the default size for reading and interface text.'],
  ['ui-text-secondary', 'Secondary — supporting copy and descriptions.'],
  ['ui-text-meta', 'Meta — Oct 4, 2026 · 6 min read'],
  ['ui-text-eyebrow', 'Eyebrow · technical label'],
]

const block = { display: 'grid', gap: 'var(--space-4)' }
const row = { display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }

export default function UiPreview() {
  const dispatch = useDispatch()
  const { theme } = useSelector(state => state.theme)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('not-an-email')

  return (
    <Container style={{ paddingBlock: 'var(--space-12)', display: 'grid', gap: 'var(--space-16)' }}>
      <SectionHeader
        as="h1"
        eyebrow="Phase 1 foundation"
        title="UI primitives"
        description="Tokens, typography and shared components. Toggle the theme to check both palettes."
        action={
          <Button variant="secondary" onClick={() => dispatch(toggleTheme())}>
            Switch to {theme === 'dark' ? 'light' : 'dark'}
          </Button>
        }
      />

      <section style={block}>
        <SectionHeader title="Colour tokens" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-3)' }}>
          {COLOR_TOKENS.map(token => (
            <Card key={token} padding="sm" style={{ display: 'grid', gap: 'var(--space-2)' }}>
              <span style={{
                height: 40, borderRadius: 'var(--radius-sm)',
                background: `var(--color-${token})`, border: '1px solid var(--color-border)',
              }} />
              <span className="ui-text-meta ui-text-mono">--color-{token}</span>
            </Card>
          ))}
        </div>
      </section>

      <section style={block}>
        <SectionHeader title="Typography" />
        {TYPE_ROLES.map(([cls, text]) => (
          <div key={cls} style={{ display: 'grid', gap: 'var(--space-1)' }}>
            <span className="ui-text-meta ui-text-mono">.{cls}</span>
            <p className={cls}>{text}</p>
          </div>
        ))}
      </section>

      <section style={block}>
        <SectionHeader title="Buttons" />
        <div style={row}>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger"><HiOutlineTrash aria-hidden="true" /> Delete</Button>
          <Button disabled>Disabled</Button>
          <Button loading={loading} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1500) }}>
            {loading ? 'Saving…' : 'Click to load'}
          </Button>
        </div>
        <div style={row}>
          <Button size="sm">Small</Button>
          <Button>Medium</Button>
          <Button size="lg"><HiOutlinePlus aria-hidden="true" /> Large</Button>
          <Button variant="ghost" icon aria-label="Search"><HiOutlineSearch /></Button>
          <Button as="a" href="#buttons" variant="secondary">Link as button</Button>
        </div>
      </section>

      <section style={block}>
        <SectionHeader title="Form controls" />
        <div style={{ display: 'grid', gap: 'var(--space-5)', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <Field label="Title" hint="Shown on cards and search results." required>
            <Input placeholder="Post title" />
          </Field>
          <Field label="Email" error={email.includes('@') ? undefined : 'Enter a valid email address.'}>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </Field>
          <Field label="Category">
            <Select defaultValue="">
              <option value="">All categories</option>
              <option value="javascript">JavaScript</option>
            </Select>
          </Field>
          <Field label="Disabled">
            <Input value="Read only" disabled readOnly />
          </Field>
          <Field label="Comment" hint="Up to 200 characters.">
            <Textarea placeholder="Share your thoughts…" />
          </Field>
        </div>
      </section>

      <section style={block}>
        <SectionHeader title="Cards & badges" />
        <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <Card>
            <p className="ui-text-card">Static card</p>
            <p className="ui-text-secondary">Bordered surface with the default padding.</p>
          </Card>
          <Card interactive as="a" href="#cards" style={{ textDecoration: 'none', color: 'inherit', display: 'grid', gap: 'var(--space-2)' }}>
            <Badge variant="accent" mono style={{ justifySelf: 'start' }}>javascript</Badge>
            <p className="ui-text-card">Interactive card</p>
            <p className="ui-text-secondary">Hover or focus for elevation and the accent line.</p>
          </Card>
        </div>
        <div style={row}>
          <Badge>Neutral</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="accent" mono>system-design</Badge>
        </div>
      </section>

      <section style={block}>
        <SectionHeader title="Feedback" />
        <Alert title="Heads up">Info alerts are announced politely.</Alert>
        <Alert variant="success">Profile updated successfully.</Alert>
        <Alert variant="warning" title="Unsaved changes">Leave anyway?</Alert>
        <Alert variant="danger" action={<Button size="sm" variant="secondary">Retry</Button>}>
          Could not load comments.
        </Alert>
        <div style={row}>
          <Spinner size="sm" /> <Spinner /> <Spinner size="lg" />
        </div>
        <Card style={{ display: 'grid', gap: 'var(--space-3)' }} aria-busy="true">
          <Skeleton height={160} />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="85%" />
          <div style={row}><Skeleton variant="circle" width={32} height={32} /><Skeleton variant="text" width={120} /></div>
        </Card>
        <EmptyState
          icon={<HiOutlineDocumentText />}
          title="No posts match your search"
          description="Try a different keyword or clear the category filter."
          action={<Button variant="secondary">Clear filters</Button>}
        />
      </section>

      <section style={block}>
        <SectionHeader title="Modal" description="Escape, backdrop click and the close button dismiss it; focus is trapped and restored." />
        <div><Button variant="danger" onClick={() => setModalOpen(true)}>Delete post…</Button></div>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Delete this post?"
          description="This permanently removes the post. Comments are not deleted."
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="danger" onClick={() => setModalOpen(false)}>Delete</Button>
            </>
          }
        />
      </section>

      <section style={block}>
        <SectionHeader title="Containers" />
        {['reading', 'content'].map(size => (
          <div key={size} style={{ background: 'var(--color-accent-subtle)', paddingBlock: 'var(--space-2)' }}>
            <Container size={size} style={{ outline: '1px dashed var(--color-accent-border)' }}>
              <span className="ui-text-meta ui-text-mono">{size}</span>
            </Container>
          </div>
        ))}
      </section>
    </Container>
  )
}
