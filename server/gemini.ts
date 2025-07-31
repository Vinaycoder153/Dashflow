import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI with debugging
console.log('Initializing Gemini AI with key:', process.env.GEMINI_API_KEY ? 'Key present' : 'Key missing');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateAIResponse(userMessage: string): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return getSmartFallbackResponse(userMessage);
    }

    // Optimized prompt for voice interaction
    const prompt = `You are an intelligent AI voice assistant. Respond naturally and conversationally. 

Guidelines:
- Keep responses concise (1-3 sentences max for voice)
- Be helpful, friendly, and engaging
- If asked about capabilities, mention: weather, web search, email, time, reminders, notes
- Use natural speech patterns suitable for text-to-speech
- Avoid markdown or special formatting

User: "${userMessage}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "I'm sorry, I couldn't process that request right now.";
  } catch (error) {
    console.error('Gemini API error:', error);
    return getSmartFallbackResponse(userMessage);
  }
}

// Smart fallback responses when Gemini API is not available
function getSmartFallbackResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  // Greeting responses
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return "Hello! I'm your AI voice assistant. I can help with weather, time, web searches, emails, and more. What would you like me to do?";
  }
  
  // Weather requests
  if (message.includes('weather') || message.includes('temperature')) {
    return "I can help you get weather information! What city would you like to know about?";
  }
  
  // Time requests
  if (message.includes('time') || message.includes('clock')) {
    const currentTime = new Date().toLocaleTimeString();
    return `The current time is ${currentTime}.`;
  }
  
  // Search requests
  if (message.includes('search') || message.includes('find') || message.includes('look up')) {
    return "I can help you search for information on the web. What would you like me to look up?";
  }
  
  // Email requests
  if (message.includes('email') || message.includes('mail')) {
    return "I can help you send emails. What would you like to send and to whom?";
  }
  
  // Capability requests
  if (message.includes('help') || message.includes('what can you do') || message.includes('capabilities')) {
    return "I can help you with weather information, tell you the time, search the web, send emails, set reminders, take notes, and answer questions. Just ask me what you need!";
  }
  
  // Reminder/note requests
  if (message.includes('remind') || message.includes('note') || message.includes('remember')) {
    return "I can help you set reminders and take notes. What would you like me to remember for you?";
  }
  
  // General conversational responses
  const responses = [
    `That's interesting! Can you tell me more about what you'd like me to help you with regarding "${userMessage}"?`,
    `I understand you mentioned "${userMessage}". How can I assist you with that?`,
    `Thanks for sharing that with me. What specific help do you need with "${userMessage}"?`,
    `I'm here to help! What would you like me to do about "${userMessage}"?`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

export async function analyzeUserIntent(userMessage: string): Promise<{
  intent: string;
  entities: string[];
  needsAction: boolean;
}> {
  try {
    const prompt = `Analyze this user message and identify the intent, entities, and if it needs an action.

User message: "${userMessage}"

Respond with JSON in this exact format:
{
  "intent": "weather|time|email|search|general|greeting|help",
  "entities": ["extracted entities"],
  "needsAction": true/false
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            intent: { type: "string" },
            entities: { type: "array", items: { type: "string" } },
            needsAction: { type: "boolean" }
          },
          required: ["intent", "entities", "needsAction"]
        }
      },
      contents: prompt,
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    
    return {
      intent: "general",
      entities: [],
      needsAction: false
    };
  } catch (error) {
    console.error('Intent analysis error:', error);
    return {
      intent: "general",
      entities: [],
      needsAction: false
    };
  }
}