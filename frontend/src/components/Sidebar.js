'use client';

export default function Sidebar({ role, activeMenu, onMenuChange }) {
  const adminTravelMenus = [
    { id: 'overview', icon: '📊', label: 'Dashboard' },
    { section: 'Operasional' },
    { id: 'paket', icon: '📦', label: 'Paket Umroh' },
    { id: 'jadwal', icon: '📅', label: 'Jadwal' },
    { id: 'dokumen', icon: '📄', label: 'Dokumen' },
    { section: 'Master Data' },
    { id: 'maskapai', icon: '✈️', label: 'Maskapai' },
    { id: 'hotel', icon: '🏨', label: 'Hotel' },
    { id: 'agent', icon: '🤝', label: 'Agent / Reseller' },
    { id: 'karyawan', icon: '👤', label: 'Karyawan' },
    { id: 'mitra', icon: '🏢', label: 'Mitra' },
    { id: 'layanan', icon: '⭐', label: 'Layanan' },
  ];

  const adminKeuanganMenus = [
    { id: 'overview', icon: '📊', label: 'Dashboard' },
    { section: 'Keuangan' },
    { id: 'pembayaran', icon: '💳', label: 'Pembayaran' },
    { id: 'pemasukan', icon: '📈', label: 'Pemasukan' },
    { id: 'pengeluaran', icon: '📉', label: 'Pengeluaran' },
    { section: 'Agent' },
    { id: 'bonus', icon: '🎁', label: 'Bonus Agent' },
    { section: 'Laporan' },
    { id: 'laporan', icon: '📊', label: 'Laporan Keuangan' },
  ];

  const adminPerlengkapanMenus = [
    { section: 'Perlengkapan' },
    { id: 'inventory', icon: '📦', label: 'Inventory' },
    { id: 'distribusi', icon: '🎒', label: 'Distribusi' },
  ];

  const menuMap = {
    admin_travel: adminTravelMenus,
    admin_keuangan: adminKeuanganMenus,
    admin_perlengkapan: adminPerlengkapanMenus,
  };

  const menus = menuMap[role];
  if (!menus) return null;

  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        {menus.map((item, i) =>
          item.section ? (
            <li key={`s-${i}`} className="sidebar-section">{item.section}</li>
          ) : (
            <li key={item.id}>
              <a
                href="#"
                className={activeMenu === item.id ? 'active' : ''}
                onClick={e => { e.preventDefault(); onMenuChange(item.id); }}
              >
                <span>{item.icon}</span> {item.label}
              </a>
            </li>
          )
        )}
      </ul>
    </aside>
  );
}
