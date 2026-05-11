'use client';
import { useEffect } from 'react';

export default function Sidebar({ role, activeMenu, onMenuChange, mobileOpen, onMobileClose }) {
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const adminTravelMenus = [
    { id: 'overview', icon: '📊', label: 'Dashboard' },
    { section: 'Konten' },
    { id: 'promo_banners', icon: '🖼️', label: 'Promo Banner' },
    { id: 'articles', icon: '📝', label: 'Blog / Artikel' },
    { section: 'Operasional' },
    { id: 'paket', icon: '📦', label: 'Paket Umroh' },
    { id: 'jadwal', icon: '📅', label: 'Jadwal' },
    { id: 'dokumen', icon: '📄', label: 'Dokumen' },
    { id: 'manasik', icon: '📖', label: 'Modul Manasik' },
    { section: 'Master Data' },
    { id: 'maskapai', icon: '✈️', label: 'Maskapai' },
    { id: 'hotel', icon: '🏨', label: 'Hotel' },
    { id: 'agent', icon: '🤝', label: 'Agent / Reseller' },
    { id: 'karyawan', icon: '👤', label: 'Karyawan' },
    { id: 'mitra', icon: '🏢', label: 'Mitra' },
    { id: 'layanan', icon: '⭐', label: 'Layanan' },
    { section: 'Akun & Jamaah' },
    { id: 'akun', icon: '🔐', label: 'Manajemen Akun' },
    { id: 'register', icon: '📝', label: 'Daftar Jamaah' },
    { id: 'manifest', icon: '📋', label: 'Manifest Jamaah' },
    { section: 'Dokumen' },
    { id: 'surat', icon: '🖨️', label: 'Cetak Surat (25)' },
  ];

  const adminKeuanganMenus = [
    { id: 'laporan', icon: '📊', label: 'Dashboard Keuangan' },
    { section: 'Transaksi' },
    { id: 'pembayaran', icon: '💳', label: 'Verifikasi Pembayaran' },
    { id: 'pengajuan', icon: '📋', label: 'Pencairan Pengajuan' },
    { section: 'Catatan Keuangan' },
    { id: 'pemasukan', icon: '📈', label: 'Pemasukan' },
    { id: 'pengeluaran', icon: '📉', label: 'Pengeluaran' },
    { section: 'Agent' },
    { id: 'bonus', icon: '🎁', label: 'Bonus Agent' },
  ];

  const adminPerlengkapanMenus = [
    { section: 'Perlengkapan' },
    { id: 'inventory', icon: '📦', label: 'Inventory' },
    { id: 'distribusi', icon: '🎒', label: 'Distribusi' },
    { id: 'pengajuan', icon: '📋', label: 'Pengajuan Barang' },
  ];

  const managerMenus = [
    { section: 'Manager' },
    { id: 'pengajuan', icon: '📋', label: 'ACC Pengajuan Barang' },
  ];

  const menuMap = {
    admin_travel: adminTravelMenus,
    admin_keuangan: adminKeuanganMenus,
    admin_perlengkapan: adminPerlengkapanMenus,
    manager: managerMenus,
  };

  const menus = menuMap[role];
  if (!menus) return null;

  const handleClick = (id) => {
    onMenuChange(id);
    if (onMobileClose) onMobileClose();
  };

  return (
    <>
      {mobileOpen && <div className="sidebar-mob-overlay" onClick={onMobileClose} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-mob-open' : ''}`}>
        <div className="sidebar-mob-header">
          <span style={{ fontWeight: 700, fontSize: 14 }}>⚙️ Menu Admin</span>
          <button className="sidebar-mob-close" onClick={onMobileClose}>✕</button>
        </div>
        <ul className="sidebar-menu">
          {menus.map((item, i) =>
            item.section ? (
              <li key={`s-${i}`} className="sidebar-section">{item.section}</li>
            ) : (
              <li key={item.id}>
                <a
                  href="#"
                  className={activeMenu === item.id ? 'active' : ''}
                  onClick={e => { e.preventDefault(); handleClick(item.id); }}
                >
                  <span>{item.icon}</span> {item.label}
                </a>
              </li>
            )
          )}
        </ul>
      </aside>
    </>
  );
}
