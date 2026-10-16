import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiArrowLeft, HiOutlinePhotograph, HiOutlineRefresh, HiOutlineX } from 'react-icons/hi'
import { Alert, Button, Field, Select, Spinner } from '../ui'
import PostEditor from '../PostEditor'
import { ConfirmDialog } from '../workspace/WorkspaceLayout'
import { CATEGORIES } from '../../constants/categories'
import { readingTime, stripHtml } from '../../utils/content'
import { friendlyError } from '../../utils/http'

const MAX_IMAGE = 5 * 1024 * 1024

// Mirrors the server's slug rule (post.controller create) for a preview only.
const previewSlug = title => title.split(' ').join('-').toLowerCase().replace(/[^a-zA-Z0-9-]/g, '')

async function uploadPostImage(file) {
  const body = new FormData()
  body.append('image', file)
  const res = await fetch('/api/post/upload-image', { method: 'POST', body })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(friendlyError(data.message, res.status) || 'Image upload failed')
  return data // { url, publicId }
}

function AutoTitle({ value, onChange, invalid, describedBy }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])
  return (
    <textarea
      ref={ref}
      id="post-title"
      className="compose__title"
      rows={1}
      placeholder="Article title"
      value={value}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onChange={e => onChange(e.target.value.replace(/\n/g, ' '))}
      onKeyDown={e => { if (e.key === 'Enter') e.preventDefault() }}
    />
  )
}

/**
 * Publishing workspace used by Create and Edit.
 * Fields match the API: title, content (HTML), category, image, imagePublicId.
 */
