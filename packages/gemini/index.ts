import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@topobre/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const gemini = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

console.log("Gemini AI client initialized.");
