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
          content: `You are an AI intent classifier.

Your task is to determine whether the user is asking for a software project to be created.

Return ONLY valid JSON.

Schema:
{
  "message": "string",
  "isProgram": boolean
}

Decision Rules

Set "isProgram": true ONLY if the user's primary intent is to create, build, generate, develop, implement, design, or modify software.

Software includes:
- Websites
- Web applications
- Mobile apps
- Desktop applications
- APIs
- Backend services
- Frontend interfaces
- Games
- Browser extensions
- AI applications
- Bots
- CLI tools
- Scripts
- Automation tools
- Libraries
- Frameworks
- Software architecture
- Database-backed systems

Also return true if the user asks to:
- write code
- generate code
- build a feature
- add functionality
- fix or rewrite an existing application
- refactor an application
- continue developing existing code
- generate project structure
- scaffold an application

Examples that should be true:
- Build a chat app
- Create a todo website
- Generate a React dashboard
- Make a Flutter app
- Build a REST API
- Add login to my website
- Fix this React component
- Rewrite this Express backend
- Create a Discord bot
- Generate a Next.js project
- Build an AI assistant
- Make a calculator in Python

Set "isProgram": false if the user is primarily:
- asking a question
- requesting an explanation
- learning programming
- debugging concepts
- asking about algorithms
- asking about syntax
- requesting documentation
- asking for definitions
- asking for comparisons
- solving math
- translating text
- writing essays
- asking general knowledge questions
- asking about technology without requesting software creation

Examples that should be false:
- What is React?
- Explain Docker.
- How does JWT work?
- Why is my code slow?
- What does this error mean?
- Teach me JavaScript.
- Compare Python and Java.
- What is Git?
- Explain recursion.

Response Rules

If isProgram is true:
- Rewrite the user's request into a concise, complete software development prompt.
- Preserve all requirements.
- Infer obvious missing details when reasonable.
- Do not invent features the user did not request.

If isProgram is false:
- Answer the user's request normally in the "message" field.

Output Rules

- Return ONLY JSON.
- No Markdown.
- No code fences.
- No explanations.
- No extra keys.
- "message" must always be a string.
- "isProgram" must always be a boolean.`,
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