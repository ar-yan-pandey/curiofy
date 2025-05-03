import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <>
      <div className="auth-bg-gradient">
        <div className="auth-glass-card">
          
          <h1 style={{ color: 'var(--curiofy-green)', fontWeight: 800, fontSize: '2.2rem', marginBottom: '0.7em', letterSpacing: '0.03em' }}>Sign in to Curiofy</h1>
          <form onSubmit={handleLogin} className="auth-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
            <p className="auth-link-row">
              Don't have an account? <a href="/signup">Sign up</a>
            </p>
            {error && <p className="error">{error}</p>}
          </form>
        </div>
      </div>
      <style jsx>{`
        .auth-bg-gradient {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(120deg, #1db954 0%, #15171b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .auth-glass-card {
          background: rgba(23, 28, 40, 0.93);
          border-radius: 32px;
          box-shadow: 0 8px 40px 0 rgba(31, 38, 135, 0.20);
          padding: 3.2rem 2.7rem 2.5rem 2.7rem;
          min-width: 340px;
          max-width: 400px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          border: 1.5px solid rgba(255,255,255,0.13);
        }
        .auth-logo-row {
          margin-bottom: 1.2em;
        }
        .auth-logo {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 2px 12px rgba(29,185,84,0.16);
        }
        .auth-form input {
          width: 100%;
          margin: 0.7rem 0;
          padding: 1.1rem;
          border: none;
          border-radius: 12px;
          background: rgba(255,255,255,0.08);
          color: #fff;
          font-size: 1.1rem;
          font-weight: 500;
          outline: none;
          transition: background 0.18s, box-shadow 0.18s;
          box-shadow: 0 1px 8px 0 rgba(31, 38, 135, 0.07);
        }
        .auth-form input:focus {
          background: rgba(29,185,84,0.08);
          box-shadow: 0 2px 16px 0 rgba(29,185,84,0.13);
        }
        .auth-form button {
          width: 100%;
          padding: 1.05rem;
          background: linear-gradient(90deg, #1db954 0%, #169c46 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.13rem;
          margin-top: 1.2rem;
          cursor: pointer;
          box-shadow: 0 2px 12px 0 rgba(29,185,84,0.13);
          transition: background 0.2s, box-shadow 0.2s;
          letter-spacing: 0.02em;
        }
        .auth-form button:hover {
          background: linear-gradient(90deg, #169c46 0%, #1db954 100%);
          box-shadow: 0 4px 16px 0 rgba(29,185,84,0.19);
        }
        .auth-link-row {
          margin-top: 1.5em;
          color: #b8b8b8;
          font-size: 1.04em;
        }
        .auth-link-row a {
          color: #1db954;
          font-weight: 600;
          text-decoration: underline;
          margin-left: 0.3em;
          transition: color 0.18s;
        }
        .auth-link-row a:hover {
          color: #169c46;
        }
        .error {
          color: #ff4d4f;
          margin-top: 1rem;
          font-weight: 600;
          background: rgba(255,77,79,0.10);
          border-radius: 7px;
          padding: 0.5em 1em;
          font-size: 1.03em;
        }
        @media (max-width: 600px) {
          .auth-glass-card {
            min-width: 0;
            padding: 2rem 0.8rem 1.5rem 0.8rem;
          }
        }
      `}</style>
    </>
  );
}
