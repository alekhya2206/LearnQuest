export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { messages } = req.body;
  
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing GROQ_API_KEY in environment" });
  }

  const systemMessage = {
    role: "system",
    content: `You are ARIA, the Adaptive Roadmap Intelligence Agent.
This is the FIRST time you are meeting the user. Your goal here is purely psychological profiling: you need to figure out exactly how their mind works, how they solve problems, and how they learn best.
Do NOT ask about specific topics (like Machine Learning or Coding). Instead, focus on cognitive psychology and learning methodologies.

1. Introduce yourself briefly and ask your FIRST psychological profiling question (e.g., "When you face a seemingly impossible problem, what's your first instinct?", or "Do you prefer building things from scratch to understand them, or reading the instruction manual first?"). Do NOT ask all questions at once.
2. Engage in a natural, back-and-forth conversation, asking exactly 3 questions total to gather deep context into their cognitive style.
3. Keep responses strictly under 2 short paragraphs mapping their answers to real psychology/learning theories. Have a friendly, insightful, and slightly neon-punk persona.
4. CRITICAL INSTRUCTION: Once you have asked your 3 questions and gathered sufficient psychological profile data, your final message MUST be purely a JSON object with NO OTHER TEXT. The JSON object must match this schema exactly:
{
  "type": "result",
  "psychProfile": "A catchy, 2-3 word title for their cognitive style (e.g., Relational Systems Thinker, Empirical Builder, Abstract Theorist)",
  "traits": ["Trait 1", "Trait 2", "Trait 3"],
  "desc": "A short 2-sentence description of how their mind works based on cognitive psychology, and how LearnQuest will adapt to help them study more effectively."
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
    console.error("Onboarding API error:", error);
    res.status(500).json({ error: error.message });
  }
}
