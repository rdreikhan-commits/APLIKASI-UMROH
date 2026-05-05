'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const formatRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

// ══════════════════════════════════════
// 1. MANAJEMEN AKUN
// ══════════════════════════════════════
export function AkunPanel({ showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nama: '', email: '', password: '', role: 'manager' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api.request('/admin/travel/akun').then(r => {
      setUsers(r.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.request('/admin/travel/akun', { method: 'POST', body: JSON.stringify(form) });
      showToast('Akun berhasil dibuat!');
      setShowModal(false);
      setForm({ nama: '', email: '', password: '', role: 'manager' });
      load();
    } catch (err) {
      showToast(err.message || 'Gagal membuat akun', 'error');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus akun ini?')) return;
    try {
      await api.request(`/admin/travel/akun/${id}`, { method: 'DELETE' });
      showToast('Akun dihapus');
      load();
    } catch (err) {
      showToast(err.message || 'Gagal menghapus', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>🔐 Manajemen Akun</h1>
        <p>Kelola akun sistem (Manager, Mitra, dll)</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-gold" onClick={() => setShowModal(true)}>+ Tambah Akun Baru</button>
      </div>

      {loading ? <div className="spinner"></div> : (
        <div className="table-container card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.nama || u.name}</strong></td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role === 'jamaah' ? 'badge-blue' : 'badge-gold'}`}>{u.role}</span></td>
                  <td>{formatDate(u.created_at)}</td>
                  <td>
                    <button className="btn btn-sm btn-outline" style={{ color: 'var(--red-400)' }} onClick={() => handleDelete(u.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Buat Akun Baru</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Nama Lengkap</label>
                <input className="input-field" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input type="password" minLength="6" className="input-field" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>Role / Hak Akses</label>
                <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="manager">Manager</option>
                  <option value="mitra">Mitra</option>
                  <option value="admin_keuangan">Admin Keuangan</option>
                  <option value="admin_perlengkapan">Admin Perlengkapan</option>
                  <option value="admin_travel">Admin Travel</option>
                  <option value="agent">Agent</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="submit" className="btn btn-gold" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 2. DAFTAR JAMAAH MANUAL
// ══════════════════════════════════════
export function RegisterJamaahPanel({ showToast }) {
  const [jadwal, setJadwal] = useState([]);
  const [form, setForm] = useState({ nama: '', email: '', no_hp: '', nik: '', jadwal_id: '', tipe_kamar: 'quad' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.request('/admin/travel/jadwal').then(r => setJadwal(r.data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.request('/admin/travel/akun/register-jamaah', { method: 'POST', body: JSON.stringify(form) });
      showToast('Jamaah berhasil didaftarkan dan booking telah dibuat!');
      setForm({ nama: '', email: '', no_hp: '', nik: '', jadwal_id: '', tipe_kamar: 'quad' });
    } catch (err) {
      showToast(err.message || 'Gagal mendaftar', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1>📝 Pendaftaran Jamaah Manual</h1>
        <p>Buat akun dan booking untuk jamaah yang mendaftar via offline/WA</p>
      </div>

      <form onSubmit={handleSubmit} className="grid-2">
        <div className="input-group">
          <label>Nama Lengkap (KTP)</label>
          <input className="input-field" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required />
        </div>
        <div className="input-group">
          <label>NIK</label>
          <input className="input-field" value={form.nik} onChange={e => setForm({ ...form, nik: e.target.value })} required />
        </div>
        <div className="input-group">
          <label>Email (Untuk Login)</label>
          <input type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="input-group">
          <label>No. HP / WA</label>
          <input className="input-field" value={form.no_hp} onChange={e => setForm({ ...form, no_hp: e.target.value })} required />
        </div>
        
        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
          <label>Pilih Jadwal Keberangkatan</label>
          <select className="input-field" value={form.jadwal_id} onChange={e => setForm({ ...form, jadwal_id: e.target.value })} required>
            <option value="">-- Pilih Jadwal --</option>
            {jadwal.map(j => (
              <option key={j.id} value={j.id} disabled={j.sisa_kuota < 1}>
                {j.paket?.nama_paket} — {formatDate(j.tanggal_berangkat)} (Sisa: {j.sisa_kuota} Seat)
              </option>
            ))}
          </select>
        </div>

        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
          <label>Tipe Kamar</label>
          <div style={{ display: 'flex', gap: 16 }}>
            {['quad', 'triple', 'double'].map(t => (
              <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="radio" name="kamar" value={t} checked={form.tipe_kamar === t} onChange={e => setForm({ ...form, tipe_kamar: e.target.value })} />
                <span style={{ textTransform: 'capitalize' }}>{t}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1', marginTop: 16 }}>
          <div style={{ padding: 12, background: 'rgba(212,175,55,0.1)', borderRadius: 8, fontSize: 13, color: 'var(--gold-400)', marginBottom: 16 }}>
            ℹ️ Password default untuk Jamaah adalah: <strong>jamaah123</strong>
          </div>
          <button type="submit" className="btn btn-gold" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Mendaftarkan...' : '✅ Daftarkan Jamaah'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ══════════════════════════════════════
// 3. MANIFEST JAMAAH
// ══════════════════════════════════════
export function ManifestPanel({ showToast }) {
  const [jadwal, setJadwal] = useState([]);
  const [selectedJadwal, setSelectedJadwal] = useState('');
  const [manifest, setManifest] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.request('/admin/travel/jadwal').then(r => setJadwal(r.data || []));
  }, []);

  const loadManifest = (id) => {
    setSelectedJadwal(id);
    if (!id) { setManifest(null); return; }
    setLoading(true);
    api.request(`/admin/travel/manifest/${id}`).then(r => {
      setManifest(r.data?.manifest || []);
      setLoading(false);
    }).catch(err => {
      showToast(err.message || 'Gagal memuat manifest', 'error');
      setLoading(false);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="page-header print-hide">
        <h1>📋 Manifest Jamaah</h1>
        <p>Daftar jamaah confirmed untuk keperluan penerbangan, visa, dan hotel</p>
      </div>

      <div className="card print-hide" style={{ padding: 20, marginBottom: 20 }}>
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label>Pilih Jadwal Penerbangan</label>
          <select className="input-field" value={selectedJadwal} onChange={e => loadManifest(e.target.value)}>
            <option value="">-- Silakan Pilih Jadwal --</option>
            {jadwal.map(j => (
              <option key={j.id} value={j.id}>
                {formatDate(j.tanggal_berangkat)} — {j.paket?.nama_paket} ({j.maskapai})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? <div className="spinner"></div> : manifest ? (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--gold-400)' }}>DATA MANIFEST JAMAAH</h2>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                {jadwal.find(j => j.id == selectedJadwal)?.paket?.nama_paket} — Keberangkatan: {formatDate(jadwal.find(j => j.id == selectedJadwal)?.tanggal_berangkat)}
              </div>
            </div>
            <button className="btn btn-outline print-hide" onClick={handlePrint}>🖨️ Cetak / PDF</button>
          </div>

          {manifest.length === 0 ? (
            <div className="empty-state">Belum ada jamaah yang lunas / dokumen valid untuk jadwal ini.</div>
          ) : (
            <div className="table-container" style={{ padding: 0, border: 'none' }}>
              <table style={{ border: '1px solid var(--border-default)' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-primary)' }}>
                    <th>No</th>
                    <th>Nama Lengkap</th>
                    <th>L/P</th>
                    <th>No. Paspor</th>
                    <th>NIK</th>
                    <th>TTL</th>
                  </tr>
                </thead>
                <tbody>
                  {manifest.map((m, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td><strong>{m.nama}</strong></td>
                      <td>{m.jenis_kelamin}</td>
                      <td>{m.no_paspor || '-'}</td>
                      <td>{m.nik || '-'}</td>
                      <td>{m.tempat_lahir}, {m.tanggal_lahir || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .card, .card * { visibility: visible; }
          .card { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; }
          .print-hide { display: none !important; }
        }
      `}</style>
    </div>
  );
}
