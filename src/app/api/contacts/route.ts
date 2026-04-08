import { getSupabase } from "@/lib/supabase";
import { nameFromEmail } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country");
  const status = searchParams.get("status");

  const supabase = getSupabase();
  let query = supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (country) query = query.eq("country", country);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, company, country, notes } = body;

  if (!email) {
    return NextResponse.json(
      { error: "email is required" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      name: name || nameFromEmail(email),
      email: email.toLowerCase().trim(),
      company: company || "",
      country: country || "",
      notes: notes || null,
      status: "not_contacted",
      has_replied: false,
      follow_up_count: 0,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Ce contact existe déjà" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
