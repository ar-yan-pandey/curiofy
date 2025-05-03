import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAssessmentQuestions } from '../utils/gemini';

export default function AssessmentPage() {
  const router = useRouter();
  const { explanations } = router.query;
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  // Move these hooks to top-level to avoid render mismatch
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  useEffect(() => {
    if (explanations) {
      getAssessmentQuestions(explanations).then(setQuestions);
    }
  }, [explanations]);

  const handleAnswer = (selected) => {
    setAnswers([...answers, selected]);
    if (currentIdx < 4) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Calculate score
      let sc = 0;
      questions.forEach((q, i) => {
        if (q.options[q.answer] === answers[i]) sc++;
      });
      setScore(sc);
      setShowResult(true);
    }
  };

  if (!questions.length) return (
    <div className="assessment-loading">
      <div className="progress-bar-wrap">
        <div className="progress-bar"></div>
      </div>
      Loading assessment...
      <style jsx>{`
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
      `}</style>
    </div>
  );

  if (showResult) {
    const handleSaveAssessment = async () => {
      setSaving(true);
      setSaveMsg(null);
      // Get playlist_id and user_id
      const playlist_id = router.query.playlist_id || null;
      const user_id = window.localStorage.getItem('user_id') || null; // Replace with your auth method
      if (!user_id || !playlist_id) {
        setSaveMsg('Cannot save: Missing user or playlist information.');
        setSaving(false);
        return;
      }
      try {
        const resp = await fetch('/api/saveAssessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id,
            playlist_id,
            score,
            accuracy: (score / 5 * 100),
            questions: JSON.stringify(questions),
            answers: JSON.stringify(answers)
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
      <div className="assessment-result-card">
        <h2>Assessment Result</h2>
        <div>Score: {score} / 5</div>
        <div>Accuracy: {(score / 5 * 100).toFixed(0)}%</div>
        <button className="assessment-save-btn" onClick={handleSaveAssessment} disabled={saving}>
          {saving ? 'Saving...' : 'Save Assessment'}
        </button>
        {saveMsg && <div className="save-msg">{saveMsg}</div>}
        <button className="assessment-home-btn" onClick={() => router.push('/playlist')}>Back to Playlist</button>
        <style jsx>{`
          .assessment-result-card {
            max-width: 420px;
            margin: 72px auto;
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
        `}</style>
      </div>
    );
  }

  const q = questions[currentIdx];
  return (
    <div className="assessment-card">
      <h2>Question {currentIdx + 1} of 5</h2>
      <div className="assessment-question">{q.question}</div>
      <div className="assessment-options">
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(opt)} className="assessment-option-btn">{opt}</button>
        ))}
      </div>
      <style jsx>{`
        .assessment-card {
          max-width: 420px;
          margin: 72px auto;
          background: rgba(24,26,32,0.93);
          border-radius: 22px;
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.13);
          padding: 2.5rem 2rem;
          color: #fff;
          text-align: center;
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

