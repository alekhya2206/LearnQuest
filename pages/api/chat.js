export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { messages } = req.body;
  
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!geminiKey && !groqKey) {
    return res.status(500).json({ 
      error: "Missing API Key. Please add GEMINI_API_KEY or GROQ_API_KEY to your environment/dashboard and redeploy." 
    });
  }

  const systemPrompt = `You are ARIA, the Adaptive Roadmap Intelligence Agent for LearnQuest.
You are a context-aware AI tutor with a friendly, high-intelligence, slightly neon-punk persona.
Your goal is to help the user learn complex technical subjects through gamified analogies and clear explanations.
Keep responses under 2-3 short paragraphs unless a long explanation is requested.
Always maintain your 'Neural Link' aesthetic.`;

  try {
    if (geminiKey) {
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
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
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
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error(`Groq API Error: ${response.status}`);
      const data = await response.json();
      return res.status(200).json({ reply: data.choices[0].message.content });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: error.message });
  }
}
