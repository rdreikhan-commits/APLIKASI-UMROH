'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import DocumentTemplate, { fmtRp, fmtDate, InfoGrid, SectionTitle, DocTable } from '../DocumentTemplate';

const DOC_CATEGORIES = [
  { section: 'Pendaftaran', items: [
    { id: 'form_umroh', label: 'Formulir Pendaftaran Umroh' },
    { id: 'form_haji', label: 'Formulir Pendaftaran Haji' },
  ]},
  { section: 'Invoice & Pembayaran Umroh', items: [
    { id: 'inv_umroh', label: 'Invoice Pendaftaran Umroh' },
    { id: 'bukti_bayar_umroh', label: 'Bukti Pembayaran Umroh' },
    { id: 'riwayat_bayar_umroh', label: 'Riwayat Mutasi Pembayaran Umroh' },
  ]},
  { section: 'Invoice & Pembayaran Haji', items: [
    { id: 'inv_haji', label: 'Invoice Pendaftaran Haji' },
    { id: 'bukti_bayar_haji', label: 'Bukti Pembayaran Haji' },
    { id: 'riwayat_bayar_haji', label: 'Riwayat Mutasi Pembayaran Haji' },
  ]},
  { section: 'Tabungan Umroh', items: [
    { id: 'bukti_setor_umroh', label: 'Bukti Setoran Tabungan Umroh' },
    { id: 'riwayat_setor_umroh', label: 'Riwayat Setoran Tabungan Umroh' },
    { id: 'bukti_tarik_umroh', label: 'Bukti Penarikan Tabungan Umroh' },
    { id: 'riwayat_tarik_umroh', label: 'Riwayat Penarikan Tabungan Umroh' },
  ]},
  { section: 'Tabungan Haji', items: [
    { id: 'bukti_setor_haji', label: 'Bukti Setoran Tabungan Haji' },
    { id: 'riwayat_setor_haji', label: 'Riwayat Setoran Tabungan Haji' },
    { id: 'bukti_tarik_haji', label: 'Bukti Penarikan Tabungan Haji' },
    { id: 'riwayat_tarik_haji', label: 'Riwayat Penarikan Tabungan Haji' },
  ]},
  { section: 'Surat Resmi', items: [
    { id: 'surat_paspor', label: 'Surat Rekomendasi Paspor' },
    { id: 'surat_cuti', label: 'Surat Izin Cuti' },
  ]},
  { section: 'Layanan & Perlengkapan', items: [
    { id: 'bukti_beli_layanan', label: 'Bukti Pembelian Layanan' },
    { id: 'bukti_bayar_layanan', label: 'Bukti Pembayaran Pembelian Layanan' },
    { id: 'riwayat_bayar_layanan', label: 'Riwayat Pembayaran Pembelian Layanan' },
    { id: 'surat_perlengkapan', label: 'Surat Pengeluaran Produk Perlengkapan' },
  ]},
  { section: 'Bonus Agent', items: [
    { id: 'bukti_bonus_agent', label: 'Bukti Pembayaran Bonus Agen' },
    { id: 'riwayat_bonus_agent', label: 'Riwayat Pembayaran Bonus Agen' },
  ]},
];

function genDocNo(prefix) {
  return `${prefix}-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9999)).padStart(4,'0')}`;
}

// Build doc data from real booking
function buildData(booking) {
  const u = booking?.user || {};
  const j = booking?.jadwal || {};
  const p = j?.paket || {};
  return {
    nama: u.nama || '-', nik: u.nik || '-', noHp: u.no_hp || '-', email: u.email || '-',
    alamat: u.alamat || '-', noBooking: booking?.kode_booking || '-',
    paket: p.nama_paket || '-', harga: Number(booking?.total_harga || p.harga || 0),
    dp: Number(p.dp_minimum || 0), dibayar: Number(booking?.total_dibayar || 0),
    tglBooking: booking?.created_at, tglBerangkat: j.tanggal_berangkat,
    tglPulang: j.tanggal_pulang, maskapai: p.maskapai || '-',
    hotel: p.hotel_makkah || '-', durasi: p.durasi_hari || 9,
    pembayaran: booking?.pembayaran || [],
  };
}

