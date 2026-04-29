'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setUser(api.getUser());
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    router.push('/');
  };

  const roleLabels = {
    jamaah: 'Jamaah',
    admin_travel: 'Admin Travel',
    admin_keuangan: 'Admin Keuangan',
    admin_perlengkapan: 'Admin Perlengkapan',
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="/" className="navbar-brand">
          🕌 <span>UmrohERP</span>
        </a>

        <div className="navbar-links">
          <a href="/" className={pathname === '/' ? 'active' : ''}>Beranda</a>
          <a href="/katalog" className={pathname === '/katalog' ? 'active' : ''}>Katalog</a>

          {user ? (
            <div className="navbar-user">
              <a href="/dashboard" className={`btn btn-sm ${pathname.startsWith('/dashboard') ? 'btn-gold' : 'btn-outline'}`}>
                Dashboard
              </a>
              <div className="user-info">
                <div className="user-name">{user.nama}</div>
                <div className="user-role">{roleLabels[user.role]}</div>
              </div>
              <button onClick={handleLogout} className="btn btn-sm btn-outline" style={{ color: 'var(--red-400)', borderColor: 'rgba(239,68,68,0.3)' }}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <a href="/login" className="btn btn-sm btn-outline">Login</a>
              <a href="/register" className="btn btn-sm btn-gold">Daftar</a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
