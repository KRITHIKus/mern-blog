import { useEffect, useRef, useState } from 'react'
import { useEditor, useEditorState, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { Placeholder } from '@tiptap/extensions'
import {
  LuBold, LuItalic, LuStrikethrough, LuCode, LuHighlighter, LuList, LuListOrdered, LuQuote,
  LuSquareCode, LuMinus, LuLink, LuImage, LuUndo2, LuRedo2, LuMoreHorizontal,
} from 'react-icons/lu'
import { Alert, Button, Field, Input, Menu, MenuItem, MenuSeparator, Modal, Spinner } from './ui'

const MAX_IMAGE = 5 * 1024 * 1024

function ToolButton({ label, active = false, disabled = false, onClick, children }) {
  return (
    <button
      type="button"
      className={active ? 'tool is-active' : 'tool'}
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={e => e.preventDefault()} // keep the editor selection
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function LinkDialog({ open, initial, onApply, onRemove, onClose }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState(null)
  useEffect(() => { if (open) { setUrl(initial || 'https://'); setError(null) } }, [open, initial])
  const apply = event => {
    event.preventDefault()
    const value = url.trim()
    if (!value || value === 'https://') return setError('Enter a web address.')
    try { new URL(value.startsWith('/') ? `${window.location.origin}${value}` : value) } catch { return setError('That doesn’t look like a valid link.') }
    onApply(value)
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit link' : 'Add link'}
      size="sm"
      footer={
        <>
          {initial && <Button variant="ghost" onClick={onRemove}>Remove link</Button>}
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="link-form">Apply</Button>
        </>
      }
    >
      <form id="link-form" onSubmit={apply}>
        <Field label="Web address" error={error}>
          <Input type="url" inputMode="url" value={url} onChange={e => { setUrl(e.target.value); setError(null) }} autoFocus />
        </Field>
      </form>
    </Modal>
  )
}

function ImageDialog({ open, onInsert, onClose, uploadImage }) {
  const fileRef = useRef(null)
  const [state, setState] = useState({ status: 'idle' }) // idle | uploading | ready | error
  const [alt, setAlt] = useState('')
  useEffect(() => { if (open) { setState({ status: 'idle' }); setAlt('') } }, [open])

  const choose = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return setState({ status: 'error', error: 'Choose an image file (JPG, PNG, WebP, GIF).' })
    if (file.size > MAX_IMAGE) return setState({ status: 'error', error: 'Images must be smaller than 5 MB.' })
    setState({ status: 'uploading', preview: URL.createObjectURL(file) })
    try {
      const { url } = await uploadImage(file)
      setState({ status: 'ready', url, preview: url })
    } catch (error) {
      setState({ status: 'error', error: error.message || 'Upload failed. Please try again.' })
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => state.status !== 'uploading' && onClose()}
      dismissible={state.status !== 'uploading'}
      title="Insert image"
      description="Images are uploaded to the publication’s media storage."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={state.status === 'uploading'}>Cancel</Button>
          <Button disabled={state.status !== 'ready'} onClick={() => onInsert({ src: state.url, alt: alt.trim() })}>Insert image</Button>
        </>
      }
    >
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={choose} />
      <div className="image-picker">
        {state.preview ? (
          <div className="image-picker__preview">
            <img src={state.preview} alt="" />
            {state.status === 'uploading' && <span className="image-picker__busy"><Spinner label="Uploading image" /> Uploading…</span>}
          </div>
        ) : (
          <button type="button" className="image-picker__drop" onClick={() => fileRef.current?.click()}>
            <LuImage aria-hidden="true" />
            <span><strong>Choose an image</strong><br />JPG, PNG, WebP or GIF · up to 5 MB</span>
          </button>
        )}
        {state.status === 'error' && <Alert variant="danger">{state.error}</Alert>}
        {(state.status === 'ready' || state.status === 'error') && (
          <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>Choose a different image</Button>
        )}
      </div>
      <Field label="Alt text" hint="Describe the image for readers using screen readers.">
        <Input value={alt} onChange={e => setAlt(e.target.value)} placeholder="e.g. Request flow between client, API and database" />
      </Field>
    </Modal>
  )
}

/**
 * Article editor (Tiptap). Output stays HTML, as before — the API contract is
 * unchanged. The writing canvas uses the same `.prose` typography readers see.
 */
export default function PostEditor({ content = '', onChange, uploadImage, invalid = false }) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [imageOpen, setImageOpen] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] }, // h1 kept so older articles round-trip unchanged
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      Image.configure({ inline: false }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Placeholder.configure({ placeholder: 'Start writing… Use the toolbar or Markdown shortcuts like ## for a heading.' }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? '' : editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose--editor',
        'aria-label': 'Article body',
        'aria-multiline': 'true',
        role: 'textbox',
      },
    },
  })

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content && !editor.isFocused) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  const ui = useEditorState({
    editor,
    selector: ({ editor: e }) => (e ? {
      block: e.isActive('heading', { level: 2 }) ? 'h2' : e.isActive('heading', { level: 3 }) ? 'h3'
        : e.isActive('heading', { level: 4 }) ? 'h4' : e.isActive('heading', { level: 1 }) ? 'h1' : 'p',
      bold: e.isActive('bold'), italic: e.isActive('italic'), strike: e.isActive('strike'), code: e.isActive('code'),
      highlight: e.isActive('highlight'), bulletList: e.isActive('bulletList'), orderedList: e.isActive('orderedList'),
      blockquote: e.isActive('blockquote'), codeBlock: e.isActive('codeBlock'), link: e.isActive('link'),
      canUndo: e.can().undo(), canRedo: e.can().redo(),
    } : null),
  })

  if (!editor || !ui) return <div className="editor editor--loading"><Spinner label="Loading editor" /></div>

  const chain = () => editor.chain().focus()
  const setBlock = value => {
    if (value === 'p') chain().setParagraph().run()
    else chain().toggleHeading({ level: Number(value.slice(1)) }).run()
  }

  return (
    <div className={invalid ? 'editor is-invalid' : 'editor'}>
      <div className="editor__toolbar" role="toolbar" aria-label="Formatting">
        <label className="ui-visually-hidden" htmlFor="block-style">Text style</label>
        <select id="block-style" className="tool-select" value={ui.block} onChange={e => setBlock(e.target.value)}>
          <option value="p">Paragraph</option>
          <option value="h2">Heading</option>
          <option value="h3">Subheading</option>
          <option value="h4">Minor heading</option>
          {ui.block === 'h1' && <option value="h1">Title heading (legacy)</option>}
        </select>

        <span className="tool-sep" aria-hidden="true" />
        <ToolButton label="Bold" active={ui.bold} onClick={() => chain().toggleBold().run()}><LuBold /></ToolButton>
        <ToolButton label="Italic" active={ui.italic} onClick={() => chain().toggleItalic().run()}><LuItalic /></ToolButton>
        <ToolButton label="Strikethrough" active={ui.strike} onClick={() => chain().toggleStrike().run()}><LuStrikethrough /></ToolButton>
        <ToolButton label="Inline code" active={ui.code} onClick={() => chain().toggleCode().run()}><LuCode /></ToolButton>
        <ToolButton label="Highlight" active={ui.highlight} onClick={() => chain().toggleHighlight({ color: 'rgba(255, 115, 82, 0.28)' }).run()}><LuHighlighter /></ToolButton>

        <span className="tool-sep" aria-hidden="true" />
        <ToolButton label="Bulleted list" active={ui.bulletList} onClick={() => chain().toggleBulletList().run()}><LuList /></ToolButton>
        <ToolButton label="Numbered list" active={ui.orderedList} onClick={() => chain().toggleOrderedList().run()}><LuListOrdered /></ToolButton>
        <ToolButton label="Quote / callout" active={ui.blockquote} onClick={() => chain().toggleBlockquote().run()}><LuQuote /></ToolButton>
        <ToolButton label="Code block" active={ui.codeBlock} onClick={() => chain().toggleCodeBlock().run()}><LuSquareCode /></ToolButton>
        <ToolButton label="Section break" onClick={() => chain().setHorizontalRule().run()}><LuMinus /></ToolButton>

        <span className="tool-sep" aria-hidden="true" />
        <ToolButton label={ui.link ? 'Edit link' : 'Add link'} active={ui.link} onClick={() => setLinkOpen(true)}><LuLink /></ToolButton>
        <ToolButton label="Insert image" onClick={() => setImageOpen(true)} disabled={!uploadImage}><LuImage /></ToolButton>

        <span className="tool-sep" aria-hidden="true" />
        <ToolButton label="Undo" disabled={!ui.canUndo} onClick={() => chain().undo().run()}><LuUndo2 /></ToolButton>
        <ToolButton label="Redo" disabled={!ui.canRedo} onClick={() => chain().redo().run()}><LuRedo2 /></ToolButton>

        <Menu
          label="More formatting"
          align="end"
          className="tool-more"
          trigger={<button type="button" className="tool" aria-label="More formatting" title="More formatting"><LuMoreHorizontal /></button>}
        >
          <MenuItem onSelect={() => chain().setColor('var(--color-accent)').run()}>Text colour: brand</MenuItem>
          <MenuItem onSelect={() => chain().setColor('var(--color-accent-2)').run()}>Text colour: accent</MenuItem>
          <MenuItem onSelect={() => chain().unsetColor().run()}>Remove text colour</MenuItem>
          <MenuSeparator />
          <MenuItem onSelect={() => chain().unsetHighlight().run()}>Remove highlight</MenuItem>
          <MenuItem onSelect={() => chain().unsetAllMarks().clearNodes().run()}>Clear formatting</MenuItem>
        </Menu>
      </div>

      <EditorContent editor={editor} className="editor__canvas" />

      <LinkDialog
        open={linkOpen}
        initial={editor.getAttributes('link').href}
        onClose={() => setLinkOpen(false)}
        onRemove={() => { chain().extendMarkRange('link').unsetLink().run(); setLinkOpen(false) }}
        onApply={href => { chain().extendMarkRange('link').setLink({ href }).run(); setLinkOpen(false) }}
      />
      <ImageDialog
        open={imageOpen}
        uploadImage={uploadImage}
        onClose={() => setImageOpen(false)}
        onInsert={attrs => { chain().setImage(attrs).run(); setImageOpen(false) }}
      />
    </div>
  )
}
