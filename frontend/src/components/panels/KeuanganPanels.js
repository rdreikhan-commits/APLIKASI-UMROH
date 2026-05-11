'use client';
import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import CrudPanel from '@/components/CrudPanel';
import api from '@/lib/api';

Chart.register(...registerables);

const formatRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
const GOLD = '#d4af37';
const katColors = ['#d4af37','#60a5fa','#f87171','#a78bfa','#fb923c','#34d399','#e8c84b','#b8960c'];

// ── Chart canvas wrapper ──
function ChartBox({ type, data, options, height = 260, title }) {
  const ref = useRef(null);
  const inst = useRef(null);
  useEffect(() => {
    if (!ref.current || !data) return;
    if (inst.current) inst.current.destroy();
    inst.current = new Chart(ref.current.getContext('2d'), {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#a89968', font: { family: 'Inter', size: 11 }, padding: 12 } },
        },
        scales: (type === 'bar' || type === 'line') ? {
          x: { ticks: { color: '#6b6040', font: { size: 10 } }, grid: { color: 'rgba(212,175,55,0.05)' } },
          y: {
            ticks: {
              color: '#6b6040', font: { size: 10 },
              callback: (v) => v >= 1000000 ? `${(v / 1000000).toFixed(0)}jt` : v,
            },
            grid: { color: 'rgba(212,175,55,0.05)' },
          },
        } : undefined,
        ...options,
      },
    });
    return () => { if (inst.current) inst.current.destroy(); };
  }, [data, type]);

  return (
    <div className="card" style={{ padding: 20 }}>
      {title && <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>{title}</h3>}
      <div style={{ height, position: 'relative' }}>
        {data
          ? <canvas ref={ref} />
          : <div className="empty-state" style={{ minHeight: height }}><div className="icon">📊</div><p>Belum ada data</p></div>}
      </div>
    </div>
  );
}

