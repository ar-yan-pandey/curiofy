// Gemini API integration for topic explanations

export async function getAssessmentQuestions(explanations) {
  const prompt = `Given the following explanations:\n${explanations}\n\nGenerate 5 multiple-choice questions (MCQs) to test understanding of the material. For each question, provide:\n- question: the question text\n- options: an array of 4 options\n- answer: the index (0-3) of the correct option\n\nReturn as a JSON array of objects with fields: question, options, answer. Do NOT include any markdown, explanations, or extra text.`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  const res = await fetch(GEMINI_API_URL + `?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  }
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length === 5) {
      return parsed;
    }
  } catch {}
  return [];
}


const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function getGeminiExplanation(topic, language, duration) {
  let prompt = `For the topic: "${topic}", reply in JSON with two fields: title (a concise, well-formatted title for the topic, max 6 words, title case, no quotes or punctuation) and explanation (explained in simple words in about ${duration === '0.5' ? '30 seconds' : duration + ' minute' + (duration !== '1' ? 's' : '')} of speaking time, no markdown formatting).`;
  if (language && language.label && language.label !== 'English') {
    prompt += ` The explanation should be in ${language.label}.`;
  }

  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  );
  if (!res.ok) throw new Error('Gemini API error');
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No explanation found.';

  // Try to parse JSON from Gemini's response
  let title = topic;
  let explanation = text;
  let cleaned = text.trim();
  // Remove code block markers if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  }
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed.title) title = parsed.title;
    if (parsed.explanation) explanation = parsed.explanation;
  } catch {}

  return { title, explanation };

}
