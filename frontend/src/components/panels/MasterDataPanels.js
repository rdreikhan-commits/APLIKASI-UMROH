'use client';
import CrudPanel from '@/components/CrudPanel';
import api from '@/lib/api';

const formatRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

// ══════════════════════════════════════
// MASKAPAI PANEL
// ══════════════════════════════════════
export function MaskapaiPanel({ showToast }) {
  return (
    <CrudPanel
      title="Maskapai"
      subtitle="Kelola data maskapai penerbangan"
      icon="✈️"
      apiClient={api.maskapai}
      showToast={showToast}
      columns={[
        { key: 'kode_maskapai', label: 'Kode', render: i => <strong style={{color:'var(--gold-400)'}}>{i.kode_maskapai}</strong> },
        { key: 'nama_maskapai', label: 'Nama Maskapai' },
        { key: 'is_active', label: 'Status', render: i => <span className={`badge ${i.is_active !== false ? 'badge-confirmed' : 'badge-cancelled'}`}>{i.is_active !== false ? 'Aktif' : 'Nonaktif'}</span> },
      ]}
      formFields={[
        { name: 'kode_maskapai', label: 'Kode Maskapai', placeholder: 'GA' },
        { name: 'nama_maskapai', label: 'Nama Maskapai', placeholder: 'Garuda Indonesia' },
      ]}
      defaultForm={{ kode_maskapai: '', nama_maskapai: '' }}
    />
  );
}

// ══════════════════════════════════════
// HOTEL PANEL
// ══════════════════════════════════════
export function HotelPanel({ showToast }) {
  return (
    <CrudPanel
      title="Hotel"
      subtitle="Kelola data hotel di Makkah & Madinah"
      icon="🏨"
      apiClient={api.hotel}
      showToast={showToast}
      columns={[
        { key: 'nama_hotel', label: 'Nama Hotel', render: i => <strong>{i.nama_hotel}</strong> },
        { key: 'kota', label: 'Kota', render: i => <span className={`badge ${i.kota === 'makkah' ? 'badge-confirmed' : 'badge-waiting'}`}>{i.kota?.charAt(0).toUpperCase() + i.kota?.slice(1)}</span> },
        { key: 'rating', label: 'Rating', render: i => '⭐'.repeat(i.rating || 3) },
        { key: 'jarak_ke_masjid', label: 'Jarak ke Masjid' },
        { key: 'is_active', label: 'Status', render: i => <span className={`badge ${i.is_active !== false ? 'badge-confirmed' : 'badge-cancelled'}`}>{i.is_active !== false ? 'Aktif' : 'Nonaktif'}</span> },
      ]}
      formFields={[
        { name: 'nama_hotel', label: 'Nama Hotel', placeholder: 'Hilton Suites Makkah' },
        { name: 'kota', label: 'Kota', type: 'select', options: [{ value: 'makkah', label: 'Makkah' }, { value: 'madinah', label: 'Madinah' }] },
        { name: 'rating', label: 'Rating', type: 'select', options: [{ value: '3', label: '⭐⭐⭐ Bintang 3' }, { value: '4', label: '⭐⭐⭐⭐ Bintang 4' }, { value: '5', label: '⭐⭐⭐⭐⭐ Bintang 5' }] },
        { name: 'alamat', label: 'Alamat', placeholder: 'Jl. King Fahd...', required: false },
        { name: 'jarak_ke_masjid', label: 'Jarak ke Masjid', placeholder: '200m', required: false },
      ]}
      defaultForm={{ nama_hotel: '', kota: 'makkah', rating: '5', alamat: '', jarak_ke_masjid: '' }}
    />
  );
}

// ══════════════════════════════════════
// AGENT PANEL
// ══════════════════════════════════════
export function AgentPanel({ showToast }) {
  return (
    <CrudPanel
      title="Agent / Reseller"
      subtitle="Kelola agent dan reseller dengan skema bonus"
      icon="🤝"
      apiClient={api.agent}
      showToast={showToast}
      columns={[
        { key: 'kode_agent', label: 'Kode', render: i => <strong style={{color:'var(--gold-400)'}}>{i.kode_agent}</strong> },
        { key: 'nama_agent', label: 'Nama Agent' },
        { key: 'no_hp', label: 'No HP' },
        { key: 'tipe_bonus', label: 'Tipe Bonus', render: i => <span className="badge badge-waiting">{(i.tipe_bonus || '-').toUpperCase()}</span> },
        { key: 'bookings_count', label: 'Booking', render: i => <strong>{i.bookings_count || 0}</strong> },
        { key: 'status', label: 'Status', render: i => <span className={`badge ${i.status === 'aktif' ? 'badge-confirmed' : 'badge-cancelled'}`}>{i.status || 'aktif'}</span> },
      ]}
      formFields={[
        { name: 'nama_agent', label: 'Nama Agent', placeholder: 'PT. Berkah Travel' },
        { name: 'no_hp', label: 'No HP', placeholder: '08123456789', required: false },
        { name: 'alamat', label: 'Alamat', placeholder: 'Jakarta', required: false },
        { name: 'tipe_bonus', label: 'Tipe Bonus', type: 'select', options: [{ value: 'persentase', label: 'Persentase (%)' }, { value: 'nominal', label: 'Nominal Tetap (Rp)' }] },
        { name: 'persentase_bonus', label: 'Persentase Bonus (%)', type: 'number', placeholder: '5', required: false },
        { name: 'nominal_bonus_per_jamaah', label: 'Nominal Bonus / Jamaah (Rp)', type: 'number', placeholder: '500000', required: false },
      ]}
      defaultForm={{ nama_agent: '', no_hp: '', alamat: '', tipe_bonus: 'persentase', persentase_bonus: '', nominal_bonus_per_jamaah: '' }}
    />
  );
}

