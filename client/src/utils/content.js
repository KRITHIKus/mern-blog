// Helpers for post content, which the API stores as editor HTML.

const WORDS_PER_MINUTE = 200

export const stripHtml = (html = '') =>
  html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|h[1-6]|li|blockquote|pre)>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// Minutes to read, based on visible words rather than raw HTML length.
export const readingTime = html => {
  const text = stripHtml(html)
  const words = text ? text.split(' ').length : 0
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

// Short plain-text summary from the start of the article (the API has no
// excerpt field), cut on a word boundary.
export const excerpt = (html, maxLength = 160) => {
  // Prefer paragraph text so headings don't run into the summary.
  const paragraphs = [...(html || '').matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(m => stripHtml(m[1]))
    .filter(Boolean)
  const text = paragraphs.length ? paragraphs.join(' ') : stripHtml(html)
  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength)
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:\s—-]+$/, '') + '…'
}

export const formatDate = (value, { month = 'short' } = {}) =>
  value
    ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month, day: 'numeric' })
    : ''

// Cloudinary delivery URLs accept transformations after /upload/; ask for a
// width-appropriate, auto-format image. Other hosts are returned unchanged.
export const imageUrl = (url, width) => {
  if (!url || !width || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  if (/\/upload\/[^/]*(w_|f_auto)/.test(url)) return url
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`)
}

const slugify = text =>
  text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 64) || 'section'

/**
 * Prepares stored article HTML for reading: gives h2/h3 stable ids (for the
 * table of contents and anchor links), lazy-loads images and opens external
 * links safely. Returns the processed HTML and the heading outline.
 */
export const prepareArticle = html => {
  if (!html || typeof DOMParser === 'undefined') return { html: html || '', headings: [] }
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const used = new Set()
  const headings = []

  doc.body.querySelectorAll('h2, h3').forEach(el => {
    const text = el.textContent.trim()
    if (!text) return
    let id = slugify(text)
    for (let i = 2; used.has(id); i++) id = `${slugify(text)}-${i}`
    used.add(id)
    el.id = id
    headings.push({ id, text, level: el.tagName === 'H2' ? 2 : 3 })
  })

  doc.body.querySelectorAll('img').forEach(img => {
    img.setAttribute('loading', 'lazy')
    img.setAttribute('decoding', 'async')
    if (!img.hasAttribute('alt')) img.setAttribute('alt', '')
  })

  doc.body.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href')
    if (/^https?:\/\//i.test(href) && !href.startsWith(window.location.origin)) {
      a.setAttribute('target', '_blank')
      a.setAttribute('rel', 'noopener noreferrer')
    }
  })

  // Code blocks get a label bar with a copy button (handled in PostPage).
  doc.body.querySelectorAll('pre').forEach(pre => {
    const block = doc.createElement('div')
    block.className = 'code-block'
    const bar = doc.createElement('div')
    bar.className = 'code-block__bar'
    bar.innerHTML = '<span class="code-block__label">Code</span><button type="button" class="code-block__copy" data-copy-code>Copy</button>'
    pre.replaceWith(block)
    block.append(bar, pre)
  })

  // Wide tables scroll inside their own wrapper instead of the page.
  doc.body.querySelectorAll('table').forEach(table => {
    const wrap = doc.createElement('div')
    wrap.className = 'prose-table'
    table.replaceWith(wrap)
    wrap.appendChild(table)
  })

  return { html: doc.body.innerHTML, headings }
}
