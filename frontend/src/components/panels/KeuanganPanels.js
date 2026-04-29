'use client';
import { useState, useEffect } from 'react';
import CrudPanel from '@/components/CrudPanel';
import api from '@/lib/api';

const formatRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) : '-';

// ══════════════════════════════════════
// PENGELUARAN PANEL
// ══════════════════════════════════════
export function PengeluaranPanel({ showToast }) {
  return (
    <CrudPanel
      title="Pengeluaran"
      subtitle="Kelola catatan pengeluaran operasional"
      icon="📉"
      apiClient={api.pengeluaran}
      showToast={showToast}
      columns={[
        { key: 'tanggal', label: 'Tanggal', render: i => formatDate(i.tanggal) },
        { key: 'kategori', label: 'Kategori', render: i => <span className="badge badge-pending">{(i.kategori||'').toUpperCase()}</span> },
        { key: 'deskripsi', label: 'Deskripsi' },
        { key: 'nominal', label: 'Nominal', render: i => <strong style={{color:'var(--red-400)'}}>{formatRp(i.nominal)}</strong> },
        { key: 'jadwal', label: 'Jadwal', render: i => i.jadwal?.paket?.nama_paket || '-' },
      ]}
      formFields={[
        { name: 'kategori', label: 'Kategori', type: 'select', options: [
          {value:'operasional',label:'Operasional'},{value:'akomodasi',label:'Akomodasi'},
          {value:'transportasi',label:'Transportasi'},{value:'konsumsi',label:'Konsumsi'},
          {value:'visa',label:'Visa'},{value:'handling',label:'Handling'},
          {value:'gaji',label:'Gaji'},{value:'lainnya',label:'Lainnya'},
        ]},
        { name: 'deskripsi', label: 'Deskripsi', placeholder: 'Biaya hotel Makkah 5 malam' },
        { name: 'nominal', label: 'Nominal (Rp)', type: 'number', placeholder: '5000000' },
        { name: 'tanggal', label: 'Tanggal', type: 'date' },
      ]}
      defaultForm={{ kategori: 'operasional', deskripsi: '', nominal: '', tanggal: '' }}
    />
  );
}

