import { getSupabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/resend";
import { getScriptByFollowUpCount } from "@/lib/scripts";
import { personalize, addDays } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("status", "contacted")
    .eq("has_replied", false)
    .lte("next_follow_up_at", now);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!contacts || contacts.length === 0) {
    return NextResponse.json({ followed_up: 0 });
  }

  let sent = 0;

  for (const contact of contacts) {
    if (contact.follow_up_count >= 3) continue;

    const script = getScriptByFollowUpCount(contact.follow_up_count);
    const vars = {
      name: contact.name,
      company: contact.company,
      country: contact.country,
    };

    try {
      await sendEmail({
        to: contact.email,
        subject: personalize(script.subject, vars),
        html: personalize(script.body, vars),
      });

      await supabase
        .from("contacts")
        .update({
          status: "follow_up",
          last_contacted_at: new Date().toISOString(),
          follow_up_count: contact.follow_up_count + 1,
          next_follow_up_at: addDays(3),
        })
        .eq("id", contact.id);

      sent++;
    } catch (err) {
      console.error(`Failed to follow up ${contact.email}:`, err);
    }
  }

  return NextResponse.json({ followed_up: sent, total: contacts.length });
}
