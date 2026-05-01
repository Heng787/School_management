const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');
const { AppError } = require('../utils/errors');

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

class GeminiService {
  async inferGender(name) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Determine the most likely gender for the name "${name}". Respond with ONLY one word: "Male", "Female", or "Unknown". Do not provide any other text.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      const normalized = text.toLowerCase();
      if (normalized.includes('male') && !normalized.includes('female')) return 'Male';
      if (normalized.includes('female')) return 'Female';
      return 'Unknown';
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new AppError('Failed to process AI request', 502, 'AI_ERROR');
    }
  }
}

module.exports = new GeminiService();
