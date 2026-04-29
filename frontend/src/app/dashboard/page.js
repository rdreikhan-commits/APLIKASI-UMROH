'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';
import OverviewPanel from '@/components/panels/OverviewPanel';
import { MaskapaiPanel, HotelPanel, AgentPanel, KaryawanPanel, MitraPanel, LayananPanel } from '@/components/panels/MasterDataPanels';
import { PengeluaranPanel, PemasukanPanel, BonusAgentPanel, LaporanKeuanganPanel } from '@/components/panels/KeuanganPanels';
import api from '@/lib/api';

const formatRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
const badgeClass = (s) => `badge badge-${s?.replace('waiting_payment','waiting')}`;

// ══════════════════════════════════════
// JAMAAH DASHBOARD
// ══════════════════════════════════════
function JamaahDashboard({ user, showToast }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => { api.getMyBookings().then(r => { setBookings(r.data || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);
  if (loading) return <div className="loading-page"><div className="spinner"/><span>Memuat...</span></div>;
  return (
    <div>
      <div className="page-header"><h1>Dashboard Jamaah</h1><p>Selamat datang, {user.nama}</p></div>
      <div className="grid-4" style={{marginBottom:32}}>
        {[
          {icon:'📋',val:bookings.length,label:'Total Booking',color:'gold'},
          {icon:'✅',val:bookings.filter(b=>b.status==='confirmed').length,label:'Confirmed',color:'emerald'},
          {icon:'⏳',val:bookings.filter(b=>['pending','waiting_payment'].includes(b.status)).length,label:'Menunggu',color:'blue'},
          {icon:'💰',val:formatRp(bookings.reduce((s,b)=>s+Number(b.total_dibayar||0),0)),label:'Total Dibayar',color:'purple'},
        ].map((s,i)=>(
          <div key={i} className="card stat-card"><div className={`stat-icon ${s.color}`}>{s.icon}</div>
          <div><div className="stat-value" style={{fontSize:s.color==='purple'?18:28}}>{s.val}</div><div className="stat-label">{s.label}</div></div></div>
        ))}
      </div>
      {bookings.length === 0 ? (
        <div className="empty-state"><div className="icon">📋</div><h3>Belum ada booking</h3><p>Kunjungi katalog untuk booking</p>
          <a href="/katalog" className="btn btn-gold" style={{marginTop:16}}>Lihat Katalog →</a></div>
      ) : (
        <div className="table-container card" style={{padding:0}}>
          <table><thead><tr><th>Kode</th><th>Paket</th><th>Berangkat</th><th>Status</th><th>Dokumen</th><th>Pembayaran</th><th>Perlengkapan</th></tr></thead>
          <tbody>{bookings.map(b=>(
            <tr key={b.id}>
              <td><strong style={{color:'var(--gold-400)'}}>{b.kode_booking}</strong></td>
              <td>{b.jadwal?.paket?.nama_paket || '-'}</td><td>{formatDate(b.jadwal?.tanggal_berangkat)}</td>
              <td><span className={badgeClass(b.status)}>{b.status}</span></td>
              <td><span className={badgeClass(b.status_dokumen)}>{b.status_dokumen}</span></td>
              <td>{formatRp(b.total_dibayar)} / {formatRp(b.total_harga)}</td>
              <td>{b.distribusi_perlengkapan?.filter(d=>d.status_penyerahan==='diserahkan').length || 0}/{b.distribusi_perlengkapan?.length || 0}</td>
            </tr>
          ))}</tbody></table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// ADMIN TRAVEL — Paket/Jadwal/Dokumen
// ══════════════════════════════════════
function PaketPanel({ showToast }) {
  const [paket, setPaket] = useState([]); const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const emptyForm = {nama_paket:'',kode_paket:'',tipe:'reguler',harga:'',dp_minimum:'',durasi_hari:9,maskapai:'',hotel_makkah:'',hotel_madinah:'',fasilitas:''};

  const load = async () => { setLoading(true); try { const p = await api.getAdminPaket(); setPaket(p.data||[]); } catch(e) { showToast('Gagal memuat paket','error'); } setLoading(false); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditId(null); setForm({...emptyForm}); setShowForm(true); };
  const openEdit = (p) => {
    setEditId(p.id);
    setForm({
      kode_paket: p.kode_paket||'', nama_paket: p.nama_paket||'', tipe: p.tipe||'reguler',
      harga: p.harga||'', dp_minimum: p.dp_minimum||'', durasi_hari: p.durasi_hari||9,
      maskapai: p.maskapai||'', hotel_makkah: p.hotel_makkah||'', hotel_madinah: p.hotel_madinah||'',
      fasilitas: Array.isArray(p.fasilitas) ? p.fasilitas.join(', ') : (p.fasilitas||''),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {...form, fasilitas: form.fasilitas?.split(',').map(f=>f.trim()) || []};
    try {
      if (editId) {
        await api.updatePaket(editId, payload);
        showToast('Paket berhasil diupdate!');
      } else {
        await api.createPaket(payload);
        showToast('Paket berhasil ditambahkan!');
      }
      setShowForm(false); load();
    } catch(err) {
      const msg = err.errors ? Object.values(err.errors).flat().join(', ') : (err.message || 'Gagal menyimpan');
      showToast(msg, 'error');
    }
  };

  const handleDelete = async (id, nama) => {
    if (!confirm(`Hapus paket "${nama}"? Data ini tidak bisa dikembalikan.`)) return;
    try { await api.deletePaket(id); showToast('Paket dihapus!'); load(); }
    catch(err) { showToast(err.message || 'Gagal menghapus', 'error'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner"/></div>;

  return (<div>
    <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div><h1>📦 Paket Umroh</h1><p>Kelola paket umroh</p></div>
      <button className="btn btn-gold" onClick={openAdd}>+ Tambah Paket</button>
    </div>

    <div className="table-container card" style={{padding:0}}>
      <table><thead><tr><th>Kode</th><th>Nama</th><th>Tipe</th><th>Harga</th><th>DP Min</th><th>Durasi</th><th>Jadwal</th><th>Aksi</th></tr></thead>
      <tbody>{paket.map(p=>(
        <tr key={p.id}>
          <td style={{color:'var(--gold-400)',fontWeight:600}}>{p.kode_paket}</td>
          <td>{p.nama_paket}</td>
          <td><span className="badge badge-pending">{p.tipe?.toUpperCase()}</span></td>
          <td>{formatRp(p.harga)}</td><td>{formatRp(p.dp_minimum)}</td>
          <td>{p.durasi_hari} hari</td><td>{p.jadwal_count||0}</td>
          <td style={{display:'flex',gap:6}}>
            <button className="btn btn-sm btn-outline" onClick={()=>openEdit(p)} title="Edit">✏️</button>
            <button className="btn btn-sm btn-danger" onClick={()=>handleDelete(p.id, p.nama_paket)} title="Hapus">🗑️</button>
          </td>
        </tr>
      ))}</tbody></table>
    </div>

    {showForm && (<div className="modal-overlay" onClick={()=>setShowForm(false)}><div className="modal-content" onClick={e=>e.stopPropagation()}>
      <h2 className="modal-title">{editId ? '✏️ Edit Paket Umroh' : '+ Tambah Paket Umroh'}</h2>
      <form onSubmit={handleSubmit}>
        {[{n:'kode_paket',l:'Kode Paket',p:'PKT-GOLD-2026'},{n:'nama_paket',l:'Nama Paket',p:'Paket Gold 2026'},{n:'harga',l:'Harga (Rp)',p:'35000000',t:'number'},{n:'dp_minimum',l:'DP Minimum',p:'10000000',t:'number'},{n:'durasi_hari',l:'Durasi (Hari)',p:'9',t:'number'},{n:'maskapai',l:'Maskapai',p:'Garuda Indonesia'},{n:'hotel_makkah',l:'Hotel Makkah'},{n:'hotel_madinah',l:'Hotel Madinah'},{n:'fasilitas',l:'Fasilitas (koma)',p:'Tiket PP, Hotel, Makan 3x'}].map(f=>(
          <div className="input-group" key={f.n}><label>{f.l}</label><input className="input-field" type={f.t||'text'} placeholder={f.p||''} value={form[f.n]||''} onChange={e=>setForm({...form,[f.n]:e.target.value})} required={!['fasilitas','maskapai','hotel_makkah','hotel_madinah'].includes(f.n)} /></div>))}
        <div className="input-group"><label>Tipe</label><select className="input-field" value={form.tipe} onChange={e=>setForm({...form,tipe:e.target.value})}><option value="reguler">Reguler</option><option value="vip">VIP</option><option value="vvip">VVIP</option></select></div>
        <div style={{display:'flex',gap:8,marginTop:16}}>
          <button type="submit" className="btn btn-gold">{editId ? 'Update' : 'Simpan'}</button>
          <button type="button" className="btn btn-outline" onClick={()=>setShowForm(false)}>Batal</button>
        </div>
      </form>
    </div></div>)}
  </div>);
}

function JadwalPanel({ showToast }) {
  const [jadwal, setJadwal] = useState([]); const [paket, setPaket] = useState([]);
  const [loading, setLoading] = useState(true); const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null); const [form, setForm] = useState({});
  const emptyForm = {paket_id:'',kode_jadwal:'',tanggal_berangkat:'',tanggal_pulang:'',kota_keberangkatan:'Jakarta',kuota_total:'',status:'open'};

  const load = async () => { setLoading(true); try { const [j,p] = await Promise.all([api.getAdminJadwal(), api.getAdminPaket()]); setJadwal(j.data||[]); setPaket(p.data||[]); } catch(e) { showToast('Gagal','error'); } setLoading(false); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditId(null); setForm({...emptyForm}); setShowForm(true); };
  const openEdit = (j) => {
    setEditId(j.id);
    setForm({
      paket_id: j.paket_id||'', kode_jadwal: j.kode_jadwal||'',
      tanggal_berangkat: j.tanggal_berangkat?.slice(0,10)||'',
      tanggal_pulang: j.tanggal_pulang?.slice(0,10)||'',
      kota_keberangkatan: j.kota_keberangkatan||'Jakarta',
      kuota_total: j.kuota_total||'', status: j.status||'open',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.updateJadwal(editId, form);
        showToast('Jadwal berhasil diupdate!');
      } else {
        await api.createJadwal(form);
        showToast('Jadwal berhasil ditambahkan!');
      }
      setShowForm(false); load();
    } catch(err) {
      const msg = err.errors ? Object.values(err.errors).flat().join(', ') : (err.message || 'Gagal menyimpan');
      showToast(msg, 'error');
    }
  };

  const handleDelete = async (id, kode) => {
    if (!confirm(`Hapus jadwal "${kode}"? Data ini tidak bisa dikembalikan.`)) return;
    try { await api.deleteJadwal(id); showToast('Jadwal dihapus!'); load(); }
    catch(err) { showToast(err.message || 'Gagal menghapus', 'error'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner"/></div>;

  return (<div>
    <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div><h1>📅 Jadwal</h1><p>Kelola jadwal keberangkatan</p></div>
      <button className="btn btn-gold" onClick={openAdd}>+ Tambah Jadwal</button>
    </div>

    <div className="table-container card" style={{padding:0}}>
      <table><thead><tr><th>Kode</th><th>Paket</th><th>Berangkat</th><th>Pulang</th><th>Kuota</th><th>Status</th><th>Aksi</th></tr></thead>
      <tbody>{jadwal.map(j=>(
        <tr key={j.id}>
          <td style={{color:'var(--gold-400)',fontWeight:600}}>{j.kode_jadwal}</td>
          <td>{j.paket?.nama_paket}</td>
          <td>{formatDate(j.tanggal_berangkat)}</td>
          <td>{formatDate(j.tanggal_pulang)}</td>
          <td><strong>{j.sisa_kuota}</strong>/{j.kuota_total}</td>
          <td><span className={`badge badge-${j.status==='open'?'confirmed':'pending'}`}>{j.status}</span></td>
          <td style={{display:'flex',gap:6}}>
            <button className="btn btn-sm btn-outline" onClick={()=>openEdit(j)} title="Edit">✏️</button>
            <button className="btn btn-sm btn-danger" onClick={()=>handleDelete(j.id, j.kode_jadwal)} title="Hapus">🗑️</button>
          </td>
        </tr>
      ))}</tbody></table>
    </div>

    {showForm && (<div className="modal-overlay" onClick={()=>setShowForm(false)}><div className="modal-content" onClick={e=>e.stopPropagation()}>
      <h2 className="modal-title">{editId ? '✏️ Edit Jadwal' : '+ Tambah Jadwal'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group"><label>Paket</label><select className="input-field" value={form.paket_id} onChange={e=>setForm({...form,paket_id:e.target.value})} required><option value="">-- Pilih Paket --</option>{paket.map(p=><option key={p.id} value={p.id}>{p.nama_paket}</option>)}</select></div>
        {[{n:'kode_jadwal',l:'Kode Jadwal',p:'JDW-2026-07-A'},{n:'tanggal_berangkat',l:'Tgl Berangkat',t:'date'},{n:'tanggal_pulang',l:'Tgl Pulang',t:'date'},{n:'kota_keberangkatan',l:'Kota Berangkat',p:'Jakarta'},{n:'kuota_total',l:'Kuota Total',p:'45',t:'number'}].map(f=>(
          <div className="input-group" key={f.n}><label>{f.l}</label><input className="input-field" type={f.t||'text'} placeholder={f.p||''} value={form[f.n]||''} onChange={e=>setForm({...form,[f.n]:e.target.value})} required /></div>))}
        {editId && (
          <div className="input-group"><label>Status</label><select className="input-field" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
            <option value="open">Open</option><option value="closed">Closed</option><option value="departed">Departed</option>
          </select></div>
        )}
        <div style={{display:'flex',gap:8,marginTop:16}}>
          <button type="submit" className="btn btn-gold">{editId ? 'Update' : 'Simpan'}</button>
          <button type="button" className="btn btn-outline" onClick={()=>setShowForm(false)}>Batal</button>
        </div>
      </form>
    </div></div>)}
  </div>);
}

function DokumenPanel({ showToast }) {
  const [dokumen, setDokumen] = useState([]); const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { const d = await api.getDokumenList(); setDokumen(d.data?.data||d.data||[]); } catch(e) { showToast('Gagal','error'); } setLoading(false); };
  useEffect(() => { load(); }, []);
  const handleVerify = async (bookingId, status) => { try { await api.verifyDokumen(bookingId, { status_dokumen: status }); showToast(status==='valid'?'Dokumen disetujui!':'Dokumen ditolak.'); load(); } catch(err) { showToast(err.message||'Gagal','error'); } };
  if (loading) return <div className="loading-page"><div className="spinner"/></div>;
  return (<div>
    <div className="page-header"><h1>📄 Verifikasi Dokumen</h1><p>Verifikasi dokumen jamaah</p></div>
    <div className="table-container card" style={{padding:0}}>
      <table><thead><tr><th>Jamaah</th><th>Status</th><th>KTP</th><th>Paspor</th><th>Aksi</th></tr></thead>
      <tbody>{dokumen.map(d=>(<tr key={d.id}><td>{d.user?.nama}</td>
        <td><span className={badgeClass(d.status_dokumen)}>{d.status_dokumen}</span></td>
        <td>{d.user?.foto_ktp_path?'✅':'❌'}</td><td>{d.user?.foto_paspor_path?'✅':'❌'}</td>
        <td style={{display:'flex',gap:8}}>{d.status_dokumen==='review' && <>
          <button className="btn btn-sm btn-success" onClick={()=>handleVerify(d.id,'valid')}>✓ Approve</button>
          <button className="btn btn-sm btn-danger" onClick={()=>handleVerify(d.id,'rejected')}>✗ Reject</button></>}
        </td></tr>))}</tbody></table>
    </div>
  </div>);
}

// ══════════════════════════════════════
// ADMIN KEUANGAN — Pembayaran
// ══════════════════════════════════════
function PembayaranPanel({ showToast }) {
  const [pembayaran, setPembayaran] = useState([]); const [loading, setLoading] = useState(true); const [filter, setFilter] = useState('');
  const load = () => { api.getPembayaranList(filter).then(r => { setPembayaran(r.data?.data||r.data||[]); setLoading(false); }).catch(()=>setLoading(false)); };
  useEffect(load, [filter]);
  const handleVerify = async (id) => { if (!confirm('Verifikasi pembayaran ini?')) return; try { const res = await api.verifyPayment(id); showToast(res.message || 'Diverifikasi!'); load(); } catch(err) { showToast(err.message||'Gagal','error'); } };
  const handleReject = async (id) => { const alasan = prompt('Alasan penolakan:'); if (!alasan) return; try { await api.rejectPayment(id, alasan); showToast('Ditolak.'); load(); } catch(err) { showToast(err.message||'Gagal','error'); } };
  if (loading) return <div className="loading-page"><div className="spinner"/></div>;
  return (<div>
    <div className="page-header"><h1>💳 Pembayaran</h1><p>Verifikasi pembayaran jamaah</p></div>
    <div style={{display:'flex',gap:8,marginBottom:24}}>
      {['','pending','verified','rejected'].map(f=>(<button key={f} className={`btn btn-sm ${filter===f?'btn-gold':'btn-outline'}`} onClick={()=>{setFilter(f);setLoading(true)}}>{f||'Semua'}</button>))}
    </div>
    {pembayaran.length===0 ? (<div className="empty-state"><div className="icon">💰</div><h3>Tidak ada pembayaran</h3></div>) : (
      <div className="table-container card" style={{padding:0}}>
        <table><thead><tr><th>Booking</th><th>Jamaah</th><th>Jenis</th><th>Nominal</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody>{pembayaran.map(p=>(<tr key={p.id}>
          <td style={{color:'var(--gold-400)',fontWeight:600}}>{p.booking?.kode_booking||'-'}</td><td>{p.booking?.user?.nama||'-'}</td>
          <td><span className="badge badge-waiting">{p.jenis_pembayaran?.toUpperCase()}</span></td>
          <td style={{fontWeight:700}}>{formatRp(p.nominal)}</td>
          <td><span className={badgeClass(p.status_pembayaran)}>{p.status_pembayaran}</span></td>
          <td style={{display:'flex',gap:8}}>{p.status_pembayaran==='pending' && <>
            <button className="btn btn-sm btn-success" onClick={()=>handleVerify(p.id)}>✓ Verify</button>
            <button className="btn btn-sm btn-danger" onClick={()=>handleReject(p.id)}>✗ Reject</button></>}
          </td></tr>))}</tbody></table>
      </div>
    )}
  </div>);
}

// ══════════════════════════════════════
// ADMIN PERLENGKAPAN — Inventory
// ══════════════════════════════════════
function InventoryPanel({ showToast }) {
  const [inventory, setInventory] = useState([]); const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { const inv = await api.getMasterPerlengkapan(); setInventory(inv.data||[]); } catch(e) { showToast('Gagal','error'); } setLoading(false); };
  useEffect(() => { load(); }, []);
  if (loading) return <div className="loading-page"><div className="spinner"/></div>;
  return (<div>
    <div className="page-header"><h1>📦 Inventory</h1><p>Stok perlengkapan jamaah</p></div>
    <div className="grid-3">{inventory.map(item=>(
      <div key={item.id} className="card card-gold">
        <div style={{fontSize:12,color:'var(--gold-400)',fontWeight:600,marginBottom:4}}>{item.kode_barang}</div>
        <div style={{fontSize:16,fontWeight:700,marginBottom:12}}>{item.nama_barang}</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><div style={{fontSize:12,color:'var(--text-muted)'}}>Stok</div><div style={{fontSize:28,fontWeight:800,color:item.stok_gudang<=item.stok_minimum?'var(--red-400)':'var(--emerald-400)'}}>{item.stok_gudang}</div></div>
          <div style={{textAlign:'right'}}><div style={{fontSize:12,color:'var(--text-muted)'}}>Min</div><div style={{fontSize:16,fontWeight:600,color:'var(--text-secondary)'}}>{item.stok_minimum}</div></div>
        </div>
        {item.stok_gudang <= item.stok_minimum && <div style={{marginTop:8,padding:'6px 10px',background:'rgba(239,68,68,0.1)',borderRadius:8,fontSize:12,color:'var(--red-400)',fontWeight:600}}>⚠️ Stok Rendah!</div>}
      </div>))}</div>
  </div>);
}

function DistribusiPanel({ showToast }) {
  const [distribusi, setDistribusi] = useState([]); const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { const dist = await api.getDistribusiList(); setDistribusi(dist.data?.data||dist.data||[]); } catch(e) { showToast('Gagal','error'); } setLoading(false); };
  useEffect(() => { load(); }, []);
  const handleHandover = async (id) => { if (!confirm('Serahkan barang ini?')) return; try { const res = await api.handoverEquipment(id, { status_penyerahan: 'diserahkan' }); showToast(res.message || 'Diserahkan!'); if (res.low_stock_warning) showToast(res.low_stock_warning, 'error'); load(); } catch(err) { showToast(err.message||'Gagal','error'); } };
  const handleBatch = async (bookingId) => { if (!confirm('Serahkan SEMUA?')) return; try { const res = await api.batchHandover({ booking_id: bookingId, status_penyerahan: 'diserahkan' }); showToast(res.message || 'Berhasil!'); load(); } catch(err) { showToast(err.message||'Gagal','error'); } };
  if (loading) return <div className="loading-page"><div className="spinner"/></div>;
  return (<div>
    <div className="page-header"><h1>🎒 Distribusi</h1><p>Distribusi perlengkapan jamaah</p></div>
    {distribusi.length===0 ? (<div className="empty-state"><div className="icon">🎒</div><h3>Belum ada distribusi</h3><p>Distribusi muncul setelah booking dikonfirmasi</p></div>) :
      distribusi.map(booking=>(<div key={booking.id} className="card" style={{marginBottom:16}}>
        <div className="flex-between" style={{marginBottom:16}}>
          <div><div style={{fontSize:14,color:'var(--gold-400)',fontWeight:700}}>{booking.kode_booking}</div><div style={{fontSize:16,fontWeight:600}}>{booking.user?.nama}</div>
            <div style={{fontSize:13,color:'var(--text-muted)'}}>{booking.jadwal?.kode_jadwal} • {formatDate(booking.jadwal?.tanggal_berangkat)}</div></div>
          <button className="btn btn-sm btn-gold" onClick={()=>handleBatch(booking.id)}>Serahkan Semua</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:8}}>
          {booking.distribusi_perlengkapan?.map(d=>(<div key={d.id} style={{padding:'10px 14px',background:'var(--bg-glass)',borderRadius:8,border:'1px solid var(--border-default)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><div style={{fontSize:13,fontWeight:600}}>{d.perlengkapan?.nama_barang}</div><span className={badgeClass(d.status_penyerahan)} style={{marginTop:4}}>{d.status_penyerahan}</span></div>
            {d.status_penyerahan==='pending' && <button className="btn btn-sm btn-success" onClick={()=>handleHandover(d.id)}>✓</button>}
          </div>))}
        </div>
      </div>))}
  </div>);
}

// ══════════════════════════════════════
// MAIN DASHBOARD PAGE
// ══════════════════════════════════════
export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeMenu, setActiveMenu] = useState('');
  const router = useRouter();

  useEffect(() => {
    const u = api.getUser();
    if (!u) { router.push('/login'); return; }
    setUser(u);
    // Set default menu
    const defaults = { admin_travel: 'overview', admin_keuangan: 'overview', admin_perlengkapan: 'inventory' };
    setActiveMenu(defaults[u.role] || '');
    setLoading(false);
  }, []);

  const showToast = (message, type = 'success') => setToast({ message, type, key: Date.now() });

  if (loading) return <><Navbar /><div className="loading-page"><div className="spinner"/><span>Memuat dashboard...</span></div></>;

  // Jamaah: no sidebar
  if (user?.role === 'jamaah') {
    return (<>
      <Navbar />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="page-container"><JamaahDashboard user={user} showToast={showToast} /></div>
    </>);
  }

  // Admin panel routing
  const adminPanels = {
    // Dashboard Overview
    overview: <OverviewPanel showToast={showToast} />,
    // Admin Travel
    paket: <PaketPanel showToast={showToast} />,
    jadwal: <JadwalPanel showToast={showToast} />,
    dokumen: <DokumenPanel showToast={showToast} />,
    maskapai: <MaskapaiPanel showToast={showToast} />,
    hotel: <HotelPanel showToast={showToast} />,
    agent: <AgentPanel showToast={showToast} />,
    karyawan: <KaryawanPanel showToast={showToast} />,
    mitra: <MitraPanel showToast={showToast} />,
    layanan: <LayananPanel showToast={showToast} />,
    // Admin Keuangan
    pembayaran: <PembayaranPanel showToast={showToast} />,
    pemasukan: <PemasukanPanel showToast={showToast} />,
    pengeluaran: <PengeluaranPanel showToast={showToast} />,
    bonus: <BonusAgentPanel showToast={showToast} />,
    laporan: <LaporanKeuanganPanel showToast={showToast} />,
    // Admin Perlengkapan
    inventory: <InventoryPanel showToast={showToast} />,
    distribusi: <DistribusiPanel showToast={showToast} />,
  };

  return (
    <>
      <Navbar />
      {toast && <Toast key={toast.key} {...toast} onClose={() => setToast(null)} />}
      <div className="dashboard-layout">
        <Sidebar role={user?.role} activeMenu={activeMenu} onMenuChange={setActiveMenu} />
        <div className="main-content">
          {adminPanels[activeMenu] || <div className="empty-state"><h3>Pilih menu di sidebar</h3></div>}
        </div>
      </div>
    </>
  );
}
