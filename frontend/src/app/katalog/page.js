'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Toast from '@/components/Toast';
import api from '@/lib/api';

const formatRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

export default function KatalogPage() {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [booking, setBooking] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    api.getJadwalList().then(r => { setJadwal(r.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleBooking = async (jadwalId) => {
    const user = api.getUser();
    if (!user) { window.location.href = '/login'; return; }
    if (user.role !== 'jamaah') { setToast({ type: 'error', message: 'Hanya jamaah yang bisa booking' }); return; }
    if (!confirm('Booking jadwal ini?')) return;
    setBooking(true);
    try {
      const res = await api.checkout(jadwalId);
      setToast({ type: 'success', message: `Booking berhasil! Kode: ${res.data.kode_booking}` });
      setTimeout(() => window.location.href = '/dashboard', 2000);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Booking gagal' });
    }
    setBooking(false);
  };

  return (
    <>
      <Navbar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="page-container">
        <div className="page-header">
          <h1>Katalog Jadwal Umroh</h1>
          <p>Pilih jadwal keberangkatan dan booking kursi Anda</p>
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner" /><span>Memuat katalog...</span></div>
        ) : jadwal.length === 0 ? (
          <div className="empty-state"><div className="icon">📋</div><h3>Belum ada jadwal tersedia</h3></div>
        ) : (
          <div className="grid-2">
            {jadwal.map(j => (
              <div key={j.id} className="card card-gold" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="flex-between">
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--gold-400)', fontWeight: 600 }}>{j.kode_jadwal}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{j.paket?.nama_paket}</div>
                  </div>
                  <span className="badge" style={{
                    background: j.paket?.tipe === 'vip' ? 'rgba(251,191,36,0.15)' : 'rgba(96,165,250,0.15)',
                    color: j.paket?.tipe === 'vip' ? 'var(--gold-300)' : 'var(--blue-400)',
                  }}>{(j.paket?.tipe || 'reguler').toUpperCase()}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <div>📅 Berangkat<br /><strong style={{ color: 'var(--text-primary)' }}>{formatDate(j.tanggal_berangkat)}</strong></div>
                  <div>📅 Pulang<br /><strong style={{ color: 'var(--text-primary)' }}>{formatDate(j.tanggal_pulang)}</strong></div>
                  <div>🏙️ Dari<br /><strong style={{ color: 'var(--text-primary)' }}>{j.kota_keberangkatan}</strong></div>
                  <div>⏱️ Durasi<br /><strong style={{ color: 'var(--text-primary)' }}>{j.paket?.durasi_hari} Hari</strong></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--border-default)' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Harga</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gold-400)' }}>{formatRp(j.paket?.harga)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sisa Kuota</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: j.sisa_kuota > 10 ? 'var(--emerald-400)' : 'var(--red-400)' }}>
                      {j.sisa_kuota}<span style={{ fontSize: 13, fontWeight: 400 }}>/{j.kuota_total}</span>
                    </div>
                  </div>
                </div>

                <button className="btn btn-gold" style={{ width: '100%' }} disabled={j.sisa_kuota <= 0 || booking}
                  onClick={() => handleBooking(j.id)}>
                  {j.sisa_kuota <= 0 ? 'Kuota Habis' : booking ? '⏳ Proses...' : '🕌 Booking Sekarang'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
