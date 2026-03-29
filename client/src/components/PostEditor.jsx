import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

const toolbarBtnStyle = (active) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  background: active ? 'var(--accent-dim)' : 'transparent',
  border: active ? '1px solid var(--accent)' : '1px solid transparent',
  borderRadius: 4,
  color: active ? 'var(--accent)' : 'var(--text-muted)',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s, border-color 0.15s',
  flexShrink: 0,
});

function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      style={toolbarBtnStyle(active)}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = 'var(--surface3)';
          e.currentTarget.style.color = 'var(--text)';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-muted)';
        }
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <span style={{
      width: 1,
      height: 18,
      background: 'var(--border2)',
      margin: '0 4px',
      flexShrink: 0,
    }} />
  );
}

export default function PostEditor({ content = '', onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: [
          'min-height: 340px',
          'padding: 20px 24px',
          'outline: none',
          'font-family: Inter, sans-serif',
          'font-size: 14px',
          'line-height: 1.75',
          'color: var(--text)',
        ].join(';'),
      },
    },
  });

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  if (!editor) return null;

  const btn = (action, active, title, label) => (
    <ToolbarButton onClick={action} active={active} title={title}>
      {label}
    </ToolbarButton>
  );

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 6,
      background: 'var(--surface)',
      overflow: 'hidden',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '8px 12px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface2)',
        flexWrap: 'wrap',
      }}>
        {btn(
          () => editor.chain().focus().toggleBold().run(),
          editor.isActive('bold'),
          'Bold',
          <strong>B</strong>
        )}
        {btn(
          () => editor.chain().focus().toggleItalic().run(),
          editor.isActive('italic'),
          'Italic',
          <em>I</em>
        )}

        <Divider />

        {btn(
          () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          editor.isActive('heading', { level: 1 }),
          'Heading 1',
          'H1'
        )}
        {btn(
          () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          editor.isActive('heading', { level: 2 }),
          'Heading 2',
          'H2'
        )}
        {btn(
          () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          editor.isActive('heading', { level: 3 }),
          'Heading 3',
          'H3'
        )}

        <Divider />

        {btn(
          () => editor.chain().focus().toggleBulletList().run(),
          editor.isActive('bulletList'),
          'Bullet List',
          '• —'
        )}
        {btn(
          () => editor.chain().focus().toggleOrderedList().run(),
          editor.isActive('orderedList'),
          'Numbered List',
          '1.'
        )}

        <Divider />

        {btn(
          () => editor.chain().focus().toggleCodeBlock().run(),
          editor.isActive('codeBlock'),
          'Code Block',
          '</>'
        )}
      </div>

      {/* Editor area */}
      <style>{`
        .tiptap-editor h1 { font-family: Orbitron, monospace; font-size: 22px; font-weight: 700; color: var(--text); margin: 20px 0 10px; }
        .tiptap-editor h2 { font-family: Orbitron, monospace; font-size: 18px; font-weight: 700; color: var(--text); margin: 18px 0 8px; }
        .tiptap-editor h3 { font-family: Orbitron, monospace; font-size: 15px; font-weight: 700; color: var(--text); margin: 16px 0 6px; }
        .tiptap-editor p { margin: 0 0 10px; }
        .tiptap-editor ul { padding-left: 20px; margin: 0 0 10px; list-style: disc; }
        .tiptap-editor ol { padding-left: 20px; margin: 0 0 10px; list-style: decimal; }
        .tiptap-editor li { margin-bottom: 4px; }
        .tiptap-editor pre { background: var(--surface2); border: 1px solid var(--border); border-radius: 4px; padding: 12px 16px; font-family: JetBrains Mono, monospace; font-size: 12px; color: var(--accent); overflow-x: auto; margin: 0 0 10px; }
        .tiptap-editor code { font-family: JetBrains Mono, monospace; font-size: 12px; background: var(--surface2); padding: 1px 5px; border-radius: 3px; color: var(--accent); }
        .tiptap-editor p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: var(--text-faint); pointer-events: none; float: left; height: 0; font-family: Inter, sans-serif; }
      `}</style>

      <div className="tiptap-editor">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}