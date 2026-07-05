import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
});

const DEFAULT_RESPONSE = {
  isDev: false,
  message:
    "Sorry, I couldn't process your request. I can answer general questions and help generate HTML, CSS, and JavaScript web applications.",
  appName: "",
  appDescription: "",
  features: [],
  pages: [],
  components: [],
  uiSuggestions: [],
  technicalNotes: [],
};

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
      temperature: 0.2,
      stream: false,
      messages: [
        {
          role: "system",
          content: `
You are an AI assistant for a browser-based web application generator.

Your primary purpose is to help users create web applications using ONLY HTML, CSS, and JavaScript.

Return ONLY valid JSON.

Response format:

{
  "isDev": true,
  "message": "",
  "appName": "",
  "appDescription": "",
  "features": [],
  "pages": [],
  "components": [],
  "uiSuggestions": [],
  "technicalNotes": []
}

Rules

1. Determine whether the user's request is asking for a website or web application.

2. If YES:
- Set "isDev" to true.
- Set "message" to an empty string.
- Generate:
  - appName
  - appDescription
  - features
  - pages
  - components
  - uiSuggestions
  - technicalNotes
- Assume the project must be built using ONLY HTML, CSS, and JavaScript.
- Never mention React, Next.js, Vue, Angular, backend technologies, databases, APIs, servers, or authentication services.

3. If NO:
- Set "isDev" to false.
- Answer the user's question naturally in the "message" field.
- After answering, politely explain that this AI specializes in generating HTML, CSS, and JavaScript web applications.
- Invite the user to describe the application they want to build.
- Leave every other field empty.

Output Rules:
- Return ONLY valid JSON.
- No Markdown.
- No code fences.
- No explanations.
- No extra keys.
`.trim(),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "";

    const parsed = safeParseJSON(raw);

    if (!parsed) {
      return Response.json(DEFAULT_RESPONSE);
    }

    return Response.json({
      isDev: parsed.isDev === true,
      message:
        typeof parsed.message === "string" ? parsed.message : "",
      appName:
        typeof parsed.appName === "string" ? parsed.appName : "",
      appDescription:
        typeof parsed.appDescription === "string"
          ? parsed.appDescription
          : "",
      features: Array.isArray(parsed.features) ? parsed.features : [],
      pages: Array.isArray(parsed.pages) ? parsed.pages : [],
      components: Array.isArray(parsed.components)
        ? parsed.components
        : [],
      uiSuggestions: Array.isArray(parsed.uiSuggestions)
        ? parsed.uiSuggestions
        : [],
      technicalNotes: Array.isArray(parsed.technicalNotes)
        ? parsed.technicalNotes
        : [],
    });
  } catch (error) {
    console.error(error);

    return Response.json(DEFAULT_RESPONSE, {
      status: 500,
    });
  }
}