'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const formatRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
const badgeClass = (s) => `badge badge-${s?.replace('waiting_payment', 'waiting')}`;

// ══════════════════════════════════════
// INVENTORY PANEL (Edit Stok Realtime)
// ══════════════════════════════════════
export function InventoryPanel({ showToast }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(null); // id barang
  const [logForm, setLogForm] = useState({ jenis_log: 'masuk', qty: '', catatan: '' });

  const load = async () => {
    setLoading(true);
    try {
      const inv = await api.getMasterPerlengkapan();
      setInventory(inv.data || []);
    } catch (e) { showToast('Gagal memuat inventory', 'error'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.request(`/admin/perlengkapan/master/${showLogModal}/log`, {
        method: 'POST',
        body: JSON.stringify(logForm)
      });
      showToast('Stok berhasil diupdate!');
      setShowLogModal(null);
      setLogForm({ jenis_log: 'masuk', qty: '', catatan: '' });
      load();
    } catch (err) {
      showToast(err.message || 'Gagal update stok', 'error');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header"><h1>📦 Inventory & Log Stok</h1><p>Kelola stok perlengkapan (masuk/keluar/hilang/rusak)</p></div>
      <div className="grid-3">
        {inventory.map(item => (
          <div key={item.id} className="card card-gold">
            <div style={{ fontSize: 12, color: 'var(--gold-400)', fontWeight: 600, marginBottom: 4 }}>{item.kode_barang}</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{item.nama_barang}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Stok</div><div style={{ fontSize: 28, fontWeight: 800, color: item.stok_gudang <= item.stok_minimum ? 'var(--red-400)' : 'var(--emerald-400)' }}>{item.stok_gudang}</div></div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Min</div><div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>{item.stok_minimum}</div>
                <button className="btn btn-sm btn-gold" onClick={() => setShowLogModal(item.id)}>Edit Stok</button>
              </div>
            </div>
            {item.stok_gudang <= item.stok_minimum && <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, fontSize: 12, color: 'var(--red-400)', fontWeight: 600 }}>⚠️ Stok Rendah!</div>}
          </div>
        ))}
      </div>

      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Edit Stok (Realtime Log)</h2>
            <form onSubmit={handleLogSubmit}>
              <div className="input-group">
                <label>Jenis Aktivitas</label>
                <select className="input-field" value={logForm.jenis_log} onChange={e => setLogForm({...logForm, jenis_log: e.target.value})}>
                  <option value="masuk">Stok Masuk (Bertambah)</option>
                  <option value="keluar">Stok Keluar Manual (Berkurang)</option>
                  <option value="pinjam">Dipinjam (Berkurang)</option>
                  <option value="rusak">Rusak (Berkurang)</option>
                  <option value="hilang">Hilang (Berkurang)</option>
                </select>
              </div>
              <div className="input-group">
                <label>Jumlah (Qty)</label>
                <input className="input-field" type="number" value={logForm.qty} onChange={e => setLogForm({...logForm, qty: e.target.value})} min="1" required />
              </div>
              <div className="input-group">
                <label>Catatan (Opsional)</label>
                <input className="input-field" type="text" value={logForm.catatan} onChange={e => setLogForm({...logForm, catatan: e.target.value})} placeholder="Contoh: Dipinjam oleh agen X" />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowLogModal(null)}>Batal</button>
                <button type="submit" className="btn btn-gold" style={{ flex: 1 }}>Simpan Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// DISTRIBUSI PANEL
// ══════════════════════════════════════
export function DistribusiPanel({ showToast }) {
  const [distribusi, setDistribusi] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const dist = await api.getDistribusiList();
      setDistribusi(dist.data?.data || dist.data || []);
    } catch (e) { showToast('Gagal memuat distribusi', 'error'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleHandover = async (id) => {
    if (!confirm('Serahkan barang ini ke jamaah?')) return;
    try {
      const res = await api.handoverEquipment(id, { status_penyerahan: 'diserahkan' });
      showToast(res.message || 'Diserahkan!');
      if (res.low_stock_warning) showToast(res.low_stock_warning, 'error');
      load();
    } catch (err) { showToast(err.message || 'Gagal', 'error'); }
  };

  const handleBatch = async (bookingId) => {
    if (!confirm('Serahkan SEMUA barang pending untuk jamaah ini?')) return;
    try {
      const res = await api.batchHandover({ booking_id: bookingId, status_penyerahan: 'diserahkan' });
      showToast(res.message || 'Berhasil diserahkan!');
      load();
    } catch (err) { showToast(err.message || 'Gagal', 'error'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header"><h1>🎒 Distribusi Jamaah</h1><p>Verifikasi & serahkan perlengkapan ke jamaah (terintegrasi otomatis)</p></div>
      {distribusi.length === 0 ? (
        <div className="empty-state"><div className="icon">🎒</div><h3>Belum ada distribusi</h3><p>Distribusi muncul otomatis setelah booking jamaah dikonfirmasi admin</p></div>
      ) : (
        distribusi.map(booking => (
          <div key={booking.id} className="card" style={{ marginBottom: 16 }}>
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, color: 'var(--gold-400)', fontWeight: 700 }}>{booking.kode_booking}</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{booking.user?.nama}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{booking.jadwal?.kode_jadwal} • {formatDate(booking.jadwal?.tanggal_berangkat)}</div>
              </div>
              {booking.distribusi_perlengkapan?.some(d => d.status_penyerahan === 'pending') && (
                <button className="btn btn-sm btn-gold" onClick={() => handleBatch(booking.id)}>Serahkan Semua (Batch)</button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 8 }}>
              {booking.distribusi_perlengkapan?.map(d => (
                <div key={d.id} style={{ padding: '10px 14px', background: 'var(--bg-glass)', borderRadius: 8, border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{d.perlengkapan?.nama_barang} ({d.jumlah})</div>
                    <span className={badgeClass(d.status_penyerahan)} style={{ marginTop: 4 }}>{d.status_penyerahan}</span>
                  </div>
                  {d.status_penyerahan === 'pending' && <button className="btn btn-sm btn-success" onClick={() => handleHandover(d.id)}>✓ Ceklis</button>}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ══════════════════════════════════════
// PENGAJUAN PERLENGKAPAN PANEL
// ══════════════════════════════════════
export function PengajuanPanel({ showToast, role }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ jenis_barang: '', qty: '', harga_satuan: '', catatan: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.request('/admin/perlengkapan/pengajuan');
      setData(res.data || []);
    } catch { showToast('Gagal', 'error'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.request('/admin/perlengkapan/pengajuan', { method: 'POST', body: JSON.stringify(form) });
      showToast('Pengajuan berhasil dikirim ke Manager!');
      setShowModal(false);
      setForm({ jenis_barang: '', qty: '', harga_satuan: '', catatan: '' });
      load();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleStatus = async (id, status) => {
    if (!confirm('Ubah status menjadi ' + status + '?')) return;
    try {
      await api.request(`/admin/perlengkapan/pengajuan/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      showToast('Status diupdate!');
      load();
    } catch (err) { showToast(err.message, 'error'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1>📋 Pengajuan Barang</h1><p>Pengadaan perlengkapan (Manager ACC & Keuangan)</p></div>
        {role === 'admin_perlengkapan' && (
          <button className="btn btn-gold" onClick={() => setShowModal(true)}>+ Buat Pengajuan</button>
        )}
      </div>

      <div className="table-container card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Tanggal</th><th>Barang</th><th>Qty</th><th>Harga Satuan</th><th>Total Harga</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {data.map(p => (
              <tr key={p.id}>
                <td>{formatDate(p.created_at)}</td>
                <td style={{ fontWeight: 600 }}>{p.jenis_barang}<div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.catatan}</div></td>
                <td>{p.qty}</td>
                <td>{formatRp(p.harga_satuan)}</td>
                <td style={{ fontWeight: 700 }}>{formatRp(p.total_harga)}</td>
                <td>
                  <span className={`badge ${p.status === 'acc_manager' ? 'badge-confirmed' : p.status === 'dicairkan' || p.status === 'diambil' ? 'badge-success' : 'badge-pending'}`}>
                    {p.status.toUpperCase().replace('_', ' ')}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: 6 }}>
                  {role === 'admin_perlengkapan' && p.status === 'dicairkan' && <button className="btn btn-sm btn-success" onClick={() => handleStatus(p.id, 'diambil')}>Ambil Barang</button>}
                  {role === 'manager' && p.status === 'pending' && <button className="btn btn-sm btn-success" onClick={() => handleStatus(p.id, 'acc_manager')}>ACC Manager</button>}
                  {role === 'admin_keuangan' && p.status === 'acc_manager' && <button className="btn btn-sm btn-gold" onClick={() => handleStatus(p.id, 'dicairkan')}>Cairkan Dana</button>}
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: 24 }}>Belum ada data pengajuan</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Form Pengajuan Barang Baru</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Jenis Barang</label>
                <input className="input-field" value={form.jenis_barang} onChange={e => setForm({...form, jenis_barang: e.target.value})} required placeholder="Contoh: Koper Kabin Polo" />
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="input-group">
                  <label>Banyaknya (Qty)</label>
                  <input className="input-field" type="number" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} required min="1" />
                </div>
                <div className="input-group">
                  <label>Harga Satuan (Rp)</label>
                  <input className="input-field" type="number" value={form.harga_satuan} onChange={e => setForm({...form, harga_satuan: e.target.value})} required min="0" />
                </div>
              </div>
              <div className="input-group" style={{ background: 'var(--bg-glass)', padding: 12, borderRadius: 8 }}>
                <label>Total Harga Estimasi:</label>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold-400)' }}>{formatRp((Number(form.qty)||0) * (Number(form.harga_satuan)||0))}</div>
              </div>
              <div className="input-group" style={{ marginTop: 12 }}>
                <label>Catatan (Opsional)</label>
                <input className="input-field" value={form.catatan} onChange={e => setForm({...form, catatan: e.target.value})} placeholder="Butuh cepat untuk kloter agustus" />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-gold" style={{ flex: 1 }}>Ajukan Sekarang</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
