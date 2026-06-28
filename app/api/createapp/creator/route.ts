import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const appName = body?.appName ?? "";
    const features = Array.isArray(body?.features) ? body.features : [];

    const featureText = features.map((f: any) => `- ${f}`).join("\n");

    const aiPrompt = `
Build a SINGLE FILE HTML web application.

App Name: ${appName}

Features:
${featureText}

IMPORTANT:
- Return ONLY HTML code
- No explanations
- No markdown
- No JSON
- No backticks
- Must be full working HTML file
`;

    const response = await client.chat.completions.create({
      model: "qwen2.5-coder",
      messages: [
        {
          role: "system",
          content: `You are a senior frontend developer.

You ONLY output raw HTML code.

No markdown.
No any sign or letter out of <html> tag in your output.
No explanations.
No JSON.
No backticks.`,
        },
        {
          role: "user",
          content: aiPrompt,
        },
      ],
      stream: false,
    });

    const html = response.choices[0].message.content ?? "";

    console.log("HTML OUTPUT:", html);

    // 🚀 return RAW HTML string
    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (err) {
    console.error(err);

    return new Response("Error generating HTML", { status: 500 });
  }
}