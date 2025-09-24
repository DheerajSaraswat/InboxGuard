import React, { useRef, useState, useEffect } from "react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useDispatch } from "react-redux";
import { addDraft } from "../redux/slices/draftSlice";
import { Underline } from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  Send,
  X,
  Paperclip,
  Sparkles,
  Heading1,
  Heading2,
  Quote,
  UnderlineIcon,
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import Toolbar from "./Toolbar";

export default function ComposeModal({ open, setOpen, isDark }) {
  const nodeRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [aiMode, setAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  // New state for multiple recipients
  const [recipients, setRecipients] = useState([]);
  const [currentRecipient, setCurrentRecipient] = useState("");

  // New state for subject
  const [subject, setSubject] = useState("");

  // State for multiple AI mail options
  const [aiMailOptions, setAiMailOptions] = useState([]);
  const dispatch = useDispatch();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: "Start writing your email...",
      }),
    ],
    content: "",
  });

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;
  if (!editor) return null;

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length) setFiles((p) => [...p, ...dropped]);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleFileSelect = (e) => {
    const chosen = Array.from(e.target.files || []);
    if (chosen.length) setFiles((p) => [...p, ...chosen]);
  };
  const removeFile = (i) => setFiles((p) => p.filter((_, idx) => idx !== i));

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setLoadingAI(true);
    const content = editor.getText();
    const prompt = `${content} \n ${aiPrompt}`
    try {
      const genAI = new GoogleGenAI({apiKey: import.meta.env.VITE_GEMINI_API_KEY});

      const result = await genAI.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: prompt,
      });
      console.log(result);
      const text = result.text;

      // Parse multiple mail options
      // Split by 'Subject:' blocks
      const mailBlocks = text.split(/\n?Subject\s*:/i).filter(Boolean);
      let mails = [];
      mailBlocks.forEach(block => {
        // Find subject and content
        const subjectMatch = block.match(/^(.*?)(\n|$)/);
        const contentMatch = block.match(/Content\s*:\s*([\s\S]*)/i);
        let subj = subjectMatch ? subjectMatch[1].trim() : "";
        let cont = contentMatch ? contentMatch[1].trim() : block.replace(/^(.*?)(\n|$)/,"").replace(/Content\s*:\s*/i,"").trim();
        if (subj || cont) {
          mails.push({ subject: subj, content: cont });
        }
      });
      if (mails.length > 1) {
        setAiMailOptions(mails);
      } else if (mails.length === 1) {
        setSubject(mails[0].subject);
        editor.chain().focus().setContent(`<p>${mails[0].content}</p>`).run();
        setAiMailOptions([]);
      } else {
        // fallback: treat as single content
        setSubject("");
        editor.chain().focus().setContent(`<p>${text}</p>`).run();
        setAiMailOptions([]);
      }
    } catch (err) {
      console.error("AI error:", err);
    } finally {
      setLoadingAI(false);
      setAiPrompt("");
      setAiMode(false);
    }
  };

  const handleRecipientAdd = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const email = currentRecipient.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && emailRegex.test(email)) {
        setRecipients((prev) => [...prev, email]);
        setCurrentRecipient("");
      }
    }
  };

  const removeRecipient = (index) => {
    setRecipients((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isDark ? "bg-black/60" : "bg-gray-900/50"
      }`}
      onClick={() => setOpen(false)}
    >
      <Draggable nodeRef={nodeRef} handle=".drag-handle">
        <div
          ref={nodeRef}
          onClick={(e) => e.stopPropagation()}
          className={`max-w-[900px] w-full`}
        >
          <ResizableBox
            width={760}
            height={520}
            minConstraints={[420, 320]}
            maxConstraints={[1200, 900]}
            className={`rounded-xl shadow-2xl overflow-hidden flex flex-col ${
              isDark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
            }`}
          >
            {/* Header */}
            <div
              className={`drag-handle flex items-center justify-between px-4 py-3 cursor-move ${
                isDark
                  ? "border-b border-gray-700 bg-gray-800"
                  : "border-b border-gray-200 bg-gray-50"
              }`}
            >
              <strong className="text-sm">New Message</strong>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAiMode((s) => !s)}
                  className={`p-2 rounded ${
                    isDark
                      ? "hover:bg-gray-700 text-gray-200"
                      : "hover:bg-gray-200 text-gray-700"
                  }`}
                  title="AI Assist"
                >
                  <Sparkles size={16} />
                </button>
                <button
                  onClick={() => {
                    dispatch(addDraft({
                      subject,
                      content: editor.getText(),
                      recipients,
                      files,
                    }));
                    setOpen(false);
                  }}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div
              className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {/* To / Subject */}
              <div
                className={`w-full p-2 rounded-md outline-none text-sm flex flex-wrap gap-2 items-center ${
                  isDark
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-gray-100 border border-gray-200"
                }`}
              >
                {recipients.map((email, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                      isDark ? "bg-blue-700" : "bg-blue-200"
                    }`}
                  >
                    {email}
                    <button
                      onClick={() => removeRecipient(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <input
                  type="email"
                  value={currentRecipient}
                  onChange={(e) => setCurrentRecipient(e.target.value)}
                  onKeyDown={handleRecipientAdd}
                  placeholder={recipients.length === 0 ? "To" : ""}
                  className="flex-1 min-w-[100px] bg-transparent outline-none"
                />
              </div>

              <input
                placeholder="Subject"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className={`w-full px-3 py-2 rounded-md outline-none text-sm ${
                  isDark
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-gray-100 border border-gray-200"
                }`}
              />

              {/* Toolbar */}
              <div
                className={`flex flex-wrap items-center gap-2 rounded-md px-2 py-2 ${
                  isDark
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <Toolbar editor={editor} isDark={isDark} />
                <div className="ml-auto flex items-center">
                  <button
                    onClick={() =>
                      document.getElementById("fileInput")?.click()
                    }
                    className={`p-2 rounded-md border transition-colors duration-150 ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600"
                        : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200 hover:border-gray-300"
                    }`}
                    title="Attach File"
                  >
                    <Paperclip size={16} />
                  </button>
                </div>
              </div>

              {/* AI Prompt */}
              {aiMode && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ask Gemini to draft or improve text..."
                      className={`flex-1 px-3 py-2 rounded-md text-sm outline-none ${
                        isDark
                          ? "bg-gray-800 border border-gray-700"
                          : "bg-gray-100 border border-gray-200"
                      }`}
                    />
                    <button
                      onClick={handleAIGenerate}
                      disabled={loadingAI}
                      className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loadingAI ? "..." : "Generate"}
                    </button>
                  </div>
                </div>
              )}
              {/* Show mail options if available, always show if present */}
              {aiMailOptions.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {aiMailOptions.map((mail, idx) => (
                    <div key={idx} className={`border rounded-lg p-3 cursor-pointer transition shadow-sm ${isDark ? 'bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700' : 'bg-white border-gray-300 hover:bg-gray-100'}`} onClick={() => {
                      setSubject(mail.subject);
                      editor.chain().focus().setContent(`<p>${mail.content}</p>`).run();
                      setAiMailOptions([]);
                    }}>
                      <div className="font-bold mb-1">{mail.subject}</div>
                      <div className="text-sm whitespace-pre-line">{mail.content.slice(0, 120)}{mail.content.length > 120 ? '...' : ''}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Editor */}
              <div
                className={`rounded-md border p-3 ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <EditorContent
                  editor={editor}
                  className="prose prose-sm max-w-none outline-none w-full h-auto min-h-[160px]"
                />
              </div>

              {/* Hidden file input */}
              <input
                id="fileInput"
                type="file"
                multiple
                hidden
                onChange={handleFileSelect}
              />

              {/* File previews */}
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((f, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-3 py-2 rounded ${
                        isDark ? "bg-gray-800" : "bg-gray-100"
                      }`}
                    >
                      <span className="truncate max-w-[70%]">{f.name}</span>
                      <button
                        className="text-red-500"
                        onClick={() => removeFile(i)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className={`flex items-center justify-between px-4 py-3 ${
                isDark
                  ? "border-t border-gray-700 bg-gray-800"
                  : "border-t border-gray-200 bg-gray-50"
              }`}
            >
              <div className="text-sm text-gray-500">
                Drag & drop to attach files
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={`px-4 py-2 rounded ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={() => {
                    dispatch(addDraft({
                      subject,
                      content: editor.getText(),
                      recipients,
                      files,
                    }));
                    setOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button onClick={()=>console.log(editor.getText())} className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                  <Send size={14} /> Send
                </button>
              </div>
            </div>
          </ResizableBox>
        </div>
      </Draggable>
    </div>
  );
}