// ── Document content renderer ──
function DocContent({ docId, data }) {
  const d = data;
  const sisa = d.harga - d.dibayar;
  switch(docId) {
    case 'form_umroh': return (<div>
      <SectionTitle>Data Jamaah</SectionTitle>
      <InfoGrid items={[['Nama Lengkap', d.nama],['NIK', d.nik],['No. HP', d.noHp],['Email', d.email],['Alamat', d.alamat],['Kode Booking', d.noBooking]]} />
      <SectionTitle>Detail Paket</SectionTitle>
      <InfoGrid items={[['Paket', d.paket],['Harga', fmtRp(d.harga)],['DP Minimum', fmtRp(d.dp)],['Maskapai', d.maskapai],['Hotel', d.hotel],['Durasi', `${d.durasi} hari`]]} />
      <SectionTitle>Jadwal</SectionTitle>
      <InfoGrid items={[['Tgl Berangkat', fmtDate(d.tglBerangkat)],['Tgl Pulang', fmtDate(d.tglPulang)]]} />
      <p style={{marginTop:20,fontSize:11,color:'#666'}}>Dengan menandatangani formulir ini, saya menyatakan bahwa data di atas adalah benar.</p>
    </div>);
    case 'form_haji': return (<div>
      <SectionTitle>Data Calon Jamaah Haji</SectionTitle>
      <InfoGrid items={[['Nama Lengkap', d.nama],['NIK', d.nik],['No. HP', d.noHp],['Email', d.email],['Alamat', d.alamat]]} />
      <SectionTitle>Detail Pendaftaran Haji</SectionTitle>
      <InfoGrid items={[['Jenis', 'Haji Reguler'],['Estimasi Keberangkatan', '2030'],['Biaya BPIH', fmtRp(45000000)]]} />
    </div>);
    case 'inv_umroh': return (<div>
      <SectionTitle>Tagihan Kepada</SectionTitle>
      <InfoGrid items={[['Nama', d.nama],['No. Booking', d.noBooking],['Email', d.email],['NIK', d.nik]]} />
      <SectionTitle>Rincian Biaya</SectionTitle>
      <DocTable headers={['No','Deskripsi','Jumlah']} rows={[
        ['1', `Paket ${d.paket}`, fmtRp(d.harga)],
      ]} showTotal totalLabel="TOTAL TAGIHAN" totalValue={fmtRp(d.harga)} />
      <InfoGrid items={[['Total Dibayar', fmtRp(d.dibayar)],['Sisa Pelunasan', fmtRp(sisa)],['Status', sisa <= 0 ? 'LUNAS ✅' : 'BELUM LUNAS']]} />
    </div>);
    case 'bukti_bayar_umroh': return (<div>
      <SectionTitle>Data Pembayaran</SectionTitle>
      <InfoGrid items={[['Nama Jamaah', d.nama],['NIK', d.nik],['No. Booking', d.noBooking]]} />
      {d.pembayaran?.filter(p=>p.status_pembayaran==='verified').length > 0 ? (
        <DocTable headers={['No','Tanggal','Keterangan','Nominal']} rows={
          d.pembayaran.filter(p=>p.status_pembayaran==='verified').map((p,i)=>[String(i+1), fmtDate(p.created_at), p.jenis_pembayaran?.toUpperCase()||'Pembayaran', fmtRp(p.nominal)])
        } showTotal totalLabel="TOTAL DIBAYAR" totalValue={fmtRp(d.dibayar)} />
      ) : (
        <DocTable headers={['Keterangan','Nominal']} rows={[['Total Terbayar', fmtRp(d.dibayar)]]} />
      )}
    </div>);
    case 'riwayat_bayar_umroh': return (<div>
      <SectionTitle>Data Jamaah</SectionTitle>
      <InfoGrid items={[['Nama', d.nama],['NIK', d.nik],['No. Booking', d.noBooking],['Paket', d.paket]]} />
      <SectionTitle>Riwayat Pembayaran</SectionTitle>
      {d.pembayaran?.length > 0 ? (
        <DocTable headers={['No','Tanggal','Keterangan','Status','Nominal']} rows={
          d.pembayaran.map((p,i)=>[String(i+1), fmtDate(p.created_at), p.jenis_pembayaran?.toUpperCase()||'-', p.status_pembayaran, fmtRp(p.nominal)])
        } showTotal totalLabel="TOTAL" totalValue={fmtRp(d.dibayar)} />
      ) : <p style={{fontSize:12,color:'#666'}}>Belum ada pembayaran tercatat.</p>}
    </div>);
    case 'inv_haji': return (<div>
      <SectionTitle>Tagihan Kepada</SectionTitle>
      <InfoGrid items={[['Nama', d.nama],['NIK', d.nik],['Email', d.email]]} />
      <SectionTitle>Rincian Biaya Haji</SectionTitle>
      <DocTable headers={['No','Deskripsi','Jumlah']} rows={[['1','Biaya BPIH Haji Reguler', fmtRp(45000000)],['2','Biaya Handling', fmtRp(3000000)]]} showTotal totalLabel="TOTAL" totalValue={fmtRp(48000000)} />
    </div>);
    case 'bukti_bayar_haji': return (<div>
      <SectionTitle>Bukti Pembayaran Haji</SectionTitle>
      <InfoGrid items={[['Nama', d.nama],['NIK', d.nik]]} />
      <DocTable headers={['Keterangan','Nominal']} rows={[['Setoran BPIH', fmtRp(d.dibayar)]]} showTotal totalLabel="TOTAL" totalValue={fmtRp(d.dibayar)} />
    </div>);
    case 'riwayat_bayar_haji': return (<div>
      <SectionTitle>Riwayat Pembayaran Haji — {d.nama}</SectionTitle>
      <InfoGrid items={[['NIK', d.nik]]} />
      <DocTable headers={['No','Tanggal','Keterangan','Nominal']} rows={
        d.pembayaran?.length > 0 ? d.pembayaran.map((p,i)=>[String(i+1), fmtDate(p.created_at), p.jenis_pembayaran||'-', fmtRp(p.nominal)]) : [['1','-','Belum ada pembayaran','-']]
      } />
    </div>);
    case 'bukti_setor_umroh': case 'bukti_setor_haji': return (<div>
      <SectionTitle>Bukti Setoran Tabungan {docId.includes('haji')?'Haji':'Umroh'}</SectionTitle>
      <InfoGrid items={[['Nama', d.nama],['NIK', d.nik],['No. Rek Tabungan','TAB-'+d.nik.slice(-6)],['Tanggal', fmtDate(new Date())]]} />
      <DocTable headers={['Keterangan','Nominal']} rows={[['Setoran Tabungan', fmtRp(d.dibayar)]]} />
    </div>);
    case 'riwayat_setor_umroh': case 'riwayat_setor_haji': return (<div>
      <SectionTitle>Riwayat Setoran Tabungan {docId.includes('haji')?'Haji':'Umroh'} — {d.nama}</SectionTitle>
      <InfoGrid items={[['NIK', d.nik],['No. Rek','TAB-'+d.nik.slice(-6)]]} />
      <DocTable headers={['No','Tanggal','Keterangan','Kredit','Saldo']} rows={
        d.pembayaran?.length > 0 ? d.pembayaran.filter(p=>p.status_pembayaran==='verified').map((p,i,a)=>[String(i+1), fmtDate(p.created_at), 'Setoran', fmtRp(p.nominal), fmtRp(a.slice(0,i+1).reduce((s,x)=>s+Number(x.nominal),0))]) : [['1','-','Belum ada setoran','-','-']]
      } />
    </div>);
    case 'bukti_tarik_umroh': case 'bukti_tarik_haji': return (<div>
      <SectionTitle>Bukti Penarikan Tabungan {docId.includes('haji')?'Haji':'Umroh'}</SectionTitle>
      <InfoGrid items={[['Nama', d.nama],['NIK', d.nik],['Tanggal', fmtDate(new Date())],['Alasan','Pelunasan Biaya '+(docId.includes('haji')?'Haji':'Umroh')]]} />
      <DocTable headers={['Keterangan','Nominal']} rows={[['Penarikan untuk pelunasan', fmtRp(d.dibayar)]]} />
    </div>);
    case 'riwayat_tarik_umroh': case 'riwayat_tarik_haji': return (<div>
      <SectionTitle>Riwayat Penarikan — {d.nama}</SectionTitle>
      <DocTable headers={['No','Tanggal','Keterangan','Nominal']} rows={[['1', fmtDate(new Date()), 'Penarikan - Pelunasan', fmtRp(d.dibayar)]]} />
    </div>);
    case 'surat_paspor': return (<div>
      <p style={{marginBottom:16,fontSize:12}}>Perihal: <strong>Surat Rekomendasi Pembuatan Paspor</strong></p>
      <p style={{fontSize:12,marginBottom:8}}>Kepada Yth.<br/>Kepala Kantor Imigrasi<br/>di Tempat</p>
      <p style={{fontSize:12,lineHeight:1.8,marginTop:16}}>Dengan hormat,<br/><br/>Yang bertanda tangan di bawah ini, Mandala 525 Tour & Travel, dengan ini memberikan rekomendasi bahwa:</p>
      <InfoGrid items={[['Nama Lengkap', d.nama],['NIK', d.nik],['Alamat', d.alamat],['No. HP', d.noHp]]} />
      <p style={{fontSize:12,lineHeight:1.8,marginTop:12}}>Adalah benar calon jamaah umroh yang terdaftar pada biro perjalanan kami dengan rencana keberangkatan pada tanggal <strong>{fmtDate(d.tglBerangkat)}</strong>.</p>
      <p style={{fontSize:12,lineHeight:1.8,marginTop:12}}>Demikian surat rekomendasi ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
    </div>);
    case 'surat_cuti': return (<div>
      <p style={{marginBottom:16,fontSize:12}}>Perihal: <strong>Surat Keterangan Izin Cuti untuk Ibadah Umroh</strong></p>
      <p style={{fontSize:12,marginBottom:8}}>Kepada Yth.<br/>HRD / Pimpinan Perusahaan<br/>di Tempat</p>
      <p style={{fontSize:12,lineHeight:1.8,marginTop:16}}>Dengan hormat,<br/><br/>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>
      <InfoGrid items={[['Nama Lengkap', d.nama],['NIK', d.nik],['Alamat', d.alamat]]} />
      <p style={{fontSize:12,lineHeight:1.8,marginTop:12}}>Akan melaksanakan ibadah umroh dengan jadwal:</p>
      <InfoGrid items={[['Tgl Berangkat', fmtDate(d.tglBerangkat)],['Tgl Kembali', fmtDate(d.tglPulang)],['Durasi', `${d.durasi} hari`],['Maskapai', d.maskapai]]} />
      <p style={{fontSize:12,lineHeight:1.8,marginTop:12}}>Demikian surat keterangan ini dibuat dengan sebenarnya.</p>
    </div>);
    case 'bukti_beli_layanan': return (<div>
      <SectionTitle>Bukti Pembelian Layanan — {d.nama}</SectionTitle>
      <InfoGrid items={[['No. Booking', d.noBooking],['NIK', d.nik]]} />
      <DocTable headers={['No','Layanan','Qty','Harga']} rows={[['1','Layanan Tambahan','1', fmtRp(d.dibayar)]]} showTotal totalLabel="TOTAL" totalValue={fmtRp(d.dibayar)} />
    </div>);
    case 'bukti_bayar_layanan': return (<div>
      <SectionTitle>Bukti Pembayaran Layanan — {d.nama}</SectionTitle>
      <InfoGrid items={[['NIK', d.nik],['No. Booking', d.noBooking]]} />
      <DocTable headers={['Keterangan','Nominal']} rows={[['Pembayaran layanan', fmtRp(d.dibayar)]]} />
    </div>);
    case 'riwayat_bayar_layanan': return (<div>
      <SectionTitle>Riwayat Pembayaran Layanan — {d.nama}</SectionTitle>
      <DocTable headers={['No','Tanggal','Nominal','Status']} rows={
        d.pembayaran?.length > 0 ? d.pembayaran.map((p,i)=>[String(i+1), fmtDate(p.created_at), fmtRp(p.nominal), p.status_pembayaran]) : [['1','-','-','Belum ada']]
      } />
    </div>);
    case 'surat_perlengkapan': return (<div>
      <p style={{fontSize:12,marginBottom:16}}>Perihal: <strong>Surat Pengeluaran Produk Perlengkapan Umroh</strong></p>
      <SectionTitle>Penerima</SectionTitle>
      <InfoGrid items={[['Nama', d.nama],['NIK', d.nik],['No. Booking', d.noBooking],['Paket', d.paket]]} />
      <SectionTitle>Daftar Perlengkapan</SectionTitle>
      <DocTable headers={['No','Item','Qty','Keterangan']} rows={[
        ['1','Koper Umroh 24"','1','Warna hitam'],['2','Kain Ihram/Mukena','1','Putih'],['3','Buku Doa & Manasik','1','-'],['4','ID Card & Lanyard','1','Mandala 525'],
      ]} />
    </div>);
    case 'bukti_bonus_agent': return (<div>
      <SectionTitle>Bukti Pembayaran Bonus Agent</SectionTitle>
      <InfoGrid items={[['Nama Agent', d.nama],['NIK', d.nik],['Periode', new Date().toLocaleDateString('id-ID',{month:'long',year:'numeric'})]]} />
      <DocTable headers={['No','Jamaah Referral','Komisi']} rows={[['1','(sesuai data referral)', fmtRp(d.dibayar)]]} showTotal totalLabel="TOTAL BONUS" totalValue={fmtRp(d.dibayar)} />
    </div>);
    case 'riwayat_bonus_agent': return (<div>
      <SectionTitle>Riwayat Bonus Agent — {d.nama}</SectionTitle>
      <DocTable headers={['No','Periode','Total Bonus','Status']} rows={[['1', new Date().toLocaleDateString('id-ID',{month:'long',year:'numeric'}), fmtRp(d.dibayar), 'Dibayar']]} />
    </div>);
    default: return <p>Template belum tersedia</p>;
  }
}

