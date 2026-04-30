'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const formatRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

// ══════════════════════════════════════
// FORM DATA DIRI JAMAAH
// ══════════════════════════════════════
export function DataDiriPanel({ user, showToast, onUpdate }) {
  const [form, setForm] = useState({
    nama: '', nik: '', no_paspor: '', no_hp: '', email: '',
    tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: '', alamat: '',
  });
  const [files, setFiles] = useState({ foto_ktp: null, foto_paspor: null, foto_buku_nikah: null });
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.getProfile().then(r => {
      const u = r.data;
      setProfile(u);
      setForm({
        nama: u.nama || '', nik: u.nik || '', no_paspor: u.no_paspor || '',
        no_hp: u.no_hp || '', email: u.email || '',
        tempat_lahir: u.tempat_lahir || '', tanggal_lahir: u.tanggal_lahir?.slice(0, 10) || '',
        jenis_kelamin: u.jenis_kelamin || '', alamat: u.alamat || '',
      });
    }).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateProfile(form);
      // Upload docs if any
      const fd = new FormData();
      let hasFile = false;
      Object.entries(files).forEach(([k, v]) => { if (v) { fd.append(k, v); hasFile = true; } });
      if (hasFile) await api.uploadDokumen(fd);
      showToast('Data diri berhasil disimpan!');
      if (onUpdate) onUpdate();
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan', 'error');
    }
    setLoading(false);
  };

  const fields = [
    { n: 'nama', l: 'Nama Lengkap (sesuai KTP)', r: true },
    { n: 'nik', l: 'NIK (16 digit)', p: '3201234567890001', r: true },
    { n: 'no_paspor', l: 'No. Paspor' },
    { n: 'no_hp', l: 'No. HP / WhatsApp', p: '081234567890', r: true },
    { n: 'email', l: 'Email', t: 'email', r: true },
    { n: 'tempat_lahir', l: 'Tempat Lahir' },
    { n: 'tanggal_lahir', l: 'Tanggal Lahir', t: 'date' },
    { n: 'alamat', l: 'Alamat Lengkap' },
  ];

  return (
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, borderBottom: '1px solid var(--border-default)', paddingBottom: 12 }}>
        📝 Data Diri Jamaah
      </h3>
      <form onSubmit={handleSave}>
        <div className="grid-2" style={{ gap: '12px 20px' }}>
          {fields.map(f => (
            <div className="input-group" key={f.n} style={f.n === 'alamat' ? { gridColumn: '1 / -1' } : {}}>
              <label>{f.l} {f.r && <span style={{ color: 'var(--red-400)' }}>*</span>}</label>
              {f.n === 'alamat' ? (
                <textarea className="input-field" rows={3} value={form[f.n]} onChange={e => setForm({ ...form, [f.n]: e.target.value })} />
              ) : (
                <input className="input-field" type={f.t || 'text'} placeholder={f.p || ''} value={form[f.n]}
                  onChange={e => setForm({ ...form, [f.n]: e.target.value })} required={f.r} />
              )}
            </div>
          ))}
          <div className="input-group">
            <label>Jenis Kelamin</label>
            <select className="input-field" value={form.jenis_kelamin} onChange={e => setForm({ ...form, jenis_kelamin: e.target.value })}>
              <option value="">-- Pilih --</option><option value="L">Laki-laki</option><option value="P">Perempuan</option>
            </select>
          </div>
        </div>

        <h4 style={{ fontSize: 14, fontWeight: 700, margin: '24px 0 12px', color: 'var(--gold-300)' }}>📎 Upload Dokumen</h4>
        <div className="grid-3" style={{ gap: 12 }}>
          {[
            { n: 'foto_ktp', l: 'Foto KTP', done: profile?.foto_ktp_path },
            { n: 'foto_paspor', l: 'Foto Paspor', done: profile?.foto_paspor_path },
            { n: 'foto_buku_nikah', l: 'Buku Nikah', done: profile?.foto_buku_nikah_path },
          ].map(d => (
            <div key={d.n} style={{ padding: 16, borderRadius: 12, border: '1px dashed var(--border-default)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{d.done ? '✅' : '📁'}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{d.l}</div>
              <input type="file" accept="image/*,.pdf" style={{ fontSize: 11, width: '100%' }}
                onChange={e => setFiles({ ...files, [d.n]: e.target.files[0] })} />
              {d.done && <div style={{ fontSize: 10, color: 'var(--emerald-400)', marginTop: 4 }}>Sudah diupload</div>}
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-gold" style={{ marginTop: 20, width: '100%' }} disabled={loading}>
          {loading ? '⏳ Menyimpan...' : '💾 Simpan Data Diri'}
        </button>
      </form>
    </div>
  );
}

// ══════════════════════════════════════
// TAGIHAN & PEMBAYARAN JAMAAH
// ══════════════════════════════════════
export function TagihanPanel({ bookings, showToast, onReload }) {
  const [showPay, setShowPay] = useState(null); // booking to pay
  const [payForm, setPayForm] = useState({ jenis: 'dp', nominal: '', metode: 'transfer', bukti: null });
  const [loading, setLoading] = useState(false);

  const belumLunas = bookings.filter(b => Number(b.total_dibayar || 0) < Number(b.total_harga || 0));
  const lunas = bookings.filter(b => Number(b.total_dibayar || 0) >= Number(b.total_harga || 0) && Number(b.total_harga) > 0);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!showPay) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('jenis_pembayaran', payForm.jenis);
      fd.append('nominal', payForm.nominal);
      fd.append('metode_pembayaran', payForm.metode);
      if (payForm.bukti) fd.append('bukti_transfer', payForm.bukti);
      await api.uploadBuktiPembayaran(showPay.kode_booking, fd);
      showToast('Pembayaran berhasil disubmit! Menunggu verifikasi admin.');
      setShowPay(null);
      setPayForm({ jenis: 'dp', nominal: '', metode: 'transfer', bukti: null });
      if (onReload) onReload();
    } catch (err) {
      showToast(err.message || 'Gagal mengirim pembayaran', 'error');
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Belum Lunas */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--red-400)' }}>
          ⚠️ Tagihan Belum Lunas ({belumLunas.length})
        </h3>
        {belumLunas.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Semua tagihan sudah lunas ✅</p>
        ) : belumLunas.map(b => {
          const sisa = Number(b.total_harga || 0) - Number(b.total_dibayar || 0);
          const persen = Math.round((Number(b.total_dibayar || 0) / Number(b.total_harga || 1)) * 100);
          return (
            <div key={b.id} style={{ padding: 16, marginBottom: 12, borderRadius: 12, background: 'var(--bg-glass)', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold-400)' }}>{b.kode_booking}</div>
                  <div style={{ fontSize: 13 }}>{b.jadwal?.paket?.nama_paket || '-'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Berangkat: {formatDate(b.jadwal?.tanggal_berangkat)}</div>
                </div>
                <button className="btn btn-sm btn-gold" onClick={() => setShowPay(b)}>💳 Bayar</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span>Dibayar: <strong style={{ color: 'var(--emerald-400)' }}>{formatRp(b.total_dibayar)}</strong></span>
                <span>Sisa: <strong style={{ color: 'var(--red-400)' }}>{formatRp(sisa)}</strong></span>
              </div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${persen}%`, height: '100%', background: 'linear-gradient(90deg, #d4af37, #b8960c)', borderRadius: 8, transition: 'width 0.5s' }} />
              </div>
              <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{persen}% dari {formatRp(b.total_harga)}</div>
            </div>
          );
        })}
      </div>

      {/* Sudah Lunas */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--emerald-400)' }}>
          ✅ Sudah Lunas ({lunas.length})
        </h3>
        {lunas.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Belum ada yang lunas</p>
        ) : lunas.map(b => (
          <div key={b.id} style={{ padding: 12, marginBottom: 8, borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 700, color: 'var(--gold-400)', marginRight: 8 }}>{b.kode_booking}</span>
              <span style={{ fontSize: 13 }}>{b.jadwal?.paket?.nama_paket}</span>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--emerald-400)' }}>{formatRp(b.total_harga)} ✅</span>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPay && (
        <div className="modal-overlay" onClick={() => setShowPay(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <h2 className="modal-title">💳 Bayar — {showPay.kode_booking}</h2>
            <div style={{ fontSize: 13, marginBottom: 16, padding: 12, borderRadius: 8, background: 'var(--bg-glass)' }}>
              <div>Paket: <strong>{showPay.jadwal?.paket?.nama_paket}</strong></div>
              <div>Total: <strong>{formatRp(showPay.total_harga)}</strong></div>
              <div>Sudah Bayar: <strong style={{ color: 'var(--emerald-400)' }}>{formatRp(showPay.total_dibayar)}</strong></div>
              <div>Sisa: <strong style={{ color: 'var(--red-400)' }}>{formatRp(Number(showPay.total_harga) - Number(showPay.total_dibayar))}</strong></div>
            </div>
            <form onSubmit={handlePay}>
              <div className="input-group">
                <label>Jenis Pembayaran</label>
                <select className="input-field" value={payForm.jenis} onChange={e => setPayForm({ ...payForm, jenis: e.target.value })}>
                  <option value="dp">DP (Uang Muka)</option><option value="cicilan">Cicilan</option><option value="lunas">Pelunasan</option>
                </select>
              </div>
              <div className="input-group">
                <label>Nominal (Rp)</label>
                <input className="input-field" type="number" placeholder="Contoh: 10000000" value={payForm.nominal}
                  onChange={e => setPayForm({ ...payForm, nominal: e.target.value })} required min="1" />
              </div>
              <div className="input-group">
                <label>Metode Pembayaran</label>
                <select className="input-field" value={payForm.metode} onChange={e => setPayForm({ ...payForm, metode: e.target.value })}>
                  <option value="transfer">Transfer Bank</option><option value="cash">Cash</option><option value="ewallet">E-Wallet (OVO/GoPay/Dana)</option>
                </select>
              </div>
              <div className="input-group">
                <label>Upload Bukti Transfer</label>
                <input type="file" accept="image/*,.pdf" className="input-field" onChange={e => setPayForm({ ...payForm, bukti: e.target.files[0] })} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="submit" className="btn btn-gold" style={{ flex: 1 }} disabled={loading}>
                  {loading ? '⏳ Mengirim...' : '✅ Kirim Pembayaran'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowPay(null)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// MODUL MANASIK — Jamaah View
// ══════════════════════════════════════
export function ManasikJamaahPanel({ bookings }) {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [materi, setMateri] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMateri = async (jadwalId) => {
    setLoading(true);
    try {
      const res = await api.request(`/jamaah/manasik/${jadwalId}`);
      setMateri(res.data || []);
    } catch (e) {
      // No materi yet, that's ok
      setMateri([]);
    }
    setLoading(false);
  };

  if (selectedBooking) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>📖 Manasik — {selectedBooking.jadwal?.paket?.nama_paket}</h3>
          <button className="btn btn-outline btn-sm" onClick={() => { setSelectedBooking(null); setMateri([]); }}>← Kembali</button>
        </div>
        {loading ? <div className="loading-page"><div className="spinner" /></div> :
          materi.length === 0 ? (
            <div className="empty-state"><div className="icon">📖</div><h3>Belum ada materi</h3><p>Admin belum menambahkan modul manasik untuk jadwal ini</p></div>
          ) : materi.map((m, i) => (
            <div key={m.id || i} className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--gold-400)', fontWeight: 600, marginBottom: 4 }}>Hari {m.urutan || i + 1}</div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{m.judul}</h4>
                </div>
                {m.file_path && (
                  <a href={`http://127.0.0.1:8000/storage/${m.file_path}`} target="_blank" className="btn btn-sm btn-outline">📥 Download</a>
                )}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{m.konten}</div>
              {m.jadwal_detail && (
                <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: 'var(--bg-glass)', fontSize: 12 }}>
                  <strong>📍 Detail:</strong> {m.jadwal_detail}
                </div>
              )}
            </div>
          ))
        }
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📖 Pilih Paket untuk Lihat Manasik</h3>
      {bookings.length === 0 ? (
        <div className="empty-state"><div className="icon">📖</div><h3>Belum ada booking</h3></div>
      ) : (
        <div className="grid-2" style={{ gap: 12 }}>
          {bookings.map(b => (
            <div key={b.id} className="card" style={{ padding: 16, cursor: 'pointer' }}
              onClick={() => { setSelectedBooking(b); loadMateri(b.jadwal_id); }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold-400)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = ''}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{b.jadwal?.paket?.nama_paket}</div>
              <div style={{ fontSize: 12, color: 'var(--gold-400)' }}>{b.kode_booking}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {formatDate(b.jadwal?.tanggal_berangkat)} — {b.jadwal?.paket?.durasi_hari || 9} hari
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
