import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const apiKey = process.env.VITE_GEMINI_API_KEY;

const GENDER_LOOKUP = {
  male: "Male",
  m: "Male",
  boy: "Male",
  man: "Male",
  female: "Female",
  f: "Female",
  girl: "Female",
  woman: "Female",
};

const resolveGender = (raw) =>
  GENDER_LOOKUP[
    String(raw || "")
      .trim()
      .toLowerCase()
  ] ?? null;

const inferGenderBatch = async (client, batch) => {
  const prompt = `You are a professional linguist specializing in Cambodian (Khmer) names.
Analyze the following list of names and determine if each is "Male" or "Female".
- Names ending in "ly", "da", "na", "ny", "nika", "vina" are often Female.
- Names ending in "rith", "vuth", "narith", "hour", "hak", "rak" are often Male.

Names: ${JSON.stringify(batch)}

RETURN A STRICT JSON OBJECT mapping each name to EITHER "Male" or "Female".
YOU MUST CHOOSE ONE FOR EVERY NAME. DO NOT USE "Unknown", "Unsure", or null.
If unsure, make your best guess based on phonetic patterns.
NO MARKDOWN. NO EXPLANATION. RETURN ONLY THE JSON OBJECT.`;

  try {
    const model = client.getGenerativeModel({
      model: "gemini-flash-latest", // UPDATED MODEL NAME
      generationConfig: { temperature: 0.1 },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("AI response text:", text);

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON in AI response");

    const parsed = JSON.parse(text.substring(start, end + 1));
    const normalized = {};
    for (const [name, value] of Object.entries(parsed)) {
      const gender = resolveGender(value);
      if (gender) normalized[name.trim().toLowerCase()] = gender;
    }
    return normalized;
  } catch (e) {
    console.error("AI batch failed:", e.message);
    throw e;
  }
};

async function test() {
  const genAI = new GoogleGenerativeAI(apiKey);
  const names = ["Sok Dara", "Keo Srey Leak", "Chanrithy", "Bopha", "Vuthy"];
  console.log("Testing names:", names);
  try {
    const result = await inferGenderBatch(genAI, names);
    console.log("Result:", result);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
