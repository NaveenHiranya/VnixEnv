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
    const body = await req.json();

    const appName = body?.appName ?? "Untitled App";
    const features = Array.isArray(body?.features) ? body.features : [];

    const featureText =
      features.length > 0
        ? features.map((f: string) => `- ${f}`).join("\n")
        : "- Basic UI";

    const systemPrompt = `
You are a senior frontend engineer.

STRICT RULES:
- Output ONLY a complete working HTML document
- Must start with <!doctype html> or <html>
- Must end with </html>
- No markdown
- No explanations
- No backticks
- No JSON
- No extra text outside HTML
- Must be safe to render inside an iframe
`;

    const userPrompt = `
Create a single-file web app.

App name: ${appName}

Features:
${featureText}

Requirements:
- Fully working UI
- Use modern HTML, CSS, JS (no frameworks unless necessary)
- Responsive design
- Clean UI
`;

    const response = await client.chat.completions.create({
      model: "qwen2.5-coder",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
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