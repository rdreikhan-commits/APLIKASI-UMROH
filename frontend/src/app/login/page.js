'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Toast from '@/components/Toast';
import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.login(email, password);
      setToast({ type: 'success', message: 'Login berhasil! Mengalihkan...' });
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Email atau password salah' });
    }
    setLoading(false);
  };

  const quickLogin = (em) => {
    setEmail(em);
    setPassword('password123');
  };

  return (
    <>
      <Navbar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)', padding: '24px',
        background: 'linear-gradient(180deg, rgba(251,191,36,0.04) 0%, var(--bg-primary) 50%)',
      }}>
        <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <img src="/logo-mandala.png" alt="Mandala 525" style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 12px', display: 'block', border: '2px solid var(--gold-300)' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Masuk ke Akun</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Mandala 525 Tour & Travel</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input type="email" className="input-field" placeholder="nama@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" className="input-field" placeholder="Masukkan password"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-gold btn-lg" disabled={loading}
              style={{ width: '100%', marginTop: '8px' }}>
              {loading ? '⏳ Memproses...' : 'Login →'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0 16px', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>ATAU</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
          </div>

          {/* Google Login */}
          <button type="button" className="btn btn-outline" style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '12px', fontSize: 14, fontWeight: 600,
          }} onClick={async () => {
            setLoading(true);
            try {
              // Load Google Identity Services
              if (!window.google?.accounts) {
                await new Promise((resolve, reject) => {
                  const s = document.createElement('script');
                  s.src = 'https://accounts.google.com/gsi/client';
                  s.onload = resolve; s.onerror = reject;
                  document.head.appendChild(s);
                });
              }
              window.google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '000000000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com',
                callback: async (response) => {
                  try {
                    const res = await api.request('/auth/google', {
                      method: 'POST',
                      body: JSON.stringify({ credential: response.credential }),
                    });
                    if (res.token) {
                      localStorage.setItem('token', res.token);
                      localStorage.setItem('user', JSON.stringify(res.user));
                      setToast({ type: 'success', message: 'Login Google berhasil!' });
                      setTimeout(() => router.push('/dashboard'), 1000);
                    }
                  } catch (err) {
                    setToast({ type: 'error', message: err.message || 'Login Google gagal' });
                    setLoading(false);
                  }
                },
              });
              window.google.accounts.id.prompt();
            } catch (err) {
              setToast({ type: 'error', message: 'Gagal memuat Google Sign-In' });
            }
            setLoading(false);
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Masuk dengan Google
          </button>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Belum punya akun? <a href="/register" style={{ color: 'var(--gold-400)', textDecoration: 'none', fontWeight: 600 }}>Daftar di sini</a>
          </p>

          {/* Quick Login Buttons */}
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '12px' }}>
              ⚡ LOGIN CEPAT (Demo)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: '👤 Jamaah', email: 'jamaah@example.com' },
                { label: '🏢 Admin Travel', email: 'travel@admin.com' },
                { label: '💰 Admin Keuangan', email: 'keuangan@admin.com' },
                { label: '📦 Admin Perlengkapan', email: 'perlengkapan@admin.com' },
              ].map(({ label, email: em }) => (
                <button key={em} type="button" className="btn btn-sm btn-outline"
                  onClick={() => quickLogin(em)} style={{ fontSize: '12px' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
