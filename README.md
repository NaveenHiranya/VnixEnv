# 🚀 Web Application Generator

![AI](https://img.shields.io/badge/AI-Powered-blue)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)
![Ollama](https://img.shields.io/badge/LLM-Ollama-black)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-lightgrey)

A **basic AI-powered web application generator** that creates full web applications from natural language prompts.

It uses **MongoDB** for storage and **Ollama (Qwen2.5-Coder)** as the LLM for generating application code.

---

## ✨ Features

- 🧠 Generate web applications from prompts
- ⚙️ AI code generation using **Qwen2.5-Coder**
- 🗄️ Store generated apps in **MongoDB**
- 📦 Install generated applications instantly
- 🏠 View all installed apps on the home dashboard
- 🔄 Full flow: Prompt → Generate → Install → Display

---

## 🧠 How It Works

1. User enters a prompt (e.g. *"create a blog app with authentication"*).
2. Prompt is sent to **Ollama LLM (Qwen2.5-Coder)**.
3. The model generates a full application structure.
4. Application is saved into **MongoDB**.
5. User installs the generated application.
6. Installed applications appear on the home page.

---

## 🛠️ Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | Next.js (TypeScript / TSX) |
| Backend    | Node.js API Routes |
| Database   | MongoDB |
| AI Engine  | Ollama |
| Model      | Qwen2.5-Coder |

---

## 📦 Installation

```bash
# Clone repository
git clone <your-repo-url>

# Move into project
cd your-project

# Install dependencies
npm install

# Run development server
npm run dev
## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
