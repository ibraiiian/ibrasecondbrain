"use client";

// TipTap Rich Text Editor with Code Block and Syntax Highlighting
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Code,
    Undo,
    Redo,
} from "lucide-react";

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

interface EditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    editable?: boolean;
}

export default function Editor({
    content,
    onChange,
    placeholder = "Start typing...",
    editable = true,
}: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false, // Disable default, use CodeBlockLowlight
            }),
            CodeBlockLowlight.configure({
                lowlight,
                defaultLanguage: "javascript",
            }),
        ],
        content,
        editable,
        immediatelyRender: false, // Fix SSR hydration mismatch
        editorProps: {
            attributes: {
                class:
                    "prose prose-invert prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Update content when prop changes
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    const toggleBold = useCallback(() => {
        editor?.chain().focus().toggleBold().run();
    }, [editor]);

    const toggleItalic = useCallback(() => {
        editor?.chain().focus().toggleItalic().run();
    }, [editor]);

    const toggleBulletList = useCallback(() => {
        editor?.chain().focus().toggleBulletList().run();
    }, [editor]);

    const toggleOrderedList = useCallback(() => {
        editor?.chain().focus().toggleOrderedList().run();
    }, [editor]);

    const toggleCodeBlock = useCallback(() => {
        editor?.chain().focus().toggleCodeBlock().run();
    }, [editor]);

    if (!editor) {
        return (
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-4">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-white/5 rounded w-3/4"></div>
                    <div className="h-4 bg-white/5 rounded w-1/2"></div>
                    <div className="h-4 bg-white/5 rounded w-5/6"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
            {/* Toolbar */}
            {editable && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1 p-2 border-b border-white/10 bg-[#0f0f0f]/50"
                >
                    <ToolbarButton
                        onClick={toggleBold}
                        active={editor.isActive("bold")}
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={toggleItalic}
                        active={editor.isActive("italic")}
                        title="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </ToolbarButton>
                    <div className="w-px h-5 bg-white/10 mx-1" />
                    <ToolbarButton
                        onClick={toggleBulletList}
                        active={editor.isActive("bulletList")}
                        title="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={toggleOrderedList}
                        active={editor.isActive("orderedList")}
                        title="Ordered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </ToolbarButton>
                    <div className="w-px h-5 bg-white/10 mx-1" />
                    <ToolbarButton
                        onClick={toggleCodeBlock}
                        active={editor.isActive("codeBlock")}
                        title="Code Block"
                    >
                        <Code className="w-4 h-4" />
                    </ToolbarButton>
                    <div className="flex-1" />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Undo"
                    >
                        <Undo className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Redo"
                    >
                        <Redo className="w-4 h-4" />
                    </ToolbarButton>
                </motion.div>
            )}

            {/* Editor Content */}
            <EditorContent editor={editor} />

            {/* Placeholder styling */}
            <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: "${placeholder}";
          color: rgba(255, 255, 255, 0.3);
          pointer-events: none;
          float: left;
          height: 0;
        }
        .ProseMirror pre {
          background: #0a0a0a;
          border-radius: 0.5rem;
          padding: 1rem;
          font-family: var(--font-jetbrains), monospace;
          overflow-x: auto;
        }
        .ProseMirror code {
          background: #0a0a0a;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-family: var(--font-jetbrains), monospace;
          font-size: 0.9em;
        }
        .ProseMirror pre code {
          background: transparent;
          padding: 0;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
        }
        .ProseMirror li {
          margin-bottom: 0.25rem;
        }
        /* Syntax highlighting */
        .hljs-keyword { color: #c792ea; }
        .hljs-string { color: #c3e88d; }
        .hljs-number { color: #f78c6c; }
        .hljs-comment { color: #546e7a; }
        .hljs-function { color: #82aaff; }
        .hljs-variable { color: #f07178; }
        .hljs-attr { color: #ffcb6b; }
      `}</style>
        </div>
    );
}

// Toolbar Button Component
interface ToolbarButtonProps {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
}

function ToolbarButton({
    onClick,
    active,
    disabled,
    title,
    children,
}: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-2 rounded-lg transition-all ${active
                ? "bg-[#D1F441]/20 text-[#D1F441]"
                : "text-white/60 hover:text-white hover:bg-white/10"
                } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
        >
            {children}
        </button>
    );
}
