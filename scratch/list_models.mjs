import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const apiKey = process.env.VITE_GEMINI_API_KEY;

async function listModels() {
  const genAI = new GoogleGenerativeAI(apiKey);
  const commonModels = ["gemini-pro", "gemini-1.0-pro"];
    
  for (const modelName of commonModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("test");
      console.log(`Model ${modelName} is working.`);
      break;
    } catch (err) {
      console.log(`Model ${modelName} failed: ${err.message}`);
    }
  }
}

listModels();
