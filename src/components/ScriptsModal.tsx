"use client";

import { useEffect, useState } from "react";

interface Script {
  id: string;
  script_order: number;
  name: string;
  subject: string;
  body: string;
}

interface ScriptsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ScriptsModal({ open, onClose }: ScriptsModalProps) {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) {
      fetch("/api/scripts")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setScripts(data);
          }
        });
    }
  }, [open]);

  if (!open) return null;

  function updateScript(index: number, field: keyof Script, value: string) {
    const updated = [...scripts];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[index] as any)[field] = value;
    setScripts(updated);
  }

  async function handleSave() {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/scripts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scripts),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(`Erreur: ${data.error}`);
    } else {
      setMessage("Templates sauvegardés");
    }
    setLoading(false);
  }

  const current = scripts[activeTab];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Templates d&apos;emails</h2>

        <p className="text-sm text-gray-500 mb-4">
          Variables disponibles : <code className="bg-gray-100 px-1 rounded">{"{{name}}"}</code>{" "}
          <code className="bg-gray-100 px-1 rounded">{"{{company}}"}</code>{" "}
          <code className="bg-gray-100 px-1 rounded">{"{{country}}"}</code>
        </p>

        {scripts.length === 0 ? (
          <p className="text-gray-400 py-8 text-center">Chargement...</p>
        ) : (
          <>
            <div className="flex gap-1 mb-4 border-b">
              {scripts.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActiveTab(i)}
                  className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
                    activeTab === i
                      ? "border-black text-black"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {current && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nom du template
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={current.name}
                    onChange={(e) =>
                      updateScript(activeTab, "name", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Objet de l&apos;email
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={current.subject}
                    onChange={(e) =>
                      updateScript(activeTab, "subject", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Contenu (HTML)
                  </label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono h-48"
                    value={current.body}
                    onChange={(e) =>
                      updateScript(activeTab, "body", e.target.value)
                    }
                  />
                </div>
              </div>
            )}
          </>
        )}

        {message && (
          <p
            className={`text-sm mt-3 ${message.startsWith("Erreur") ? "text-red-600" : "text-green-600"}`}
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
            onClick={handleSave}
            disabled={loading || scripts.length === 0}
            className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
}
