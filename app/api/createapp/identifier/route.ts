import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
});

function safeParseJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await client.chat.completions.create({
      model: "qwen2.5-coder",
      messages: [
        {
          role: "system",
          content: `
You are an AI intent classifier.

Your job:
Decide whether the user is requesting SOFTWARE DEVELOPMENT.

Return ONLY valid JSON:
{
  "message": "string",
  "isProgram": boolean
}

STRICT RULES:

If user request is about building software, return:
- isProgram: true
- message: rewrite request into a clear software build prompt

If user request is NOT about building software:
- isProgram: false
- message MUST ALWAYS be exactly:
"This model is for developing applications."

SOFTWARE includes:
web apps, mobile apps, APIs, bots, scripts, UI, backend, frontend, AI apps, games, CLI tools, automation, etc.

NOT SOFTWARE:
explanations, learning, debugging theory, definitions, comparisons, general questions, math, writing, or conceptual questions.

OUTPUT RULES:
- Only JSON
- No markdown
- No explanation
- No extra keys
- Always valid JSON
          `.trim(),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      stream: false,
    });

    const raw = response.choices?.[0]?.message?.content ?? "";

    const parsed = safeParseJSON(raw);

    if (!parsed) {
      return Response.json(
        {
          message: "This model is for developing applications.",
          isProgram: false,
        },
        { status: 200 }
      );
    }

    // FORCE RULE ENFORCEMENT (important safety layer)
    if (!parsed.isProgram) {
      return Response.json({
        message: "This model is for developing applications.",
        isProgram: false,
      });
    }

    return Response.json({
      message: parsed.message ?? "Build a web application.",
      isProgram: true,
    });
  } catch (err) {
    console.error(err);

    return Response.json(
      {
        message: "This model is for developing applications.",
        isProgram: false,
      },
      { status: 500 }
    );
  }
}