export default function PostForm({ mode, initial, onSubmit, existingSlug, updatedAt }) {
  const navigate = useNavigate()
  const [values, setValues] = useState(() => ({
    title: initial?.title || '',
    content: initial?.content || '',
    category: initial?.category || 'uncategorized',
    image: initial?.image || '',
    imagePublicId: initial?.imagePublicId || null,
  }))
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [cover, setCover] = useState({ status: 'idle' })
  const [discardOpen, setDiscardOpen] = useState(false)
  const coverInput = useRef(null)
  const saved = useRef(false)

  const initialSnapshot = useRef(JSON.stringify(values))
  const dirty = JSON.stringify(values) !== initialSnapshot.current

  // Warn before closing the tab with unsaved work.
  useEffect(() => {
    if (!dirty) return undefined
    const warn = event => { if (!saved.current) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const words = useMemo(() => {
    const text = stripHtml(values.content)
    return text ? text.split(' ').length : 0
  }, [values.content])

  const set = (field, value) => {
    setValues(v => ({ ...v, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }))
  }

  const chooseCover = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return setCover({ status: 'error', error: 'Choose an image file (JPG, PNG, WebP).' })
    if (file.size > MAX_IMAGE) return setCover({ status: 'error', error: 'Cover images must be smaller than 5 MB.' })
    setCover({ status: 'uploading', preview: URL.createObjectURL(file) })
    try {
      const { url, publicId } = await uploadPostImage(file)
      setValues(v => ({ ...v, image: url, imagePublicId: publicId }))
      setCover({ status: 'idle' })
    } catch (error) {
      setCover({ status: 'error', error: error.message })
    }
  }

  const submit = async event => {
    event?.preventDefault()
    setSubmitError(null)
    const next = {}
    if (!values.title.trim()) next.title = 'Give the article a title.'
    if (!stripHtml(values.content)) next.content = 'Write the article before publishing.'
    setErrors(next)
    if (Object.keys(next).length) {
      document.getElementById(next.title ? 'post-title' : 'post-body')?.scrollIntoView({ block: 'center' })
      return
    }
    if (cover.status === 'uploading') return setSubmitError('Wait for the cover image to finish uploading.')
    setSubmitting(true)
    try {
      const payload = {
        title: values.title.trim(),
        content: values.content,
        category: values.category,
        ...(values.image && { image: values.image }),
        ...(values.imagePublicId && { imagePublicId: values.imagePublicId }),
      }
      const post = await onSubmit(payload)
      saved.current = true
      navigate(`/dashboard/post/${post.slug}`)
    } catch (error) {
      setSubmitError(error.message)
      setSubmitting(false)
    }
  }

  const cancel = () => (dirty ? setDiscardOpen(true) : navigate('/dashboard?tab=posts'))
  const isEdit = mode === 'edit'
  const coverSrc = cover.preview || values.image

  return (
    <form className="compose" onSubmit={submit} noValidate>
      <div className="compose__bar">
        <div className="compose__bar-inner">
          <Link to="/dashboard?tab=posts" className="text-link compose__back"><HiArrowLeft aria-hidden="true" /> Posts</Link>
          <p className="compose__status" aria-live="polite">
            {isEdit ? 'Editing article' : 'New article'}
            {dirty ? <span className="compose__dirty">Unsaved changes</span>
              : isEdit && updatedAt ? <span className="compose__meta">Last updated {new Date(updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> : null}
          </p>
          <div className="compose__actions">
            <Button variant="ghost" onClick={cancel} disabled={submitting}>Cancel</Button>
            <Button type="submit" loading={submitting}>
              {submitting ? (isEdit ? 'Updating…' : 'Publishing…') : (isEdit ? 'Update article' : 'Publish')}
            </Button>
          </div>
        </div>
      </div>

      <div className="compose__grid">
        <div className="compose__main">
          {submitError && <Alert variant="danger" title={isEdit ? 'Couldn’t update the article' : 'Couldn’t publish the article'}>{submitError}</Alert>}

          <label htmlFor="post-title" className="ui-visually-hidden">Title</label>
          <AutoTitle value={values.title} onChange={v => set('title', v)} invalid={Boolean(errors.title)} describedBy={errors.title ? 'post-title-error' : undefined} />
          {errors.title && <p id="post-title-error" className="ui-field__error">{errors.title}</p>}

          <div id="post-body">
            <PostEditor
              content={values.content}
              onChange={html => set('content', html)}
              uploadImage={uploadPostImage}
              invalid={Boolean(errors.content)}
            />
          </div>
          {errors.content && <p className="ui-field__error">{errors.content}</p>}
        </div>

        <aside className="compose__side" aria-label="Publishing details">
          <section className="side-panel">
            <h2 className="side-panel__title">Publishing</h2>

            <Field label="Topic">
              <Select value={values.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </Field>

            <div className="cover-field">
              <p className="ui-label" id="cover-label">Cover image</p>
              <input ref={coverInput} type="file" accept="image/*" hidden onChange={chooseCover} aria-labelledby="cover-label" />
              {coverSrc ? (
                <div className="cover-field__preview">
                  <img src={coverSrc} alt="Cover preview" />
                  {cover.status === 'uploading' && <span className="cover-field__busy"><Spinner label="Uploading cover" /> Uploading…</span>}
                </div>
              ) : (
                <button type="button" className="cover-field__drop" onClick={() => coverInput.current?.click()}>
                  <HiOutlinePhotograph aria-hidden="true" />
                  <span><strong>Add a cover image</strong><br />JPG, PNG or WebP · up to 5 MB</span>
                </button>
              )}
              {coverSrc && cover.status !== 'uploading' && (
                <div className="cover-field__actions">
                  <Button variant="secondary" size="sm" onClick={() => coverInput.current?.click()}><HiOutlineRefresh aria-hidden="true" /> Replace</Button>
                  {!isEdit && (
                    <Button variant="ghost" size="sm" onClick={() => setValues(v => ({ ...v, image: '', imagePublicId: null }))}><HiOutlineX aria-hidden="true" /> Remove</Button>
                  )}
                </div>
              )}
              {!coverSrc && !isEdit && <p className="ui-field__hint">Without a cover, the default image is used.</p>}
              {cover.status === 'error' && <Alert variant="danger">{cover.error}</Alert>}
            </div>
          </section>

          <section className="side-panel side-panel--quiet">
            <h2 className="side-panel__title">Article</h2>
            <dl className="facts">
              <div><dt>Words</dt><dd>{words.toLocaleString()}</dd></div>
              <div><dt>Reading time</dt><dd>{words ? `${readingTime(values.content)} min` : '—'}</dd></div>
              <div className="facts__wide">
                <dt>Address</dt>
                <dd className="facts__mono">
                  /dashboard/post/{isEdit ? existingSlug : (previewSlug(values.title) || '…')}
                </dd>
              </div>
            </dl>
            <p className="ui-field__hint">
              {isEdit ? 'The address stays the same when you change the title, so shared links keep working.' : 'The address is created from the title when you publish.'}
            </p>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={discardOpen}
        title="Discard your changes?"
        description="Anything you haven’t published will be lost."
        confirmLabel="Discard changes"
        pendingLabel="Discarding…"
        onConfirm={async () => { saved.current = true; navigate('/dashboard?tab=posts') }}
        onClose={() => setDiscardOpen(false)}
      />
    </form>
  )
}
