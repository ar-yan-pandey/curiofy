import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';
import ChatPrompt from '../components/ChatPrompt';
import Navbar from '../components/Navbar';
import LearnInterestModal from '../components/LearnInterestModal';
import { getGeminiExplanation } from '../utils/gemini';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOpenBtn, setShowOpenBtn] = useState(false);
  const [showLearnInterest, setShowLearnInterest] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);
  const chatPromptRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
      } else {
        setUser(user);
      }
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (!user) return null;

  // Gemini API integration: returns a 5-second explanation for each topic
  async function getGeminiExplanations(topics, language, duration) {
    return Promise.all(
      topics.map(async (topic) => {
        const result = await getGeminiExplanation(topic, language, duration);
        return {
          topic: result.title, // formatted title from Gemini
          explanation: result.explanation,
          language,
          duration,
        };
      })
    );
  }

  const handlePromptSubmit = async (prompt, language, duration) => {
    // Split prompt into topics (comma or new line separated)
    let topics = prompt
      .split(/,|\n/)
      .map(t => t.trim())
      .filter(Boolean);
    if (!topics.length) return;
    // Call Gemini (stub)
    setLoading(true);
    setShowOpenBtn(false);
    const explanations = await getGeminiExplanations(topics, language, duration);
    setPlaylist(explanations);
    setLoading(false);
    setShowOpenBtn(true);
  }

  async function handleGenerateLearningTopics(selectedTopics, userInterest) {
    setInterestLoading(true);
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    // Compose a prompt to Gemini
    let prompt = 'Suggest 3 interesting, diverse learning topics (concise, title case, comma-separated, no explanations) based on: ';
    if (selectedTopics.length) prompt += `Trending topics: ${selectedTopics.join(', ')}. `;
    if (userInterest.trim()) prompt += `User interest: ${userInterest.trim()}.`;
    const body = {
      contents: [
        { parts: [ { text: prompt } ] }
      ]
    };
    try {
      const res = await fetch(`${GEMINI_API_URL}?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );
      const data = await res.json();
      let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      let cleaned = text.trim();
      if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
      // Expecting comma-separated topics
      let topics = cleaned.split(/,|\n/).map(t => t.trim()).filter(Boolean).slice(0, 3);
      if (chatPromptRef.current && chatPromptRef.current.setValue) {
        chatPromptRef.current.setValue(topics.join(', '));
      }
      setShowLearnInterest(false);
    } catch (e) {
      alert('Failed to generate topics.');
    }
    setInterestLoading(false);
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <main className="dashboard-modern-bg">
        <div className="dashboard-glass-card">
          <h1 className="dashboard-title">Welcome to <span>Curiofy</span></h1>
          <div className="dashboard-btn-row">
            <button
              className="dashboard-btn dashboard-learninterest-btn"
              type="button"
              onClick={() => setShowLearnInterest(true)}
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" style={{marginRight: '0.7em'}}><circle cx="12" cy="12" r="10" fill="#fff" fillOpacity="0.13"/><path d="M12 7v6l4 2" stroke="#1db954" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Learn with Interest
            </button>
            {showOpenBtn && (
              <button className="dashboard-btn dashboard-openplaylist-btn" onClick={() => {
                const data = encodeURIComponent(JSON.stringify(playlist));
                router.push(`/playlist?data=${data}`);
              }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" style={{marginRight: '0.7em'}}><circle cx="12" cy="12" r="10" fill="#fff" fillOpacity="0.13"/><polygon points="10,8 16,12 10,16" fill="#1db954"/></svg>
                Open Playlist
              </button>
            )}
          </div>
          <div className="dashboard-prompt-area">
            <ChatPrompt onSubmit={handlePromptSubmit} ref={chatPromptRef} />
          </div>
          {loading && (
            <div className="dashboard-loading-bar">
              <div className="dashboard-bar">
                <div className="dashboard-progress" />
              </div>
              <span>Generating playlist</span>
            </div>
          )}
        </div>
        <LearnInterestModal
          open={showLearnInterest}
          onClose={() => setShowLearnInterest(false)}
          onGenerate={handleGenerateLearningTopics}
          user={user}
          setShowLearnInterest={setShowLearnInterest}
        />
        <style jsx>{`
          .dashboard-modern-bg {
            min-height: 100vh;
            width: 100vw;
            display: flex;
            justify-content: center;
            align-items: center;
            background:
              linear-gradient(120deg, #1db954 0%, #15171b 100%),
              repeating-linear-gradient(135deg, rgba(29,185,84,0.11) 0px, rgba(29,185,84,0.11) 2px, transparent 2px, transparent 40px),
              repeating-linear-gradient(45deg, rgba(29,185,84,0.09) 0px, rgba(29,185,84,0.09) 2px, transparent 2px, transparent 40px),
              #15171b;
            background-blend-mode: overlay, overlay, normal;
            background-attachment: fixed;
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          }
          .dashboard-glass-card {
            background: rgba(24,26,32,0.92);
            border-radius: 28px;
            box-shadow: 0 8px 32px 0 rgba(31,38,135,0.17);
            padding: 3.2rem 2.5rem 2.7rem 2.5rem;
            max-width: 520px;
            width: 95vw;
            color: #fff;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
          }
          .dashboard-title {
            font-size: 2.25rem;
            font-weight: 700;
            letter-spacing: -1.5px;
            margin-bottom: 2.2rem;
            background: linear-gradient(90deg, #1db954 40%, #fff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-fill-color: transparent;
          }
          .dashboard-title span {
            color: #1db954;
            text-shadow: 0 0 18px #1db95466;
          }
          .dashboard-btn-row {
            display: flex;
            gap: 1.2rem;
            margin-bottom: 2.4rem;
            width: 100%;
            justify-content: center;
          }
          .dashboard-btn {
            display: flex;
            align-items: center;
            font-size: 1.1rem;
            font-weight: 600;
            padding: 0.85em 2em;
            border: none;
            border-radius: 14px;
            background: linear-gradient(90deg, #1db954 60%, #169c46 100%);
            color: #fff;
            box-shadow: 0 2px 14px 0 rgba(29,185,84,0.19);
            cursor: pointer;
            transition: background 0.18s, box-shadow 0.18s;
            outline: none;
            letter-spacing: 0.02em;
          }
          .dashboard-btn:hover {
            background: linear-gradient(90deg, #169c46 60%, #1db954 100%);
            box-shadow: 0 4px 24px 0 rgba(29,185,84,0.24);
          }
          .dashboard-openplaylist-btn {
            background: linear-gradient(90deg, #fff 10%, #1db954 100%);
            color: #15171b;
            border: 1.5px solid #1db954;
            box-shadow: 0 2px 14px 0 rgba(29,185,84,0.13);
          }
          .dashboard-openplaylist-btn:hover {
            background: linear-gradient(90deg, #1db954 60%, #fff 100%);
            color: #fff;
          }
          .dashboard-learninterest-btn {
            display: flex;
            align-items: center;
            font-size: 1.1rem;
            font-weight: 600;
            padding: 0.85em 2em;
            border: none;
            border-radius: 14px;
            background: linear-gradient(90deg, #fff 60%, #1db954 100%);
            color: #1db954;
            box-shadow: 0 2px 14px 0 rgba(29,185,84,0.09);
            cursor: pointer;
            transition: background 0.18s, box-shadow 0.18s, color 0.18s;
            outline: none;
            letter-spacing: 0.02em;
            margin-right: 0.7em;
          }
          .dashboard-learninterest-btn:hover {
            background: linear-gradient(90deg, #1db954 60%, #fff 100%);
            color: #fff;
          }
          .dashboard-prompt-area {
            width: 100%;
            margin-bottom: 1.7rem;
          }
          .dashboard-loading-bar {
            margin-top: 2.2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.8rem;
          }
          .dashboard-bar {
            width: 220px;
            height: 8px;
            background: #232323;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 0.3rem;
          }
          .dashboard-progress {
            width: 80%;
            height: 100%;
            background: linear-gradient(90deg, #1db954 30%, #169c46 100%);
            animation: loadingBar 1.2s linear infinite alternate;
          }
          @keyframes loadingBar {
            0% { width: 10%; }
            100% { width: 100%; }
          }
          @media (max-width: 600px) {
            .dashboard-glass-card {
              padding: 1.3rem 0.7rem 1.2rem 0.7rem;
              max-width: 98vw;
            }
            .dashboard-title {
              font-size: 1.45rem;
            }
            .dashboard-btn {
              font-size: 0.99rem;
              padding: 0.7em 1.1em;
            }
            .dashboard-btn-row {
              gap: 0.7rem;
            }
          }
        `}</style>
      </main>
    </>
  );
}
