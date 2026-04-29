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
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🕌</div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Masuk ke Akun</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Silakan masukkan email dan password Anda</p>
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
