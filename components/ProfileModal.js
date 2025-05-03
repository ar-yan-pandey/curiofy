import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function ProfileModal({ open, onClose, user, onLogout }) {
  const [profile, setProfile] = useState({ name: '', age: '', email: user?.email || '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (open && user) {
      setMsg('');
      setLoading(true);
      supabase
        .from('profiles')
        .select('name, age, email')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (data) setProfile({ ...profile, ...data });
          setLoading(false);
        });
    }
    // eslint-disable-next-line
  }, [open, user]);

  const handleChange = e => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setMsg('');
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: profile.name,
      age: profile.age,
      email: profile.email
    });
    setLoading(false);
    setMsg(error ? 'Failed to save.' : 'Profile saved!');
  };

  if (!open) return null;
  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-card" onClick={e => e.stopPropagation()}>
        <h2>Profile</h2>
        <div className="profile-modal-fields">
          <label>Name
            <input name="name" value={profile.name} onChange={handleChange} placeholder="Your name" />
          </label>
          <label>Age
            <input name="age" value={profile.age} onChange={handleChange} placeholder="Your age" type="number" min="0" />
          </label>
          <label>Email
            <input name="email" value={profile.email} disabled />
          </label>
        </div>
        <div className="profile-modal-actions">
          <button className="profile-save-btn" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          <button className="profile-logout-btn" onClick={onLogout}>Logout</button>
        </div>
        {msg && <div className="profile-modal-msg">{msg}</div>}
      </div>
      <style jsx>{`
        .profile-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .profile-modal-card {
          background: rgba(24,26,32,0.97);
          border-radius: 18px;
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.19);
          padding: 2.2rem 2.1rem 1.6rem 2.1rem;
          min-width: 320px;
          max-width: 95vw;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .profile-modal-fields label {
          display: flex;
          flex-direction: column;
          font-weight: 500;
          margin-bottom: 1.1em;
          color: #bbb;
        }
        .profile-modal-fields input {
          margin-top: 0.3em;
          padding: 0.7em 1em;
          border-radius: 8px;
          border: 1.2px solid #232;
          background: #181a20;
          color: #fff;
          font-size: 1.08em;
          outline: none;
          transition: border 0.16s;
        }
        .profile-modal-fields input:focus {
          border: 1.2px solid #1db954;
        }
        .profile-modal-actions {
          display: flex;
          gap: 1.2em;
          margin-top: 1.2em;
        }
        .profile-save-btn {
          background: linear-gradient(90deg, #1db954 60%, #169c46 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.7em 1.7em;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.18s;
        }
        .profile-save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .profile-save-btn:hover:not(:disabled) {
          background: linear-gradient(90deg, #169c46 60%, #1db954 100%);
        }
        .profile-logout-btn {
          background: #232;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.7em 1.7em;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.18s;
        }
        .profile-logout-btn:hover {
          background: #1db954;
          color: #fff;
        }
        .profile-modal-msg {
          margin-top: 1em;
          color: #1db954;
          font-weight: 500;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
