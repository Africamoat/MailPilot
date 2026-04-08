"use client";

import { useState } from "react";

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

export function ImportModal({ open, onClose, onImported }: ImportModalProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!open) return null;

  async function handleImport() {
    setLoading(true);
    setMessage("");
    try {
      let body: string;
      let headers: Record<string, string> = {};

      // Try JSON first
      try {
        JSON.parse(text);
        body = text;
        headers["Content-Type"] = "application/json";
      } catch {
        // Treat as CSV
        body = text;
        headers["Content-Type"] = "text/csv";
      }

      const res = await fetch("/api/import", { method: "POST", headers, body });
      const data = await res.json();

      if (!res.ok) {
        setMessage(`Erreur: ${data.error}`);
      } else {
        setMessage(`${data.imported} contact(s) importé(s) sur ${data.total}`);
        onImported();
      }
    } catch {
      setMessage("Erreur lors de l'import");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
        <h2 className="text-lg font-semibold mb-4">Importer des contacts</h2>
        <p className="text-sm text-gray-500 mb-2">
          Collez du JSON ou CSV (colonnes: name, email, company, country)
        </p>
        <textarea
          className="w-full border rounded-lg p-3 h-48 text-sm font-mono"
          placeholder={`[{"name":"Abou","email":"abou@gmail.com","company":"Aeroby","country":"Côte d'Ivoire"}]`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {message && (
          <p
            className={`text-sm mt-2 ${message.startsWith("Erreur") ? "text-red-600" : "text-green-600"}`}
          >
            {message}
          </p>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Fermer
          </button>
          <button
            onClick={handleImport}
            disabled={loading || !text.trim()}
            className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Import..." : "Importer"}
          </button>
        </div>
      </div>
    </div>
  );
}
