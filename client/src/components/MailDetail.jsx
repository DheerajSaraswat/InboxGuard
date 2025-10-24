import React, { useCallback, useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getLocalPrivateKey, rsaDecryptBase64, importAesKeyFromRaw } from "../utils/crypto";
import {
  ChevronDown,
  Trash2,
  ArrowLeft,
  Reply,
  Forward,
  Star,
} from "lucide-react";

export default function MailDetail({ email, onBack, onDelete }) {
  const [isClosing, setIsClosing] = useState(false);
  console.log(email);
  if (!email) return null;

  // Handle close with slide-out animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onBack();
      setIsClosing(false);
    }, 300); // matches CSS animation duration
  };

  return (
    <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50">
      {/* Click outside to close */}
      <button
        onClick={handleClose}
        className="absolute inset-0 bg-transparent"
        aria-label="close overlay"
      ></button>

      {/* Mail container - Gmail style from bottom right */}
      <div
        className={`fixed bottom-4 right-4 w-[400px] h-[600px] sm:w-[450px] sm:h-[650px] md:w-[500px] md:h-[700px] bg-card shadow-2xl border border-border flex flex-col rounded-2xl 
        transform transition-all duration-300 ease-out overflow-hidden
        ${isClosing ? "animate-slideOutToBottom" : "animate-slideInFromBottom"}`}
        style={{ maxHeight: "calc(100vh - 2rem)", maxWidth: "calc(100vw - 2rem)" }}
      >
        {/* Header */}
        <div className="border-b border-border p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-md hover:bg-muted transition">
                <Reply className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-md hover:bg-muted transition">
                <Forward className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-md hover:bg-muted transition">
                <Star
                  className={
                    email.isStarred
                      ? "w-4 h-4 fill-yellow-400 text-yellow-400"
                      : "w-4 h-4"
                  }
                />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onDelete}
                className="p-1.5 rounded-md hover:bg-destructive/10 transition"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-md hover:bg-muted transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subject */}
          <h1 className="text-lg font-semibold mb-2 truncate">{email.subject}</h1>

          {/* Sender Info */}
          <div className="flex items-center gap-2">
            <img
              src={email.from?.displayImage}
              alt={email.from?.username}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{email.from?.email}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(email.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <div
            className="prose prose-sm max-w-none text-foreground leading-relaxed text-sm"
            dangerouslySetInnerHTML={{ __html: email.body }}
          />
        </div>
      </div>
    </div>
  );
}

