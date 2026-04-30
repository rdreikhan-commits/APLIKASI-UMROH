'use client';
import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import api from '@/lib/api';

Chart.register(...registerables);

const formatRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

const PERIODS = [
  { key: 'week', label: '1 Minggu' },
  { key: '2week', label: '2 Minggu' },
  { key: 'month', label: '1 Bulan' },
  { key: '3month', label: '3 Bulan' },
  { key: 'year', label: '1 Tahun' },
];

const GOLD = '#d4af37';
const GOLD_LIGHT = '#e8c84b';
const GOLD_DARK = '#b8960c';

// ── Reusable Chart Component ──
function ChartCanvas({ type, data, options, height = 280 }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#a89968', font: { family: 'Inter', size: 12 } } },
        },
        scales: type === 'bar' || type === 'line' ? {
          x: { ticks: { color: '#6b6040', font: { size: 11 } }, grid: { color: 'rgba(212,175,55,0.06)' } },
          y: { ticks: { color: '#6b6040', font: { size: 11 } }, grid: { color: 'rgba(212,175,55,0.06)' } },
        } : undefined,
        ...options,
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data, type, options]);

  return <canvas ref={canvasRef} style={{ maxHeight: height }} />;
}

// ── Stat Card ──
function StatCard({ icon, value, label, color = GOLD }) {
  return (
    <div className="card stat-card" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="stat-icon" style={{ background: `${color}22`, color }}>{icon}</div>
      <div>
        <div className="stat-value" style={{ color, fontSize: typeof value === 'string' && value.length > 10 ? 16 : 28 }}>{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// MAIN OVERVIEW PANEL
// ══════════════════════════════════════
export default function OverviewPanel({ showToast }) {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  const load = async (p) => {
    setLoading(true);
    try {
      const res = await api.getDashboardStats(p);
      setStats(res.data);
    } catch (err) {
      showToast('Gagal memuat statistik', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { load(period); }, [period]);

  if (loading) return <div className="loading-page" style={{ minHeight: '50vh' }}><div className="spinner" /><span>Memuat dashboard...</span></div>;
  if (!stats) return <div className="empty-state"><div className="icon">📊</div><h3>Data tidak tersedia</h3></div>;

  const { summary, booking_trend, paket_distribution, booking_by_status, cash_flow, pengeluaran_kategori, jadwal_terdekat } = stats;

  // ── Chart Data: Booking Trend (Bar) ──
  const bookingTrendData = {
    labels: booking_trend?.map(b => b.label) || [],
    datasets: [{
      label: 'Booking',
      data: booking_trend?.map(b => b.total) || [],
      backgroundColor: `${GOLD}99`,
      borderColor: GOLD,
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  // ── Chart Data: Paket Type (Doughnut) ──
  const paketColors = { reguler: '#d4af37', vip: '#e8c84b', vvip: '#b8960c' };
  const paketDistData = {
    labels: paket_distribution?.map(p => p.tipe?.toUpperCase()) || [],
    datasets: [{
      data: paket_distribution?.map(p => p.total) || [],
      backgroundColor: paket_distribution?.map(p => paketColors[p.tipe] || GOLD) || [],
      borderColor: '#0d0d0d',
      borderWidth: 3,
    }],
  };

  // ── Chart Data: Booking Status (Doughnut) ──
  const statusColors = { pending: '#60a5fa', confirmed: '#34d399', waiting_payment: '#fb923c', cancelled: '#f87171', completed: '#a78bfa' };
  const bookingStatusData = {
    labels: booking_by_status?.map(b => b.status?.toUpperCase().replace(/_/g, ' ')) || [],
    datasets: [{
      data: booking_by_status?.map(b => b.total) || [],
      backgroundColor: booking_by_status?.map(b => statusColors[b.status] || '#888') || [],
      borderColor: '#0d0d0d',
      borderWidth: 3,
    }],
  };

  // ── Chart Data: Cash Flow (Line) ──
  const allLabels = [...new Set([
    ...(cash_flow?.pemasukan?.map(p => p.label) || []),
    ...(cash_flow?.pengeluaran?.map(p => p.label) || []),
  ])].sort();
  const cashFlowData = {
    labels: allLabels,
    datasets: [
      {
        label: 'Pemasukan',
        data: allLabels.map(l => cash_flow?.pemasukan?.find(p => p.label === l)?.total || 0),
        borderColor: '#34d399',
        backgroundColor: 'rgba(52,211,153,0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: 'Pengeluaran',
        data: allLabels.map(l => cash_flow?.pengeluaran?.find(p => p.label === l)?.total || 0),
        borderColor: '#f87171',
        backgroundColor: 'rgba(248,113,113,0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  // ── Chart Data: Pengeluaran Kategori (Doughnut) ──
  const katColors = ['#d4af37','#e8c84b','#f87171','#60a5fa','#a78bfa','#fb923c','#34d399','#b8960c'];
  const pengeluaranKatData = pengeluaran_kategori?.length > 0 ? {
    labels: pengeluaran_kategori.map(k => k.kategori?.toUpperCase()),
    datasets: [{
      data: pengeluaran_kategori.map(k => k.total),
      backgroundColor: pengeluaran_kategori.map((_, i) => katColors[i % katColors.length]),
      borderColor: '#0d0d0d',
      borderWidth: 3,
    }],
  } : null;

  const doughnutOptions = { plugins: { legend: { position: 'bottom', labels: { color: '#a89968', padding: 16, font: { size: 12 } } } } };
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  return (
    <div>
      {/* Header + Period Filter */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div><h1>📊 Dashboard Overview</h1><p>Ringkasan operasional Mandala 525</p></div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PERIODS.map(p => (
            <button key={p.key} className={`btn btn-sm ${period === p.key ? 'btn-gold' : 'btn-outline'}`}
              onClick={() => setPeriod(p.key)}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard icon="📦" value={summary.total_paket} label="Total Paket" color={GOLD} />
        <StatCard icon="👤" value={summary.total_jamaah} label="Jamaah Terdaftar" color="#60a5fa" />
        <StatCard icon="📋" value={summary.total_booking} label="Total Booking" color={GOLD_LIGHT} />
        <StatCard icon="✅" value={summary.booking_confirmed} label="Confirmed" color="#34d399" />
      </div>

      {/* Financial Cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard icon="📈" value={formatRp(summary.total_pemasukan)} label="Pemasukan" color="#34d399" />
        <StatCard icon="📉" value={formatRp(summary.total_pengeluaran)} label="Pengeluaran" color="#f87171" />
        <StatCard icon="💳" value={formatRp(summary.pembayaran_verified)} label="Pembayaran Verified" color="#60a5fa" />
        <StatCard icon="💰" value={formatRp(summary.profit)} label="Profit Bersih" color={summary.profit >= 0 ? '#34d399' : '#f87171'} />
      </div>

      {/* Charts Row 1: Booking Trend + Paket Distribution */}
      <div className="grid-2-1" style={{ marginBottom: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            📊 Tren Booking ({PERIODS.find(p => p.key === period)?.label})
          </h3>
          <div style={{ height: 280 }}>
            {booking_trend?.length > 0
              ? <ChartCanvas type="bar" data={bookingTrendData} height={280} />
              : <div className="empty-state" style={{ minHeight: 200 }}><p>Belum ada data booking pada periode ini</p></div>}
          </div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700 }}>🎯 Tipe Paket</h3>
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {paket_distribution?.length > 0
              ? <ChartCanvas type="doughnut" data={paketDistData} options={doughnutOptions} height={260} />
              : <p style={{ color: 'var(--text-muted)' }}>Belum ada paket</p>}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Cash Flow + Booking Status */}
      <div className="grid-2-1" style={{ marginBottom: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700 }}>
            💰 Arus Kas ({PERIODS.find(p => p.key === period)?.label})
          </h3>
          <div style={{ height: 280 }}>
            {allLabels.length > 0
              ? <ChartCanvas type="line" data={cashFlowData} height={280} />
              : <div className="empty-state" style={{ minHeight: 200 }}><p>Belum ada data keuangan pada periode ini</p></div>}
          </div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700 }}>📋 Status Booking</h3>
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {booking_by_status?.length > 0
              ? <ChartCanvas type="doughnut" data={bookingStatusData} options={doughnutOptions} height={260} />
              : <p style={{ color: 'var(--text-muted)' }}>Belum ada booking</p>}
          </div>
        </div>
      </div>

      {/* Charts Row 3: Pengeluaran Kategori + Jadwal Terdekat */}
      <div className="grid-2" style={{ gap: 20 }}>
        {pengeluaranKatData && (
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700 }}>📉 Pengeluaran per Kategori</h3>
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChartCanvas type="doughnut" data={pengeluaranKatData} options={doughnutOptions} height={240} />
            </div>
          </div>
        )}

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700 }}>🗓️ Jadwal Terdekat</h3>
          {jadwal_terdekat?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {jadwal_terdekat.map(j => (
                <div key={j.id} style={{
                  padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 10,
                  border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-300)' }}>{j.kode_jadwal}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{j.paket?.nama_paket}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(j.tanggal_berangkat)}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: j.sisa_kuota <= 5 ? '#f87171' : '#34d399' }}>
                      {j.sisa_kuota}/{j.kuota_total}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ minHeight: 150 }}><p>Tidak ada jadwal mendatang</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
