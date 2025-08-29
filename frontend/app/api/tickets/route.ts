import { supabase } from "@/lib/supabaseClient";
import { categorizeTicket } from "@/lib/aiCategorizer";

export async function POST(req: Request) {
  const { customer_id, message } = await req.json();

  // 1. Insert ticket
  const { data, error } = await supabase
    .from("tickets")
    .insert([{ customer_id, message }])
    .select()
    .single();

  if (error) return new Response(JSON.stringify({ error }), { status: 400 });

  // 2. AI categorization
  const category = await categorizeTicket(message);

  // 3. Update ticket with AI category
  await supabase
    .from("tickets")
    .update({ category, ai_status: "categorized" })
    .eq("id", data.id);

  return new Response(JSON.stringify({ ...data, category }), { status: 201 });
}
