import { getSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("email_scripts")
    .select("*")
    .order("script_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const scripts = await req.json();

  if (!Array.isArray(scripts)) {
    return NextResponse.json({ error: "Array expected" }, { status: 400 });
  }

  const supabase = getSupabase();

  for (const script of scripts) {
    const { error } = await supabase
      .from("email_scripts")
      .upsert(
        {
          id: script.id,
          script_order: script.script_order,
          name: script.name,
          subject: script.subject,
          body: script.body,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "script_order" }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
