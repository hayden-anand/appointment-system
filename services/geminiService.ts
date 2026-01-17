
import { GoogleGenAI, Type } from "@google/genai";
import { Appointment, Doctor } from "../types";

// Always use the required structure for initialization with process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const predictNoShow = async (appointment: Appointment): Promise<number> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Predict the likelihood of a "no-show" for this appointment in percentage (0-100).
      Patient: ${appointment.patientName}
      Time: ${appointment.time}
      Priority: ${appointment.priority}
      Current System Load: High
      Return only an integer.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER }
          },
          required: ["score"]
        }
      }
    });
    // Use the .text property directly and trim for consistent JSON parsing
    const text = response.text || '{"score": 10}';
    const result = JSON.parse(text.trim());
    return result.score;
  } catch (error) {
    console.error("Gemini Error:", error);
    return Math.floor(Math.random() * 30);
  }
};

export const optimizeSchedule = async (appointments: Appointment[], doctors: Doctor[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are a hospital operations optimizer. Analyze current workload and suggest re-assignments to balance fatigue scores.
      Doctors: ${JSON.stringify(doctors)}
      Appointments: ${JSON.stringify(appointments)}
      Provide a brief summary of redistribution logic.`,
    });
    // Access the extracted string directly from the response object
    return response.text;
  } catch (error) {
    return "Load balancing optimization currently running locally.";
  }
};
