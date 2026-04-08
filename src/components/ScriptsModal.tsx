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

// Convert HTML to plain text for editing
function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<\/?p>/gi, "")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .trim();
}

// Convert plain text back to HTML for sending
function textToHtml(text: string): string {
  return text
    .split("\n\n")
    .map((paragraph) => {
      const formatted = paragraph
        .replace(/\n/g, "<br>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return `<p>${formatted}</p>`;
    })
    .join("");
}

// Preview: replace variables with example values
function previewText(text: string): string {
  return text
    .replace(/\{\{name\}\}/g, "Aboubacar")
    .replace(/\{\{company\}\}/g, "Aeroby")
    .replace(/\{\{country\}\}/g, "Côte d'Ivoire");
}

export function ScriptsModal({ open, onClose }: ScriptsModalProps) {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [editTexts, setEditTexts] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState("");

  const defaultScripts: Script[] = [
    {
      id: "new_0",
      script_order: 0,
      name: "Premier contact",
      subject: "Collaboration avec {{company}}",
      body: "<p>Bonjour {{name}},</p><p>Je vois que <strong>{{company}}</strong> est basé en {{country}} et je serais ravi d'échanger avec vous sur une potentielle collaboration.</p><p>Seriez-vous disponible pour un bref appel cette semaine ?</p><p>Cordialement</p>",
    },
    {
      id: "new_1",
      script_order: 1,
      name: "Relance 1",
      subject: "Re: Collaboration avec {{company}}",
      body: "<p>Bonjour {{name}},</p><p>Je me permets de relancer mon précédent message concernant une collaboration avec <strong>{{company}}</strong>.</p><p>N'hésitez pas à me faire signe si vous êtes intéressé.</p><p>Cordialement</p>",
    },
    {
      id: "new_2",
      script_order: 2,
      name: "Relance 2 (dernière)",
      subject: "Dernière tentative — {{company}}",
      body: "<p>Bonjour {{name}},</p><p>C'est ma dernière tentative pour vous joindre. Si le timing n'est pas bon, je comprendrai tout à fait.</p><p>Si vous souhaitez en discuter plus tard, n'hésitez pas à revenir vers moi.</p><p>Bonne continuation à <strong>{{company}}</strong>.</p><p>Cordialement</p>",
    },
  ];

  useEffect(() => {
    if (open && scripts.length === 0) {
      setFetching(true);
      fetch("/api/scripts")
        .then((r) => r.json())
        .then((data) => {
          const loaded =
            Array.isArray(data) && data.length > 0 ? data : defaultScripts;
          setScripts(loaded);
          setEditTexts(loaded.map((s: Script) => htmlToText(s.body)));
        })
        .catch(() => {
          setScripts(defaultScripts);
          setEditTexts(defaultScripts.map((s) => htmlToText(s.body)));
        })
        .finally(() => setFetching(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  function updateBody(index: number, text: string) {
    const newTexts = [...editTexts];
    newTexts[index] = text;
    setEditTexts(newTexts);

    const updated = [...scripts];
    updated[index] = { ...updated[index], body: textToHtml(text) };
    setScripts(updated);
  }

  function updateField(index: number, field: "name" | "subject", value: string) {
    const updated = [...scripts];
    updated[index] = { ...updated[index], [field]: value };
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
  const currentText = editTexts[activeTab] || "";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Templates d&apos;emails</h2>

        <p className="text-sm text-gray-500 mb-4">
          Variables : <code className="bg-gray-100 px-1 rounded">{"{{name}}"}</code>{" "}
          <code className="bg-gray-100 px-1 rounded">{"{{company}}"}</code>{" "}
          <code className="bg-gray-100 px-1 rounded">{"{{country}}"}</code>
          {" "}&middot;{" "}
          Gras : <code className="bg-gray-100 px-1 rounded">**texte**</code>
          {" "}&middot;{" "}
          Saut de ligne : Entrée, Nouveau paragraphe : double Entrée
        </p>

        {fetching ? (
          <p className="text-gray-400 py-8 text-center">Chargement...</p>
        ) : scripts.length === 0 ? (
          <p className="text-gray-400 py-8 text-center">Aucun template</p>
        ) : (
          <>
            <div className="flex gap-1 mb-4 border-b">
              {scripts.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => { setActiveTab(i); setShowPreview(false); }}
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
                    onChange={(e) => updateField(activeTab, "name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Objet de l&apos;email
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={current.subject}
                    onChange={(e) => updateField(activeTab, "subject", e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium">
                      Contenu
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {showPreview ? "Modifier" : "Aperçu"}
                    </button>
                  </div>

                  {showPreview ? (
                    <div className="w-full border rounded-lg px-4 py-3 text-sm bg-gray-50 min-h-[200px] prose prose-sm max-w-none">
                      <p className="text-xs text-gray-400 mb-2">
                        Objet : {previewText(current.subject)}
                      </p>
                      <hr className="mb-2" />
                      <div
                        dangerouslySetInnerHTML={{
                          __html: previewText(current.body),
                        }}
                      />
                    </div>
                  ) : (
                    <textarea
                      className="w-full border rounded-lg px-3 py-2 text-sm h-48 leading-relaxed"
                      placeholder={`Bonjour {{name}},\n\nVotre message ici...\n\nCordialement`}
                      value={currentText}
                      onChange={(e) => updateBody(activeTab, e.target.value)}
                    />
                  )}
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
