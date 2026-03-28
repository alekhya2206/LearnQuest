export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { messages, topic } = req.body;
  
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing GROQ_API_KEY in environment" });
  }

  const systemMessage = {
    role: "system",
    content: `You are ARIA, a supportive, personalized AI tutor for the gamified learning platform LearnQuest. You are currently teaching the topic: '${topic}'. Keep your responses short (max 2-3 short paragraphs), engaging, and encouraging. Use gamified analogies like 'leveling up', 'skill trees', and 'XP' occasionally. You have a playful, slightly neon-punk personality. Use emojis sparingly but effectively.`
  };

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // Fast model for real-time chat
        messages: [systemMessage, ...messages],
        temperature: 0.8
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
    console.error("Chat API error:", error);
    res.status(500).json({ error: error.message });
  }
}
