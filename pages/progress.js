import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import ReactMarkdown from 'react-markdown';

export default function ProgressPage() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAIReport, setShowAIReport] = useState(false);
  const [aiReportLoading, setAIReportLoading] = useState(false);
  const [aiReportError, setAIReportError] = useState(null);
  const [aiReport, setAIReport] = useState(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) throw new Error('You must be logged in.');
        const { data, error } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        if (error) throw error;
        setAssessments(data);
      } catch (e) {
        setError(e.message || 'Failed to fetch data');
      }
      setLoading(false);
    };
    fetchAssessments();
  }, []);

  // Prepare data for chart
  const labels = assessments.map(a => new Date(a.created_at).toLocaleDateString());
  const scores = assessments.map(a => a.score || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Assessment Score',
        data: scores,
        backgroundColor: 'rgba(29,185,84,0.18)',
        borderColor: '#1db954',
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#1db954',
        pointRadius: 6,
        fill: true,
        tension: 0.35,
        cubicInterpolationMode: 'monotone',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Your Assessment Progress', color: '#fff', font: { size: 22, weight: 700 } },
      tooltip: { enabled: true, backgroundColor: '#222', titleColor: '#1db954', bodyColor: '#fff', borderColor: '#1db954', borderWidth: 1 },
    },
    scales: {
      x: { ticks: { color: '#fff', font: { weight: 600 } }, grid: { color: 'rgba(255,255,255,0.09)' } },
      y: { beginAtZero: true, ticks: { color: '#fff', font: { weight: 600 } }, grid: { color: 'rgba(255,255,255,0.09)' } },
    },
  };

  function parseAIReport(report) {
    // Try to extract weak topics for highlighting
    let weakTopics = [];
    const weakSection = report.match(/(Weak Topics|Weaknesses|Areas to Improve)[^\n]*:?\s*([\s\S]*?)(\n\n|$)/i);
    if (weakSection && weakSection[2]) {
      weakTopics = weakSection[2]
        .split(/\n|[-•]/)
        .map(s => s.trim())
        .filter(Boolean)
        .filter(t => !/^\s*(Weak|Areas|\d+\.|\*)/i.test(t));
    }

    // Custom renderer for markdown to highlight weak topics
    const components = {
      li: ({children}) => {
        const text = String(children).trim();
        const isWeak = weakTopics.some(topic => text.toLowerCase().includes(topic.toLowerCase()));
        return <li className={isWeak ? 'highlight-weak-topic' : ''}>{children}</li>;
      },
      strong: ({children}) => <strong style={{color:'#fff'}}>{children}</strong>,
      h3: ({children}) => <h3 style={{color:'#1db954',marginTop:'1.2em',fontWeight:800}}>{children}</h3>,
      p: ({children}) => <p style={{marginBottom:'0.7em'}}>{children}</p>
    };

    return <ReactMarkdown components={components}>{report}</ReactMarkdown>;
  }

  function downloadReport(report) {
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Curiofy_AI_Performance_Report.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 150);
  }

  return (
    <div className="progress-page gradient-bg" style={{minHeight:'100vh',padding:'2.5em'}}>
      <div className="progress-card glass-card" style={{maxWidth:640,margin:'48px auto',padding:'2.6em 2.8em',borderRadius:28,boxShadow:'0 8px 32px 0 rgba(31,38,135,0.19)'}}>
        <h1 style={{marginBottom:'1.5em',color:'#1db954',fontWeight:700,letterSpacing:'-1.5px',fontSize:'2.2rem'}}>My Progress</h1>
        {loading && (
          <div className="progress-loading-modern">
            <div className="progress-bar-modern">
              <div className="progress-bar-fill"></div>
            </div>
            <div style={{marginTop:'1.2em',color:'#fff',fontWeight:600}}>Loading your progress...</div>
          </div>
        )}
        {!loading && error && <div className="progress-error-modern">{error}</div>}
        {!loading && !error && assessments.length === 0 && <div className="progress-empty-modern">No assessment data found.</div>}
        {!loading && !error && assessments.length > 0 && (
          <>
            <Line data={data} options={options} />
            <button
              className="ai-report-btn"
              style={{marginTop:'2.4em',background:'#1db954',color:'#fff',border:'none',borderRadius:12,padding:'0.7em 1.6em',fontWeight:700,fontSize:'1.08rem',boxShadow:'0 2px 12px 0 rgba(29,185,84,0.13)',cursor:'pointer',transition:'background 0.18s'}}
              onClick={async () => {
                setShowAIReport(true);
                setAIReportLoading(true);
                setAIReportError(null);
                setAIReport(null);
                try {
                  const topics = await Promise.all(
                    assessments.map(async (a) => {
                      // Try to get playlist topics for each assessment
                      if (a.playlist_id) {
                        const { data } = await supabase.from('playlists').select('title').eq('id', a.playlist_id).single();
                        return data?.title || '';
                      }
                      return '';
                    })
                  );
                  const scores = assessments.map(a => a.score || 0);
                  const response = await fetch('/api/aiReport', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ scores, topics }),
                  });
                  const data = await response.json();
                  if (data.result) setAIReport(data.result);
                  else setAIReportError('Failed to generate AI report.');
                } catch (e) {
                  setAIReportError('Error generating AI report.');
                }
                setAIReportLoading(false);
              }}
            >
              <i className="fa fa-magic" style={{marginRight:'0.6em'}}></i>
              Generate AI Report
            </button>
            {showAIReport && (
              <div className="ai-report-modal-overlay">
                <div className="ai-report-modal">
                  <button className="modal-close-btn" onClick={()=>setShowAIReport(false)}>&times;</button>
                  <h2 style={{color:'#1db954',marginBottom:'1em'}}>AI Performance Analysis</h2>
                  {aiReportLoading && (
                    <div className="ai-report-loading">
                      <div className="progress-bar-modern"><div className="progress-bar-fill"></div></div>
                      <div style={{marginTop:'1em',color:'#fff'}}>Generating analysis...</div>
                    </div>
                  )}
                  {aiReportError && <div className="progress-error-modern">{aiReportError}</div>}
                  {aiReport && (
                    <div className="ai-report-content-formatted scrollable-modal-content">
                      {parseAIReport(aiReport)}
                      <button className="download-report-btn" onClick={() => downloadReport(aiReport)}>
                        <i className="fa fa-download" style={{marginRight:'0.5em'}}></i>Download Report
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <style jsx>{`
        .progress-card {
          background: rgba(24,26,32,0.90);
          backdrop-filter: blur(18px) saturate(140%);
          border: 1.5px solid rgba(255,255,255,0.13);
        }
        .progress-loading-modern {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.5em;
        }
        .progress-bar-modern {
          width: 88%;
          height: 8px;
          background: rgba(29,185,84,0.13);
          border-radius: 8px;
          overflow: hidden;
          margin: 0 auto;
        }
        .progress-bar-fill {
          height: 100%;
          width: 100%;
          background: linear-gradient(90deg, #1db954 0%, #169c46 100%);
          border-radius: 8px;
          animation: progressBarStripes 1.2s linear infinite alternate;
        }
        @keyframes progressBarStripes {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .progress-error-modern {
          color: #ff5252;
          background: rgba(255,82,82,0.09);
          border-radius: 8px;
          padding: 1em;
          text-align: center;
          font-weight: 600;
          margin-bottom: 1em;
        }
        .progress-empty-modern {
          color: #fff;
          background: rgba(29,185,84,0.09);
          border-radius: 8px;
          padding: 1em;
          text-align: center;
          font-weight: 600;
          margin-bottom: 1em;
        }
        .ai-report-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.55); z-index: 1200;
          display: flex; align-items: center; justify-content: center;
        }
        .ai-report-modal {
          background: #181a20;
          border-radius: 24px;
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.19);
          padding: 2.5rem 2.2rem;
          min-width: 340px;
          max-width: 98vw;
          min-height: 220px;
          position: relative;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
        }
        .modal-close-btn {
          position: absolute;
          top: 12px;
          right: 16px;
          background: none;
          border: none;
          font-size: 2.2rem;
          color: #fff;
          cursor: pointer;
        }
        .ai-report-loading {
          display: flex; flex-direction: column; align-items: center; margin-bottom: 1.5em;
        }
        .ai-report-content-formatted {
          color: #fff;
          background: rgba(29,185,84,0.07);
          border-radius: 14px;
          padding: 1.5em 1.1em 1.8em 1.1em;
          margin-top: 1.2em;
          margin-bottom: 1.2em;
          font-size: 1.08rem;
          box-shadow: 0 2px 16px 0 rgba(29,185,84,0.09);
          font-weight: 600;
        }
        .ai-report-content-formatted h3 {
          color: #1db954;
          margin-top: 1.2em;
          font-size: 1.18em;
          font-weight: 800;
        }
        .ai-report-content-formatted ul {
          margin-left: 1.2em;
          margin-bottom: 0.7em;
        }
        .ai-report-content-formatted li {
          margin-bottom: 0.35em;
        }
        .scrollable-modal-content {
          overflow-y: auto;
          max-height: 60vh;
        }
        .download-report-btn {
          margin-top: 1.7em;
          background: #1db954;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.6em 1.3em;
          font-weight: 700;
          font-size: 1.01rem;
          box-shadow: 0 2px 12px 0 rgba(29,185,84,0.13);
          cursor: pointer;
          transition: background 0.18s;
          display: flex;
          align-items: center;
        }
        .download-report-btn:hover {
          background: #169c46;
        }
        .highlight-weak-topic {
          background: #ff525220;
          color: #ff5252 !important;
          font-weight: 700;
          border-radius: 6px;
          padding: 2px 7px;
          display: inline-block;
          margin-bottom: 0.25em;
        }
      `}</style>
    </div>
  );
}
