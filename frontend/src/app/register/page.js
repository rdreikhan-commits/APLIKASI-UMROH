'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Toast from '@/components/Toast';
import api from '@/lib/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ nama: '', email: '', password: '', password_confirmation: '', no_hp: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.register(form);
      setToast({ type: 'success', message: 'Registrasi berhasil!' });
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (err) {
      const msg = err.errors ? Object.values(err.errors).flat().join(', ') : (err.message || 'Registrasi gagal');
      setToast({ type: 'error', message: msg });
    }
    setLoading(false);
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
            <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Daftar Akun Jamaah</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Buat akun untuk mulai booking umroh</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Nama Lengkap</label>
              <input className="input-field" name="nama" placeholder="Nama sesuai KTP" value={form.nama} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" className="input-field" name="email" placeholder="nama@email.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>No. HP</label>
              <input className="input-field" name="no_hp" placeholder="08xxxxxxxxxx" value={form.no_hp} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" className="input-field" name="password" placeholder="Minimal 8 karakter" value={form.password} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Konfirmasi Password</label>
              <input type="password" className="input-field" name="password_confirmation" placeholder="Ulangi password" value={form.password_confirmation} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-gold btn-lg" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
              {loading ? '⏳ Memproses...' : 'Daftar Sekarang →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Sudah punya akun? <a href="/login" style={{ color: 'var(--gold-400)', textDecoration: 'none', fontWeight: 600 }}>Login di sini</a>
          </p>
        </div>
      </div>
    </>
  );
}
