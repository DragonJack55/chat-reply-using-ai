export const generateReplies = async (apiKey, text, imageFile, gender = 'female', conversationStage = 'replying', vibe = 'Normal', language = 'en', curiosityMode = false) => {
    if (!apiKey) {
        throw new Error("API Key is required. Please add it in Settings.");
    }

    console.log("Generating replies with Vibe:", vibe);

    const genderContext = {
        'female': 'a woman',
        'male': 'a man',
        'lgbtq': 'an LGBTQ+ person'
    };

    const stageContext = {
        'opening': 'starting a conversation',
        'replying': 'continuing a conversation',
        'closing': 'ending a conversation',
        'greeting': 'creating a first message for dating apps or social media'
    };

    const languageNames = {
        'en': 'English',
        'fr': 'French',
        'zh': 'Chinese',
        'am': 'Amharic',
        'rw': 'Kinyarwanda',
        'my': 'Burmese'
    };

    const targetLangName = languageNames[language] || 'English';

    const curiosityInstruction = curiosityMode
        ? '\n\nCURIOSITY MODE: Add 1-2 natural, engaging questions at the end of each reply to keep the conversation flowing.'
        : '';

    const systemPrompt = `You are an expert social communication coach.
User: ${genderContext[gender] || 'a person'}
Context: ${stageContext[conversationStage] || 'replying'}
Target Vibe: ${vibe}
App Language: ${targetLangName}${curiosityInstruction}

INSTRUCTIONS:
1. DETECT the language of the 'User Input' text.
2. GENERATE 3 distinct reply options matching the "${vibe}" vibe in the DETECTED INPUT LANGUAGE (Sender's language).
   - If input is empty, use the App Language (${targetLangName}).
3. GENERATE the 'analysis' section (mood, intent, advice) in the APP LANGUAGE (${targetLangName}).
4. GENERATE the 'tone' labels for the replies in the APP LANGUAGE (${targetLangName}).

Return ONLY a JSON object with this EXACT structure:
{
  "analysis": {
    "mood": "Sender's Mood (in ${targetLangName})",
    "intent": "Short explanation (in ${targetLangName})",
    "advice": "Short advice (in ${targetLangName})"
  },
  "replies": [
    { "tone": "Nuance (in ${targetLangName})", "emoji": "😊", "content": "Reply (in SENDER'S language)" },
    { "tone": "Nuance (in ${targetLangName})", "emoji": "😎", "content": "Reply (in SENDER'S language)" },
    { "tone": "Nuance (in ${targetLangName})", "emoji": "🤔", "content": "Reply (in SENDER'S language)" }
  ]
}

If the input is empty/just starting, assume a neutral/open mood for analysis.`;

    try {
        if (imageFile) {
            throw new Error("Image upload not supported with current model. Please use text only.");
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin,
                "X-Title": "ChatReply.AI"
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text || "Start a conversation" }
                ],
                temperature: 0.85
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        const textResponse = data.choices[0].message.content;

        // Clean and parse
        const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        // Validate structure
        if (!parsed.replies || !Array.isArray(parsed.replies)) {
            if (Array.isArray(parsed)) {
                return {
                    replies: parsed,
                    analysis: { mood: "Unknown", intent: "N/A", advice: "Just go with the flow!" }
                };
            }
            throw new Error("Invalid AI response format");
        }

        return parsed;
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw error;
    }
};

export const analyzeTextOnly = async (apiKey, text) => {
    if (!apiKey || !text.trim()) return null;

    const systemPrompt = `Analyze the following text message.
Return ONLY a JSON object with this EXACT structure:
{
  "mood": "Sender's Mood (e.g., Flirty, Cold, Curious)",
  "intent": "Short explanation of what they really mean",
  "advice": "Short, actionable advice on what to do next"
}`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin,
                "X-Title": "ChatReply.AI"
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) return null;

        const data = await response.json();
        const textResponse = data.choices[0].message.content;
        const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Analysis Error:", error);
        return null;
    }
};
