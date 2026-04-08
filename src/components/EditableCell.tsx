"use client";

import { useState, useRef, useEffect } from "react";

interface EditableCellProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function EditableCell({
  value,
  onSave,
  className = "",
  placeholder = "",
}: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function handleSave() {
    setEditing(false);
    if (text !== value) {
      onSave(text);
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-black"
        value={text}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") { setText(value); setEditing(false); }
        }}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`cursor-pointer hover:bg-gray-100 rounded px-1 -mx-1 ${className} ${!value ? "text-gray-300 italic" : ""}`}
      title="Cliquer pour modifier"
    >
      {value || placeholder || "—"}
    </span>
  );
}
