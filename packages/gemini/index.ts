import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@topobre/env";
import { logger } from "@topobre/winston";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const gemini = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

logger.info("[GEMINI] Gemini AI client initialized.");