function getDocLabel(id) {
  for (const cat of DOC_CATEGORIES) for (const item of cat.items) if (item.id === id) return item.label;
  return id;
}

// ══════════════════════════════════════
// MAIN PANEL — now loads real jamaah/booking data
// ══════════════════════════════════════
export default function DokumenSuratPanel({ showToast }) {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [step, setStep] = useState('list'); // 'list' | 'pick_jamaah' | 'preview'

  // Load all bookings with user data
  useEffect(() => {
    (async () => {
      try {
        const res = await api.getDokumenList();
        setBookings(res.data?.data || res.data || []);
      } catch (e) { console.error(e); }
      setLoadingBookings(false);
    })();
  }, []);

  const handlePickDoc = (docId) => {
    setSelectedDoc(docId);
    setStep('pick_jamaah');
  };

  const handlePickJamaah = (booking) => {
    setSelectedBooking(booking);
    setStep('preview');
  };

  const handleClose = () => {
    setStep('list');
    setSelectedDoc(null);
    setSelectedBooking(null);
  };

  const allDocs = DOC_CATEGORIES.flatMap(c => c.items);
  const filtered = search ? allDocs.filter(d => d.label.toLowerCase().includes(search.toLowerCase())) : null;

  // Step 2: Pick jamaah
  if (step === 'pick_jamaah' && selectedDoc) {
    return (<div>
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div><h1>👤 Pilih Jamaah</h1><p>Untuk: <strong>{getDocLabel(selectedDoc)}</strong></p></div>
        <button className="btn btn-outline" onClick={handleClose}>← Kembali</button>
      </div>
      {loadingBookings ? <div className="loading-page"><div className="spinner"/></div> :
        bookings.length === 0 ? <div className="empty-state"><div className="icon">👤</div><h3>Belum ada jamaah terdaftar</h3></div> : (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {bookings.map(b => (
            <div key={b.id} className="card" style={{padding:16,cursor:'pointer',transition:'all 0.2s'}} onClick={()=>handlePickJamaah(b)}
              onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gold-400)'} onMouseLeave={e=>e.currentTarget.style.borderColor=''}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:'var(--text-primary)'}}>{b.user?.nama || '-'}</div>
                  <div style={{fontSize:12,color:'var(--text-secondary)'}}>NIK: {b.user?.nik || '-'} • {b.user?.email || '-'}</div>
                  <div style={{fontSize:12,color:'var(--gold-400)',marginTop:4}}>{b.kode_booking} — {b.jadwal?.paket?.nama_paket || '-'}</div>
                </div>
                <div style={{fontSize:24}}>→</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>);
  }

  // Step 3: Preview
  if (step === 'preview' && selectedDoc && selectedBooking) {
    const data = buildData(selectedBooking);
    return (
      <DocumentTemplate title={getDocLabel(selectedDoc)} docNo={genDocNo(selectedDoc.toUpperCase().slice(0,3))} date={new Date().toISOString()} onClose={handleClose}>
        <DocContent docId={selectedDoc} data={data} />
      </DocumentTemplate>
    );
  }

  // Step 1: Pick document
  return (<div>
    <div className="page-header"><h1>📄 Dokumen & Surat</h1><p>Pilih dokumen → Pilih jamaah → Preview & Cetak</p></div>
    <div className="card" style={{padding:16,marginBottom:20}}>
      <input className="input-field" placeholder="🔍 Cari dokumen..." value={search} onChange={e=>setSearch(e.target.value)} />
    </div>
    {filtered ? (
      <div className="card" style={{padding:20}}>
        <h3 style={{marginBottom:12,fontSize:14}}>Hasil Pencarian ({filtered.length})</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {filtered.map(d => (
            <button key={d.id} className="btn btn-outline" style={{justifyContent:'flex-start',textAlign:'left',padding:'10px 16px'}} onClick={()=>handlePickDoc(d.id)}>📄 {d.label}</button>
          ))}
        </div>
      </div>
    ) : (
      DOC_CATEGORIES.map((cat, ci) => (
        <div key={ci} className="card" style={{padding:20,marginBottom:16}}>
          <h3 style={{marginBottom:12,fontSize:14,color:'var(--gold-300)',borderBottom:'1px solid var(--border-default)',paddingBottom:8}}>{cat.section}</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {cat.items.map(d => (
              <button key={d.id} className="btn btn-outline" style={{justifyContent:'flex-start',textAlign:'left',padding:'10px 16px',fontSize:13}} onClick={()=>handlePickDoc(d.id)}>📄 {d.label}</button>
            ))}
          </div>
        </div>
      ))
    )}
  </div>);
}
