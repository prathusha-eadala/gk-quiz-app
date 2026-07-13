import { InferenceClient } from "@huggingface/inference";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const token = process.env.HF_TOKEN;
const hf = token ? new InferenceClient(token) : null;

const logFilePath = path.join(process.cwd(), "quiz_logs.json");

// Helper function to pull question history from your local JSON store
function getQuestionHistory() {
  try {
    if (fs.existsSync(logFilePath)) {
      const fileContent = fs.readFileSync(logFilePath, "utf8");
      const logs = JSON.parse(fileContent || "[]");
      
      // Extract just the question strings to pass to the prompt context window
      return logs.map(log => log.response_payload?.structured_data?.question).filter(Boolean);
    }
  } catch (err) {
    console.error("Failed to read history log:", err);
  }
  return [];
}

// Helper function to handle saving logs locally
function saveToLocalJson(category, rawResponse, parsedQuiz) {
  try {
    const newLogEntry = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      category: category || "General Trivia",
      response_payload: {
        raw_llm_text: rawResponse,
        structured_data: parsedQuiz
      }
    };

    let existingLogs = [];
    if (fs.existsSync(logFilePath)) {
      const fileContent = fs.readFileSync(logFilePath, "utf8");
      existingLogs = JSON.parse(fileContent || "[]"); 
    }

    existingLogs.push(newLogEntry);
    fs.writeFileSync(logFilePath, JSON.stringify(existingLogs, null, 2), "utf8");
  } catch (err) {
    console.error("Local JSON logging failed:", err);
  }
}

export async function POST(request) {
  if (!hf) return NextResponse.json({ error: "HF_TOKEN missing" }, { status: 500 });

  try {
    const { category } = await request.json();

    // 1. Fetch previous question array strings
    const historyList = getQuestionHistory();
    
    // 2. Format the history list as text instructions for the LLM context window
    const historyContext = historyList.length > 0 
      ? `CRITICAL: You MUST NOT generate any of the following questions as they have already been served to this user:\n${historyList.map(q => `- "${q}"`).join("\n")}`
      : "No previous question history recorded.";

    const prompt = `Generate a single unique multiple-choice question about ${category || "General Knowledge"}.
    You must output ONLY valid, parsable JSON matching this exact pattern. Do not include markdown codeblocks or intro/outro text.
    
    ${historyContext}
    
    {
      "question": "The question sentence goes here?",
      "options": ["Choice A", "Choice B", "Choice C", "Choice D"],
      "answer": "The exact matching text string of the correct choice from the options array",
      "explanation": "Brief explanation of why the answer is correct."
    }`;

    const response = await hf.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.85 // Raised slightly from 0.7 to increase semantic randomness
    });

    const rawText = response.choices[0].message.content.trim();

    let cleanText = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
    const firstBrace = cleanText.indexOf("{");
    const lastBrace = cleanText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    const quizData = JSON.parse(cleanText.trim());

    // 3. Save current entry to update history list for the next call
    saveToLocalJson(category, rawText, quizData);

    return NextResponse.json(quizData);

  } catch (error) {
    console.error("CRITICAL API ROUTE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}