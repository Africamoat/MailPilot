import { getSupabase } from "./supabase";

export interface EmailScript {
  id: string;
  script_order: number;
  name: string;
  subject: string;
  body: string;
}

// Fallback scripts if DB is empty
const fallbackScripts: EmailScript[] = [
  {
    id: "fallback_0",
    script_order: 0,
    name: "Premier contact",
    subject: "Collaboration avec {{company}}",
    body: `<p>Bonjour {{name}},</p><p>Je vois que <strong>{{company}}</strong> est basé en {{country}} et je serais ravi d'échanger avec vous.</p><p>Cordialement</p>`,
  },
  {
    id: "fallback_1",
    script_order: 1,
    name: "Relance 1",
    subject: "Re: Collaboration avec {{company}}",
    body: `<p>Bonjour {{name}},</p><p>Je me permets de relancer mon précédent message concernant <strong>{{company}}</strong>.</p><p>Cordialement</p>`,
  },
  {
    id: "fallback_2",
    script_order: 2,
    name: "Relance 2 (dernière)",
    subject: "Dernière tentative — {{company}}",
    body: `<p>Bonjour {{name}},</p><p>C'est ma dernière tentative pour vous joindre.</p><p>Bonne continuation à <strong>{{company}}</strong>.</p><p>Cordialement</p>`,
  },
];

export async function getScripts(): Promise<EmailScript[]> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("email_scripts")
      .select("*")
      .order("script_order", { ascending: true });

    if (data && data.length > 0) return data;
  } catch {
    // fallback
  }
  return fallbackScripts;
}

export async function getScriptByFollowUpCount(
  count: number
): Promise<EmailScript> {
  const scripts = await getScripts();
  if (count >= scripts.length) return scripts[scripts.length - 1];
  return scripts[count];
}
