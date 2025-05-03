import styles from '../styles/Navbar.module.css';

import Link from 'next/link';
import { useState } from 'react';
import ProfileModal from './ProfileModal';

export default function Navbar({ user, onLogout }) {
  const [showProfile, setShowProfile] = useState(false);
  return (
    <nav className="navbar-modern">
      <div className="navbar-brand-row">
        <span className="navbar-brand">Curiofy</span>
      </div>
      <div className="navbar-userSection">
        <span className="navbar-welcome">{user ? `Welcome, ${user.email}` : ''}</span>
        <div className="navbar-profile" style={{cursor:'pointer'}} onClick={() => setShowProfile(true)}>
          <svg height="26" width="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/></svg>
        </div>
        <Link href="/myplaylists" legacyBehavior>
          <a className="navbar-myplaylists-btn">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{marginRight: '0.5em', verticalAlign: 'middle'}}><rect x="3" y="5" width="18" height="14" rx="2" fill="#fff" fillOpacity="0.13"/><rect x="7" y="9" width="10" height="2" rx="1" fill="#1db954"/><rect x="7" y="13" width="6" height="2" rx="1" fill="#1db954"/></svg>
            My Playlists
          </a>
        </Link>
        <Link href="/progress" legacyBehavior>
          <a className="navbar-progress-btn">
            <i className="fa fa-line-chart" style={{marginRight: '0.5em', fontSize: '1.15em', verticalAlign: 'middle'}}></i>
            My Progress
          </a>
        </Link>
      </div>
      <style jsx>{`
        .navbar-modern {
          width: 100vw;
          min-height: 58px;
          background: rgba(24,26,32,0.89);
          box-shadow: 0 2px 18px 0 rgba(31,38,135,0.10);
          border-radius: 0 0 22px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.7em 2.3em 0.7em 2em;
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
        }
        .navbar-brand-row {
          display: flex;
          align-items: center;
          gap: 1.2em;
        }
        .navbar-brand {
          font-size: 1.45rem;
          font-weight: 700;
          letter-spacing: -1.2px;
          color: #fff;
          background: linear-gradient(90deg, #1db954 40%, #fff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
        .navbar-myplaylists-btn {
          display: flex;
          align-items: center;
          background: linear-gradient(90deg, #1db954 60%, #169c46 100%);
          color: #fff;
          padding: 0.5em 1.5em;
          border-radius: 12px;
          font-size: 1.07rem;
          font-weight: 600;
          border: none;
          box-shadow: 0 1px 8px 0 rgba(29,185,84,0.12);
          cursor: pointer;
          outline: none;
          transition: background 0.18s, box-shadow 0.18s;
          text-decoration: none;
        }
        .navbar-myplaylists-btn:hover {
          background: linear-gradient(90deg, #169c46 60%, #1db954 100%);
          color: #fff;
          box-shadow: 0 4px 18px 0 rgba(29,185,84,0.18);
        }
        .navbar-progress-btn {
          display: flex;
          align-items: center;
          background: linear-gradient(90deg, #1db954 60%, #169c46 100%);
          color: #fff;
          padding: 0.5em 1.5em;
          border-radius: 12px;
          font-size: 1.07rem;
          font-weight: 600;
          border: none;
          box-shadow: 0 1px 8px 0 rgba(29,185,84,0.12);
          cursor: pointer;
          outline: none;
          transition: background 0.18s, box-shadow 0.18s;
          text-decoration: none;
        }
        .navbar-progress-btn:hover {
          background: linear-gradient(90deg, #169c46 60%, #1db954 100%);
          color: #fff;
          box-shadow: 0 4px 18px 0 rgba(29,185,84,0.18);
        }
        .navbar-userSection {
          display: flex;
          align-items: center;
          gap: 1.2em;
        }
        .navbar-welcome {
          color: #fff;
          font-size: 1.05rem;
          font-weight: 500;
          opacity: 0.8;
        }
        .navbar-profile {
          display: flex;
          align-items: center;
          margin-right: 0.2em;
        }
        .navbar-logout {
          background: linear-gradient(90deg, #1db954 60%, #169c46 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.5em 1.2em;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.18s;
        }
        .navbar-logout:hover {
          background: linear-gradient(90deg, #169c46 60%, #1db954 100%);
        }
        @media (max-width: 600px) {
          .navbar-modern {
            padding: 0.6em 0.5em 0.6em 0.7em;
          }
          .navbar-brand {
            font-size: 1.07rem;
          }
          .navbar-myplaylists-btn {
            font-size: 0.97rem;
            padding: 0.4em 0.8em;
          }
          .navbar-progress-btn {
            font-size: 0.97rem;
            padding: 0.4em 0.8em;
          }
          .navbar-userSection {
            gap: 0.6em;
          }
        }
      `}</style>
      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} user={user} onLogout={onLogout} />
    </nav>
  );
}
