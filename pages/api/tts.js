import fs from 'fs';
import path from 'path';
import { GoogleAuth } from 'google-auth-library';

export const config = {
  api: {
    bodyParser: true,
  },
};

const TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, languageCode, voice } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Missing text' });
  }
  const lang = languageCode || 'en-US';
  const voiceName = voice || 'en-US-Wavenet-F';

  // Load credentials from env variable (JSON string)
  const keyJson = process.env.GOOGLE_TTS_KEY_JSON;
  if (!keyJson) {
    return res.status(500).json({ error: 'Google TTS key JSON not found in environment variables' });
  }
  const auth = new GoogleAuth({
    credentials: JSON.parse(keyJson),
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  // Call Google TTS API
  const response = await fetch(TTS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken.token || accessToken}`,
    },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: lang, name: voiceName },
      audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0 },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return res.status(500).json({ error: 'Google TTS API error', details: err });
  }

  const data = await response.json();
  // data.audioContent is base64-encoded MP3
  res.status(200).json({ audioContent: data.audioContent });
}
