import { getSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
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
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sender_email, sender_name } = body;

    if (!sender_email || !sender_name) {
      return NextResponse.json(
        { error: "sender_email et sender_name requis" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Update existing rows
    const { error: err1 } = await supabase
      .from("settings")
      .update({ value: sender_email, updated_at: new Date().toISOString() })
      .eq("key", "sender_email");

    if (err1) {
      return NextResponse.json({ error: err1.message }, { status: 500 });
    }

    const { error: err2 } = await supabase
      .from("settings")
      .update({ value: sender_name, updated_at: new Date().toISOString() })
      .eq("key", "sender_name");

    if (err2) {
      return NextResponse.json({ error: err2.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
