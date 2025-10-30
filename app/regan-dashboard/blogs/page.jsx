"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, ApolloProvider } from "@apollo/client";
import client from "@/lib/apolloClient";
import { GET_BLOGS } from "@/graphql/queries/getBlogs";
import dynamic from "next/dynamic";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import { useSearchParams } from "next/navigation";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
} from "lucide-react";

// Avoid SSR hydration mismatch for TipTap's EditorContent
const EditorContentNoSSR = dynamic(
  () => import("@tiptap/react").then((m) => m.EditorContent),
  { ssr: false }
);

// Toolbar button
function ToolButton({ onClick, isActive, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex h-8 items-center justify-center rounded-md px-2 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/60 ${
        isActive ? "bg-violet-600/25 text-violet-200" : "text-slate-300 hover:bg-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editor }) {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-700 bg-[#0f0f12] px-3 py-2">
      <ToolButton
        title="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
      >
        <Bold size={16} />
      </ToolButton>
      <ToolButton
        title="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
      >
        <Italic size={16} />
      </ToolButton>
      <ToolButton
        title="Strike"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
      >
        <Strikethrough size={16} />
      </ToolButton>
      <div className="mx-2 h-5 w-px bg-slate-700" />
      <ToolButton
        title="Heading 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
      >
        <Heading1 size={16} />
      </ToolButton>
      <ToolButton
        title="Heading 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
      >
        <Heading2 size={16} />
      </ToolButton>
      <ToolButton
        title="Heading 3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
      >
        <Heading3 size={16} />
      </ToolButton>
      <div className="mx-2 h-5 w-px bg-slate-700" />
      <ToolButton
        title="Bullet List"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
      >
        <List size={16} />
      </ToolButton>
      <ToolButton
        title="Ordered List"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
      >
        <ListOrdered size={16} />
      </ToolButton>
      <ToolButton
        title="Blockquote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
      >
        <Quote size={16} />
      </ToolButton>
      <ToolButton
        title="Code Block"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
      >
        <Code size={16} />
      </ToolButton>
      <ToolButton title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus size={16} />
      </ToolButton>
      <div className="mx-2 h-5 w-px bg-slate-700" />
      <ToolButton title="Link" onClick={() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
          editor.chain().focus().extendMarkRange('link').unsetLink().run();
          return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      }} isActive={editor.isActive('link')}>
        <LinkIcon size={16} />
      </ToolButton>
      <ToolButton title="Image" onClick={() => {
        const url = window.prompt('Image URL');
        if (!url) return;
        editor.chain().focus().setImage({ src: url }).run();
      }}>
        <ImageIcon size={16} />
      </ToolButton>
      <div className="ml-auto flex items-center gap-2">
        <ToolButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={16} />
        </ToolButton>
        <ToolButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={16} />
        </ToolButton>
      </div>
    </div>
  );
}

function SimpleEditor({ initialContent, onEditorMount }) {
  const editor = useEditor({
    extensions: [
      Color.configure({ types: ["textStyle"] }),
      TextStyle,
      Underline,
      LinkExtension.configure({ openOnClick: true, autolink: true }),
      ImageExtension,
      Placeholder.configure({ placeholder: "Start writing your update…" }),
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: true,
        horizontalRule: true,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[300px] p-4 text-slate-100 focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && typeof onEditorMount === "function") {
      onEditorMount(editor);
    }
  }, [editor, onEditorMount]);

  // Sync new initialContent when selection changes
  useEffect(() => {
    if (editor && typeof initialContent === "string") {
      editor.commands.setContent(initialContent, false);
    }
  }, [initialContent, editor]);

  return (
    <div className="rounded-lg border border-slate-700 bg-[#0f0f12] shadow-lg">
      <EditorToolbar editor={editor} />
      <div className="bg-[#131317]">
        <EditorContentNoSSR editor={editor} />
      </div>
    </div>
  );
}

function BlogList({ posts, activeId }) {
  return (
    <aside className="h-full overflow-y-auto rounded-lg border border-slate-800 bg-[#0b0b0e] p-3">
      <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Blogs</div>
      <ul className="space-y-1">
        {posts.map((p) => {
          const id = p.documentId || p.id;
          return (
            <li key={id}>
              <Link
                href={`/regan-dashboard/blogs?post=${id}`}
                className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                  (activeId === id)
                    ? "bg-violet-600/25 text-violet-200"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="line-clamp-1">{p.title}</div>
                {p.publishedAt && (
                  <div className="mt-0.5 text-xs text-slate-500">
                    {new Date(p.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function DashboardContent() {
  const { loading, error, data } = useQuery(GET_BLOGS);
  const posts = data?.blogPosts || [];
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("post") || (posts[0]?.documentId || posts[0]?.id);

  const [editorInstance, setEditorInstance] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    if (!editorInstance || !selectedId) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const html = editorInstance.getHTML();
      const baseUrl = "https:typical-car-e0b66549b3.strapiapp.com"
      if (!baseUrl) {
        throw new Error("Strapi base URL is not configured (NEXT_PUBLIC_STRAPI_URL)");
      }
      const idForRest = activePost?.id ?? selectedId; // Prefer numeric id if available
      const url = `${baseUrl.replace(/\/$/, "")}/api/blog-posts/${idForRest}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.NEXT_PUBLIC_STRAPI_TOKEN
            ? { Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({ data: { content: html } }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Update failed with status ${res.status}`);
      }
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const activePost = useMemo(() => {
    if (!posts.length) return null;
    return posts.find((p) => (p.documentId || p.id) === selectedId) || posts[0];
  }, [posts, selectedId]);

  return (
    <div className="min-h-screen bg-[#0a0a0d] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-xl font-bold text-slate-200">Regan Dashboard — Blog Updates</h1>
        <p className="mt-1 text-sm text-slate-400">Select a blog on the left and edit the content using the editor.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            {loading ? (
              <div className="rounded-lg border border-slate-800 bg-[#0b0b0e] p-4 text-sm text-slate-400">Loading blogs…</div>
            ) : error ? (
              <div className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">{error.message}</div>
            ) : (
              <BlogList posts={posts} activeId={activePost?.documentId || activePost?.id} />
            )}
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-slate-400">
                Editing: <span className="font-medium text-slate-200">{activePost?.title || "Untitled"}</span>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !editorInstance || !selectedId}
                className="inline-flex h-9 items-center rounded-md bg-violet-600 px-3 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Updating..." : "Update"}
              </button>
            </div>
            {saveError && (
              <div className="mb-3 rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-300">{saveError}</div>
            )}
            {saveSuccess && (
              <div className="mb-3 rounded-md border border-emerald-800 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300">Content updated successfully.</div>
            )}
            <SimpleEditor
              initialContent={activePost?.content || `<h1>${activePost?.title || "Simple Editor"}</h1><p>Edit your blog update with the toolbar above.</p>`}
              onEditorMount={setEditorInstance}
            />
            <div className="mt-3 text-xs text-slate-500">Changes are local-only until you click Update. Ensure your Strapi URL and token are set.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ApolloProvider client={client}>
      <DashboardContent />
    </ApolloProvider>
  );
}