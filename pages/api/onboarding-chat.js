export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { messages } = req.body;
  
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();

  // Robust validation for production readiness
  const hasGemini = geminiKey && geminiKey.length > 5;
  const hasGroq = groqKey && groqKey.length > 5;

  if (!hasGemini && !hasGroq) {
    return res.status(500).json({ 
      error: "No AI Brain configured. Please verify GEMINI_API_KEY or GROQ_API_KEY in your .env.local file and RESTART your dev server." 
    });
  }

  const systemPrompt = `You are ARIA, the system-level Adaptive Roadmap Intelligence Agent for LearnQuest.
You are in INITIALIZATION MODE. Your goal is to conduct a 3-turn cognitive profiling session with the user before they can access the platform.
ARIA Persona: Friendly, observant, highly intelligent, slightly neon-punk but deeply interested in the user's mind.
1. DO NOT mention technical stacks. Focus on HOW the user thinks, solves problems, and feels about learning.
2. Ask one deep question at a time.
3. Keep responses under 2 short paragraphs.
4. CRITICAL: Once the user has responded 3 times, you MUST conclude the session and provide their final 'Cognitive Archetype' by returning ONLY a JSON object and nothing else.
The JSON object MUST follow this schema exactly:
{
  "type": "result",
  "psychProfile": "The Cognitive Archetype Title (e.g. The Reflective Explorer)",
  "desc": "A 2-sentence description of how their mind works.",
  "traits": ["Trait 1", "Trait 2", "Trait 3"]
}`;

  try {
    if (hasGemini) {
      const history = messages.map(m => ({
        role: m.role === 'aria' ? 'model' : 'user',
        parts: [{ text: m.text || m.content || "" }]
      }));

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: history,
          generationConfig: { temperature: 0.85, maxOutputTokens: 2048 }
        })
      });

      if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
      const data = await response.json();
      return res.status(200).json({ reply: data.candidates?.[0]?.content?.parts?.[0]?.text });
    } else {
      const groqMessages = [{ role: 'system', content: systemPrompt }, ...messages.map(m => ({
        role: m.role === 'aria' ? 'assistant' : 'user',
        content: m.text || m.content || ""
      }))];

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: groqMessages,
          temperature: 0.85
        })
      });

      if (!response.ok) throw new Error(`Groq API Error: ${response.status}`);
      const data = await response.json();
      return res.status(200).json({ reply: data.choices[0].message.content });
    }
  } catch (error) {
    console.error("Onboarding API error:", error);
    res.status(500).json({ error: error.message });
  }
}