// ── KPI Card ──
function KPI({ icon, value, label, color, sub }) {
  const isLong = typeof value === 'string' && value.length > 12;
  return (
    <div className="card stat-card" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="stat-icon" style={{ background: `${color}22`, color }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: isLong ? 14 : 22, fontWeight: 800, color, lineHeight: 1.2, wordBreak: 'break-word' }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// LAPORAN KEUANGAN — full dashboard
// ══════════════════════════════════════
export function LaporanKeuanganPanel({ showToast }) {
  const [lap, setLap] = useState(null);
  const [pem, setPem] = useState([]);
  const [peng, setPeng] = useState([]);
  const [pemas, setPemas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getLaporanKeuangan().catch(() => ({ data: null })),
      api.getPembayaranList().catch(() => ({ data: [] })),
      api.pengeluaran.list().catch(() => ({ data: [] })),
      api.pemasukan.list().catch(() => ({ data: [] })),
    ]).then(([l, p, g, m]) => {
      setLap(l.data || null);
      setPem(Array.isArray(p.data) ? p.data : p.data?.data || []);
      setPeng(Array.isArray(g.data) ? g.data : []);
      setPemas(Array.isArray(m.data) ? m.data : []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading-page" style={{ minHeight: '50vh' }}><div className="spinner" /><span>Memuat laporan keuangan...</span></div>;

  const totalIn   = Number(lap?.total_pemasukan || 0);
  const totalOut  = Number(lap?.total_pengeluaran || 0);
  const profit    = Number(lap?.profit || 0);
  const bonus     = Number(lap?.total_bonus_agent || 0);
  const pembJamaah = Number(lap?.total_pembayaran_jamaah || 0);
  const pemasukanLain = Number(lap?.total_pemasukan_lain || 0);
  const profitPct = totalIn > 0 ? Math.round((profit / totalIn) * 100) : 0;
  const pemVerified = pem.filter(x => x.status_pembayaran === 'verified').reduce((s, x) => s + Number(x.nominal || 0), 0);
  const pemPending  = pem.filter(x => x.status_pembayaran === 'pending').length;

  // Monthly bar chart
  const getMonth = d => d ? new Date(d).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }) : '?';
  const byMonthIn  = pemas.reduce((a, x) => { const k = getMonth(x.tanggal); a[k] = (a[k] || 0) + Number(x.nominal || 0); return a; }, {});
  const byMonthOut = peng.reduce((a, x)  => { const k = getMonth(x.tanggal); a[k] = (a[k] || 0) + Number(x.nominal || 0); return a; }, {});
  const months = [...new Set([...Object.keys(byMonthIn), ...Object.keys(byMonthOut)])].sort();
  const barData = months.length > 0 ? {
    labels: months,
    datasets: [
      { label: 'Pemasukan', data: months.map(m => byMonthIn[m] || 0), backgroundColor: 'rgba(52,211,153,0.75)', borderColor: '#34d399', borderRadius: 6, borderWidth: 2 },
      { label: 'Pengeluaran', data: months.map(m => byMonthOut[m] || 0), backgroundColor: 'rgba(248,113,113,0.75)', borderColor: '#f87171', borderRadius: 6, borderWidth: 2 },
    ],
  } : null;

  // Payment status donut
  const statusGroup = pem.reduce((a, x) => { a[x.status_pembayaran] = (a[x.status_pembayaran] || 0) + 1; return a; }, {});
  const statusColors = { verified: '#34d399', pending: '#60a5fa', rejected: '#f87171' };
  const donutStatus = Object.keys(statusGroup).length > 0 ? {
    labels: Object.keys(statusGroup).map(s => s.toUpperCase()),
    datasets: [{ data: Object.values(statusGroup), backgroundColor: Object.keys(statusGroup).map(s => statusColors[s] || '#888'), borderColor: '#0d0d0d', borderWidth: 3 }],
  } : null;

  // Pengeluaran kategori donut
  const byKat = peng.reduce((a, x) => { a[x.kategori || 'lainnya'] = (a[x.kategori || 'lainnya'] || 0) + Number(x.nominal || 0); return a; }, {});
  const lapKat = lap?.pengeluaran_per_kategori?.length > 0
    ? lap.pengeluaran_per_kategori.map(k => ({ k: k.kategori, v: Number(k.total) }))
    : Object.entries(byKat).map(([k, v]) => ({ k, v }));
  const donutKat = lapKat.length > 0 ? {
    labels: lapKat.map(x => x.k.toUpperCase()),
    datasets: [{ data: lapKat.map(x => x.v), backgroundColor: lapKat.map((_, i) => katColors[i % katColors.length]), borderColor: '#0d0d0d', borderWidth: 3 }],
  } : null;

  // Pemasukan sumber donut
  const bySrc = pemas.reduce((a, x) => { a[x.sumber || 'lainnya'] = (a[x.sumber || 'lainnya'] || 0) + Number(x.nominal || 0); return a; }, {});
  const srcColors = { pembayaran_jamaah: '#d4af37', sponsor: '#60a5fa', lainnya: '#a78bfa' };
  const donutSrc = Object.keys(bySrc).length > 0 ? {
    labels: Object.keys(bySrc).map(s => s.toUpperCase().replace(/_/g, ' ')),
    datasets: [{ data: Object.values(bySrc), backgroundColor: Object.keys(bySrc).map(s => srcColors[s] || '#888'), borderColor: '#0d0d0d', borderWidth: 3 }],
  } : null;

  const donutOpts = { plugins: { legend: { position: 'bottom', labels: { color: '#a89968', padding: 12, font: { size: 11 } } } }, cutout: '62%' };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1>📊 Dashboard Keuangan</h1>
        <p>Analisis & ringkasan keuangan Mandala 525 Tour & Travel</p>
      </div>

      {/* KPI Row 1 */}
      <div className="grid-4" style={{ marginBottom: 16 }}>
        <KPI icon="📈" value={formatRp(totalIn)}    label="Total Pemasukan"   color="#34d399" />
        <KPI icon="📉" value={formatRp(totalOut)}   label="Total Pengeluaran" color="#f87171" />
        <KPI icon="💰" value={formatRp(profit)}     label="Profit Bersih"     color={profit >= 0 ? '#34d399' : '#f87171'} sub={`Margin ${profitPct}%`} />
        <KPI icon="🎁" value={formatRp(bonus)}      label="Bonus Agent"       color="#a78bfa" />
      </div>

      {/* KPI Row 2 */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <KPI icon="💳" value={formatRp(pemVerified)}  label="Pembayaran Verified" color="#60a5fa" />
        <KPI icon="⏳" value={`${pemPending} Transaksi`} label="Menunggu Verifikasi" color="#fb923c" />
        <KPI icon="👥" value={formatRp(pembJamaah)}   label="Bayaran Jamaah"    color={GOLD} />
        <KPI icon="🏦" value={formatRp(pemasukanLain)} label="Pemasukan Lain"   color="#e8c84b" />
      </div>

      {/* Profit Progress */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>💰 Profit Margin</span>
          <span style={{ fontWeight: 800, color: profit >= 0 ? '#34d399' : '#f87171' }}>{profitPct}%</span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(Math.abs(profitPct), 100)}%`, background: profit >= 0 ? 'linear-gradient(90deg,#34d399,#10b981)' : 'linear-gradient(90deg,#f87171,#ef4444)', borderRadius: 99, transition: 'width 1.2s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
          <span>Pemasukan {formatRp(totalIn)}</span>
          <span>Pengeluaran {formatRp(totalOut)}</span>
        </div>
      </div>

      {/* Bar Chart + Payment Status */}
      <div className="grid-2-1" style={{ marginBottom: 20 }}>
        <ChartBox type="bar" data={barData} height={280} title="📊 Pemasukan vs Pengeluaran per Bulan" />
        <ChartBox type="doughnut" data={donutStatus} options={donutOpts} height={280} title="💳 Status Pembayaran" />
      </div>

      {/* Kategori Pengeluaran + Sumber Pemasukan */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <ChartBox type="doughnut" data={donutKat} options={donutOpts} height={260} title="📉 Pengeluaran per Kategori" />
        <ChartBox type="doughnut" data={donutSrc} options={donutOpts} height={260} title="📈 Sumber Pemasukan" />
      </div>

      {/* Kategori detail with bar */}
      {lapKat.length > 0 && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>📋 Rincian Pengeluaran per Kategori</h3>
          {lapKat.map((x, i) => {
            const maxV = Math.max(...lapKat.map(a => a.v));
            const pct = maxV > 0 ? Math.round((x.v / maxV) * 100) : 0;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-default)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: katColors[i % katColors.length], flexShrink: 0 }} />
                <span style={{ minWidth: 120, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{x.k.toUpperCase()}</span>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: katColors[i % katColors.length], borderRadius: 99, transition: 'width 0.8s ease' }} />
                </div>
                <strong style={{ color: '#f87171', minWidth: 130, textAlign: 'right', fontSize: 13 }}>{formatRp(x.v)}</strong>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Payments Table */}
      {pem.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>💳 Riwayat Pembayaran Terbaru</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pem.length} transaksi</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Booking</th><th>Jamaah</th><th>Jenis</th><th>Nominal</th><th>Status</th><th>Tanggal</th></tr>
              </thead>
              <tbody>
                {pem.slice(0, 10).map(p => (
                  <tr key={p.id}>
                    <td><strong style={{ color: 'var(--gold-400)' }}>{p.booking?.kode_booking || '-'}</strong></td>
                    <td>{p.booking?.user?.nama || '-'}</td>
                    <td><span className="badge badge-waiting">{p.jenis_pembayaran?.toUpperCase()}</span></td>
                    <td><strong>{formatRp(p.nominal)}</strong></td>
                    <td>
                      <span className={`badge badge-${p.status_pembayaran === 'verified' ? 'confirmed' : p.status_pembayaran === 'rejected' ? 'rejected' : 'pending'}`}>
                        {p.status_pembayaran}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// PENGELUARAN PANEL
// ══════════════════════════════════════
export function PengeluaranPanel({ showToast }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterKat, setFilterKat] = useState('');

  const load = async () => {
    setLoading(true);
    try { const res = await api.pengeluaran.list(); setData(res.data || []); }
    catch { showToast('Gagal memuat', 'error'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = filterKat ? data.filter(d => d.kategori === filterKat) : data;
  const total = filtered.reduce((s, d) => s + Number(d.nominal || 0), 0);

  const exportCSV = () => {
    const rows = filtered.map(d => `${d.tanggal},${d.kategori},"${d.deskripsi}",${d.nominal}`).join('\n');
    const blob = new Blob(['Tanggal,Kategori,Deskripsi,Nominal\n' + rows], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pengeluaran.csv'; a.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select className="input-field" value={filterKat} onChange={e => setFilterKat(e.target.value)} style={{ width: 200 }}>
            <option value="">-- Semua Kategori --</option>
            {['operasional','akomodasi','transportasi','konsumsi','visa','handling','gaji','lainnya'].map(k => <option key={k} value={k}>{k.toUpperCase()}</option>)}
          </select>
          <button className="btn btn-outline" onClick={exportCSV}>📥 Export CSV</button>
        </div>
        {total > 0 && <div style={{ fontWeight: 700, color: '#f87171', fontSize: 14 }}>Total: {formatRp(total)}</div>}
      </div>
      <CrudPanel
        title="Pengeluaran" subtitle="Kelola catatan pengeluaran operasional" icon="📉"
        apiClient={api.pengeluaran} showToast={showToast}
        columns={[
          { key: 'tanggal', label: 'Tanggal', render: i => formatDate(i.tanggal) },
          { key: 'kategori', label: 'Kategori', render: i => <span className="badge badge-pending">{(i.kategori||'').toUpperCase()}</span> },
          { key: 'deskripsi', label: 'Deskripsi' },
          { key: 'nominal', label: 'Nominal', render: i => <strong style={{ color: '#f87171' }}>{formatRp(i.nominal)}</strong> },
          { key: 'jadwal', label: 'Jadwal', render: i => i.jadwal?.paket?.nama_paket || '-' },
        ]}
        formFields={[
          { name: 'kategori', label: 'Kategori', type: 'select', options: [
            {value:'operasional',label:'Operasional'},{value:'akomodasi',label:'Akomodasi'},
            {value:'transportasi',label:'Transportasi'},{value:'konsumsi',label:'Konsumsi'},
            {value:'visa',label:'Visa'},{value:'handling',label:'Handling'},
            {value:'gaji',label:'Gaji'},{value:'lainnya',label:'Lainnya'},
          ]},
          { name: 'deskripsi', label: 'Deskripsi', placeholder: 'Biaya hotel Makkah' },
          { name: 'nominal', label: 'Nominal (Rp)', type: 'number', placeholder: '5000000' },
          { name: 'tanggal', label: 'Tanggal', type: 'date' },
        ]}
        defaultForm={{ kategori: 'operasional', deskripsi: '', nominal: '', tanggal: '' }}
      />
    </div>
  );
}

// ══════════════════════════════════════
// PEMASUKAN PANEL
// ══════════════════════════════════════
export function PemasukanPanel({ showToast }) {
  return (
    <CrudPanel
      title="Pemasukan" subtitle="Kelola catatan pemasukan perusahaan" icon="📈"
      apiClient={api.pemasukan} showToast={showToast}
      columns={[
        { key: 'tanggal', label: 'Tanggal', render: i => formatDate(i.tanggal) },
        { key: 'sumber', label: 'Sumber', render: i => <span className="badge badge-confirmed">{(i.sumber||'').toUpperCase().replace(/_/g,' ')}</span> },
        { key: 'deskripsi', label: 'Deskripsi' },
        { key: 'nominal', label: 'Nominal', render: i => <strong style={{ color: '#34d399' }}>{formatRp(i.nominal)}</strong> },
        { key: 'jadwal', label: 'Jadwal', render: i => i.jadwal?.paket?.nama_paket || '-' },
      ]}
      formFields={[
        { name: 'sumber', label: 'Sumber', type: 'select', options: [
          {value:'pembayaran_jamaah',label:'Pembayaran Jamaah'},
          {value:'sponsor',label:'Sponsor'},{value:'lainnya',label:'Lainnya'},
        ]},
        { name: 'deskripsi', label: 'Deskripsi', placeholder: 'Penerimaan DP jamaah batch Juli' },
        { name: 'nominal', label: 'Nominal (Rp)', type: 'number', placeholder: '10000000' },
        { name: 'tanggal', label: 'Tanggal', type: 'date' },
      ]}
      defaultForm={{ sumber: 'pembayaran_jamaah', deskripsi: '', nominal: '', tanggal: '' }}
    />
  );
}

// ══════════════════════════════════════
// BONUS AGENT PANEL
// ══════════════════════════════════════
export function BonusAgentPanel({ showToast }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try { const res = await api.getBonusList(filter ? `status=${filter}` : ''); setData(res.data || []); }
    catch { showToast('Gagal memuat bonus', 'error'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [filter]);

  const handleBayar = async (id) => {
    if (!confirm('Bayar bonus ini?')) return;
    try { await api.bayarBonus(id); showToast('Bonus dibayarkan!'); load(); }
    catch (err) { showToast(err.message || 'Gagal', 'error'); }
  };

  const totalPending = data.filter(b => b.status === 'pending').reduce((s, b) => s + Number(b.nominal_bonus || 0), 0);
  const totalDibayar = data.filter(b => b.status === 'dibayar').reduce((s, b) => s + Number(b.nominal_bonus || 0), 0);

  if (loading) return <div className="loading-page" style={{ minHeight: '40vh' }}><div className="spinner" /><span>Memuat bonus...</span></div>;

  return (
    <div>
      <div className="page-header"><h1>🎁 Bonus Agent</h1><p>Kelola pembayaran bonus agent/reseller</p></div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { icon: '🎁', val: data.length, label: 'Total Bonus', color: GOLD },
          { icon: '⏳', val: data.filter(b => b.status === 'pending').length, label: 'Pending', color: '#60a5fa' },
          { icon: '💰', val: formatRp(totalPending), label: 'Total Pending', color: '#a78bfa' },
          { icon: '✅', val: formatRp(totalDibayar), label: 'Total Dibayar', color: '#34d399' },
        ].map((s, i) => <KPI key={i} icon={s.icon} value={s.val} label={s.label} color={s.color} />)}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['', 'pending', 'dibayar'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-gold' : 'btn-outline'}`} onClick={() => setFilter(f)}>{f || 'Semua'}</button>
        ))}
      </div>
      {data.length === 0 ? (
        <div className="empty-state"><div className="icon">🎁</div><h3>Belum ada bonus</h3></div>
      ) : (
        <div className="table-container card" style={{ padding: 0 }}>
          <table>
            <thead><tr><th>Agent</th><th>Booking</th><th>Jamaah</th><th>Nominal</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>{data.map(b => (
              <tr key={b.id}>
                <td><strong>{b.agent?.nama_agent || '-'}</strong></td>
                <td style={{ color: 'var(--gold-400)' }}>{b.booking?.kode_booking || '-'}</td>
                <td>{b.booking?.user?.nama || '-'}</td>
                <td><strong>{formatRp(b.nominal_bonus)}</strong></td>
                <td><span className={`badge ${b.status === 'dibayar' ? 'badge-confirmed' : 'badge-pending'}`}>{b.status}</span></td>
                <td>{b.status === 'pending' && <button className="btn btn-sm btn-success" onClick={() => handleBayar(b.id)}>💸 Bayar</button>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
