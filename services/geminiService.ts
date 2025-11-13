import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MCQ, Flashcard } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const textModel = 'gemini-2.5-flash';
const imageModel = 'gemini-2.5-flash-image';


export const generateSummary = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: textModel,
    contents: `Your task is to act as an expert academic assistant. Create a high-quality summary of the following text. Your summary should be structured in two parts:

1.  **Main Summary:** A concise paragraph that captures the core argument, main ideas, and overall conclusion of the text.
2.  **Key Takeaways:** A bulleted list of the most important points, findings, or evidence presented in the text.

Please ensure the summary is objective, accurate, and easy to understand.

---
TEXT:
${text}
---
`,
  });
  return response.text;
};

export const generateMCQs = async (text: string): Promise<MCQ[]> => {
  const response = await ai.models.generateContent({
    model: textModel,
    contents: `Based on the following text, generate 3 multiple-choice questions. For each question, provide 4 options and indicate the correct answer.
---
TEXT:
${text}
---
`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: "The question text."
            },
            options: {
              type: Type.ARRAY,
              description: "An array of 4 possible answers.",
              items: { type: Type.STRING }
            },
            correctAnswer: {
              type: Type.STRING,
              description: "The correct answer from the options array."
            }
          },
          required: ['question', 'options', 'correctAnswer']
        },
      },
    },
  });

  try {
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result as MCQ[];
  } catch(e) {
    console.error("Failed to parse Gemini response as JSON", e);
    console.error("Raw response text:", response.text);
    throw new Error("Invalid JSON response from model.");
  }
};


export const generateFlashcards = async (text: string): Promise<Flashcard[]> => {
  const response = await ai.models.generateContent({
    model: textModel,
    contents: `Based on the following text, identify 5-8 key concepts and generate flashcards for them. For each flashcard, provide a concise term and a clear definition suitable for studying.
---
TEXT:
${text}
---
`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            term: {
              type: Type.STRING,
              description: "The key term or concept."
            },
            definition: {
              type: Type.STRING,
              description: "A clear and concise definition of the term."
            }
          },
          required: ['term', 'definition']
        },
      },
    },
  });

  try {
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result as Flashcard[];
  } catch(e) {
    console.error("Failed to parse Gemini response as JSON", e);
    console.error("Raw response text:", response.text);
    throw new Error("Invalid JSON response from model.");
  }
};


export const generateExplanation = async (topic: string, contextText?: string): Promise<string> => {
    const prompt = contextText
    ? `Using the provided context, explain the following topic in a clear and concise way, suitable for a high school student. If the topic is not in the context, explain it generally. Use markdown for formatting if needed.

CONTEXT:
---
${contextText}
---

TOPIC: ${topic}`
    : `Explain the following topic in a clear and concise way, suitable for a high school student. Use markdown for formatting if needed.\n\nTOPIC: ${topic}`;

  const response = await ai.models.generateContent({
    model: textModel,
    contents: prompt,
  });
  return response.text;
};


export const generateDiagram = async (topic: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: imageModel,
        contents: {
            parts: [{
                text: `Create a simple, clear, and educational diagram illustrating the concept of "${topic}". The diagram should be in a minimalist style with clear labels, suitable for a textbook or study guide. Use a clean, light background.`
            }]
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const firstPart = response.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && firstPart.inlineData) {
        const base64ImageBytes: string = firstPart.inlineData.data;
        const mimeType = firstPart.inlineData.mimeType;
        return `data:${mimeType};base64,${base64ImageBytes}`;
    }

    throw new Error("No image was generated by the model.");
};
