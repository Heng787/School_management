/** @vitest-environment node */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import geminiService from './geminiService';
import { GoogleGenerativeAI } from '@google/generative-ai';

vi.mock('@google/generative-ai', () => {
  const generateContent = vi.fn();
  const getGenerativeModel = vi.fn(() => ({ generateContent }));
  return {
    GoogleGenerativeAI: vi.fn(() => ({ getGenerativeModel })),
  };
});

describe('GeminiService', () => {
  let mockGenerateContent;

  beforeEach(() => {
    vi.clearAllMocks();
    const genAI = new GoogleGenerativeAI();
    mockGenerateContent = genAI.getGenerativeModel().generateContent;
  });

  it('should return Male for male names', async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => 'Male' }
    });

    const result = await geminiService.inferGender('John');
    expect(result).toBe('Male');
  });

  it('should return Female for female names', async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => 'Female' }
    });

    const result = await geminiService.inferGender('Jane');
    expect(result).toBe('Female');
  });

  it('should return Unknown for ambiguous names', async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => 'Not sure' }
    });

    const result = await geminiService.inferGender('Alex');
    expect(result).toBe('Unknown');
  });

  it('should throw AppError on API failure', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Down'));

    await expect(geminiService.inferGender('Error')).rejects.toThrow('Failed to process AI request');
  });
});
