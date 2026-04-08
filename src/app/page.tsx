"use client";

import { useCallback, useEffect, useState } from "react";
import { Contact } from "@/lib/supabase";
import { COUNTRIES, STATUS_LABELS } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { ImportModal } from "@/components/ImportModal";
import { AddContactModal } from "@/components/AddContactModal";
import { SettingsModal } from "@/components/SettingsModal";
import { ScriptsModal } from "@/components/ScriptsModal";

interface Stats {
  total: number;
  not_contacted: number;
  contacted: number;
  follow_up: number;
  replied: number;
}

export default function Dashboard() {
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filterCountry, setFilterCountry] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scriptsOpen, setScriptsOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Always fetch ALL contacts for stats, then filter client-side
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/contacts");
    const data = await res.json();
    setAllContacts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Client-side filtering
  const filteredContacts = allContacts.filter((c) => {
    if (filterCountry && c.country !== filterCountry) return false;
    if (filterStatus && c.status !== filterStatus) return false;
    return true;
  });

  // Stats always from ALL contacts
  const stats: Stats = {
    total: allContacts.length,
    not_contacted: allContacts.filter((c) => c.status === "not_contacted").length,
    contacted: allContacts.filter((c) => c.status === "contacted").length,
    follow_up: allContacts.filter((c) => c.status === "follow_up").length,
    replied: allContacts.filter((c) => c.status === "replied").length,
  };

  function notify(type: "success" | "error", text: string) {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  }

  async function handleSendNew() {
    if (!confirm(`Contacter les ${stats.not_contacted} nouveau(x) contact(s) ?`)) return;
    setSending(true);
    try {
      const res = await fetch("/api/send", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        notify("error", data.error || "Erreur lors de l'envoi");
      } else if (data.sent === 0) {
        notify("error", data.message || "Aucun contact à contacter");
      } else {
        notify("success", `${data.sent} email(s) envoyé(s), ${data.failed || 0} échoué(s)`);
        fetchContacts();
      }
    } catch {
      notify("error", "Erreur réseau");
    } finally {
      setSending(false);
    }
  }

  async function handleFollowUp() {
    if (!confirm("Relancer tous les contacts en attente ?")) return;
    setSending(true);
    try {
      const res = await fetch("/api/followup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        notify("error", data.error || "Erreur lors de la relance");
      } else if (data.sent === 0) {
        notify("error", data.message || "Aucun contact à relancer");
      } else {
        notify("success", `${data.sent} relance(s) envoyée(s), ${data.failed || 0} échoué(s)`);
        fetchContacts();
      }
    } catch {
      notify("error", "Erreur réseau");
    } finally {
      setSending(false);
    }
  }

  async function markReplied(id: string) {
    const res = await fetch(`/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "replied", has_replied: true }),
    });
    if (res.ok) {
      notify("success", "Marqué comme répondu");
      fetchContacts();
    }
  }

  async function deleteContact(id: string) {
    if (!confirm("Supprimer ce contact ?")) return;
    const res = await fetch(`/api/contact/${id}`, { method: "DELETE" });
    if (res.ok) {
      notify("success", "Contact supprimé");
      fetchContacts();
    }
  }

  async function sendSingle(id: string) {
    const res = await fetch("/api/send-one", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (res.ok) {
      notify("success", `Email envoyé à ${data.email}`);
    } else {
      notify("error", data.error || "Erreur d'envoi");
    }
    fetchContacts();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${
            notification.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {notification.text}
        </div>
      )}

      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">MailPilot</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
            >
              Config Email
            </button>
            <button
              onClick={() => setScriptsOpen(true)}
              className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
            >
              Templates
            </button>
            <button
              onClick={() => setImportOpen(true)}
              className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
            >
              Importer
            </button>
            <button
              onClick={() => setAddOpen(true)}
              className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
            >
              + Contact
            </button>
            <button
              onClick={handleFollowUp}
              disabled={sending}
              className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
            >
              {sending ? "Envoi..." : "Relancer"}
            </button>
            <button
              onClick={handleSendNew}
              disabled={sending}
              className="px-3 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {sending ? "Envoi..." : "Contacter les nouveaux"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Total", value: stats.total, color: "bg-white" },
            { label: "Non contactés", value: stats.not_contacted, color: "bg-gray-50" },
            { label: "Contactés", value: stats.contacted, color: "bg-blue-50" },
            { label: "Relances", value: stats.follow_up, color: "bg-yellow-50" },
            { label: "Répondus", value: stats.replied, color: "bg-green-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} border rounded-lg p-4`}>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <select
            className="border rounded-lg px-3 py-1.5 text-sm"
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
          >
            <option value="">Tous les pays</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="border rounded-lg px-3 py-1.5 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium">Nom</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Entreprise</th>
                  <th className="text-left px-4 py-3 font-medium">Pays</th>
                  <th className="text-left px-4 py-3 font-medium">Statut</th>
                  <th className="text-left px-4 py-3 font-medium">Dernier contact</th>
                  <th className="text-left px-4 py-3 font-medium">Prochaine relance</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      Chargement...
                    </td>
                  </tr>
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      Aucun contact
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-gray-600">{c.email}</td>
                      <td className="px-4 py-3">{c.company}</td>
                      <td className="px-4 py-3">{c.country}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {c.last_contacted_at
                          ? new Date(c.last_contacted_at).toLocaleDateString("fr-FR")
                          : "\u2014"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {c.next_follow_up_at
                          ? new Date(c.next_follow_up_at).toLocaleDateString("fr-FR")
                          : "\u2014"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {c.status !== "replied" && (
                            <>
                              <button
                                onClick={() => sendSingle(c.id)}
                                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                              >
                                Envoyer
                              </button>
                              <button
                                onClick={() => markReplied(c.id)}
                                className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100"
                              >
                                Répondu
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteContact(c.id)}
                            className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={fetchContacts}
      />
      <AddContactModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={fetchContacts}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <ScriptsModal
        open={scriptsOpen}
        onClose={() => setScriptsOpen(false)}
      />
    </div>
  );
}
