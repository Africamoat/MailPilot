import { Resend } from "resend";
import { getSupabase } from "./supabase";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("Missing RESEND_API_KEY");
    _resend = new Resend(key);
  }
  return _resend;
}

export async function getSenderConfig(): Promise<{
  email: string;
  name: string;
}> {
  const supabase = getSupabase();
  const { data } = await supabase.from("settings").select("key, value");

  const settings: Record<string, string> = {};
  data?.forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value;
  });

  return {
    email: settings["sender_email"] || "onboarding@resend.dev",
    name: settings["sender_name"] || "MailPilot",
  };
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const resend = getResend();
  const sender = await getSenderConfig();

  const { data, error } = await resend.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
