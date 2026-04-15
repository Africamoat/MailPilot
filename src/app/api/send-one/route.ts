import { getSupabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/resend";
import { getScriptByFollowUpCount } from "@/lib/scripts";
import { personalize, addDays } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: contact, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !contact) {
    return NextResponse.json({ error: "Contact introuvable" }, { status: 404 });
  }

  if (contact.has_replied) {
    return NextResponse.json({ error: "Ce contact a déjà répondu" }, { status: 400 });
  }

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
        status: contact.follow_up_count > 0 ? "follow_up" : "contacted",
        last_contacted_at: new Date().toISOString(),
        follow_up_count: contact.follow_up_count + 1,
        next_follow_up_at: addDays(3),
      })
      .eq("id", id);

    return NextResponse.json({ success: true, email: contact.email });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur d'envoi" },
      { status: 500 }
    );
  }
}
