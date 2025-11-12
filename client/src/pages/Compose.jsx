import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Paperclip,
  Code,
  Undo,
  Redo,
  FileText,
  Bot,
  Edit3,
  Type,
  Layout,
  MessageSquare,
  X,
  Plus,
  Send,
  Menu,
  ArrowLeft,
  Quote as QuoteIcon,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import { GoogleGenAI } from "@google/genai";
import { AdvancedPhishingScanner, scanEmailAndReport } from "../utils/scanner";
import PhishingAlert from "../components/PhishingAlert";
import api from "../utils/api";
import { encryptEmailAndAttachments } from "../utils/encryption";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import LinkExt from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Blockquote from "@tiptap/extension-blockquote";
import axios from "axios";

const EmailEditor = ({ isDark }) => {
  const location = useLocation();
  const [recipients, setRecipients] = useState([]);
  const [subject, setSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showAssistant, setShowAssistant] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI writing assistant. I can help you write better emails, suggest improvements, or generate content. How can I help you today?",
      time: "02:57 pm",
      isAssistant: true,
    },
  ]);
  const [assistantInput, setAssistantInput] = useState("");
  const [newRecipient, setNewRecipient] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const fileInputRef = useRef(null);
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const scannerRef = useRef(new AdvancedPhishingScanner());
  const [showAlert, setShowAlert] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const dragCounter = useRef(0);
  const [isEditorDragging, setIsEditorDragging] = useState(false);

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      UnderlineExt,
      LinkExt.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: true,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer nofollow",
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Blockquote,
      Placeholder.configure({
        placeholder: "Write your email content here...",
      }),
    ],
    content: emailContent || "<p></p>",
    onUpdate: ({ editor }) => {
      // Keep the html state in sync
      setEmailContent(editor.getHTML());
    },
  });

  // Helpers for recipients & files (kept same behavior)
  const addRecipient = () => {
    if (newRecipient.trim() && !recipients.includes(newRecipient.trim())) {
      setRecipients([...recipients, newRecipient.trim()]);
      setNewRecipient("");
    }
  };
  const removeRecipient = (index) =>
    setRecipients(recipients.filter((_, i) => i !== index));
  const handleRecipientKeyPress = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addRecipient();
    }
  };

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }));
    setAttachedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
    dragCounter.current = 0;
    setIsEditorDragging(false);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsEditorDragging(true);
  };
  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current += 1;
    setIsEditorDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) setIsEditorDragging(false);
  };
  const removeFile = (fileId) =>
    setAttachedFiles(attachedFiles.filter((f) => f.id !== fileId));
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // AI assistant (use editor.getText() for plain content)
  const sendAssistantMessage = async () => {
    const question = assistantInput.trim();
    if (!question || !editor) return;

    const newMessage = {
      id: Date.now(),
      text: question,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isAssistant: false,
    };

    // Optimistically update the UI with the user's new message immediately
    setAssistantMessages((prev) => [...prev, newMessage]);
    setAssistantInput("");
    setIsAssistantTyping(true);

    try {
      const genAI = new GoogleGenAI({
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      });

      // Construct the conversation history with the CORRECT structure
      const conversation = [
        {
          role: "user",
          parts: [
            {
              text: "You are an assistant that helps draft emails. Keep replies as email-ready text only with paragraphs and lists. Do not modify the subject.",
            },
          ],
        },

        // Correctly map history to parts: [{ text: "..." }]
        ...assistantMessages.map((m) => ({
          role: m.isAssistant ? "assistant" : "user",
          parts: [{ text: m.text }], // <-- This is the fix!
        })),

        {
          role: "user",
          parts: [
            { text: `Current email body (plain text): ${editor.getText()}` },
          ],
        },

        // Add the latest user question
        { role: "user", parts: [{ text: question }] },
      ];

      const result = await genAI.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: conversation,
      });

      const responseText = result.text || "";
      const aiResponse = {
        id: Date.now() + 1,
        text: responseText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isAssistant: true,
      };

      // Add the AI response to the history
      setAssistantMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.error("AI error", err);
      // You should also remove the last user message if the API failed
      setAssistantMessages((prev) => prev.slice(0, -1));
      toast.error("AI request failed");
    } finally {
      setIsAssistantTyping(false);
    }
  };

  const handleQuickAction = (action) => {
    let message = "";
    switch (action) {
      case "improve":
        message = "Please help me improve this email";
        break;
      case "formal":
        message = "Make this email more formal";
        break;
      case "casual":
        message = "Make this email more casual";
        break;
      case "template":
        message = "Show me an email template";
        break;
      default:
        break;
    }
    setAssistantInput(message);
    setTimeout(() => sendAssistantMessage(), 100);
  };

  // Send flow: use editor.getText() for plain text checks and editor.getHTML() for body
  const handleSendEmail = async () => {
    if (recipients.length === 0) {
      toast.error("Please add at least one recipient");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please add a subject line");
      return;
    }
    const plain = editor ? editor.getText().trim() : "";
    if (!plain) {
      toast.error("Please add email content");
      return;
    }
    setIsScanning(true);
    const text = editor ? editor.getText() : "";
    const htmlContent = editor ? editor.getHTML() : "";

    try {
      // Call ML model directly from frontend to save time
      const mlApiUrl = import.meta.env.VITE_ML_API_URL || "https://inboxguard-production.up.railway.app";
      const baseUrl = mlApiUrl.replace(/\/$/, "");
      
      const response = await axios.post(
        `${baseUrl}/classify`,
        { email_text: text },
        {
          timeout: 25000, // 25 seconds timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      setIsScanning(false);

      // Check if phishing detected (using classification or is_phishing)
      const isPhishing = response.data.classification === "phishing" || response.data.is_phishing === true;
      
      if (isPhishing) {
        // Phishing detected - create phishing report
        const confidence = response.data.confidence || 0.85;
        const confidencePercent = Math.round(confidence * 100);
        
        // Determine risk level based on confidence
        let riskLevel = "low";
        if (confidence >= 0.8) {
          riskLevel = "high";
        } else if (confidence >= 0.6) {
          riskLevel = "medium";
        }
        
        const phishingReport = {
          reportedBy: "system",
          reportedAt: new Date().toISOString(),
          reportType: "auto-scan",
          confidence: confidencePercent,
          emailData: {
            subject,
            text: text.substring(0, 500), // Store first 500 chars
          },
          analysis: {
            riskScore: confidencePercent,
            detectedPatterns: [
              `ML model detected phishing with ${confidencePercent}% confidence`,
              `Classification: ${response.data.classification || "phishing"}`,
            ],
            verificationStatus: "pending",
          },
          riskLevel: riskLevel,
        };

        if (phishingReport.riskLevel === "low") {
          await sendEmail(phishingReport);
          return;
        }

        // Medium/High risk — show phishing alert
        setScanResult({
          riskLevel: phishingReport.riskLevel,
          indicators: phishingReport.analysis.detectedPatterns.map(
            (pattern) => ({
              description: pattern,
            })
          ),
          phishingReport,
        });
        setShowAlert(true);
        return; // Stop email sending - user must review or send anyway
      }

      // No phishing detected - send email normally
      await sendEmail();
    } catch (error) {
      console.error("Phishing scan error:", error);
      setIsScanning(false);
      
      // Show user-friendly error message
      const errorMessage = error.code === "ECONNABORTED" 
        ? "Phishing scan timed out. The ML model may be slow or unavailable."
        : error.response?.data?.message || error.message || "Phishing scan failed.";
      
      toast.error(errorMessage);
      
      // If ML model fails or times out, ask user if they want to send anyway
      const shouldSend = window.confirm(
        `${errorMessage}\n\nDo you want to send the email anyway?`
      );
      if (shouldSend) {
        await sendEmail();
      }
    }
  };

  const sendEmail = async (phishingReport = null) => {
    setIsSending(true);
    try {
      const htmlBody = editor ? editor.getHTML() : emailContent;
      const encrypted = await encryptEmailAndAttachments({
        subject,
        htmlBody,
        attachments: attachedFiles,
        recipients,
      });

      // Prepare phishing report in format expected by server
      let formattedPhishingReport = null;
      if (phishingReport) {
        formattedPhishingReport = {
          riskScore: phishingReport.analysis?.riskScore || 75,
          riskLevel: phishingReport.riskLevel || "medium",
          indicators:
            phishingReport.analysis?.detectedPatterns?.map((desc) => ({
              type: "auto_detected",
              severity: phishingReport.riskLevel,
              description: desc,
              detected: true,
            })) || [],
          analyzedAt: new Date(),
          bypassedByUser: true,
        };
      }

      const payload = {
        to: recipients,
        subject: encrypted.subject,
        // send plaintext HTML body to server; server encrypts at rest
        body: htmlBody,
        attachments: encrypted.attachments,
        encryptedKeys: encrypted.encryptedKeys,
        phishingReport: formattedPhishingReport,
      };
      const { data } = await api.post("/emails/sendMail", payload, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Email sent");
      if (
        Array.isArray(data?.missingRecipients) &&
        data.missingRecipients.length
      ) {
        toast((t) => (
          <div>
            <div className="font-semibold">Some recipients were not found:</div>
            <div className="text-sm mt-1">
              {data.missingRecipients.join(", ")}
            </div>
          </div>
        ));
      }

      // Clear the compose form after successful send
      setRecipients([]);
      setSubject("");
      editor?.commands.clearContent();
      setEmailContent("");
      setAttachedFiles([]);
      setScanResult(null);
      setShowAlert(false);
    } catch (err) {
      console.error("Send email error:", err);
      const serverMsg = err?.response?.data?.message;
      const missing = err?.response?.data?.missing;
      if (serverMsg) {
        toast.error(serverMsg);
        if (Array.isArray(missing) && missing.length) {
          toast((t) => (
            <div>
              <div className="font-semibold">Missing recipients:</div>
              <div className="text-sm mt-1">{missing.join(", ")}</div>
            </div>
          ));
        }
      } else {
        toast.error("Failed to send email");
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleSendAnyway = async () => {
    if (!scanResult) return;
    // Send email with phishing report attached
    await sendEmail(scanResult.phishingReport);
    setShowAlert(false);
    setScanResult(null);
  };

  const handleReview = () => setShowAlert(false);

  const handleSaveDraft = async () => {
    console.log("clicked");
    try {
      const draft = {
        to: recipients,
        subject,
        body: editor ? editor.getHTML() : emailContent,
        attachments: attachedFiles,
      };

      // Save to server
      const { saveDraft } = await import("../apiRequests/saveDraft");
      await saveDraft(draft);

      // Also save to localStorage as backup
      localStorage.setItem("inboxguard_draft", JSON.stringify(draft));
      toast.success("Draft saved");
    } catch (e) {
      console.error("Failed to save draft:", e);
      toast.error("Failed to save draft");
    }
  };

  // ---------------------------
  // TipTap toolbar glue
  // ---------------------------
  const formatButtons = [
    { icon: Bold, title: "Bold", action: "bold" },
    { icon: Italic, title: "Italic", action: "italic" },
    { icon: Underline, title: "Underline", action: "underline" },
    { icon: List, title: "Bullet List", action: "bulletList" },
    { icon: ListOrdered, title: "Numbered List", action: "orderedList" },
    { icon: AlignLeft, title: "Align Left", action: "alignLeft" },
    { icon: AlignCenter, title: "Align Center", action: "alignCenter" },
    { icon: AlignRight, title: "Align Right", action: "alignRight" },
    { icon: Link, title: "Insert Link", action: "link" },
    { icon: QuoteIcon, title: "Quote", action: "blockquote" },
    { icon: Paperclip, title: "Attach File", action: "attach" },
    { icon: Code, title: "Code Block", action: "codeBlock" },
    { icon: Undo, title: "Undo", action: "undo" },
    { icon: Redo, title: "Redo", action: "redo" },
  ];

  const isActive = (action) => {
    if (!editor) return false;
    switch (action) {
      case "bold":
        return editor.isActive("bold");
      case "italic":
        return editor.isActive("italic");
      case "underline":
        return editor.isActive("underline");
      case "bulletList":
        return editor.isActive("bulletList");
      case "orderedList":
        return editor.isActive("orderedList");
      case "link":
        return editor.isActive("link");
      case "codeBlock":
        return editor.isActive("codeBlock");
      case "blockquote":
        return editor.isActive("blockquote");
      default:
        return false;
    }
  };

  const handleFormatClick = (action) => {
    if (!editor && action !== "attach") return;
    switch (action) {
      case "bold":
        editor.chain().focus().toggleBold().run();
        break;
      case "italic":
        editor.chain().focus().toggleItalic().run();
        break;
      case "underline":
        editor.chain().focus().toggleUnderline().run();
        break;
      case "bulletList":
        editor.chain().focus().toggleBulletList().run();
        break;
      case "orderedList":
        editor.chain().focus().toggleOrderedList().run();
        break;
      case "alignLeft":
        editor.chain().focus().setTextAlign("left").run();
        break;
      case "alignCenter":
        editor.chain().focus().setTextAlign("center").run();
        break;
      case "alignRight":
        editor.chain().focus().setTextAlign("right").run();
        break;
      case "link": {
        // capture current selection text, open modal
        const { from, to, empty } = editor.state.selection;
        const selected = !empty
          ? editor.state.doc.textBetween(from, to, " ")
          : "";
        setLinkText(selected || "");
        setLinkUrl("");
        setShowLinkModal(true);
        break;
      }
      case "blockquote":
        editor.chain().focus().toggleBlockquote().run();
        break;
      case "codeBlock":
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case "undo":
        editor.chain().focus().undo().run();
        break;
      case "redo":
        editor.chain().focus().redo().run();
        break;
      case "attach":
        fileInputRef.current?.click();
        break;
      default:
        break;
    }
  };

  // Apply hyperlink using TipTap commands (supports selected text or inserted text)
  const applyHyperlink = () => {
    if (!editor) {
      setShowLinkModal(false);
      return;
    }
    const url = linkUrl.trim();
    if (!url) {
      setShowLinkModal(false);
      return;
    }
    const normalized = /^(https?:)?\/\//i.test(url) ? url : `https://${url}`;
    const { empty } = editor.state.selection;
    const text = linkText.trim() || normalized;

    if (!empty) {
      // If selection exists and no custom text -> just set link
      if (!linkText.trim()) {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: normalized })
          .run();
      } else {
        // replace selection with custom link text
        editor
          .chain()
          .focus()
          .deleteSelection()
          .insertContent(
            `<a href="${normalized}" target="_blank" rel="noopener noreferrer">${text}</a>`
          )
          .run();
      }
    } else {
      // insert new anchor at caret
      editor
        .chain()
        .focus()
        .insertContent(
          `<a href="${normalized}" target="_blank" rel="noopener noreferrer">${text}</a>`
        )
        .run();
    }

    setShowLinkModal(false);
    setLinkText("");
    setLinkUrl("");
  };

  // Handle URL parameters for reply/forward
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const reply = searchParams.get("reply");
    const forward = searchParams.get("forward");
    const toParam = searchParams.get("to");
    const subjectParam = searchParams.get("subject");
    const bodyParam = searchParams.get("body");

    if (reply === "true" && toParam) {
      setRecipients([toParam]);
      if (subjectParam) setSubject(decodeURIComponent(subjectParam));
      if (bodyParam && editor) {
        const decodedBody = decodeURIComponent(bodyParam);
        editor.commands.setContent(decodedBody);
        setEmailContent(decodedBody);
      }
    } else if (forward === "true") {
      if (subjectParam) setSubject(decodeURIComponent(subjectParam));
      if (bodyParam && editor) {
        const decodedBody = decodeURIComponent(bodyParam);
        editor.commands.setContent(decodedBody);
        setEmailContent(decodedBody);
      }
    }
  }, [location.search, editor]);

  // when component unmounts, destroy editor
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  // ---------- UI (Google/Gmail style) ----------
  return (
    <div
      className={`min-h-screen max-h-screen flex flex-col ${
        isDark ? "bg-[#202124]" : "bg-[#f8f9fa]"
      }`}
    >
      {/* Mobile Header */}
      <div
        className={`lg:hidden ${
          isDark ? "bg-[#202124] border-[#3c4043]" : "bg-white border-gray-200"
        } shadow-sm border-b p-4 sticky top-0 z-10 flex-shrink-0`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                // On mobile, navigate back; on desktop could show menu
                if (window.innerWidth < 1024) {
                  window.history.back();
                } else {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }
              }}
              className={`p-2 rounded-lg transition-colors active:scale-95 ${
                isDark ? "hover:bg-[#303134]" : "hover:bg-gray-100"
              }`}
              aria-label="Back"
            >
              <ArrowLeft
                size={20}
                className={isDark ? "text-[#e8eaed]" : "text-gray-600"}
              />
            </button>
            <h1
              className={`text-lg font-medium ${
                isDark ? "text-[#e8eaed]" : "text-gray-900"
              }`}
            >
              Compose
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAssistant(!showAssistant)}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? "hover:bg-[#303134]" : "hover:bg-gray-100"
              }`}
            >
              <Bot
                size={20}
                className={
                  showAssistant
                    ? isDark
                      ? "text-[#8ab4f8]"
                      : "text-blue-600"
                    : isDark
                    ? "text-[#9aa0a6]"
                    : "text-gray-400"
                }
              />
            </button>
            <button
              onClick={handleSendEmail}
              disabled={isScanning || isSending}
              className={`${
                isDark
                  ? "bg-[#8ab4f8] hover:bg-[#7ba3f7] text-[#202124]"
                  : "bg-[#1a73e8] hover:bg-[#1765cc] text-white"
              } px-4 py-2 rounded-lg flex items-center space-x-2 transition-all disabled:opacity-50 font-medium`}
            >
              {isScanning ? (
                <>
                  <Shield size={16} className="animate-pulse" />
                  <span className="hidden sm:inline">Scanning...</span>
                </>
              ) : isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Sending...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Editor area */}
        <div
          className={`flex-1 lg:overflow-y-auto ${
            isDark ? "bg-[#202124]" : "bg-[#f8f9fa] lg:bg-white"
          }`}
        >
          <div
            className={`hidden lg:flex items-center justify-between px-6 py-3 ${
              isDark
                ? "bg-[#202124] border-b border-[#3c4043]"
                : "bg-white border-b border-gray-200"
            } flex-shrink-0`}
          >
            <h1
              className={`text-lg font-normal ${
                isDark ? "text-[#e8eaed]" : "text-gray-900"
              }`}
            >
              Compose
            </h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveDraft}
                className={`px-4 py-2 rounded transition-colors ${
                  isDark
                    ? "hover:bg-[#303134] text-[#e8eaed]"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                Save draft
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isScanning || isSending}
                className={`${
                  isDark
                    ? "bg-[#8ab4f8] hover:bg-[#7ba3f7] text-[#202124]"
                    : "bg-[#1a73e8] hover:bg-[#1765cc] text-white"
                } px-6 py-2 rounded-lg flex items-center space-x-2 transition-all disabled:opacity-50 font-medium`}
              >
                {isScanning ? (
                  <>
                    <Shield size={16} className="animate-pulse" />
                    <span>Scanning...</span>
                  </>
                ) : isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 lg:p-0">
            <div
              className={`${
                isDark ? "bg-[#202124]" : "bg-white"
              } lg:shadow-sm border-t lg:border-t-0 ${
                isDark ? "border-[#3c4043]" : "border-gray-200"
              } overflow-hidden`}
            >
              <div className="px-4 py-2 lg:px-6 lg:py-4 space-y-4">
                {/* Recipients */}
                <div>
                  <div
                    className={`border-b ${
                      isDark ? "border-[#3c4043]" : "border-gray-200"
                    } pb-2 min-h-[40px] flex flex-wrap items-center gap-2`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        isDark ? "text-[#9aa0a6]" : "text-gray-500"
                      } mr-2`}
                    >
                      To
                    </span>
                    {recipients.map((recipient, index) => (
                      <div
                        key={index}
                        className={`${
                          isDark
                            ? "bg-[#303134] text-[#e8eaed] border-[#5f6368]"
                            : "bg-[#e8f0fe] text-[#1a73e8] border-blue-200"
                        } px-2 py-1 rounded flex items-center space-x-2 text-sm font-medium border`}
                      >
                        <span>{recipient}</span>
                        <button
                          onClick={() => removeRecipient(index)}
                          className={`${
                            isDark
                              ? "text-[#9aa0a6] hover:text-[#e8eaed]"
                              : "text-blue-600 hover:text-blue-700"
                          } p-0.5 rounded transition-colors`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <input
                      type="email"
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                      onKeyDown={handleRecipientKeyPress}
                      onBlur={addRecipient}
                      placeholder={recipients.length === 0 ? "Recipients" : ""}
                      className={`flex-1 min-w-[150px] outline-none ${
                        isDark
                          ? "bg-transparent text-[#e8eaed] placeholder-[#9aa0a6]"
                          : "text-gray-900 placeholder-gray-400"
                      }`}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <div
                    className={`border-b ${
                      isDark ? "border-[#3c4043]" : "border-gray-200"
                    } pb-2`}
                  >
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Subject"
                      className={`w-full outline-none ${
                        isDark
                          ? "bg-transparent text-[#e8eaed] placeholder-[#9aa0a6]"
                          : "text-gray-900 placeholder-gray-400"
                      }`}
                    />
                  </div>
                </div>

                {/* Formatting toolbar */}
                <div>
                  <div
                    className={`flex items-center space-x-0.5 px-2 py-1 border-b ${
                      isDark
                        ? "border-[#3c4043] bg-[#202124]"
                        : "border-gray-200 bg-gray-50"
                    } overflow-x-auto`}
                  >
                    {formatButtons.map((button, index) => {
                      const active = isActive(button.action);
                      return (
                        <button
                          key={index}
                          title={button.title}
                          onClick={() => handleFormatClick(button.action)}
                          className={`p-1.5 rounded transition-colors ${
                            active
                              ? isDark
                                ? "bg-[#303134] text-[#e8eaed]"
                                : "bg-gray-200 text-gray-900"
                              : isDark
                              ? "hover:bg-[#303134] text-[#9aa0a6]"
                              : "hover:bg-gray-100 text-gray-600"
                          }`}
                        >
                          <button.icon size={16} />
                        </button>
                      );
                    })}
                  </div>

                  {/* Editor area with drag/drop */}
                  <div
                    className={`relative tiptap-editor ${
                      isDark ? "dark" : "light"
                    }`}
                  >
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      className={`w-full min-h-[400px] ${
                        isDark ? "bg-[#202124]" : "bg-white"
                      }`}
                      style={{
                        borderStyle: isEditorDragging ? "dashed" : undefined,
                        backgroundColor: isEditorDragging
                          ? isDark
                            ? "#303134"
                            : "#f8fafc"
                          : undefined,
                      }}
                    >
                      <EditorContent
                        editor={editor}
                        className={`prose prose-sm max-w-none px-4 py-4 focus:outline-none ${
                          isDark
                            ? "text-[#e8eaed] prose-invert"
                            : "text-gray-900"
                        }`}
                      />
                    </div>
                    {isEditorDragging && (
                      <div
                        className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
                          isDark ? "text-[#9aa0a6]" : "text-gray-500"
                        }`}
                      >
                        Drop files to attach
                      </div>
                    )}
                  </div>
                </div>

                {/* Link modal */}
                {showLinkModal && (
                  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">
                          Insert Link
                        </h3>
                        <button
                          onClick={() => setShowLinkModal(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-600">Text</label>
                          <input
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-200"
                            placeholder="Visible text"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">URL</label>
                          <input
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-200"
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          onClick={() => setShowLinkModal(false)}
                          className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={applyHyperlink}
                          className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Insert
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {attachedFiles.length > 0 && (
                  <div
                    className={`pt-4 border-t ${
                      isDark ? "border-[#3c4043]" : "border-gray-200"
                    }`}
                  >
                    <h3
                      className={`text-sm font-medium mb-2 ${
                        isDark ? "text-[#9aa0a6]" : "text-gray-600"
                      }`}
                    >
                      Attachments ({attachedFiles.length})
                    </h3>
                    <div className="space-y-2">
                      {attachedFiles.map((file) => (
                        <div
                          key={file.id}
                          className={`flex items-center justify-between ${
                            isDark
                              ? "bg-[#303134] border-[#5f6368]"
                              : "bg-gray-50 border-gray-200"
                          } border p-2 rounded`}
                        >
                          <div className="flex items-center space-x-3 truncate">
                            <FileText
                              size={18}
                              className={
                                isDark
                                  ? "text-[#9aa0a6] flex-shrink-0"
                                  : "text-gray-600 flex-shrink-0"
                              }
                            />
                            <div className="min-w-0">
                              <span
                                className={`text-sm truncate block ${
                                  isDark ? "text-[#e8eaed]" : "text-gray-900"
                                }`}
                              >
                                {file.name}
                              </span>
                              <span
                                className={`text-xs ${
                                  isDark ? "text-[#9aa0a6]" : "text-gray-500"
                                }`}
                              >
                                {formatFileSize(file.size)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(file.id)}
                            className={`p-1 ml-2 rounded transition-colors flex-shrink-0 ${
                              isDark
                                ? "text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#202124]"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant Panel - Mobile: Full screen overlay, Desktop: Side panel */}
        {showAssistant && (
          <>
            {/* Mobile Overlay */}
            <div 
              className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
              onClick={() => setShowAssistant(false)}
            />
            <div className={`fixed lg:relative lg:z-auto inset-0 lg:inset-auto top-0 left-0 right-0 bottom-0 lg:top-auto lg:left-auto lg:right-auto lg:bottom-auto w-full lg:w-96 ${isDark ? 'bg-[#18181b]' : 'bg-white'} border-l border-gray-200 flex flex-col shadow-xl lg:shadow-none flex-shrink-0 z-50 lg:z-auto`}>
              <div className={`p-4 border-b ${isDark ? 'border-[#2E2E2E]' : 'border-gray-200'} flex items-center justify-between flex-shrink-0`}>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                    <Bot size={16} className="text-white" />
                  </div>
                  <span className={`font-bold ${isDark ? 'text-[#f3f4f6]' : 'text-gray-800'}`}>
                    AI Writing Assistant
                  </span>
                </div>
                <button
                  onClick={() => setShowAssistant(false)}
                  className={`${isDark ? 'text-[#9aa0a6] hover:text-[#f3f4f6] hover:bg-[#232326]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} p-1 rounded-full transition-colors`}
                  aria-label="Close assistant"
                >
                  <X size={20} />
                </button>
              </div>

            <div className={`p-4 border-b ${isDark ? 'border-[#2E2E2E]' : 'border-gray-100'} flex-shrink-0`}>
              <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-[#f3f4f6]' : 'text-gray-700'}`}>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {["improve", "formal", "casual", "template"].map((action) => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    className={`flex items-center space-x-2 px-3 py-2 ${isDark ? 'bg-[#232326] hover:bg-[#2E2E2E] border-[#2E2E2E] text-[#f3f4f6]' : 'bg-gray-50 hover:bg-blue-100/50 border-gray-200 text-gray-700'} border rounded-xl transition-colors text-left text-sm font-medium shadow-sm active:scale-95`}
                  >
                    {action === "improve" && (
                      <Edit3 size={16} className="text-blue-500" />
                    )}
                    {action === "formal" && (
                      <Type size={16} className="text-blue-500" />
                    )}
                    {action === "casual" && (
                      <MessageSquare size={16} className="text-blue-500" />
                    )}
                    {action === "template" && (
                      <Layout size={16} className="text-blue-500" />
                    )}
                    <span className="capitalize">{action}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-4 flex-1 overflow-y-auto space-y-4 ${isDark ? 'bg-[#18181b]' : ''}`}>
              {assistantMessages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[85%] ${
                    message.isAssistant
                      ? isDark 
                        ? "bg-[#232326] rounded-bl-xl rounded-tr-xl rounded-br-xl self-start"
                        : "bg-gray-100 rounded-bl-xl rounded-tr-xl rounded-br-xl self-start"
                      : "bg-blue-500 text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl ml-auto"
                  } rounded-xl p-3 shadow-sm`}
                  style={{ wordBreak: "break-word" }}
                >
                  <p
                    className={`text-sm ${
                      message.isAssistant 
                        ? isDark ? "text-[#f3f4f6]" : "text-gray-800"
                        : "text-white"
                    } whitespace-pre-wrap`}
                  >
                    {message.text}
                  </p>
                  <span
                    className={`text-xs mt-1 block ${
                      message.isAssistant 
                        ? isDark ? "text-[#9aa0a6]" : "text-gray-500"
                        : "text-blue-200"
                    } text-right`}
                  >
                    {message.time}
                  </span>
                </div>
              ))}

              {isAssistantTyping && (
                <div className={`max-w-[85%] ${isDark ? 'bg-[#232326]' : 'bg-gray-100'} rounded-bl-xl rounded-tr-xl rounded-br-xl p-3 shadow-sm flex items-center space-x-2`}>
                  <Bot size={16} className="text-blue-500 animate-pulse" />
                  <span className={`text-sm ${isDark ? 'text-[#9aa0a6]' : 'text-gray-600'}`}>
                    Assistant is typing...
                  </span>
                </div>
              )}
            </div>

            <div className={`p-4 border-t ${isDark ? 'border-[#2E2E2E] bg-[#18181b]' : 'border-gray-200 bg-white'} flex-shrink-0`}>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && sendAssistantMessage()
                  }
                  placeholder="Ask for help with your email..."
                  className={`flex-1 px-4 py-3 border-2 ${isDark ? 'border-[#2E2E2E] bg-[#232326] text-[#f3f4f6] placeholder-[#9aa0a6] focus:border-blue-500 focus:ring-blue-500/20' : 'border-gray-200 text-gray-700 focus:ring-blue-50 focus:border-blue-500'} rounded-xl focus:outline-none focus:ring-4 text-sm transition-all`}
                  disabled={isAssistantTyping}
                />
                <button
                  onClick={sendAssistantMessage}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-3 rounded-xl transition-all shadow-md flex items-center justify-center disabled:opacity-50 active:scale-95"
                  disabled={isAssistantTyping || !assistantInput.trim()}
                >
                  <Send size={18} />
                </button>
                <button
                  onClick={() => {
                    const last = [...assistantMessages]
                      .reverse()
                      .find((m) => m.isAssistant);
                    if (!last) {
                      toast.error("No assistant reply to insert");
                      return;
                    }
                    const subjectMatch =
                      last.text.match(/\bSubject\s*:\s*(.+)/i);
                    const contentMatch = last.text.match(
                      /\bContent\s*:\s*([\s\S]*)/i
                    );
                    if (subjectMatch && subjectMatch[1])
                      setSubject(subjectMatch[1].trim());
                    const raw = contentMatch
                      ? contentMatch[1].trim()
                      : last.text;
                    const html = raw
                      .split(/\n\n+/)
                      .map((block) => block.trim())
                      .filter(Boolean)
                      .map((b) =>
                        /^(\-|\*|\d+\.)\s/.test(b)
                          ? `<ul>${b
                              .split(/\n/)
                              .map((l) =>
                                l.replace(/^\s*(\-|\*|\d+\.)\s+/, "").trim()
                              )
                              .filter(Boolean)
                              .map((i) => `<li>${i}</li>`)
                              .join("")}</ul>`
                          : `<p>${b.replace(/\n/g, "<br/>")}</p>`
                      )
                      .join("");
                    editor?.chain().focus().setContent(html).run();
                    toast.success("Inserted into editor");
                  }}
                  className="px-4 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all shadow-sm"
                  title="Insert last assistant reply into subject and body"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
          </>
        )}

        {!showAssistant && (
          <button
            onClick={() => setShowAssistant(true)}
            className="fixed right-6 bottom-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 hidden lg:block z-20"
            title="Open AI Assistant"
          >
            <Bot size={24} />
          </button>
        )}
      </div>

      {showAlert && scanResult && (
        <PhishingAlert
          scanResult={scanResult}
          onReview={handleReview}
          onSendAnyway={handleSendAnyway}
        />
      )}
    </div>
  );
};

export default EmailEditor;
