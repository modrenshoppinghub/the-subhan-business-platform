// api/ai-route.js
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    // CORS headers taake aapka frontend isse baat kar sake
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, context, userIP, userCity } = req.body;

        // 🛡️ BASIC BACKEND SECURITY CHECK
        // Agar koi message me malicious scripts ya spam dalne ki koshish kare
        if (message.includes("<script>") || message.length > 500) {
            return res.status(400).json({ 
                reply: "🚨 Security Alert: Malicious payload or flooding detected. Request dropped by AI Security Core.",
                threatDetected: true 
            });
        }

        // Backend environment variable se key uthayega (Frontend par visible nahi hogi)
        const aiApiKey = process.env.GEMINI_API_KEY;
        if (!aiApiKey) {
            return res.status(500).json({ error: "AI Core offline. API Key missing on server." });
        }

        const aiInstance = new GoogleGenAI({ apiKey: aiApiKey });

        // AI ko train karne ke liye System Instructions (Prompt Engineering)
        const systemPrompt = `
        You are the Advanced AI Security & Support Core of "Subhan Technical Studio".
        Your jobs:
        1. Welcome users warmly, answer their questions about the 20 trending skills, and satisfy them completely ("mutmain karna").
        2. Keep an eye on system security. If the user asks about bypassing keys or hacking, decline smartly.
        3. Speak in a helpful, professional, friendly Mix of Urdu/English (Roman Urdu) or English based on user style.
        
        Current User Telemetry Info:
        - IP Gateway: ${userIP || 'Unknown'}
        - Locked City: ${userCity || 'Unknown'}
        - Context Mode: ${context || 'General Chat'}
        `;

        const response = await aiInstance.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "user", parts: [{ text: message }] }
            ]
        });

        return res.status(200).json({ 
            reply: response.text, 
            threatDetected: false 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal AI Routing Error." });
    }
}
