import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await client.chat.completions.create({
      model: "qwen2.5-coder",
      messages: [
        {
          role: "system",
          content: `
You are an AI request classifier.

Determine whether the user's message is requesting the creation of a software application.

Return ONLY valid JSON.

Format:
{
  "message": "...",
  "isProgram": true
}

Rules:
- If the user wants to build, generate, create, develop, code, or make an application, website, mobile app, desktop app, API, game, or software, set isProgram to true.
- Otherwise set isProgram to false.
- If isProgram is false, answer the user's question normally in "message".
- If isProgram is true, rewrite the user's software request into a clear development prompt and place it in "message".
- Never return markdown.
- Never wrap the JSON in code fences.
`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
    });

    const content = response.choices[0].message.content ?? "";

    // Parse the AI's JSON response
    const result = JSON.parse(content);

    return Response.json(result);
  } catch (err) {
    console.error(err);

    return Response.json(
      {
        message: "Something went wrong.",
        isProgram: false,
      },
      { status: 500 }
    );
  }
}