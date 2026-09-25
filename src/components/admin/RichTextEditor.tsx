import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function RichTextEditor({
  content, onChange, placeholder
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      // @tiptap/starter-kit v3 inclut déjà l'extension Link — la désactiver
      // ici pour éviter un conflit avec l'instance configurée séparément
      // ci-dessous (openOnClick: false).
      StarterKit.configure({ link: false }),
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: placeholder || 'Rédigez votre article ici...'
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    immediatelyRender: false,
  })

  if (!editor) return null

  return (
    <div className="border rounded-xl overflow-hidden"
      style={{ borderColor: '#DEDEDE' }}>

      {/* Barre d'outils */}
      <div className="flex flex-wrap gap-1 p-2 border-b"
        style={{ borderColor: '#DEDEDE', background: '#F9F9F9' }}>

        {/* Titres */}
        <button type="button"
          onClick={() => editor.chain().focus()
            .toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1 rounded text-sm font-bold
            ${editor.isActive('heading', { level: 1 })
              ? 'bg-green-700 text-white'
              : 'bg-white border hover:bg-gray-50'}`}>
          H1
        </button>
        <button type="button"
          onClick={() => editor.chain().focus()
            .toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 rounded text-sm font-bold
            ${editor.isActive('heading', { level: 2 })
              ? 'bg-green-700 text-white'
              : 'bg-white border hover:bg-gray-50'}`}>
          H2
        </button>
        <button type="button"
          onClick={() => editor.chain().focus()
            .toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1 rounded text-sm font-bold
            ${editor.isActive('heading', { level: 3 })
              ? 'bg-green-700 text-white'
              : 'bg-white border hover:bg-gray-50'}`}>
          H3
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Formatage */}
        <button type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded text-sm font-bold
            ${editor.isActive('bold')
              ? 'bg-green-700 text-white'
              : 'bg-white border hover:bg-gray-50'}`}>
          G
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded text-sm italic
            ${editor.isActive('italic')
              ? 'bg-green-700 text-white'
              : 'bg-white border hover:bg-gray-50'}`}>
          I
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Listes */}
        <button type="button"
          onClick={() => editor.chain().focus()
            .toggleBulletList().run()}
          className={`px-3 py-1 rounded text-sm
            ${editor.isActive('bulletList')
              ? 'bg-green-700 text-white'
              : 'bg-white border hover:bg-gray-50'}`}>
          • Liste
        </button>
        <button type="button"
          onClick={() => editor.chain().focus()
            .toggleOrderedList().run()}
          className={`px-3 py-1 rounded text-sm
            ${editor.isActive('orderedList')
              ? 'bg-green-700 text-white'
              : 'bg-white border hover:bg-gray-50'}`}>
          1. Liste
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Citation */}
        <button type="button"
          onClick={() => editor.chain().focus()
            .toggleBlockquote().run()}
          className={`px-3 py-1 rounded text-sm
            ${editor.isActive('blockquote')
              ? 'bg-green-700 text-white'
              : 'bg-white border hover:bg-gray-50'}`}>
          " Citation
        </button>

        {/* Lien */}
        <button type="button"
          onClick={() => {
            const url = window.prompt('URL du lien :')
            if (url) {
              editor.chain().focus()
                .setLink({ href: url }).run()
            }
          }}
          className="px-3 py-1 rounded text-sm bg-white border hover:bg-gray-50">
          🔗 Lien
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Annuler / Refaire */}
        <button type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="px-3 py-1 rounded text-sm bg-white border
            hover:bg-gray-50 disabled:opacity-40">
          ↩
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="px-3 py-1 rounded text-sm bg-white border
            hover:bg-gray-50 disabled:opacity-40">
          ↪
        </button>
      </div>

      {/* Zone de saisie */}
      <EditorContent
        editor={editor}
        className="prose max-w-none p-4 min-h-64 focus:outline-none"
        style={{ fontSize: '0.95rem', lineHeight: 1.7 }}
      />
    </div>
  )
}
