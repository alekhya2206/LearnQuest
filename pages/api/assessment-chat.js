export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { messages, topic, psychProfile } = req.body;
  
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!geminiKey && !groqKey) {
    return res.status(500).json({ 
      error: "Missing API Key. Please add GEMINI_API_KEY or GROQ_API_KEY to your environment/dashboard and redeploy." 
    });
  }

  const systemPrompt = `You are ARIA, the Adaptive Roadmap Intelligence Agent for LearnQuest. 
You are speaking to a user who has ALREADY completed their psychological onboarding. Their cognitive archetype is: ${psychProfile}.
Your goal now is strictly to assess their current knowledge and proficiency level regarding the topic: '${topic}'.
1. Introduce yourself briefly, acknowledge their archetype, and ask your FIRST assessment question regarding their technical experience with '${topic}'. Do NOT ask all questions at once.
2. Engage in a natural, back-and-forth conversation, asking 2 or 3 questions total to gauge their skill level.
3. Keep responses strictly under 2 short paragraphs. Have a friendly, slightly neon-punk persona.
4. CRITICAL INSTRUCTION: Once you have gathered sufficient information to gauge their technical skill level, your final message MUST be purely a JSON object with NO OTHER TEXT. The JSON object must match this schema exactly:
{
  "type": "result",
  "profileLabel": "${psychProfile}",
  "tier": "Beginner" | "Intermediate" | "Advanced",
  "desc": "A short 2-sentence description of their '${topic}' proficiency and how their archetype will be factored into the roadmap."
}`;

  try {
    if (geminiKey) {
      // GEMINI IMPLEMENTATION
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
      // GROQ PRIMARY (Optimized for Llama 3.3)
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
    console.error("Assessment API error:", error);
    res.status(500).json({ error: error.message });
  }
}
