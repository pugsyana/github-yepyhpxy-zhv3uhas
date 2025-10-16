
import { GoogleGenAI, Type } from "@google/genai";
import type { BrainstormIdea } from '../types';

// Fix: Removed `as string` to align with coding guidelines for API key usage.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizeText = async (text: string): Promise<string> => {
  if (!text.trim()) {
    return "Please enter some text to summarize.";
  }
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize the following text in a concise paragraph:\n\n---\n\n${text}`,
        config: {
            temperature: 0.2,
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing text:", error);
    return "Sorry, I couldn't summarize the text. Please try again.";
  }
};

export const brainstormIdeas = async (topic: string): Promise<BrainstormIdea[]> => {
    if (!topic.trim()) {
        return [];
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Brainstorm 5 creative and actionable ideas related to the topic: "${topic}". For each idea, provide a short title and a one-sentence description.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        ideas: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: {
                                        type: Type.STRING,
                                        description: 'A short, catchy title for the idea.'
                                    },
                                    description: {
                                        type: Type.STRING,
                                        description: 'A one-sentence description of the idea.'
                                    },
                                },
                                required: ["title", "description"],
                            },
                        },
                    },
                    required: ["ideas"],
                },
            },
        });

        const jsonResponse = JSON.parse(response.text);
        return jsonResponse.ideas || [];

    } catch (error) {
        console.error("Error brainstorming ideas:", error);
        throw new Error("Failed to brainstorm ideas. Please check the topic and try again.");
    }
};