import { getSupabase } from "@/lib/supabase";
import { isValidEmail, nameFromEmail, companyFromEmail } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

interface ImportContact {
  name?: string;
  email: string;
  company?: string;
  country?: string;
  notes?: string;
}

function parseCSV(text: string): ImportContact[] {
  const lines = text.trim().split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const firstLine = lines[0].toLowerCase();

  // Check if first line looks like a header
  const hasHeader = firstLine.includes("email") || firstLine.includes("name") || firstLine.includes("company");

  // If no header and each line looks like a single email, treat as email list
  if (!hasHeader) {
    const allEmails = lines.every((l) => l.includes("@") && !l.includes(","));
    if (allEmails) {
      return lines.map((email) => ({ email: email.trim() }));
    }
  }

  if (!hasHeader || lines.length < 2) {
    // Try as plain email list separated by commas
    const emails = text.split(/[,;\n]/).map((e) => e.trim()).filter((e) => e.includes("@"));
    if (emails.length > 0) {
      return emails.map((email) => ({ email }));
    }
    return [];
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const contacts: ImportContact[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] || "";
    });
    if (obj.email) {
      contacts.push({
        name: obj.name || undefined,
        email: obj.email,
        company: obj.company || undefined,
        country: obj.country || undefined,
        notes: obj.notes,
      });
    }
  }

  return contacts;
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  let contacts: ImportContact[] = [];

  if (contentType.includes("text/csv")) {
    const text = await req.text();
    contacts = parseCSV(text);
  } else {
    const body = await req.json();
    contacts = Array.isArray(body) ? body : body.contacts || [];
  }

  if (contacts.length === 0) {
    return NextResponse.json({ error: "Aucun contact à importer" }, { status: 400 });
  }

  const invalid = contacts.filter((c) => !isValidEmail(c.email));
  if (invalid.length > 0) {
    return NextResponse.json(
      {
        error: `Emails invalides: ${invalid.map((c) => c.email).join(", ")}`,
      },
      { status: 400 }
    );
  }

  const rows = contacts.map((c) => ({
    name: c.name || nameFromEmail(c.email),
    email: c.email.toLowerCase().trim(),
    company: c.company || companyFromEmail(c.email),
    country: c.country || "",
    notes: c.notes || null,
    status: "not_contacted" as const,
    has_replied: false,
    follow_up_count: 0,
  }));

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("contacts")
    .upsert(rows, { onConflict: "email", ignoreDuplicates: true })
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    imported: data?.length || 0,
    total: contacts.length,
  });
}
