import { getSupabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/resend";
import { getScriptByFollowUpCount } from "@/lib/scripts";
import { personalize, isToday, addDays } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = getSupabase();

  // Optional: only follow up specific contacts
  const body = await req.json().catch(() => ({}));
  const selectedIds: string[] | undefined = body.ids;

  let query = supabase
    .from("contacts")
    .select("*")
    .in("status", ["contacted", "follow_up"])
    .eq("has_replied", false);

  if (selectedIds && selectedIds.length > 0) {
    query = query.in("id", selectedIds);
  } else {
    query = query.lte("next_follow_up_at", new Date().toISOString());
  }

  const { data: contacts, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!contacts || contacts.length === 0) {
    return NextResponse.json({ sent: 0, message: "Aucun contact à relancer" });
  }

  const eligible = selectedIds
    ? contacts.filter((c) => c.follow_up_count < 3)
    : contacts.filter(
        (c) => !isToday(c.last_contacted_at) && c.follow_up_count < 3
      );
  const batch = eligible.slice(0, 20);
  const results: { email: string; success: boolean; error?: string }[] = [];

  for (const contact of batch) {
    const script = await getScriptByFollowUpCount(contact.follow_up_count);
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

      results.push({ email: contact.email, success: true });
    } catch (err) {
      results.push({
        email: contact.email,
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  const sent = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return NextResponse.json({ sent, failed, total: batch.length, results });
}
