'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function Home() {
  const [jadwal, setJadwal] = useState([]);
  const [banners, setBanners] = useState([]);
  const [articles, setArticles] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getJadwalList().catch(() => ({ data: [] })),
      api.getActiveBanners().catch(() => ({ data: [] })),
      api.getPublishedArticles().catch(() => ({ data: [] }))
    ]).then(([resJadwal, resBanners, resArticles]) => {
      setJadwal(Array.isArray(resJadwal) ? resJadwal : resJadwal.data || []);
      setBanners(Array.isArray(resBanners) ? resBanners : resBanners.data || []);
      setArticles(Array.isArray(resArticles) ? resArticles : resArticles.data || []);
      setLoading(false);
    });
  }, []);

  const formatRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(180deg, rgba(251,191,36,0.06) 0%, var(--bg-primary) 60%)',
        padding: '80px 24px 60px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🕌</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '48px', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px',
            background: 'linear-gradient(135deg, #fcd34d, #f59e0b, #d97706)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>
            Perjalanan Suci<br />Dimulai di Sini
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
            Sistem ERP terintegrasi untuk manajemen Travel Umroh.
            Booking, pembayaran, dokumen, dan perlengkapan dalam satu platform.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <a href="/katalog" className="btn btn-lg btn-gold">Lihat Paket Umroh →</a>
            <a href="/register" className="btn btn-lg btn-outline">Daftar Sekarang</a>
          </div>
        </div>
      </section>
      {/* Promo Slider */}
      {banners.length > 0 && (
        <section className="page-container" style={{ marginBottom: '60px' }}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '400px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            {banners.map((b, i) => (
              <div key={b.id} style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                opacity: i === currentSlide ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
                zIndex: i === currentSlide ? 1 : 0
              }}>
                <img src={`http://127.0.0.1:8000${b.image_path}`} alt={b.title || 'Promo Banner'} style={{
                  width: '100%', height: '100%', objectFit: 'cover'
                }} />
                {b.title && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '40px 24px 24px',
                    background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
                    color: 'white', fontSize: '24px', fontWeight: 'bold'
                  }}>
                    {b.title}
                  </div>
                )}
              </div>
            ))}
            
            {/* Slider Dots */}
            {banners.length > 1 && (
              <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 2 }}>
                {banners.map((_, i) => (
                  <div key={i} onClick={() => setCurrentSlide(i)} style={{
                    width: i === currentSlide ? '24px' : '8px', height: '8px', borderRadius: '4px',
                    background: i === currentSlide ? 'var(--gold-400)' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer', transition: 'all 0.3s ease'
                  }} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      {/* Stats */}
      <section className="page-container">
        <div className="grid-4" style={{ marginBottom: '60px' }}>
          {[
            { icon: '🕌', value: jadwal.length || '—', label: 'Jadwal Tersedia', color: 'gold' },
            { icon: '✈️', value: jadwal.reduce((sum, j) => sum + (j.kuota_total || 0), 0) || '—', label: 'Total Kapasitas', color: 'blue' },
            { icon: '👥', value: jadwal.reduce((sum, j) => sum + (j.kuota_total - j.sisa_kuota), 0) || '0', label: 'Jamaah Terdaftar', color: 'emerald' },
            { icon: '📦', value: '5+', label: 'Perlengkapan Umroh', color: 'purple' },
          ].map((s, i) => (
            <div key={i} className="card stat-card card-gold">
              <div className={`stat-icon ${s.color}`}>{s.icon}</div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Jadwal Tersedia */}
        <div className="page-header">
          <h1>Jadwal Keberangkatan</h1>
          <p>Pilih jadwal dan segera booking kursi Anda</p>
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner" /><span>Memuat jadwal...</span></div>
        ) : jadwal.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <h3>Belum ada jadwal tersedia</h3>
            <p>Silakan hubungi admin untuk informasi lebih lanjut</p>
          </div>
        ) : (
          <div className="grid-2">
            {jadwal.map((j) => (
              <div key={j.id} className="card card-gold" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="flex-between">
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--gold-400)', fontWeight: 600, letterSpacing: '0.5px' }}>
                      {j.kode_jadwal}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px' }}>
                      {j.paket?.nama_paket || 'Paket Umroh'}
                    </div>
                  </div>
                  <span className={`badge badge-${j.paket?.tipe || 'reguler'}`}
                    style={{
                      background: j.paket?.tipe === 'vip' ? 'rgba(251,191,36,0.15)' : j.paket?.tipe === 'vvip' ? 'rgba(167,139,250,0.15)' : 'rgba(96,165,250,0.15)',
                      color: j.paket?.tipe === 'vip' ? 'var(--gold-300)' : j.paket?.tipe === 'vvip' ? 'var(--purple-400)' : 'var(--blue-400)',
                    }}>
                    {(j.paket?.tipe || 'reguler').toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <div>📅 Berangkat<br /><strong style={{ color: 'var(--text-primary)' }}>{formatDate(j.tanggal_berangkat)}</strong></div>
                  <div>📅 Pulang<br /><strong style={{ color: 'var(--text-primary)' }}>{formatDate(j.tanggal_pulang)}</strong></div>
                  <div>🏙️ Dari<br /><strong style={{ color: 'var(--text-primary)' }}>{j.kota_keberangkatan}</strong></div>
                  <div>⏱️ Durasi<br /><strong style={{ color: 'var(--text-primary)' }}>{j.paket?.durasi_hari || '—'} Hari</strong></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--border-default)' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mulai dari</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gold-400)' }}>{formatRp(j.paket?.harga)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sisa Kuota</div>
                    <div style={{
                      fontSize: '22px', fontWeight: 800,
                      color: j.sisa_kuota > 10 ? 'var(--emerald-400)' : j.sisa_kuota > 0 ? 'var(--orange-400)' : 'var(--red-400)'
                    }}>
                      {j.sisa_kuota} <span style={{ fontSize: '13px', fontWeight: 400 }}>/ {j.kuota_total}</span>
                    </div>
                  </div>
                </div>

                <a href={`/katalog?jadwal=${j.id}`} className="btn btn-gold" style={{ width: '100%' }}>
                  Booking Sekarang →
                </a>
              </div>
            ))}
          </div>
        )}
        {/* Recent Articles */}
        <div className="page-header" style={{ marginTop: '80px' }}>
          <h1>Berita & Informasi Terbaru</h1>
          <p>Update seputar perjalanan umroh dan kegiatan kami</p>
        </div>

        {articles.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="icon">📝</div>
            <h3>Belum ada artikel</h3>
          </div>
        ) : (
          <div className="grid-3" style={{ marginBottom: '60px' }}>
            {articles.slice(0, 3).map(a => (
              <a href={`/blog/${a.slug}`} key={a.id} className="card card-gold" style={{ display: 'block', textDecoration: 'none', color: 'inherit', padding: 0, overflow: 'hidden', transition: 'transform 0.3s ease' }}>
                <div style={{ width: '100%', height: '200px', backgroundColor: '#2a2a2a' }}>
                  {a.image_path ? (
                    <img src={`http://127.0.0.1:8000${a.image_path}`} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>📝</div>
                  )}
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--gold-400)', marginBottom: '8px' }}>
                    {new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', lineHeight: 1.4 }}>{a.title}</h3>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Baca selengkapnya →
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
        {articles.length > 3 && (
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <a href="/blog" className="btn btn-outline">Lihat Semua Artikel</a>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-default)', padding: '40px 24px',
        textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginTop: '80px'
      }}>
        <div style={{ fontSize: '20px', marginBottom: '8px' }}>🕌 <strong style={{ color: 'var(--gold-400)' }}>UmrohERP</strong></div>
        <p>© 2026 ERP Travel Umroh — Sistem Manajemen Terintegrasi</p>
      </footer>
    </>
  );
}
