export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt, model } = req.body;
  
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing GROQ_API_KEY in environment" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model || "llama-3.3-70b-versatile", // Fast and reliable
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Groq API Error: ${errorText}` });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    res.status(200).json(JSON.parse(content));
  } catch (error) {
    console.error("Generate API error:", error);
    res.status(500).json({ error: error.message });
  }
}
