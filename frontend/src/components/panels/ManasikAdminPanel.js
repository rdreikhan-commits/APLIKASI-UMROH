'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

export default function ManasikAdminPanel({ showToast }) {
  const [jadwals, setJadwals] = useState([]);
  const [materi, setMateri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id: null, judul: '', konten: '', urutan: 1, jadwal_detail: '', file: null });

  const loadData = async () => {
    setLoading(true);
    try {
      const jRes = await api.getAdminJadwal();
      setJadwals(jRes.data || []);
      const mRes = await api.request('/admin/travel/manasik');
      setMateri(mRes.data || []);
    } catch (e) {}
    setLoading(false);
  };
  useEffect(() => { loadData(); }, []);

  const filteredMateri = selectedJadwal ? materi.filter(m => m.jadwal_id === selectedJadwal) : materi;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('jadwal_id', selectedJadwal || jadwals[0]?.id);
      fd.append('judul', form.judul);
      fd.append('konten', form.konten);
      fd.append('urutan', form.urutan);
      fd.append('jadwal_detail', form.jadwal_detail);
      if (form.file) fd.append('file', form.file);

      if (form.id) {
        // PUT via POST method with _method=PUT for FormData in Laravel
        fd.append('_method', 'PUT');
        await api.request(`/admin/travel/manasik/${form.id}`, { method: 'POST', body: fd, headers: {} });
        showToast('Materi diupdate!');
      } else {
        await api.request('/admin/travel/manasik', { method: 'POST', body: fd, headers: {} });
        showToast('Materi ditambahkan!');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan', 'error');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus materi manasik ini?')) return;
    try {
      await api.request(`/admin/travel/manasik/${id}`, { method: 'DELETE' });
      showToast('Dihapus!');
      loadData();
    } catch (e) {
      showToast('Gagal menghapus', 'error');
    }
  };

  if (loading && jadwals.length === 0) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1>📖 Modul Manasik</h1><p>Kelola materi dan itinerary perjalanan jamaah</p></div>
        <button className="btn btn-gold" onClick={() => {
          if (!selectedJadwal && jadwals.length > 0) setSelectedJadwal(jadwals[0].id);
          setForm({ id: null, judul: '', konten: '', urutan: 1, jadwal_detail: '', file: null });
          setShowModal(true);
        }}>+ Tambah Materi</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ flex: 1, padding: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Filter Jadwal Keberangkatan</label>
          <select className="input-field" value={selectedJadwal || ''} onChange={e => setSelectedJadwal(Number(e.target.value) || null)}>
            <option value="">-- Semua Jadwal --</option>
            {jadwals.map(j => (
              <option key={j.id} value={j.id}>{j.paket?.nama_paket} — {formatDate(j.tanggal_berangkat)}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredMateri.length === 0 ? (
        <div className="empty-state"><div className="icon">📖</div><h3>Tidak ada materi manasik</h3></div>
      ) : (
        <div className="table-container card" style={{ padding: 0 }}>
          <table>
            <thead><tr><th>Urutan</th><th>Jadwal & Paket</th><th>Judul Materi</th><th>Detail Itinerary</th><th>File</th><th>Aksi</th></tr></thead>
            <tbody>
              {filteredMateri.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 700, textAlign: 'center' }}>Hari {m.urutan}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{m.jadwal?.paket?.nama_paket}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Brgkt: {formatDate(m.jadwal?.tanggal_berangkat)}</div>
                  </td>
                  <td>{m.judul}</td>
                  <td style={{ fontSize: 12 }}>{m.jadwal_detail || '-'}</td>
                  <td>{m.file_path ? <a href={`http://127.0.0.1:8000/storage/${m.file_path}`} target="_blank" style={{ color: 'var(--gold-400)' }}>📄 Lihat</a> : '-'}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm btn-outline" onClick={() => {
                      setForm({ id: m.id, judul: m.judul, konten: m.konten || '', urutan: m.urutan, jadwal_detail: m.jadwal_detail || '', file: null });
                      setShowModal(true);
                    }}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <h2 className="modal-title">{form.id ? 'Edit Materi' : 'Tambah Materi Manasik'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Untuk Jadwal Keberangkatan</label>
                <select className="input-field" value={selectedJadwal || ''} onChange={e => setSelectedJadwal(Number(e.target.value))} required disabled={!!form.id}>
                  {jadwals.map(j => (
                    <option key={j.id} value={j.id}>{j.paket?.nama_paket} ({formatDate(j.tanggal_berangkat)})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12 }}>
                <div className="input-group">
                  <label>Hari Ke-</label>
                  <input type="number" className="input-field" value={form.urutan} onChange={e => setForm({ ...form, urutan: e.target.value })} required min="1" />
                </div>
                <div className="input-group">
                  <label>Judul Materi / Aktivitas</label>
                  <input type="text" className="input-field" value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} required placeholder="Contoh: Keberangkatan & Check-in Hotel" />
                </div>
              </div>
              <div className="input-group">
                <label>Detail Itinerary (Waktu & Tempat)</label>
                <input type="text" className="input-field" value={form.jadwal_detail} onChange={e => setForm({ ...form, jadwal_detail: e.target.value })} placeholder="Contoh: 08:00 - Kumpul di Terminal 3 Bandara Soetta" />
              </div>
              <div className="input-group">
                <label>Deskripsi Konten / Doa-doa</label>
                <textarea className="input-field" rows={5} value={form.konten} onChange={e => setForm({ ...form, konten: e.target.value })} placeholder="Tulis rincian materi manasik atau panduan perjalanan di sini..."></textarea>
              </div>
              <div className="input-group">
                <label>Upload File (PDF/Image Opsional)</label>
                <input type="file" className="input-field" accept=".pdf,.jpg,.png" onChange={e => setForm({ ...form, file: e.target.files[0] })} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Batal</button>
                <button type="submit" className="btn btn-gold" style={{ flex: 1 }} disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
