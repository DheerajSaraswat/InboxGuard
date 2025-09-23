import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

const ToolbarButton = ({ onClick, active, icon: Icon, label, isDark }) => (
  <motion.button
    onClick={onClick}
    title={label}
    whileTap={{ scale: 0.9 }} // tap feedback
    animate={active ? { scale: 0.95, y: 1 } : { scale: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 400, damping: 20 }}
    className={`p-2 rounded-md flex items-center justify-center border
      ${
        active
          ? isDark
            ? "bg-blue-900/60 border-blue-600 text-blue-400 shadow-inner"
            : "bg-blue-100 border-blue-400 text-blue-600 shadow-inner"
          : isDark
          ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600"
          : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200 hover:border-gray-300"
      }`}
  >
    <Icon size={16} />
  </motion.button>
);

function Toolbar({editor, isDark}) {
  const [forceUpdate, setForceUpdate] = useState(0);

  // 🔥 re-render when editor state changes
  useEffect(() => {
    if (!editor) return;

    const update = () => setForceUpdate((prev) => prev + 1);
    editor.on("transaction", update);

    return () => {
      editor.off("transaction", update);
    };
  }, [editor]);

  if (!editor) return null;
  return (
    <div className="flex gap-2 p-2">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        icon={Bold}
        label="Bold"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        icon={Italic}
        label="Italic"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        icon={UnderlineIcon} // You might want to import Underline icon
        label="Underline"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        icon={Strikethrough}
        label="Strikethrough"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        icon={List}
        label="Bullet List"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        icon={Heading1}
        label="Heading 1"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        icon={Heading2}
        label="Heading 2"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        icon={Quote}
        label="Quote"
      />
    </div>
  );
}
export default Toolbar;
