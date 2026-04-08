"use client";

import { useRef, useState } from "react";

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

function parseExcelCSV(text: string): string {
  // Handle semicolon-separated (European Excel export)
  if (text.includes(";") && !text.includes(",")) {
    return text.replace(/;/g, ",");
  }
  return text;
}

export function ImportModal({ open, onClose, onImported }: ImportModalProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setMessage("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (file.name.endsWith(".csv") || file.name.endsWith(".txt")) {
        setText(parseExcelCSV(content));
      } else if (file.name.endsWith(".json")) {
        setText(content);
      } else {
        setMessage(
          "Format non supporté. Utilisez .csv ou .json. Pour Excel, exportez d'abord en CSV."
        );
      }
    };
    reader.readAsText(file);
  }

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

        {/* File upload */}
        <div className="mb-4">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.json,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition"
          >
            <p className="text-sm font-medium text-gray-700">
              {fileName || "Cliquez pour choisir un fichier"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              CSV, JSON (seul l&apos;email est obligatoire)
            </p>
          </button>
        </div>

        <div className="relative mb-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-400">ou collez directement</span>
          </div>
        </div>

        <textarea
          className="w-full border rounded-lg p-3 h-32 text-sm font-mono"
          placeholder={`email\nrfk@entreprise.com\nseydi@africamoat.com\njean@company.fr`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 mt-2">
          <strong>Astuce :</strong> Seul l&apos;email est obligatoire. Le nom est extrait
          automatiquement (rfk@entreprise.com &rarr; Rfk) et l&apos;entreprise aussi
          (rfk@entreprise.com &rarr; Entreprise). Vous pouvez aussi fournir les colonnes :
          email, name, company, country.
        </div>

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
