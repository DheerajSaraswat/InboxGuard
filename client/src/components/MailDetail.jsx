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
    <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex justify-center items-center z-50 px-4">
      {/* Click outside to close */}
      <button
        onClick={handleClose}
        className="absolute inset-0 bg-transparent"
        aria-label="close overlay"
      ></button>

      {/* Mail container */}
      <div
        className={`relative w-full sm:w-[600px] md:w-[700px] max-h-[90vh] bg-card shadow-2xl border border-border flex flex-col rounded-2xl 
        transform transition-transform duration-300 ease-out overflow-hidden
        ${isClosing ? "animate-slideOutRight" : "animate-slideInRight"}`}
      >
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={handleClose}
              className="p-2 rounded-md hover:bg-muted transition md:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button className="p-2 rounded-md hover:bg-muted transition">
              <Reply className="w-4 h-4" />
            </button>

            <button className="p-2 rounded-md hover:bg-muted transition">
              <Forward className="w-4 h-4" />
            </button>

            <button className="p-2 rounded-md hover:bg-muted transition">
              <Star
                className={
                  email.isStarred
                    ? "w-4 h-4 fill-yellow-400 text-yellow-400"
                    : "w-4 h-4"
                }
              />
            </button>

            <button
              onClick={onDelete}
              className="p-2 rounded-md hover:bg-destructive/10 ml-auto transition"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          </div>

          {/* Subject */}
          <h1 className="text-2xl font-semibold mb-2">{email.subject}</h1>

          {/* Sender Info */}
          <div className="flex items-center gap-3">
            <img
              src={email.from?.displayImage}
              alt={email.from?.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="font-medium">{email.from?.email}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(email.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div
            className="prose prose-sm max-w-none text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: email.body }}
          />
        </div>
      </div>
    </div>
  );
}

