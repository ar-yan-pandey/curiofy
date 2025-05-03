import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const GOOGLE_TTS_BASE = 'https://translate.google.com/translate_tts';

import { useRef } from 'react';
import AssessmentModal from '../components/AssessmentModal';

function CustomAudioPlayer({ src, autoPlay, onEnded }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(!!autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [seeking, setSeeking] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (autoPlay) audioRef.current.play();
    }
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };
  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };
  const handleSeek = e => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    setSeeking(true);
  };
  const handleSeekCommit = e => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = parseFloat(e.target.value);
    setSeeking(false);
  };
  const handleVolume = e => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };
  const handlePlayState = () => setPlaying(true);
  const handlePauseState = () => setPlaying(false);

  // Format time as mm:ss
  const fmt = s => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div className="custom-audio-player">
      <audio
        ref={audioRef}
        src={src}
        autoPlay={autoPlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onEnded}
        onPlay={handlePlayState}
        onPause={handlePauseState}
        style={{ display: 'none' }}
      />
      <div className="controls-row">
        <button className="audio-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? (
            <svg width="28" height="28" viewBox="0 0 28 28"><rect x="6" y="5" width="5" height="18" rx="2" fill="#fff"/><rect x="17" y="5" width="5" height="18" rx="2" fill="#fff"/></svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 28 28"><polygon points="7,5 23,14 7,23" fill="#fff"/></svg>
          )}
        </button>
        <span className="audio-time">{fmt(seeking ? currentTime : currentTime)}</span>
        <input
          className="audio-slider"
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={seeking ? currentTime : currentTime}
          onChange={handleSeek}
          onMouseUp={handleSeekCommit}
          onTouchEnd={handleSeekCommit}
        />
        <span className="audio-time">{fmt(duration)}</span>
        <input
          className="audio-volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolume}
        />
        {(src) && (
          <a
            href={src}
            download="audio.mp3"
            className="audio-download-btn"
            title="Download MP3"
            style={{ marginLeft: '0.7em', background: '#1db954', color: '#fff', borderRadius: '8px', padding: '0.4em 1em', textDecoration: 'none', fontWeight: 600 }}
          >
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none" style={{verticalAlign:'middle',marginRight:'0.4em'}}><path d="M10.5 3v10.5M10.5 13.5l-4-4m4 4l4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="17" width="13" height="2" rx="1" fill="#fff"/></svg>
            Download
          </a>
        )}
      </div>
      <style jsx>{`
        .custom-audio-player {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 1.5em;
        }
        .controls-row {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1em;
        }
        .audio-btn {
          background: var(--curiofy-green);
          border: none;
          border-radius: 50%;
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-right: 0.5em;
        }
        .audio-btn:hover {
          background: #169c46;
        }
        .audio-slider {
          flex: 1;
          margin: 0 0.5em;
          accent-color: var(--curiofy-green);
          height: 4px;
        }
        .audio-volume {
          width: 70px;
          accent-color: var(--curiofy-green);
        }
        .audio-time {
          font-size: 0.98rem;
          color: var(--curiofy-text-secondary);
          min-width: 40px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

import { supabase } from '../utils/supabaseClient';

export default function PlaylistPage() {
  // ...other hooks
  const [showAssessment, setShowAssessment] = useState(false);
  const [playlistId, setPlaylistId] = useState(null);
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const [playlist, setPlaylist] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [playingIdx, setPlayingIdx] = useState(null);
  const [loadingStage, setLoadingStage] = useState("");

  useEffect(() => {
    if (router.query.data) {
      try {
        setPlaylist(JSON.parse(decodeURIComponent(router.query.data)));
      } catch {
        setPlaylist([]);
      }
    }
    // Try to get playlist_id from query if present
    if (router.query.playlist_id) setPlaylistId(router.query.playlist_id);
    // Get user_id from localStorage (or use your auth method)
    if (typeof window !== 'undefined') {
      const uid = window.localStorage.getItem('user_id');
      if (uid) setUserId(uid);
    }
  }, [router.query.data, router.query.playlist_id]);

  const [audioLoading, setAudioLoading] = useState(false);
  const [albumArts, setAlbumArts] = useState({}); // { idx: base64 }
  const [artLoading, setArtLoading] = useState(false);
  const [albumArtError, setAlbumArtError] = useState("");

  const handlePlay = async (_unused, idx) => {
    const lang = playlist[idx]?.language || { code: 'en-US', voice: 'en-US-Wavenet-F' };
    const explanationText = playlist[idx]?.explanation || '';
    // Album art: fetch if not already generated
    setLoadingStage("Loading...");
    if (!albumArts[idx]) {
      setArtLoading(true);
      setAlbumArtError("");
      try {
        const prompt = `A beautiful, modern, vibrant album cover art for the topic: ${playlist[idx]?.topic}`;
        const res = await fetch('/api/albumart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.image) {
            setAlbumArts(prev => ({ ...prev, [idx]: data.image }));
          } else {
            setAlbumArtError(data.error || 'No image generated.');
          }
        } else {
          const err = await res.json();
          setAlbumArtError(err.error || 'Failed to generate album art.');
        }
      } catch (e) {
        setAlbumArtError('Failed to call album art API.');
      }
      setArtLoading(false);
    }
    setLoadingStage("Generating audio...");
    console.log('Explanation:', explanationText);
    setAudioLoading(true);
    setPlayingIdx(idx);
    setPlaying(false);
    setAudioUrl(null);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: explanationText, languageCode: lang.code, voice: lang.voice }),
      });
      if (!res.ok) throw new Error('TTS API error');
      const data = await res.json();
      const audioBase64 = data.audioContent;
      const audioBlob = new Blob([Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
      setPlaying(true);
    } catch (err) {
      alert('Failed to generate audio.');
    }
    setLoadingStage("");
    setAudioLoading(false);
  };


  const handleAudioEnd = () => {
    setPlaying(false);
    setPlayingIdx(null);
    setAudioUrl(null);
  };

  // Save playlist to Supabase
  const handleSavePlaylist = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        alert('You must be logged in to save playlists.');
        return;
      }
      // Insert and get the id
      const { data, error } = await supabase.from('playlists').insert([
        {
          user_id: user.id,
          created_at: new Date().toISOString(),
          title: playlist.map(p => p.topic).join(', ').slice(0, 80) || 'Playlist',
          data: playlist,
        },
      ]).select('id').single();
      if (error) throw error;
      if (data && data.id) {
        setPlaylistId(data.id);
        alert('Playlist saved! ID: ' + data.id);
      } else {
        alert('Playlist saved, but could not retrieve playlist ID.');
      }
    } catch (e) {
      alert('Failed to save playlist: ' + (e.message || e));
    }
  };

  return (
    <div className="playlist-main-container gradient-bg">
      <button className="save-playlist-btn" onClick={handleSavePlaylist}>Save Playlist</button>
      <div className="playlist-content-card glass-card">
        <div className="playlist-two-col">
          <div className="topics-list">
            <h2>Topics</h2>
            {playlist.length === 0 && <div>No playlist found.</div>}
            {playlist.map((item, idx) => (
              <div
                key={idx}
                className={`topic-item${playingIdx === idx ? ' active' : ''}`}
                onClick={() => handlePlay(null, idx)}
              >
                <span className="topic-title">{item.topic}</span>
                <button
                  className="play-btn"
                  aria-label="Play audio"
                  onClick={e => { e.stopPropagation(); handlePlay(null, idx); }}
                  disabled={audioLoading && playingIdx === idx}
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="10" fill="#1db954"/>
                    <polygon points="7,5 16,10 7,15" fill="#fff"/>
                  </svg>
                  <span style={{marginLeft:'0.5em'}}>{(audioLoading && playingIdx === idx) ? 'Loading...' : 'Play'}</span>
                </button>
              </div>
            ))}
          </div>
          <div className="media-player-col">
            <div className="media-player-box glass-card">
              {loadingStage && (
                <div className="loading-bar-container">
                  <div className="loading-bar">
                    <div className="loading-bar-progress" />
                  </div>
                  <div className="loading-bar-label">{loadingStage}</div>
                </div>
              )}
              <div className="media-player-header-row">
                <h2>Media Player</h2>
              </div>
              {playingIdx !== null && (
                <>
                  <div className="album-art-wrap">
                    {artLoading && !albumArts[playingIdx] && (
                      <div className="album-art-placeholder">Generating album art...</div>
                    )}
                    {albumArts[playingIdx] && (
                      <img
                        className="album-art-img"
                        src={`data:image/png;base64,${albumArts[playingIdx]}`}
                        alt="Album Art"
                      />
                    )}
                    {!artLoading && !albumArts[playingIdx] && (
                      <div className="album-art-placeholder album-art-error">
                        <span>No album art</span>
                        {albumArtError && <div className="album-art-error-text">{albumArtError}</div>}
                      </div>
                    )}
                  </div>
                  <div className="media-topic">{playlist[playingIdx]?.topic}</div>
                  <CustomAudioPlayer
                    src={audioUrl}
                    autoPlay
                    onEnded={handleAudioEnd}
                    key={audioUrl}
                  />
                </>
              )}
              {playingIdx === null && <div className="media-placeholder">Select a topic to play audio</div>}
              <button
                className="give-assessment-btn"
                onClick={() => setShowAssessment(true)}
                style={{marginTop:'2em'}}
              >
                Give Assessment
              </button>
              <button
                className="share-playlist-btn"
                style={{ marginTop: '1.2em', background: '#1da1f2', color: '#fff', borderRadius: '8px', padding: '0.4em 1em', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                onClick={() => {
                  const url = playlistId ? `${window.location.origin}/playlist?playlist_id=${playlistId}` : window.location.href;
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(url);
                    alert('Playlist link copied to clipboard!');
                  } else {
                    prompt('Copy this playlist link:', url);
                  }
                }}
                disabled={!playlistId}
                title={playlistId ? 'Share this playlist' : 'Save playlist to enable sharing'}
              >
                <i className="fa fa-share-alt" style={{marginRight:'0.5em', fontSize:'1.1em'}}></i>
                Share
              </button>
              <AssessmentModal
                open={showAssessment}
                onClose={() => setShowAssessment(false)}
                explanations={playlist.map(item => item.explanation).join('\n\n')}
                playlistId={playlistId}
                userId={userId}
              />
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .gradient-bg {
          min-height: 100vh;
          width: 100vw;
          // background:
          //   repeating-linear-gradient(135deg, rgba(29,185,84,0.13) 0px, rgba(29,185,84,0.13) 2px, transparent 2px, transparent 40px),
          //   repeating-linear-gradient(45deg, rgba(29,185,84,0.10) 0px, rgba(29,185,84,0.10) 2px, transparent 2px, transparent 40px),
          //   #15171b;
          background-blend-mode: overlay, overlay, normal;
          background-attachment: fixed;
        }
        .playlist-main-container {
          min-height: 100vh;
          width: 100vw;
        }
        .playlist-content-card {
          max-width: 1200px;
          margin: 56px auto 0 auto;
          border-radius: 30px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.19);
          padding: 2.8rem 2.2rem 2.2rem 2.2rem;
          background: rgba(24, 26, 32, 0.63);
          backdrop-filter: blur(18px) saturate(140%);
          border: 1.5px solid rgba(255,255,255,0.13);
          position: relative;
        }
        .save-playlist-btn {
          position: fixed;
          top: 24px;
          right: 36px;
          z-index: 20;
          background: linear-gradient(90deg, #1db954 0%, #169c46 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 0.8em 2.4em;
          font-weight: 700;
          font-size: 1.13rem;
          cursor: pointer;
          box-shadow: 0 2px 12px 0 rgba(29,185,84,0.13);
          transition: background 0.2s, box-shadow 0.2s;
          letter-spacing: 0.02em;
        }
        .save-playlist-btn:hover {
          background: linear-gradient(90deg, #169c46 0%, #1db954 100%);
          box-shadow: 0 4px 16px 0 rgba(29,185,84,0.19);
        }
        .playlist-two-col {
          display: flex;
          flex-direction: row;
          gap: 2.5rem;
        }
        .topics-list {
          width: 330px;
          background: rgba(23, 28, 40, 0.82);
          padding: 2rem 1.5rem 2rem 2rem;
          border-right: 2px solid rgba(34,34,34,0.5);
          display: flex;
          flex-direction: column;
          border-radius: 24px;
          box-shadow: 0 2px 16px 0 rgba(0,0,0,0.09);
        }
        .topic-item {
          background: rgba(32, 36, 50, 0.95);
          border-radius: 13px;
          padding: 1.1em 1.1em 1.1em 1.5em;
          margin-bottom: 1.2em;
          box-shadow: 0 2px 12px rgba(0,0,0,0.11);
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: background 0.16s, box-shadow 0.16s;
          border: 1.5px solid transparent;
        }
        .topic-item.active {
          background: rgba(40, 49, 65, 0.97);
          border: 1.5px solid var(--curiofy-green);
          box-shadow: 0 2px 16px 0 rgba(29,185,84,0.07);
        }
        .topic-title {
          font-size: 1.08rem;
          font-weight: 500;
          color: var(--curiofy-green);
        }
        .play-btn {
          background: var(--curiofy-green);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0.4rem 1rem;
          font-weight: bold;
          font-size: 0.98rem;
          cursor: pointer;
          margin-left: 1.2rem;
          transition: background 0.2s;
          display: flex;
          align-items: center;
        }
        .play-btn:disabled {
          background: #888;
          cursor: not-allowed;
        }
        .play-btn:hover:not(:disabled) {
          background: #169c46;
        }
        .media-player-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
        }
        .media-player-box {
          background: rgba(23, 28, 40, 0.93);
          border-radius: 28px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.13);
          padding: 2.8rem 2.2rem;
          min-height: 360px;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 2rem;
          border: 1.5px solid rgba(255,255,255,0.07);
        }
        .give-assessment-btn {
          margin-top: 2.5rem;
          background: linear-gradient(90deg, #1db954 0%, #169c46 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 0.9em 2.1em;
          font-weight: 700;
          font-size: 1.13rem;
          cursor: pointer;
          box-shadow: 0 2px 12px 0 rgba(29,185,84,0.13);
          transition: background 0.2s, box-shadow 0.2s;
          letter-spacing: 0.02em;
          text-decoration: none;
          display: inline-block;
        }
        .give-assessment-btn:hover {
          background: linear-gradient(90deg, #169c46 0%, #1db954 100%);
          box-shadow: 0 4px 16px 0 rgba(29,185,84,0.19);
        }
        .save-assessment-btn {
          margin-top: 1.2rem;
          background: #222;
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 0.8em 2em;
          font-weight: 600;
          font-size: 1.07rem;
          cursor: pointer;
          box-shadow: 0 2px 8px 0 rgba(29,185,84,0.11);
          transition: background 0.2s;
        }
        .save-assessment-btn:hover {
          background: #1db954;
        }
        .media-player-box h2 {
          color: var(--curiofy-green);
          margin-bottom: 1.3rem;
        }
        .media-topic {
          font-size: 1.18rem;
          font-weight: 600;
          color: var(--curiofy-green);
          margin-bottom: 1.2rem;
          text-align: center;
        }
        .media-placeholder {
          color: var(--curiofy-text-secondary);
          font-size: 1.05rem;
          margin-top: 2.2rem;
        }
        .album-art-placeholder {
          width: 220px;
          height: 220px;
          background: #23272e;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ccc;
          font-size: 1.2em;
          font-weight: 600;
          text-align: center;
          margin: 0 auto 1em auto;
          position: relative;
        }
        .album-art-img {
          width: 220px;
          height: 220px;
          border-radius: 18px;
          object-fit: cover;
          box-shadow: 0 2px 18px 0 rgba(29,185,84,0.09);
          margin: 0 auto 1em auto;
          display: block;
        }
        .album-art-error-text {
          color: #ff5252;
          font-size: 0.98em;
          font-weight: 700;
          margin-top: 0.6em;
          background: rgba(255,82,82,0.10);
          border-radius: 6px;
          padding: 0.25em 0.7em;
          position: absolute;
          bottom: 10px;
          left: 0;
          right: 0;
        }
        .loading-bar-container {
          width: 100%;
          margin-bottom: 1.2em;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .loading-bar {
          width: 90%;
          height: 8px;
          background: #23272e;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 0.5em;
        }
        .loading-bar-progress {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #1db954 10%, #169c46 90%);
          animation: loading-bar-stripes 1.1s linear infinite;
        }
        @keyframes loading-bar-stripes {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .loading-bar-label {
          color: #1db954;
          font-weight: 600;
          font-size: 1.09em;
          text-align: center;
        }
        @media (max-width: 900px) {
          .playlist-two-col {
            flex-direction: column;
          }
          .topics-list {
            width: 100%;
            border-right: none;
            border-bottom: 2px solid #222;
            flex-direction: row;
            overflow-x: auto;
            padding: 1rem 0.5rem 1rem 1rem;
          }
          .topic-item {
            margin-bottom: 0;
            margin-right: 1em;
            min-width: 180px;
          }
          .media-player-col {
            padding: 2rem 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}
