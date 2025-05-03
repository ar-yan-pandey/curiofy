import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { scores, topics } = req.body;
  if (!scores || !topics) return res.status(400).json({ error: "Missing scores or topics" });
  try {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    // Compose prompt
    const prompt = `Analyze this user's assessment performance. Here are their scores in sequence: [${scores.join(", ")}].\nThe topics of the playlists for each assessment are: [${topics.join("; ")}].\n\nPlease provide:\n- A brief summary of their overall performance\n- Any trends or improvements/declines over time\n- Identify weak topics\n- Suggest what the user should focus on next.\n\nBe clear, concise, and actionable.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.status(200).json({ result: text });
  } catch (e) {
    console.error("Gemini AI report error:", e);
    res.status(500).json({ error: "Failed to generate AI report" });
  }
}
