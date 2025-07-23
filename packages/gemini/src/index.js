"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gemini = void 0;
const generative_ai_1 = require("@google/generative-ai");
const env_1 = require("@topobre/env");
const winston_1 = require("@topobre/winston");
const genAI = new generative_ai_1.GoogleGenerativeAI(env_1.env.GEMINI_API_KEY);
exports.gemini = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
winston_1.logger.info("[GEMINI] Gemini AI client initialized.");
//# sourceMappingURL=index.js.map