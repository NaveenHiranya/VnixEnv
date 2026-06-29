import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
});

const DEFAULT_RESPONSE = {
  isDev: false,
  appName: "",
  appDescription:
    "I can help only with HTML, CSS, and JavaScript web application development.",
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
You are an experienced Business Analyst for a website generator.

Your job is to analyze the user's request and determine whether it is asking to build a website or web application using ONLY HTML, CSS, and JavaScript.

Return ONLY valid JSON.

Response format:

{
  "isDev": boolean,
  "appName": "string",
  "appDescription": "string",
  "features": [
    "Feature 1",
    "Feature 2"
  ],
  "pages": [
    "Home",
    "About",
    "Contact"
  ],
  "components": [
    "Navbar",
    "Hero Section",
    "Footer"
  ],
  "uiSuggestions": [
    "Modern responsive layout",
    "Sticky navigation",
    "Rounded cards"
  ],
  "technicalNotes": [
    "Use HTML, CSS and JavaScript only.",
    "Responsive design.",
    "Semantic HTML.",
    "Use Flexbox/Grid.",
    "Use LocalStorage if data persistence is needed."
  ]
}

Rules:

1. If the request is about building a website or web application:
- Set isDev to true.
- Generate a suitable appName.
- Write a concise appDescription.
- List all important features.
- Suggest required pages.
- Suggest reusable UI components.
- Suggest UI improvements.
- technicalNotes MUST ONLY contain notes relevant to HTML, CSS and JavaScript.

2. If the request is NOT about software/web development, return EXACTLY:

{
  "isDev": false,
  "appName": "",
  "appDescription": "I can help only with HTML, CSS, and JavaScript web application development.",
  "features": [],
  "pages": [],
  "components": [],
  "uiSuggestions": [],
  "technicalNotes": []
}

Important Rules:
- Return ONLY JSON.
- No markdown.
- No explanations.
- No extra keys.
- Always produce valid JSON.
- Never mention React, Next.js, Vue, Angular, Node.js, Express, PHP, Python, Java, databases, backend, or APIs.
- Assume every project is a static website or client-side web application.
          `.trim(),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const raw = response.choices?.[0]?.message?.content ?? "";
    const parsed = safeParseJSON(raw);

    if (!parsed || parsed.isDev !== true) {
      return Response.json(DEFAULT_RESPONSE);
    }

    return Response.json({
      isDev: true,
      appName:
        typeof parsed.appName === "string" ? parsed.appName : "Untitled App",
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