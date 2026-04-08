"use client";

import { useEffect, useState } from "react";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [senderEmail, setSenderEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) {
      fetch("/api/settings")
        .then((r) => r.json())
        .then((data) => {
          setSenderEmail(data.sender_email || "");
          setSenderName(data.sender_name || "");
        });
    }
  }, [open]);

  if (!open) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_email: senderEmail,
        sender_name: senderName,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(`Erreur: ${data.error}`);
    } else {
      setMessage("Configuration sauvegardée");
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold mb-2">Configuration Email</h2>
        <p className="text-sm text-gray-500 mb-4">
          Connectez votre email professionnel. Assurez-vous que le domaine est
          vérifié dans votre compte Resend.
        </p>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nom d&apos;expéditeur
            </label>
            <input
              required
              placeholder="Ex: John Doe"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Email d&apos;expéditeur
            </label>
            <input
              required
              type="email"
              placeholder="Ex: contact@monentreprise.com"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
            />
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
            <strong>Note :</strong> Pour envoyer depuis votre domaine (ex:
            @votreentreprise.com), ajoutez-le dans{" "}
            <span className="font-mono">Resend &gt; Domains</span> et
            configurez les enregistrements DNS (SPF, DKIM) chez votre
            hébergeur LWS.
          </div>
          {message && (
            <p
              className={`text-sm ${message.startsWith("Erreur") ? "text-red-600" : "text-green-600"}`}
            >
              {message}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Fermer
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
