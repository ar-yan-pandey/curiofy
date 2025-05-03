import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { user_id, playlist_id, score, accuracy, questions, answers, access_token } = req.body;
  if (!user_id || !playlist_id || typeof score === 'undefined' || typeof accuracy === 'undefined' || !access_token) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  // Create a Supabase client with the user's token
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${access_token}` } } }
  );
  let questionsObj = questions;
  let answersObj = answers;
  try {
    if (typeof questions === 'string') questionsObj = JSON.parse(questions);
    if (typeof answers === 'string') answersObj = JSON.parse(answers);
  } catch (e) {
    console.error('Failed to parse questions or answers:', e);
    return res.status(400).json({ error: 'Invalid questions or answers format' });
  }
  const { error } = await supabase.from('assessments').insert([
    { user_id, playlist_id, score, accuracy, questions: questionsObj, answers: answersObj }
  ]);
  if (error) {
    console.error('Supabase insert error:', error);
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json({ success: true });
}
