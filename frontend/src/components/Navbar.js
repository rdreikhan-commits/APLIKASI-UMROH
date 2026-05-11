'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { setUser(api.getUser()); }, []);

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setMenuOpen(false);
    router.push('/');
  };

  const roleLabels = {
    jamaah: 'Jamaah',
    admin_travel: 'Admin Travel',
    admin_keuangan: 'Admin Keuangan',
    admin_perlengkapan: 'Admin Perlengkapan',
    manager: 'Manager',
  };

  const close = () => setMenuOpen(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="/" className="navbar-brand">
            <img src="/logo-mandala.png" alt="Mandala 525" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--gold-300)' }} />
            <div>
              <span style={{ color: 'var(--gold-300)', fontWeight: 800, fontSize: 16, letterSpacing: 1 }}>MANDALA</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 11, display: 'block', marginTop: -3, letterSpacing: 2 }}>525 TOUR & TRAVEL</span>
            </div>
          </a>

          {/* Desktop links */}
          <div className="navbar-links">
            <a href="/" className={pathname === '/' ? 'active' : ''}>Beranda</a>
            <a href="/katalog" className={pathname === '/katalog' ? 'active' : ''}>Katalog</a>
            {user ? (
              <div className="navbar-user">
                <a href="/dashboard" className={`btn btn-sm ${pathname.startsWith('/dashboard') ? 'btn-gold' : 'btn-outline'}`}>Dashboard</a>
                <div className="user-info">
                  <div className="user-name">{user.nama}</div>
                  <div className="user-role">{roleLabels[user.role]}</div>
                </div>
                <button onClick={handleLogout} className="btn btn-sm btn-outline" style={{ color: 'var(--red-400)', borderColor: 'rgba(239,68,68,0.3)' }}>Logout</button>
              </div>
            ) : (
              <>
                <a href="/login" className="btn btn-sm btn-outline">Login</a>
                <a href="/register" className="btn btn-sm btn-gold">Daftar</a>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="nav-hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div className="nav-mob-overlay" onClick={close}>
          <div className="nav-mob-drawer" onClick={e => e.stopPropagation()}>
            <div className="nav-mob-head">
              <div className="navbar-brand" style={{ textDecoration: 'none' }}>
                <img src="/logo-mandala.png" alt="" style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid var(--gold-300)' }} />
                <span style={{ color: 'var(--gold-300)', fontWeight: 800 }}>MANDALA 525</span>
              </div>
              <button className="nav-mob-close" onClick={close}>✕</button>
            </div>

            {user && (
              <div className="nav-mob-user">
                <div className="jm-avatar-lg" style={{ width: 44, height: 44, fontSize: 18 }}>{user.nama?.charAt(0)?.toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{user.nama}</div>
                  <div style={{ fontSize: 12, color: 'var(--gold-400)' }}>{roleLabels[user.role]}</div>
                </div>
              </div>
            )}

            <div className="nav-mob-links">
              <a href="/" className={`nav-mob-link ${pathname === '/' ? 'active' : ''}`} onClick={close}><span>🏠</span>Beranda</a>
              <a href="/katalog" className={`nav-mob-link ${pathname === '/katalog' ? 'active' : ''}`} onClick={close}><span>🕌</span>Katalog Paket</a>
              {user ? (
                <>
                  <a href="/dashboard" className={`nav-mob-link ${pathname.startsWith('/dashboard') ? 'active' : ''}`} onClick={close}><span>📊</span>Dashboard</a>
                  <button className="nav-mob-link danger" onClick={handleLogout}><span>🚪</span>Logout</button>
                </>
              ) : (
                <>
                  <a href="/login" className="nav-mob-link" onClick={close}><span>🔑</span>Login</a>
                  <a href="/register" className="nav-mob-link gold" onClick={close}><span>✨</span>Daftar Gratis</a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