// ══════════════════════════════════════
// PEMASUKAN PANEL
// ══════════════════════════════════════
export function PemasukanPanel({ showToast }) {
  return (
    <CrudPanel
      title="Pemasukan"
      subtitle="Kelola catatan pemasukan perusahaan"
      icon="📈"
      apiClient={api.pemasukan}
      showToast={showToast}
      columns={[
        { key: 'tanggal', label: 'Tanggal', render: i => formatDate(i.tanggal) },
        { key: 'sumber', label: 'Sumber', render: i => <span className="badge badge-confirmed">{(i.sumber||'').toUpperCase().replace(/_/g,' ')}</span> },
        { key: 'deskripsi', label: 'Deskripsi' },
        { key: 'nominal', label: 'Nominal', render: i => <strong style={{color:'var(--emerald-400)'}}>{formatRp(i.nominal)}</strong> },
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
    try {
      const res = await api.getBonusList(filter ? `status=${filter}` : '');
      setData(res.data || []);
    } catch { showToast('Gagal memuat bonus', 'error'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [filter]);

  const handleBayar = async (id) => {
    if (!confirm('Bayar bonus ini?')) return;
    try {
      await api.bayarBonus(id);
      showToast('Bonus dibayarkan!'); load();
    } catch (err) { showToast(err.message || 'Gagal', 'error'); }
  };

  const totalPending = data.filter(b => b.status === 'pending').reduce((s, b) => s + Number(b.nominal_bonus || 0), 0);
  const totalDibayar = data.filter(b => b.status === 'dibayar').reduce((s, b) => s + Number(b.nominal_bonus || 0), 0);

  if (loading) return <div className="loading-page" style={{minHeight:'40vh'}}><div className="spinner"/><span>Memuat bonus...</span></div>;

  return (
    <div>
      <div className="page-header"><h1>🎁 Bonus Agent</h1><p>Kelola pembayaran bonus agent/reseller</p></div>

      <div className="grid-4" style={{marginBottom:24}}>
        {[
          {icon:'🎁',val:data.length,label:'Total Bonus',color:'gold'},
          {icon:'⏳',val:data.filter(b=>b.status==='pending').length,label:'Pending',color:'blue'},
          {icon:'💰',val:formatRp(totalPending),label:'Total Pending',color:'purple'},
          {icon:'✅',val:formatRp(totalDibayar),label:'Total Dibayar',color:'emerald'},
        ].map((s,i)=>(
          <div key={i} className="card stat-card"><div className={`stat-icon ${s.color}`}>{s.icon}</div>
          <div><div className="stat-value" style={{fontSize: typeof s.val==='string'?16:28}}>{s.val}</div><div className="stat-label">{s.label}</div></div></div>
        ))}
      </div>

      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {['','pending','dibayar'].map(f=>(
          <button key={f} className={`btn btn-sm ${filter===f?'btn-gold':'btn-outline'}`} onClick={()=>setFilter(f)}>{f||'Semua'}</button>
        ))}
      </div>

      {data.length === 0 ? (
        <div className="empty-state"><div className="icon">🎁</div><h3>Belum ada bonus</h3></div>
      ) : (
        <div className="table-container card" style={{padding:0}}>
          <table><thead><tr><th>Agent</th><th>Booking</th><th>Jamaah</th><th>Nominal</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>{data.map(b=>(
            <tr key={b.id}>
              <td><strong>{b.agent?.nama_agent||'-'}</strong></td>
              <td style={{color:'var(--gold-400)'}}>{b.booking?.kode_booking || '-'}</td>
              <td>{b.booking?.user?.nama||'-'}</td>
              <td><strong>{formatRp(b.nominal_bonus)}</strong></td>
              <td><span className={`badge ${b.status==='dibayar'?'badge-confirmed':'badge-pending'}`}>{b.status}</span></td>
              <td>{b.status==='pending' && <button className="btn btn-sm btn-success" onClick={()=>handleBayar(b.id)}>💸 Bayar</button>}</td>
            </tr>
          ))}</tbody></table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// LAPORAN KEUANGAN PANEL
// ══════════════════════════════════════
export function LaporanKeuanganPanel({ showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLaporanKeuangan().then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page" style={{minHeight:'40vh'}}><div className="spinner"/></div>;
  if (!data) return <div className="empty-state"><div className="icon">📊</div><h3>Data laporan kosong</h3></div>;

  const items = [
    { label:'Total Pemasukan', val: formatRp(data.total_pemasukan), color:'var(--emerald-400)', icon:'📈' },
    { label:'Pembayaran Jamaah', val: formatRp(data.total_pembayaran_jamaah), color:'var(--blue-400)', icon:'💳' },
    { label:'Pemasukan Lain', val: formatRp(data.total_pemasukan_lain), color:'var(--purple-400)', icon:'💰' },
    { label:'Total Pengeluaran', val: formatRp(data.total_pengeluaran), color:'var(--red-400)', icon:'📉' },
    { label:'Bonus Agent', val: formatRp(data.total_bonus_agent), color:'var(--orange-400)', icon:'🎁' },
    { label:'Profit', val: formatRp(data.profit), color: data.profit >= 0 ? 'var(--emerald-400)' : 'var(--red-400)', icon:'📊' },
  ];

  return (
    <div>
      <div className="page-header"><h1>📊 Laporan Keuangan</h1><p>Ringkasan keuangan perusahaan</p></div>
      <div className="grid-3">
        {items.map((item, i) => (
          <div key={i} className="card card-gold" style={{textAlign:'center',padding:28}}>
            <div style={{fontSize:32,marginBottom:8}}>{item.icon}</div>
            <div style={{fontSize:13,color:'var(--text-muted)',marginBottom:4}}>{item.label}</div>
            <div style={{fontSize:22,fontWeight:800,color:item.color}}>{item.val}</div>
          </div>
        ))}
      </div>

      {data.pengeluaran_per_kategori?.length > 0 && (
        <div className="card" style={{marginTop:24}}>
          <h3 style={{marginBottom:16,fontSize:16,fontWeight:700}}>Pengeluaran per Kategori</h3>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {data.pengeluaran_per_kategori.map((k,i) => (
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'10px 14px',background:'var(--bg-glass)',borderRadius:8,border:'1px solid var(--border-default)'}}>
                <span className="badge badge-pending">{k.kategori?.toUpperCase()}</span>
                <strong style={{color:'var(--red-400)'}}>{formatRp(k.total)}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
