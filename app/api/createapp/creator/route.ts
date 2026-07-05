import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
});

/**
 * Extract only HTML from messy LLM output
 */
function extractHTML(text: string) {
  if (!text) return "";

  // Try to extract full HTML document first
  const htmlMatch = text.match(/<!doctype html[\s\S]*<\/html>/i);
  if (htmlMatch) return htmlMatch[0];

  const htmlTagMatch = text.match(/<html[\s\S]*<\/html>/i);
  if (htmlTagMatch) return htmlTagMatch[0];

  // fallback cleanup
  return text
    .replace(/```html|```/g, "")
    .replace(/```\w+/g, "")
    .trim();
}

export async function POST(req: Request) {
  try {
    const prompt = await req.json();



    const systemPrompt = `
You are a senior frontend engineer.

You will receive a complete application specification from another AI model.

Your task is to implement the specification exactly as described.

Rules:
- Generate ONE complete HTML document.
- Include all CSS inside <style>.
- Include all JavaScript inside <script>.
- Implement every feature described.
- Do not invent unnecessary functionality.
- Use localStorage if persistence is required.
- Make the UI modern, responsive, and user-friendly.
- The output must start with <!DOCTYPE html>.
- The output must end with </html>.
- Do NOT output markdown.
- Do NOT output explanations.
- Do NOT output JSON.
- Return ONLY the HTML document.
`;


    const response = await client.chat.completions.create({
      model: "qwen2.5-coder",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      stream: false,
    });

    const raw = response.choices?.[0]?.message?.content ?? "";

    const html = extractHTML(raw);

    if (!html.includes("<html")) {
      return new Response("Invalid HTML generated", { status: 500 });
    }

    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Error generating HTML", { status: 500 });
  }
}