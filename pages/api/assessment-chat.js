export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { messages, topic, psychProfile } = req.body;
  
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing GROQ_API_KEY in environment" });
  }

  const systemMessage = {
    role: "system",
    content: `You are ARIA, the Adaptive Roadmap Intelligence Agent for LearnQuest. 
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
}`
  };

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [systemMessage, ...messages],
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Groq API Error: ${errorText}` });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    res.status(200).json({ reply: content });
  } catch (error) {
    console.error("Assessment API error:", error);
    res.status(500).json({ error: error.message });
  }
}
