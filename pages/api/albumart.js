// Next.js API route for generating album art using Stability AI
import axios from "axios";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: true,
  },
};

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
// Use Stable Diffusion 3.5 engine for Stability AI
const STABILITY_API_URL = 'https://api.stability.ai/v2beta/stable-image/generate/core';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }
  if (!STABILITY_API_KEY) {
    return res.status(500).json({ error: 'Stability API key not set' });
  }
  try {
    const payload = {
      prompt,
      output_format: "webp"
    };
    const response = await axios.postForm(
      STABILITY_API_URL,
      axios.toFormData(payload, new FormData()),
      {
        validateStatus: undefined,
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${STABILITY_API_KEY}`,
          Accept: "image/*"
        },
      }
    );
    if (response.status === 200) {
      // Convert binary to base64 for frontend
      const base64 = Buffer.from(response.data).toString('base64');
      res.status(200).json({ image: base64 });
    } else {
      const errMsg = response.data ? response.data.toString() : 'Unknown error';
      console.error('Stability API error:', response.status, errMsg);
      res.status(response.status).json({ error: 'Stability API error', details: errMsg });
    }
  } catch (e) {
    res.status(500).json({ error: 'Failed to call Stability API', details: e.message });
  }
}
