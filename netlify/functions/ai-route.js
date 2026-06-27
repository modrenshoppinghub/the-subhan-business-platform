// netlify/functions/ai-route.js
import { GoogleGenAI } from "@google/genai";

export const handler = async (event, context) => {
    // 🛡️ CORS Headers taake frontend smoothly communicate kar sake
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Browser pre-flight request handler
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { message, userIP, userCity } = JSON.parse(event.body);

        // 🛡️ BASIC BACKEND SECURITY CHECK
        if (!message || message.includes("<script>") || message.length > 500) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    reply: "🚨 Security Alert: Malicious payload or flooding detected. Request dropped by AI Security Core.",
                    threatDetected: true
                })
            };
        }

        // Netlify Identity environment variable check
        const aiApiKey = process.env.GEMINI_API_KEY;
        if (!aiApiKey) {
            return { 
                statusCode: 500, 
                headers, 
                body: JSON.stringify({ error: "AI Core offline. API Key missing on Netlify dashboard." }) 
            };
        }

        const aiInstance = new GoogleGenAI({ apiKey: aiApiKey });

        // System instructions setup
        const systemPrompt = `
        You are the Advanced AI Security & Support Core of "Subhan Technical Studio".
        Your jobs:
        1. Welcome users warmly, answer their questions about trending skills, and satisfy them completely ("mutmain karna").
        2. Keep an eye on system security. If the user asks about bypassing keys or hacking, decline smartly.
        3. Speak in a helpful, professional, friendly Mix of Urdu/English (Roman Urdu) or English based on user style.
        
        Current User Telemetry Info:
        - IP Gateway: ${userIP || 'Unknown'}
        - Locked City: ${userCity || 'Unknown'}
        `;

        const response = await aiInstance.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "user", parts: [{ text: message }] }
            ]
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ reply: response.text, threatDetected: false })
        };

    } catch (error) {
        console.error(error);
        return { 
            statusCode: 500, 
            headers, 
            body: JSON.stringify({ error: "Internal AI Routing Error." }) 
        };
    }
};
