import { GoogleGenAI } from '@google/genai';

let aiClient = null;

const getAIClient = () => {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
};

export const inferGenders = async (names) => {
  if (!names || names.length === 0) return {};
  
  const client = getAIClient();
  if (!client) {
    console.warn("No GEMINI_API_KEY set, defaulting inferred genders to 'Female'");
    return Object.fromEntries(names.map(name => [name, "Female"]));
  }
  
  const prompt = `You are a helpful assistant that infers whether a given human name is generally "Male" or "Female".
The names belong to students. The names might be in English or other languages (like Cambodian/Khmer transliterated).
Please return a strict JSON object mapping the exact name string to either "Male" or "Female".
Names: ${JSON.stringify(names)}`;
  
  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0,
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
  } catch (e) {
    console.error("AI Gender inference failed:", e);
  }
  
  // Fallback to "Female" if failed
  return Object.fromEntries(names.map(name => [name, "Female"]));
};
