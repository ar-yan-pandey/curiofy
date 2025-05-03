import React from 'react';
import styles from '../styles/ChatPrompt.module.css';
import { forwardRef, useImperativeHandle, useState, useRef } from 'react';

const LANGUAGES = [
  { code: 'en-US', label: 'English', voice: 'en-US-Wavenet-F' },
  { code: 'hi-IN', label: 'Hindi', voice: 'hi-IN-Wavenet-A' },
  { code: 'es-ES', label: 'Spanish', voice: 'es-ES-Wavenet-D' },
  { code: 'fr-FR', label: 'French', voice: 'fr-FR-Wavenet-E' },
  { code: 'de-DE', label: 'German', voice: 'de-DE-Wavenet-B' },
  { code: 'it-IT', label: 'Italian', voice: 'it-IT-Wavenet-C' },
  { code: 'ja-JP', label: 'Japanese', voice: 'ja-JP-Wavenet-B' },
  { code: 'zh-CN', label: 'Chinese', voice: 'cmn-CN-Wavenet-A' },
];

const ChatPrompt = forwardRef(function ChatPrompt({ onSubmit }, ref) {
  const [value, setValue] = useState('');
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [langOpen, setLangOpen] = useState(false);
  const [duration, setDuration] = useState('1'); // default 1 min
  const DURATION_OPTIONS = [
    { value: '0.5', label: '30s' },
    { value: '1', label: '1 min' },
    { value: '2', label: '2 min' },
    { value: '3', label: '3 min' },
    { value: '5', label: '5 min' },
  ];
  const langDropdownRef = useRef();

  useImperativeHandle(ref, () => ({
    setValue,
    getValue: () => value
  }), [value]);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClick(e) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    }
    if (langOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [langOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (value.trim() && onSubmit) {
      onSubmit(value, language, duration);
      setValue('');
    }
  };

  return (
    <form className="chatprompt-modern-card" onSubmit={handleSend}>
      <div className="chatprompt-lang-row">
        <label className="chatprompt-lang-label">Language:</label>
        <div className="chatprompt-lang-dropdown" ref={langDropdownRef}>
          <button
            type="button"
            className="chatprompt-lang-selected"
            onClick={() => setLangOpen(v => !v)}
            aria-haspopup="listbox"
            aria-expanded={langOpen}
          >
            <span className="chatprompt-lang-flag" role="img" aria-label={language.label}>
              {language.code === 'en-US' && '🇬🇧'}
              {language.code === 'hi-IN' && '🇮🇳'}
              {language.code === 'es-ES' && '🇪🇸'}
              {language.code === 'fr-FR' && '🇫🇷'}
              {language.code === 'de-DE' && '🇩🇪'}
              {language.code === 'it-IT' && '🇮🇹'}
              {language.code === 'ja-JP' && '🇯🇵'}
              {language.code === 'zh-CN' && '🇨🇳'}
            </span>
            <span className="chatprompt-lang-label-text">{language.label}</span>
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" style={{marginLeft:'0.4em'}}><path d="M6 8l4 4 4-4" stroke="#1db954" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          {langOpen && (
            <ul className="chatprompt-lang-list" tabIndex={-1} role="listbox">
              {LANGUAGES.map(l => (
                <li
                  key={l.code}
                  className={`chatprompt-lang-option${l.code === language.code ? ' selected' : ''}`}
                  role="option"
                  aria-selected={l.code === language.code}
                  onClick={() => {
                    setLanguage(l);
                    setLangOpen(false);
                  }}
                >
                  <span className="chatprompt-lang-flag" role="img" aria-label={l.label}>
                    {l.code === 'en-US' && '🇬🇧'}
                    {l.code === 'hi-IN' && '🇮🇳'}
                    {l.code === 'es-ES' && '🇪🇸'}
                    {l.code === 'fr-FR' && '🇫🇷'}
                    {l.code === 'de-DE' && '🇩🇪'}
                    {l.code === 'it-IT' && '🇮🇹'}
                    {l.code === 'ja-JP' && '🇯🇵'}
                    {l.code === 'zh-CN' && '🇨🇳'}
                  </span>
                  <span className="chatprompt-lang-label-text">{l.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="chatprompt-duration-row">
        <label className="chatprompt-duration-label">Duration:</label>
        <div className="chatprompt-duration-options">
          {DURATION_OPTIONS.map(opt => (
            <button
              type="button"
              key={opt.value}
              className={`chatprompt-duration-btn${duration === opt.value ? ' selected' : ''}`}
              onClick={() => setDuration(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="chatprompt-textarea-wrap">
        <textarea
          id="chat_bot"
          name="chat_bot"
          className="chatprompt-textarea"
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={3}
          autoComplete="off"
          spellCheck={false}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleSend(e);
            }
          }}
        />
        <label htmlFor="chat_bot" className={`chatprompt-floating-label${value ? ' filled' : ''}`}>What do you want to learn?</label>
        <button type="submit" className="chatprompt-send-btn" aria-label="Submit">
          <svg width="28" height="28" viewBox="0 0 512 512">
            <defs>
              <radialGradient id="send-glow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#1db954" stopOpacity="0.7"/>
                <stop offset="100%" stopColor="#169c46" stopOpacity="0.9"/>
              </radialGradient>
            </defs>
            <path fill="url(#send-glow)" d="M473 39.05a24 24 0 0 0-25.5-5.46L47.47 185h-.08a24 24 0 0 0 1 45.16l.41.13l137.3 58.63a16 16 0 0 0 15.54-3.59L422 80a7.07 7.07 0 0 1 10 10L226.66 310.26a16 16 0 0 0-3.59 15.54l58.65 137.38c.06.2.12.38.19.57c3.2 9.27 11.3 15.81 21.09 16.25h1a24.63 24.63 0 0 0 23-15.46L478.39 64.62A24 24 0 0 0 473 39.05" />
          </svg>
        </button>
      </div>
      <style jsx>{`
        .chatprompt-modern-card {
          background: rgba(24,26,32,0.93);
          border-radius: 18px;
          box-shadow: 0 2px 18px 0 rgba(31,38,135,0.11);
          padding: 1.6rem 1.3rem 1.2rem 1.3rem;
          display: flex;
          flex-direction: column;
          gap: 1.3rem;
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          position: relative;
        }
        .chatprompt-lang-row {
          display: flex;
          align-items: center;
          gap: 0.7em;
        }
        .chatprompt-lang-label {
          font-weight: 500;
          color: #bbb;
          font-size: 1.08em;
        }
        .chatprompt-lang-dropdown {
          position: relative;
          min-width: 134px;
        }
        .chatprompt-lang-selected {
          display: flex;
          align-items: center;
          gap: 0.5em;
          background: linear-gradient(90deg, #1db95422 0%, #191919 100%);
          color: #fff;
          border: 1.5px solid #232;
          border-radius: 8px;
          padding: 0.27em 1.05em 0.27em 0.7em;
          font-size: 1em;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          transition: border 0.18s, box-shadow 0.18s;
        }
        .chatprompt-lang-selected:focus, .chatprompt-lang-selected:hover {
          border: 1.5px solid #1db954;
          box-shadow: 0 2px 8px 0 #1db95422;
        }
        .chatprompt-lang-list {
          position: absolute;
          top: 110%;
          left: 0;
          width: 100%;
          background: #202226;
          border-radius: 10px;
          box-shadow: 0 8px 28px 0 rgba(31,185,84,0.13);
          z-index: 20;
          margin: 0;
          padding: 0.4em 0;
          list-style: none;
          max-height: 220px;
          overflow-y: auto;
          animation: fadeInLang 0.17s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeInLang {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chatprompt-lang-option {
          display: flex;
          align-items: center;
          gap: 0.5em;
          padding: 0.53em 1.1em;
          font-size: 1em;
          color: #fff;
          cursor: pointer;
          transition: background 0.16s, color 0.16s;
        }
        .chatprompt-lang-option.selected, .chatprompt-lang-option:hover {
          background: #1db95433;
          color: #1db954;
        }
        .chatprompt-lang-flag {
          font-size: 1.18em;
        }
        .chatprompt-lang-label-text {
          font-weight: 500;
        }
        .chatprompt-duration-row {
          display: flex;
          align-items: center;
          margin-bottom: 0.7em;
          gap: 0.7em;
        }
        .chatprompt-duration-label {
          font-weight: 500;
          color: #bbb;
          font-size: 1.08em;
        }
        .chatprompt-duration-options {
          display: flex;
          gap: 0.5em;
        }
        .chatprompt-duration-btn {
          background: #232;
          color: #fff;
          border: 1.5px solid #232;
          border-radius: 7px;
          padding: 0.33em 1.05em;
          font-size: 1em;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          transition: border 0.16s, background 0.16s, color 0.16s;
        }
        .chatprompt-duration-btn.selected, .chatprompt-duration-btn:hover {
          background: #1db95433;
          color: #1db954;
          border: 1.5px solid #1db954;
        }
        .chatprompt-textarea-wrap {
          position: relative;
          display: flex;
          align-items: flex-end;
          width: 100%;
        }
        .chatprompt-textarea {
          width: 100%;
          min-height: 56px;
          max-height: 160px;
          resize: vertical;
          border-radius: 13px;
          border: 1.8px solid #232;
          background: linear-gradient(90deg, #232323 0%, #191919 100%);
          color: #fff;
          font-size: 1.13em;
          font-family: inherit;
          padding: 1.4em 3.2em 1.1em 1.2em;
          outline: none;
          box-shadow: 0 1px 8px 0 rgba(29,185,84,0.06);
          transition: border 0.18s, box-shadow 0.18s;
        }
        .chatprompt-textarea:focus {
          border: 1.8px solid #1db954;
          box-shadow: 0 1px 16px 0 #1db95433;
        }
        .chatprompt-floating-label {
          position: absolute;
          left: 1.3em;
          top: 1.1em;
          font-size: 1.05em;
          color: #a4a4a4;
          pointer-events: none;
          opacity: 1;
          transform: translateY(0);
          transition: 0.19s cubic-bezier(.4,0,.2,1);
          background: transparent;
        }
        .chatprompt-floating-label.filled,
        .chatprompt-textarea:focus ~ .chatprompt-floating-label {
          top: -0.8em;
          left: 0.9em;
          font-size: 0.92em;
          color: #1db954;
          opacity: 1;
          background: #191919;
          padding: 0 0.3em;
          border-radius: 7px;
        }
        .chatprompt-send-btn {
          position: absolute;
          right: 0.7em;
          bottom: 0.7em;
          background: none;
          border: none;
          outline: none;
          cursor: pointer;
          border-radius: 50%;
          padding: 0.25em;
          box-shadow: 0 0 0 0 #1db95400;
          transition: box-shadow 0.18s;
          z-index: 2;
        }
        .chatprompt-send-btn:hover {
          // box-shadow: 0 0 16px 2px #1db95455;
          scale: 1.1;
        }
        @media (max-width: 600px) {
          .chatprompt-modern-card {
            padding: 1.1rem 0.5rem 0.9rem 0.5rem;
            max-width: 99vw;
          }
          .chatprompt-lang-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.4em;
          }
        }
      `}</style>
    </form>
  );
});

export default ChatPrompt;