// ══════════════════════════════════════
// KARYAWAN PANEL
// ══════════════════════════════════════
export function KaryawanPanel({ showToast }) {
  return (
    <CrudPanel
      title="Karyawan"
      subtitle="Kelola data karyawan perusahaan"
      icon="👤"
      apiClient={api.karyawan}
      showToast={showToast}
      columns={[
        { key: 'kode_karyawan', label: 'Kode', render: i => <strong style={{color:'var(--gold-400)'}}>{i.kode_karyawan}</strong> },
        { key: 'nama', label: 'Nama' },
        { key: 'jabatan', label: 'Jabatan' },
        { key: 'departemen', label: 'Departemen', render: i => <span className="badge badge-pending">{(i.departemen || '-').toUpperCase()}</span> },
        { key: 'no_hp', label: 'No HP' },
        { key: 'gaji', label: 'Gaji', render: i => i.gaji ? formatRp(i.gaji) : '-' },
        { key: 'status', label: 'Status', render: i => <span className={`badge ${i.status === 'aktif' ? 'badge-confirmed' : 'badge-cancelled'}`}>{i.status || 'aktif'}</span> },
      ]}
      formFields={[
        { name: 'nama', label: 'Nama Lengkap', placeholder: 'Ahmad Fauzi' },
        { name: 'jabatan', label: 'Jabatan', placeholder: 'Staff Operasional', required: false },
        { name: 'departemen', label: 'Departemen', type: 'select', options: [
          { value: 'operasional', label: 'Operasional' }, { value: 'keuangan', label: 'Keuangan' },
          { value: 'marketing', label: 'Marketing' }, { value: 'gudang', label: 'Gudang' },
        ]},
        { name: 'no_hp', label: 'No HP', placeholder: '08123456789', required: false },
        { name: 'alamat', label: 'Alamat', placeholder: 'Jakarta', required: false },
        { name: 'gaji', label: 'Gaji (Rp)', type: 'number', placeholder: '5000000', required: false },
        { name: 'tanggal_masuk', label: 'Tanggal Masuk', type: 'date', required: false },
      ]}
      defaultForm={{ nama: '', jabatan: '', departemen: 'operasional', no_hp: '', alamat: '', gaji: '', tanggal_masuk: '' }}
    />
  );
}

// ══════════════════════════════════════
// MITRA PANEL
// ══════════════════════════════════════
export function MitraPanel({ showToast }) {
  return (
    <CrudPanel
      title="Mitra"
      subtitle="Kelola data mitra kerja sama"
      icon="🏢"
      apiClient={api.mitra}
      showToast={showToast}
      columns={[
        { key: 'nama_mitra', label: 'Nama Mitra', render: i => <strong>{i.nama_mitra}</strong> },
        { key: 'jenis', label: 'Jenis', render: i => <span className="badge badge-waiting">{(i.jenis || '-').toUpperCase()}</span> },
        { key: 'kontak', label: 'Kontak' },
        { key: 'alamat', label: 'Alamat' },
        { key: 'is_active', label: 'Status', render: i => <span className={`badge ${i.is_active !== false ? 'badge-confirmed' : 'badge-cancelled'}`}>{i.is_active !== false ? 'Aktif' : 'Nonaktif'}</span> },
      ]}
      formFields={[
        { name: 'nama_mitra', label: 'Nama Mitra', placeholder: 'CV. Berkah Catering' },
        { name: 'jenis', label: 'Jenis Mitra', type: 'select', options: [
          { value: 'bus', label: 'Bus' }, { value: 'katering', label: 'Katering' },
          { value: 'handling', label: 'Handling' }, { value: 'guide', label: 'Guide' },
          { value: 'lainnya', label: 'Lainnya' },
        ]},
        { name: 'kontak', label: 'Kontak', placeholder: '08123456789', required: false },
        { name: 'alamat', label: 'Alamat', placeholder: 'Jakarta', required: false },
      ]}
      defaultForm={{ nama_mitra: '', jenis: 'bus', kontak: '', alamat: '' }}
    />
  );
}

// ══════════════════════════════════════
// LAYANAN PANEL
// ══════════════════════════════════════
export function LayananPanel({ showToast }) {
  return (
    <CrudPanel
      title="Layanan"
      subtitle="Kelola layanan tambahan untuk jamaah"
      icon="⭐"
      apiClient={api.layananCrud}
      showToast={showToast}
      columns={[
        { key: 'nama_layanan', label: 'Nama Layanan', render: i => <strong>{i.nama_layanan}</strong> },
        { key: 'deskripsi', label: 'Deskripsi' },
        { key: 'harga', label: 'Harga', render: i => formatRp(i.harga) },
        { key: 'is_active', label: 'Status', render: i => <span className={`badge ${i.is_active !== false ? 'badge-confirmed' : 'badge-cancelled'}`}>{i.is_active !== false ? 'Aktif' : 'Nonaktif'}</span> },
      ]}
      formFields={[
        { name: 'nama_layanan', label: 'Nama Layanan', placeholder: 'City Tour Makkah' },
        { name: 'deskripsi', label: 'Deskripsi', type: 'textarea', placeholder: 'Deskripsi layanan...', required: false },
        { name: 'harga', label: 'Harga (Rp)', type: 'number', placeholder: '500000' },
      ]}
      defaultForm={{ nama_layanan: '', deskripsi: '', harga: '' }}
    />
  );
}
