import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const TRENDING_TOPICS = [
  'AI & Machine Learning',
  'Web Development',
  'Blockchain',
  'Personal Finance',
  'Mental Health',
  'Space Exploration',
  'Climate Change',
  'Digital Marketing',
  'Entrepreneurship',
  'Quantum Computing'
];

export default function LearnInterestModal({ open, onClose, onGenerate, user, setShowLearnInterest }) {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [interest, setInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pastLoading, setPastLoading] = useState(false);

  const toggleTopic = (topic) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTopics.length && !interest.trim()) {
      setError('Please select or enter at least one interest.');
      return;
    }
    setError('');
    setLoading(true);
    await onGenerate(selectedTopics, interest);
    setLoading(false);
  };

  // Fetch last 5 playlists and generate new topics from Gemini
  const handlePastInterest = async () => {
    if (!user?.id) {
      setError('You must be logged in.');
      return;
    }
    setPastLoading(true);
    setError('');
    try {
      const { data, error: fetchErr } = await supabase
        .from('playlists')
        .select('data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (fetchErr) throw fetchErr;
      if (!data || !data.length) throw new Error('No past playlists found.');
      // Collect all topics
      let allTopics = [];
      data.forEach(pl => {
        if (Array.isArray(pl.data)) {
          allTopics.push(...pl.data.map(item => item.topic).filter(Boolean));
        }
      });
      if (!allTopics.length) throw new Error('No topics found in playlists.');
      // Compose Gemini prompt
      const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
      let prompt = `Given these topics from my past learning playlists: ${allTopics.slice(0, 20).join(', ')}. Suggest 3 new, diverse topics I might enjoy next (comma-separated, concise, no explanations).`;
      const body = {
        contents: [ { parts: [ { text: prompt } ] } ]
      };
      const res = await fetch(`${GEMINI_API_URL}?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );
      const geminiData = await res.json();
      let text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      let cleaned = text.trim();
      if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
      // Use as interest string
      await onGenerate([], cleaned);
      setPastLoading(false);
      setShowLearnInterest && setShowLearnInterest(false);
    } catch (e) {
      setError(e.message || 'Failed to get past interest.');
      setPastLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="learninterest-modal-overlay" onClick={onClose}>
      <div className="learninterest-modal-card" onClick={e => e.stopPropagation()}>
        <h2>What do you want to learn?</h2>
        <form onSubmit={handleSubmit}>
          <div className="learninterest-trending">
            <div className="learninterest-label">Trending Topics:</div>
            <div className="learninterest-topics">
              {TRENDING_TOPICS.map(topic => (
                <button
                  type="button"
                  key={topic}
                  className={`learninterest-topic-btn${selectedTopics.includes(topic) ? ' selected' : ''}`}
                  onClick={() => toggleTopic(topic)}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
          <div className="learninterest-input-row">
            <label htmlFor="learninterest-input">Or add your own:</label>
            <input
              id="learninterest-input"
              type="text"
              value={interest}
              onChange={e => setInterest(e.target.value)}
              placeholder="e.g. Philosophy of Mind"
              className="learninterest-input"
            />
          </div>
          {error && <div className="learninterest-error">{error}</div>}
          <div className="learninterest-actions">
            <button type="submit" className="learninterest-generate-btn" disabled={loading || pastLoading}>
              {loading ? 'Generating...' : 'Generate Learning Topics'}
            </button>
            <button type="button" className="learninterest-cancel-btn" onClick={onClose} disabled={loading || pastLoading}>Cancel</button>
            <button type="button" className="learninterest-past-btn" onClick={handlePastInterest} disabled={pastLoading || loading}>
              {pastLoading ? 'Loading...' : 'My Past Interest'}
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
        .learninterest-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.55);
          z-index: 1100;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .learninterest-modal-card {
          background: #191b22;
          border-radius: 22px;
          box-shadow: 0 6px 32px 0 rgba(31,38,135,0.19);
          padding: 2.2rem 2rem 1.6rem 2rem;
          min-width: 340px;
          max-width: 98vw;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .learninterest-trending {
          width: 100%;
          margin-bottom: 1.2rem;
        }
        .learninterest-label {
          font-weight: 600;
          margin-bottom: 0.5em;
        }
        .learninterest-topics {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5em;
        }
        .learninterest-topic-btn {
          background: #23272f;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0.5em 1.1em;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .learninterest-topic-btn.selected, .learninterest-topic-btn:hover {
          background: #1db954;
          color: #fff;
        }
        .learninterest-input-row {
          margin: 1.2em 0 0.6em 0;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.2em;
        }
        .learninterest-input {
          padding: 0.5em 1em;
          border-radius: 8px;
          border: none;
          font-size: 1.07rem;
          background: #23272f;
          color: #fff;
        }
        .learninterest-error {
          color: #ff4d4f;
          margin-bottom: 0.7em;
          text-align: center;
        }
        .learninterest-actions {
          display: flex;
          gap: 1.2em;
          margin-top: 1.1em;
          justify-content: center;
        }
        .learninterest-generate-btn {
          background: linear-gradient(90deg, #1db954 60%, #169c46 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.7em 1.7em;
          font-size: 1.07rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.18s;
        }
        .learninterest-generate-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .learninterest-cancel-btn {
          background: #232;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.7em 1.7em;
          font-size: 1.07rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.18s;
        }
        .learninterest-cancel-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .learninterest-past-btn {
          background: linear-gradient(90deg, #1db954 60%, #169c46 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.7em 1.7em;
          font-size: 1.07rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.18s;
        }
        .learninterest-past-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
