import { getSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("settings").select("key, value");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settings: Record<string, string> = {};
  data?.forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value;
  });

  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sender_email, sender_name } = body;

  if (!sender_email || !sender_name) {
    return NextResponse.json(
      { error: "sender_email et sender_name requis" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  const updates = [
    { key: "sender_email", value: sender_email },
    { key: "sender_name", value: sender_name },
  ];

  for (const u of updates) {
    const { error } = await supabase
      .from("settings")
      .upsert(
        { key: u.key, value: u.value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
