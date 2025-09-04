// supabase/functions/ai-reply/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { message } = await req.json();
    console.log("✅ Received message:", message);

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful support AI." },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();
    console.log("✅ OpenAI raw response:", JSON.stringify(data, null, 2));

    const reply = data?.choices?.[0]?.message?.content || "⚠️ No reply generated";

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Error in AI function:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
