import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Manual .env parsing since we might not have dotenv
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const apiKeyMatch = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!apiKey) {
    console.error("Could not find API Key in .env file");
    process.exit(1);
}

console.log("Found API Key:", apiKey.substring(0, 10) + "...");

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const text = "hey how was your dday going so far";

const prompt = `
    You are an expert dating and social communication coach. 
    Analyze the provided conversation context (text and/or image).
    
    Generate 3 distinct replies based on the following personas:
    1. Casual: Relaxed, friendly, low-pressure.
    2. Curious: Inquisitive, asking a follow-up question to keep the conversation going.
    3. Flirty: Mature, witty, charming, with a sense of humor.

    Return the result strictly as a JSON object with keys: "casual", "curious", "flirty".
    Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
    
    Context: ${text}
`;

async function run() {
    try {
        console.log(`Sending prompt: "${text}"...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        console.log("\n--- Raw AI Response ---");
        console.log(textResponse);

        const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const replies = JSON.parse(cleanJson);

        console.log("\n--- Parsed Replies ---");
        console.log("Casual:", replies.casual);
        console.log("Curious:", replies.curious);
        console.log("Flirty:", replies.flirty);

    } catch (error) {
        console.error("Error:", error);
    }
}

run();
