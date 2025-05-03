import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';

export default function MyPlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchPlaylists() {
      setLoading(true);
      setError(null);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('You must be logged in to view your playlists.');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('playlists')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setPlaylists(data);
      setLoading(false);
    }
    fetchPlaylists();
  }, []);

  const handleOpenPlaylist = async (playlistId) => {
    // Fetch the playlist data and redirect to /playlist with data as query param
    const { data, error } = await supabase
      .from('playlists')
      .select('data')
      .eq('id', playlistId)
      .single();
    if (error || !data) {
      alert('Failed to load playlist.');
      return;
    }
    const encoded = encodeURIComponent(JSON.stringify(data.data));
    router.push(`/playlist?data=${encoded}&playlist_id=${playlistId}`);
  };

  return (
    <div className="myplaylists-modern-bg">
      <div className="myplaylists-glass-card">
        <h2 className="myplaylists-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{marginRight: '0.6em', verticalAlign: 'middle'}}><rect x="3" y="5" width="18" height="14" rx="2" fill="#fff" fillOpacity="0.11"/><rect x="7" y="9" width="10" height="2" rx="1" fill="#1db954"/><rect x="7" y="13" width="6" height="2" rx="1" fill="#1db954"/></svg>
          My Playlists
        </h2>
        {loading && <div className="myplaylists-loading">Loading...</div>}
        {error && <div className="myplaylists-error-msg">{error}</div>}
        {!loading && !error && playlists.length === 0 && (
          <div className="myplaylists-empty">No playlists found.</div>
        )}
        <div className="myplaylists-list">
          {playlists.map(pl => (
            <div key={pl.id} className="myplaylists-list-card">
              <div className="myplaylists-list-main">
                <span className="myplaylists-list-title">{pl.title}</span>
                <span className="myplaylists-list-date">{new Date(pl.created_at).toLocaleString()}</span>
              </div>
              <button className="myplaylists-open-btn" onClick={() => handleOpenPlaylist(pl.id)}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{marginRight: '0.5em', verticalAlign: 'middle'}}><circle cx="12" cy="12" r="10" fill="#fff" fillOpacity="0.13"/><polygon points="10,8 16,12 10,16" fill="#1db954"/></svg>
                Open
              </button>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .myplaylists-modern-bg {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            linear-gradient(120deg, #1db954 0%, #15171b 100%),
            repeating-linear-gradient(135deg, rgba(29,185,84,0.11) 0px, rgba(29,185,84,0.11) 2px, transparent 2px, transparent 40px),
            repeating-linear-gradient(45deg, rgba(29,185,84,0.09) 0px, rgba(29,185,84,0.09) 2px, transparent 2px, transparent 40px),
            #15171b;
          background-blend-mode: overlay, overlay, normal;
          background-attachment: fixed;
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
        }
        .myplaylists-glass-card {
          max-width: 620px;
          margin: 48px auto;
          background: rgba(24,26,32,0.97);
          border-radius: 26px;
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.17);
          padding: 2.7rem 2.3rem 2.1rem 2.3rem;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .myplaylists-title {
          margin-bottom: 2.1rem;
          text-align: center;
          font-size: 2.0rem;
          font-weight: 700;
          letter-spacing: -1.1px;
          background: linear-gradient(90deg, #1db954 40%, #fff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .myplaylists-loading {
          color: #bbb;
          text-align: center;
          margin-bottom: 1.5em;
        }
        .myplaylists-error-msg {
          color: #ff4d4f;
          margin-bottom: 1.5em;
          text-align: center;
        }
        .myplaylists-empty {
          color: #bbb;
          text-align: center;
          margin-bottom: 1.5em;
        }
        .myplaylists-list {
          display: flex;
          flex-direction: column;
          gap: 1.1em;
        }
        .myplaylists-list-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(36,38,44,0.97);
          border-radius: 15px;
          box-shadow: 0 2px 12px 0 rgba(29,185,84,0.10);
          padding: 1.15em 1.3em;
          transition: box-shadow 0.18s, background 0.18s, transform 0.18s;
        }
        .myplaylists-list-card:hover {
          background: rgba(36,38,44,1);
          box-shadow: 0 4px 22px 0 rgba(29,185,84,0.18);
          transform: translateY(-2px) scale(1.012);
        }
        .myplaylists-list-main {
          display: flex;
          flex-direction: column;
          gap: 0.2em;
        }
        .myplaylists-list-title {
          font-weight: 600;
          font-size: 1.15rem;
          color: #fff;
        }
        .myplaylists-list-date {
          color: #bbb;
          font-size: 0.98rem;
          margin-top: 0.2em;
        }
        .myplaylists-open-btn {
          background: linear-gradient(90deg, #1db954 60%, #169c46 100%);
          color: #fff;
          border: none;
          border-radius: 11px;
          padding: 0.5em 1.5em;
          font-size: 1.07rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.18s, box-shadow 0.18s;
          display: flex;
          align-items: center;
          box-shadow: 0 1px 8px 0 rgba(29,185,84,0.11);
        }
        .myplaylists-open-btn:hover {
          background: linear-gradient(90deg, #169c46 60%, #1db954 100%);
          box-shadow: 0 4px 18px 0 rgba(29,185,84,0.17);
        }
        @media (max-width: 600px) {
          .myplaylists-glass-card {
            padding: 1.1rem 0.5rem 0.8rem 0.5rem;
            max-width: 99vw;
          }
          .myplaylists-title {
            font-size: 1.15rem;
          }
          .myplaylists-list-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.7em;
            padding: 0.9em 0.7em;
          }
          .myplaylists-open-btn {
            font-size: 0.99rem;
            padding: 0.4em 0.8em;
          }
        }
      `}</style>
    </div>
  );
}
