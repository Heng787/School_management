import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const apiKey = process.env.VITE_GEMINI_API_KEY;

async function listAllModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Status:", response.status);
    if (data.models) {
      console.log("Available models:");
      data.models.forEach(m => console.log(`- ${m.name}`));
    } else {
      console.log("No models found or error response:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

listAllModels();
