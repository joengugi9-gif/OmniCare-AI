import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
});

export async function categorizeTicket(message: string) {
  const prompt = `Categorize this customer message into one of the following:
  - General Inquiry
  - Order Issue
  - Technical Support
  - Billing

  Message: "${message}"
  Reply with only the category name.`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return res.choices[0].message.content?.trim() || "General Inquiry";
}
