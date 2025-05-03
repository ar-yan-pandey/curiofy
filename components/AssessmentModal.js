import { useState, useEffect } from 'react';
import { getAssessmentQuestions } from '../utils/gemini';

import { supabase } from '../utils/supabaseClient';

export default function AssessmentModal({ open, onClose, explanations, playlistId, userId: propUserId }) {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [userId, setUserId] = useState(propUserId || null);

  // Always fetch userId from Supabase auth when modal opens
  useEffect(() => {
    async function fetchUserId() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      else setUserId(null);
    }
    if (open) fetchUserId();
  }, [open, propUserId]);
  useEffect(() => {
    if (open && explanations) {
      setQuestions([]);
      setCurrentIdx(0);
      setAnswers([]);
      setShowResult(false);
      setScore(0);
      getAssessmentQuestions(explanations).then(setQuestions);
    }
  }, [open, explanations]);

  if (!open) return null;

  const handleAnswer = (selected) => {
    setAnimating(true);
    setTimeout(() => {
      setAnswers(prev => [...prev, selected]);
      if (currentIdx < 4) {
        setCurrentIdx(idx => idx + 1);
      } else {
        // Calculate score
        let sc = 0;
        questions.forEach((q, i) => {
          if (q.options[q.answer] === answers[i]) sc++;
        });
        setScore(sc);
        setShowResult(true);
      }
      setAnimating(false);
    }, 350); // Animation duration
  };


  const handleSaveAssessment = async () => {
    setSaving(true);
    setSaveMsg(null);
    if (!userId) {
      setSaveMsg('Cannot save: User not logged in. Please log in again.');
      setSaving(false);
      return;
    }
    if (!playlistId) {
      setSaveMsg('Cannot save: Playlist is not saved. Please save the playlist first.');
      setSaving(false);
      return;
    }
    try {
      // Get the user's Supabase access token
      const session = await supabase.auth.getSession();
      const access_token = session.data.session?.access_token;
      if (!access_token) {
        setSaveMsg('Cannot save: User session invalid. Please log in again.');
        setSaving(false);
        return;
      }
      const resp = await fetch('/api/saveAssessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          playlist_id: playlistId,
          score,
          accuracy: (score / 5 * 100),
          questions: JSON.stringify(questions),
          answers: JSON.stringify(answers),
          access_token
        })
      });
      const data = await resp.json();
      if (data.success) setSaveMsg('Assessment saved successfully!');
      else setSaveMsg('Failed to save assessment.');
    } catch (e) {
      setSaveMsg('Error saving assessment.');
    }
    setSaving(false);
  };


  return (
    <div className="assessment-modal-overlay">
      <div className="assessment-modal">
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        {!questions.length ? (
          <div className="assessment-loading">
            <div className="progress-bar-wrap">
              <div className="progress-bar"></div>
            </div>
            Loading assessment...
          </div>
        ) : showResult ? (
          <div className="assessment-result-card">
            <h2>Assessment Result</h2>
            <div>Score: {score} / 5</div>
            <div>Accuracy: {(score / 5 * 100).toFixed(0)}%</div>
            <button className="assessment-save-btn" onClick={handleSaveAssessment} disabled={saving}>
              {saving ? 'Saving...' : 'Save Assessment'}
            </button>
            {saveMsg && <div className="save-msg">{saveMsg}</div>}
            <button className="assessment-home-btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <div className={`assessment-card${animating ? ' fade-out' : ' fade-in'}`}>
            <h2>Question {currentIdx + 1} of 5</h2>
            <div className="assessment-question">{questions[currentIdx]?.question}</div>
            <div className="assessment-options">
              {questions[currentIdx]?.options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(opt)} className="assessment-option-btn">{opt}</button>
              ))}
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .assessment-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.55);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .assessment-modal {
          background: #181a20;
          border-radius: 24px;
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.19);
          padding: 2.5rem 2.2rem;
          min-width: 340px;
          max-width: 98vw;
          min-height: 320px;
          position: relative;
        }
        .modal-close-btn {
          position: absolute;
          top: 12px;
          right: 16px;
          background: transparent;
          border: none;
          font-size: 2rem;
          color: #fff;
          cursor: pointer;
        }
        .assessment-loading {
          margin: 2rem 0;
          color: #fff;
          text-align: center;
        }
        .progress-bar-wrap {
          width: 100%;
          height: 8px;
          background: #232;
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 1.2rem;
        }
        .progress-bar {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #1db954 0%, #169c46 100%);
          animation: progressBarAnim 1.2s linear infinite alternate;
        }
        @keyframes progressBarAnim {
          0% { transform: translateX(-80%); }
          100% { transform: translateX(0); }
        }
        .assessment-result-card {
          max-width: 420px;
          margin: 0 auto;
          background: rgba(24,26,32,0.93);
          border-radius: 22px;
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.13);
          padding: 2.5rem 2rem;
          color: #fff;
          text-align: center;
        }
        .assessment-save-btn {
          margin-top: 2rem;
          background: #1db954;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.7em 2em;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .assessment-save-btn:hover {
          background: #169c46;
        }
        .save-msg {
          margin-top: 1rem;
          font-size: 1.01rem;
          color: #1db954;
        }
        .assessment-home-btn {
          margin-top: 2rem;
          background: #232;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.7em 2em;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
          display: block;
        }
        .assessment-home-btn:hover {
          background: #1db954;
        }
        .assessment-card {
          max-width: 420px;
          margin: 0 auto;
          background: rgba(24,26,32,0.93);
          border-radius: 22px;
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.13);
          padding: 2.5rem 2rem;
          color: #fff;
          text-align: center;
          transition: opacity 0.35s, transform 0.35s;
        }
        .fade-in {
          opacity: 1;
          transform: translateY(0);
        }
        .fade-out {
          opacity: 0;
          transform: translateY(40px);
        }
        .assessment-question {
          font-size: 1.15rem;
          margin-bottom: 1.4rem;
          margin-top: 1.2rem;
        }
        .assessment-options {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        .assessment-option-btn {
          background: linear-gradient(90deg, #1db954 0%, #169c46 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.8em 1.5em;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px 0 rgba(29,185,84,0.13);
          transition: background 0.2s;
        }
        .assessment-option-btn:hover {
          background: linear-gradient(90deg, #169c46 0%, #1db954 100%);
        }
      `}</style>
    </div>
  );
}
