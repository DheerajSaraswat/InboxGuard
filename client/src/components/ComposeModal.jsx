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
import Link from "@tiptap/extension-link";
import {
  Send,
  X,
  Paperclip,
  Sparkles,
  AlertTriangle,
  Shield,
  AlertCircle,
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import toast from "react-hot-toast";
import { AdvancedPhishingScanner } from "../utils/scanner";

export default function ComposeModal({ open, setOpen, isDark }) {
  const nodeRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiMessages, setAiMessages] = useState([]); // {role: 'user'|'assistant', text}

  // New state for multiple recipients
  const [recipients, setRecipients] = useState([]);
  const [currentRecipient, setCurrentRecipient] = useState("");

  // New state for subject
  const [subject, setSubject] = useState("");

  // State for multiple AI mail options
  const [aiMailOptions, setAiMailOptions] = useState([]);
  const dispatch = useDispatch();

  //State for Sending mails
  const [mail, setMail] = useState({
    to: "",
    subject: "",
    body: "",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  // removed success page state; we'll use toast notifications instead

  //State for Alert

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: true,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer nofollow",
        },
      }),
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

  //Drag and Drop
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

  // Convert plain text to simple email HTML paragraphs while preserving lists and line breaks
  const textToEmailHtml = (raw) => {
    if (!raw) return "";
    const lines = raw.replace(/\r\n/g, "\n").split(/\n\n+/);
    const htmlBlocks = lines.map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      // simple list detection
      if (/^(\-|\*|\d+\.)\s/m.test(trimmed)) {
        const items = trimmed
          .split(/\n/)
          .filter(Boolean)
          .map((l) => l.replace(/^\s*(\-|\*|\d+\.)\s+/, "").trim());
        return `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
      }
      return `<p>${trimmed.replace(/\n/g, "<br/>")}</p>`;
    });
    return htmlBlocks.join("");
  };

  // AI Chat Assistant
  const sendAiMessage = async () => {
    const question = aiInput.trim();
    if (!question) return;
    setLoadingAI(true);
    const prior = aiMessages;
    setAiMessages([...prior, { role: "user", text: question }]);
    setAiInput("");
    try {
      const genAI = new GoogleGenAI({
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      });
      const contextText = editor.getText();
      const conversation = [
        {
          role: "user",
          parts: [
            `You are an assistant that helps draft emails. Keep replies as email-ready text only. Use professional tone. Do not modify subject. Use paragraphs and lists where appropriate.\nCurrent Draft:\n${contextText}`,
          ],
        },
        ...prior.map((m) => ({ role: m.role, parts: [m.text] })),
        { role: "user", parts: [question] },
      ];
      const result = await genAI.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: conversation,
      });
      const answer = result.text;
      setAiMessages((msgs) => [...msgs, { role: "assistant", text: answer }]);
    } catch (err) {
      console.error("AI error:", err);
      toast.error("AI request failed");
    } finally {
      setLoadingAI(false);
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

  const scanner = new AdvancedPhishingScanner();
  const handleSendMail = async () => {
    setIsScanning(true);

    // Simulate a small delay for scanning
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = scanner.scan({
      text: editor.getHTML(),
      subject: subject,
    });

    if (result.riskLevel !== "minimal") {
      setScanResult(result);
      setShowAlert(true);
      setIsScanning(false);
    } else {
      await sendEmail();
    }

    // // Show warning modal if risks are detected
    // if (result.riskLevel !== "minimal" && result.riskScore > 15) {
    //   setShowWarningModal(true);
    // } else {
    //   // If safe, send directly
    //   sendEmailDirectly();
    // }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-green-600 bg-green-50 border-green-200";
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case "high":
        return <AlertTriangle className="h-5 w-5" />;
      case "medium":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  // Send despite warnings
  const sendAnyway = async () => {
    await sendEmail();
  };

  // Cancel sending
  const cancelSend = () => {
    setShowAlert(false);
    setScanResult(null);
  };

  const sendEmail = async () => {
    try {
      const payload = {
        to: recipients,
        subject: subject,
        body: editor.getHTML(),
        attachments: files.map((f) => ({ name: f.name, size: f.size })),
      };
      await axios.post("/api/emails/send", payload);
      toast.success("Email sent");
      setShowAlert(false);
      setScanResult(null);
      setOpen(false);
    } catch (err) {
      console.error("Error sending email", err);
      toast.error("Failed to send email");
    }
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
                  onClick={() => setAiChatOpen((s) => !s)}
                  className={`p-2 rounded ${
                    isDark
                      ? "hover:bg-gray-700 text-gray-200"
                      : "hover:bg-gray-200 text-gray-700"
                  }`}
                  title="AI Assist (Chat)"
                >
                  <Sparkles size={16} />
                </button>
                <button
                  onClick={() => {
                    dispatch(
                      addDraft({
                        subject,
                        content: editor.getText(),
                        recipients,
                        files,
                      })
                    );
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
                onChange={(e) => setSubject(e.target.value)}
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

              {/* AI Chat Panel */}
              {aiChatOpen && (
                <div className="flex gap-3 w-full">
                  <div className={`flex-1 flex flex-col gap-2 ${isDark ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-200"} rounded-md p-2 max-h-64 overflow-y-auto`}>
                    {aiMessages.length === 0 && (
                      <div className="text-xs text-gray-500 px-1 py-1">Ask for a draft, rewrite, or add bullet points. The assistant won’t change your subject.</div>
                    )}
                    {aiMessages.map((m, idx) => (
                      <div key={idx} className={`${m.role === "user" ? "text-blue-700 dark:text-blue-300" : "text-gray-800 dark:text-gray-200"} text-sm whitespace-pre-wrap`}>{m.text}</div>
                    ))}
                  </div>
                  <div className="w-64 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder="Chat with AI..."
                        className={`flex-1 px-2 py-2 rounded-md text-sm outline-none ${isDark ? "bg-gray-800 border border-gray-700" : "bg-gray-100 border border-gray-200"}`}
                      />
                      <button
                        onClick={sendAiMessage}
                        disabled={loadingAI}
                        className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loadingAI ? "..." : "Send"}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        const last = [...aiMessages].reverse().find((m) => m.role === "assistant");
                        if (!last) return;
                        editor.chain().focus().insertContent(textToEmailHtml(last.text)).run();
                        toast.success("Inserted into body");
                      }}
                      className="px-2 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      Insert last reply into body
                    </button>
                  </div>
                </div>
              )}
              {/* Show mail options if available, always show if present */}
              {aiMailOptions.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {aiMailOptions.map((mail, idx) => (
                    <div
                      key={idx}
                      className={`border rounded-lg p-3 cursor-pointer transition shadow-sm ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700"
                          : "bg-white border-gray-300 hover:bg-gray-100"
                      }`}
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .setContent(textToEmailHtml(mail.content))
                      .run();
                    setAiMailOptions([]);
                    toast.success("Draft applied to body");
                  }}
                    >
                      <div className="font-bold mb-1">{mail.subject}</div>
                      <div className="text-sm whitespace-pre-line">
                        {mail.content.slice(0, 120)}
                        {mail.content.length > 120 ? "..." : ""}
                      </div>
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
                    dispatch(
                      addDraft({
                        subject,
                        content: editor.getText(),
                        recipients,
                        files,
                      })
                    );
                    setOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMail}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Send size={14} /> Send
                </button>
              </div>
            </div>
          </ResizableBox>
        </div>
      </Draggable>
      {showAlert && scanResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Security Warning
                    </h2>
                    <p className="text-sm text-gray-600">
                      Your email contains potentially harmful content
                    </p>
                  </div>
                </div>
                <button
                  onClick={cancelSend}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Risk Overview */}
              <div
                className={`rounded-lg border p-4 mb-4 ${getRiskColor(
                  scanResult.riskLevel
                )}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {getRiskIcon(scanResult.riskLevel)}
                  <span className="font-medium capitalize">
                    {scanResult.riskLevel} Risk Detected
                  </span>
                </div>
                <p className="text-sm">
                  Risk Score: <strong>{scanResult.riskScore}/100</strong>
                </p>
              </div>

              {/* Detected Issues */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  Detected Issues:
                </h3>
                <div className="space-y-2">
                  {scanResult.indicators.map((indicator, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded p-3 border-l-4 border-red-400"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            indicator.severity === "high"
                              ? "bg-red-100 text-red-800"
                              : indicator.severity === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {indicator.severity.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {indicator.type.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {indicator.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* URLs Found */}
              {scanResult.urls && scanResult.urls.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">
                    URLs Found in Email:
                  </h3>
                  <div className="space-y-1">
                    {scanResult.urls.map((url, index) => (
                      <div
                        key={index}
                        className={`text-sm p-2 rounded ${
                          url.suspicious
                            ? "bg-red-50 text-red-700"
                            : "bg-gray-50 text-gray-700"
                        }`}
                      >
                        {url.suspicious && (
                          <span className="font-medium">⚠️ SUSPICIOUS: </span>
                        )}
                        {url.original}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={cancelSend}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Cancel & Review
                </button>
                <button
                  onClick={sendAnyway}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Send Anyway
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-3 text-center">
                ⚠️ Sending emails with suspicious content may harm your
                reputation or violate policies
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
