"use client";

import { useState } from "react";
import { COUNTRIES } from "@/lib/utils";

interface AddContactModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function AddContactModal({
  open,
  onClose,
  onAdded,
}: AddContactModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    country: COUNTRIES[0],
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    setForm({ name: "", email: "", company: "", country: COUNTRIES[0], notes: "" });
    setLoading(false);
    onAdded();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold mb-4">Ajouter un contact</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="Nom"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            required
            type="email"
            placeholder="Email"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            required
            placeholder="Entreprise"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Notes (optionnel)"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Ajout..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
