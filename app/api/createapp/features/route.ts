import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
});

function cleanAIJson(text: string) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await client.chat.completions.create({
      model: "qwen2.5-coder",
      messages: [
        {
          role: "system",
          content: `You are an expert web application planner.

Your task is to determine whether the user's request can be built as a desktop web application.

Return ONLY valid JSON Do Not add other signs and keywords.

Schema:
{
  "isWebApplication": true,
  "message": "",
  "appName": "",
  "shortDescription": "",
  "features": 
    ""
  
}

Decision Rules

- Set "isWebApplication" to true if the user's request can reasonably be implemented as a desktop web application running in a browser.
- Set "isWebApplication" to false if the request cannot be built as a desktop web application.

Examples of requests that should return false:
- Build an Android app
- Create an iPhone app
- Develop a Windows desktop application
- Make a Linux desktop application
- Build firmware
- Create an operating system
- Develop a device driver
- Build embedded software
- Create a browser
- Build a video editing desktop software

When "isWebApplication" is true:
- "message" should be an empty string.
- Generate a descriptive application name.
- Write a short description (1–2 sentences).
- Generate 5–10 essential MVP features.
- Features should describe user-facing functionality only.
- Infer only reasonable core features.
- Do not invent unnecessary advanced functionality.

When "isWebApplication" is false:
- Generate a helpful message explaining why the request cannot be built as a desktop web application and, if appropriate, suggest how it could be adapted.
- Set:
  - "appName" to an empty string.
  - "shortDescription" to an empty string.
  - "features" list of features as string.

Output Rules
- Return ONLY valid JSON.
- No json keyword.
- No markdown.
- No code fences.
- No explanations.
- No additional text.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
    });

    const content = response.choices[0].message.content ?? "";
    
    console.log(content);
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
        throw new Error("No JSON found in AI response.");
    }

    const cleaned = cleanAIJson(content);
    // Parse the AI's JSON response
    const result = JSON.parse(cleaned);

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