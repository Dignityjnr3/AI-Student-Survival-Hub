import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateStudyPlan(assignmentTitle: string, description: string, deadline: string) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `As an academic assistant, create a detailed study plan for the following assignment:
  Title: ${assignmentTitle}
  Description: ${description}
  Deadline: ${deadline}
  
  Break the assignment into manageable steps, estimate the time required for each step, and provide a clear plan.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                task: { type: Type.STRING },
                time: { type: Type.STRING }
              },
              required: ["task", "time"]
            }
          }
        },
        required: ["steps"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function simplifyNotes(notes: string) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Simplify the following academic notes. Provide a concise summary and a simplified explanation for a student:
  
  ${notes}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["summary", "explanation"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateMockExam(content: string) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Based on the following course content, generate a mock exam with 5 multiple choice questions and 5 short answer questions. 
  Ensure the questions are challenging and cover the key concepts.
  
  Course Content:
  ${content}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["mcq", "short"] },
                question: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Only for mcq type"
                },
                correctAnswer: { type: Type.STRING }
              },
              required: ["id", "type", "question", "correctAnswer"]
            }
          }
        },
        required: ["questions"]
      }
    }
  });

  return JSON.parse(response.text);
}
