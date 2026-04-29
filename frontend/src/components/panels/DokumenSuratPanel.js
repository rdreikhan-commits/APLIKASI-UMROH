'use client';
import { useState } from 'react';
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

// Sample data generator
function getSampleData(docId) {
  const base = { nama: 'Ahmad Fauzi', nik: '3201234567890001', noHp: '081234567890', email: 'ahmad@email.com', alamat: 'Jl. Merdeka No. 10, Jakarta', noBooking: 'BK-2026-001', paket: 'Paket Gold 2026', harga: 35000000, dp: 10000000, tglBooking: '2026-04-29', tglBerangkat: '2026-10-11', tglPulang: '2026-10-20', maskapai: 'Garuda Indonesia', hotel: 'Grand Zamzam Makkah' };
  return base;
}

function genDocNo(prefix) {
  return `${prefix}-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9999)).padStart(4,'0')}`;
}

// ── Document content renderer ──
function DocContent({ docId, data }) {
  const d = data;
  switch(docId) {
    case 'form_umroh': return (<div>
      <SectionTitle>Data Jamaah</SectionTitle>
      <InfoGrid items={[['Nama Lengkap', d.nama],['NIK', d.nik],['No. HP', d.noHp],['Email', d.email],['Alamat', d.alamat],['Kode Booking', d.noBooking]]} />
      <SectionTitle>Detail Paket</SectionTitle>
      <InfoGrid items={[['Paket', d.paket],['Harga', fmtRp(d.harga)],['DP Minimum', fmtRp(d.dp)],['Maskapai', d.maskapai],['Hotel', d.hotel],['Durasi', '9 hari']]} />
      <SectionTitle>Jadwal</SectionTitle>
      <InfoGrid items={[['Tgl Berangkat', fmtDate(d.tglBerangkat)],['Tgl Pulang', fmtDate(d.tglPulang)]]} />
      <p style={{marginTop:20,fontSize:11,color:'#666'}}>Dengan menandatangani formulir ini, saya menyatakan bahwa data di atas adalah benar dan saya bersedia mengikuti seluruh ketentuan perjalanan umroh yang berlaku.</p>
    </div>);
    case 'form_haji': return (<div>
      <SectionTitle>Data Calon Jamaah Haji</SectionTitle>
      <InfoGrid items={[['Nama Lengkap', d.nama],['NIK', d.nik],['No. HP', d.noHp],['Email', d.email],['Alamat', d.alamat]]} />
      <SectionTitle>Detail Pendaftaran Haji</SectionTitle>
      <InfoGrid items={[['Jenis', 'Haji Reguler'],['Estimasi Keberangkatan', '2030'],['Biaya BPIH', fmtRp(45000000)]]} />
      <p style={{marginTop:20,fontSize:11,color:'#666'}}>Pendaftaran haji bersifat antrian sesuai ketentuan Kementerian Agama RI.</p>
    </div>);
    case 'inv_umroh': return (<div>
      <SectionTitle>Tagihan Kepada</SectionTitle>
      <InfoGrid items={[['Nama', d.nama],['No. Booking', d.noBooking],['Email', d.email]]} />
      <SectionTitle>Rincian Biaya</SectionTitle>
      <DocTable headers={['No','Deskripsi','Jumlah']} rows={[
        ['1', `Paket ${d.paket}`, fmtRp(d.harga)],['2','Biaya Visa', fmtRp(2500000)],['3','Asuransi Perjalanan', fmtRp(500000)],
      ]} showTotal totalLabel="TOTAL TAGIHAN" totalValue={fmtRp(d.harga+3000000)} />
      <InfoGrid items={[['Status','BELUM LUNAS'],['DP Dibayar', fmtRp(d.dp)],['Sisa Pelunasan', fmtRp(d.harga+3000000-d.dp)]]} />
    </div>);
    case 'bukti_bayar_umroh': return (<div>
      <SectionTitle>Data Pembayaran</SectionTitle>
      <InfoGrid items={[['Nama Jamaah', d.nama],['No. Booking', d.noBooking],['Metode Pembayaran','Transfer Bank BCA'],['No. Referensi','TRF-20260429-001']]} />
      <DocTable headers={['Keterangan','Nominal']} rows={[['Pembayaran DP Paket Umroh', fmtRp(d.dp)]]} showTotal totalLabel="TOTAL DIBAYAR" totalValue={fmtRp(d.dp)} />
      <p style={{fontSize:11,color:'#666',marginTop:12}}>Pembayaran telah diverifikasi dan diterima dengan baik.</p>
    </div>);
    case 'riwayat_bayar_umroh': return (<div>
      <SectionTitle>Data Jamaah</SectionTitle>
      <InfoGrid items={[['Nama', d.nama],['No. Booking', d.noBooking],['Paket', d.paket]]} />
      <SectionTitle>Riwayat Pembayaran</SectionTitle>
      <DocTable headers={['No','Tanggal','Keterangan','Metode','Nominal']} rows={[
        ['1','29 Apr 2026','DP Awal','Transfer BCA', fmtRp(d.dp)],['2','15 Mei 2026','Cicilan 1','Transfer BCA', fmtRp(5000000)],['3','15 Jun 2026','Pelunasan','Transfer BCA', fmtRp(d.harga-d.dp-5000000)],
      ]} showTotal totalLabel="TOTAL DIBAYAR" totalValue={fmtRp(d.harga)} />
    </div>);
    case 'inv_haji': return (<div>
      <SectionTitle>Tagihan Kepada</SectionTitle>
      <InfoGrid items={[['Nama', d.nama],['NIK', d.nik],['Email', d.email]]} />
      <SectionTitle>Rincian Biaya Haji</SectionTitle>
      <DocTable headers={['No','Deskripsi','Jumlah']} rows={[['1','Biaya BPIH Haji Reguler', fmtRp(45000000)],['2','Biaya Handling & Administrasi', fmtRp(3000000)]]} showTotal totalLabel="TOTAL" totalValue={fmtRp(48000000)} />
    </div>);
    case 'bukti_bayar_haji': return (<div>
      <SectionTitle>Bukti Pembayaran Haji</SectionTitle>
      <InfoGrid items={[['Nama', d.nama],['NIK', d.nik],['Metode','Transfer Bank Syariah'],['No. Referensi','TRF-HAJI-001']]} />
      <DocTable headers={['Keterangan','Nominal']} rows={[['Setoran Awal BPIH', fmtRp(25000000)]]} showTotal totalLabel="TOTAL" totalValue={fmtRp(25000000)} />
    </div>);
    case 'riwayat_bayar_haji': return (<div>
      <SectionTitle>Riwayat Pembayaran Haji</SectionTitle>
      <InfoGrid items={[['Nama', d.nama],['NIK', d.nik]]} />
      <DocTable headers={['No','Tanggal','Keterangan','Nominal','Saldo']} rows={[
        ['1','29 Apr 2026','Setoran Awal', fmtRp(25000000), fmtRp(25000000)],['2','29 Mei 2026','Cicilan 1', fmtRp(10000000), fmtRp(35000000)],
      ]} showTotal totalLabel="TOTAL TERBAYAR" totalValue={fmtRp(35000000)} />
    </div>);
    case 'bukti_setor_umroh': case 'bukti_setor_haji': return (<div>
      <SectionTitle>Bukti Setoran Tabungan {docId.includes('haji')?'Haji':'Umroh'}</SectionTitle>
      <InfoGrid items={[['Nama', d.nama],['No. Rekening Tabungan','TAB-'+d.nik.slice(-6)],['Tanggal Setoran', fmtDate(new Date())],['Metode','Transfer Bank']]} />
      <DocTable headers={['Keterangan','Nominal']} rows={[['Setoran Tabungan '+( docId.includes('haji')?'Haji':'Umroh'), fmtRp(2000000)]]} showTotal totalLabel="SALDO SETELAH SETORAN" totalValue={fmtRp(12000000)} />
    </div>);
    case 'riwayat_setor_umroh': case 'riwayat_setor_haji': return (<div>
      <SectionTitle>Riwayat Setoran Tabungan {docId.includes('haji')?'Haji':'Umroh'}</SectionTitle>
      <InfoGrid items={[['Nama', d.nama],['No. Rekening','TAB-'+d.nik.slice(-6)]]} />
      <DocTable headers={['No','Tanggal','Keterangan','Debit','Kredit','Saldo']} rows={[
        ['1','01 Jan 2026','Setoran Awal','-', fmtRp(5000000), fmtRp(5000000)],['2','01 Feb 2026','Setoran Bulanan','-', fmtRp(2000000), fmtRp(7000000)],['3','01 Mar 2026','Setoran Bulanan','-', fmtRp(2000000), fmtRp(9000000)],
      ]} />
    </div>);
    case 'bukti_tarik_umroh': case 'bukti_tarik_haji': return (<div>
      <SectionTitle>Bukti Penarikan Tabungan {docId.includes('haji')?'Haji':'Umroh'}</SectionTitle>
      <InfoGrid items={[['Nama', d.nama],['No. Rekening','TAB-'+d.nik.slice(-6)],['Tanggal Penarikan', fmtDate(new Date())],['Alasan Penarikan','Pelunasan Biaya '+(docId.includes('haji')?'Haji':'Umroh')]]} />
      <DocTable headers={['Keterangan','Nominal']} rows={[['Penarikan untuk pelunasan', fmtRp(9000000)]]} showTotal totalLabel="SALDO TERSISA" totalValue={fmtRp(0)} />
    </div>);
    case 'riwayat_tarik_umroh': case 'riwayat_tarik_haji': return (<div>
      <SectionTitle>Riwayat Penarikan Tabungan {docId.includes('haji')?'Haji':'Umroh'}</SectionTitle>
      <InfoGrid items={[['Nama', d.nama],['No. Rekening','TAB-'+d.nik.slice(-6)]]} />
      <DocTable headers={['No','Tanggal','Keterangan','Nominal','Saldo']} rows={[
        ['1','29 Apr 2026','Penarikan - Pelunasan', fmtRp(9000000), fmtRp(0)],
      ]} />
    </div>);
    case 'surat_paspor': return (<div>
      <p style={{marginBottom:16,fontSize:12}}>Perihal: <strong>Surat Rekomendasi Pembuatan Paspor</strong></p>
      <p style={{fontSize:12,marginBottom:8}}>Kepada Yth.<br/>Kepala Kantor Imigrasi<br/>di Tempat</p>
      <p style={{fontSize:12,lineHeight:1.8,marginTop:16}}>Dengan hormat,<br/><br/>Yang bertanda tangan di bawah ini, Mandala 525 Tour & Travel, dengan ini memberikan rekomendasi bahwa:</p>
      <InfoGrid items={[['Nama Lengkap', d.nama],['NIK', d.nik],['Alamat', d.alamat],['No. HP', d.noHp]]} />
      <p style={{fontSize:12,lineHeight:1.8,marginTop:12}}>Adalah benar calon jamaah umroh yang terdaftar pada biro perjalanan kami dengan rencana keberangkatan pada tanggal <strong>{fmtDate(d.tglBerangkat)}</strong>. Untuk keperluan tersebut, yang bersangkutan memerlukan paspor untuk perjalanan ke Kerajaan Arab Saudi.</p>
      <p style={{fontSize:12,lineHeight:1.8,marginTop:12}}>Demikian surat rekomendasi ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
    </div>);
    case 'surat_cuti': return (<div>
      <p style={{marginBottom:16,fontSize:12}}>Perihal: <strong>Surat Keterangan Izin Cuti untuk Ibadah Umroh</strong></p>
      <p style={{fontSize:12,marginBottom:8}}>Kepada Yth.<br/>HRD / Pimpinan Perusahaan<br/>di Tempat</p>
      <p style={{fontSize:12,lineHeight:1.8,marginTop:16}}>Dengan hormat,<br/><br/>Yang bertanda tangan di bawah ini, Mandala 525 Tour & Travel, dengan ini menerangkan bahwa:</p>
      <InfoGrid items={[['Nama Lengkap', d.nama],['NIK', d.nik],['Alamat', d.alamat]]} />
      <p style={{fontSize:12,lineHeight:1.8,marginTop:12}}>Adalah benar calon jamaah umroh yang terdaftar di biro perjalanan kami dan akan melaksanakan ibadah umroh dengan jadwal sebagai berikut:</p>
      <InfoGrid items={[['Tanggal Berangkat', fmtDate(d.tglBerangkat)],['Tanggal Kembali', fmtDate(d.tglPulang)],['Durasi', '9 hari'],['Maskapai', d.maskapai]]} />
      <p style={{fontSize:12,lineHeight:1.8,marginTop:12}}>Untuk itu kami mohon agar yang bersangkutan dapat diberikan izin cuti kerja selama melaksanakan ibadah tersebut. Demikian surat keterangan ini dibuat dengan sebenarnya.</p>
    </div>);
    case 'bukti_beli_layanan': return (<div>
      <SectionTitle>Bukti Pembelian Layanan</SectionTitle>
      <InfoGrid items={[['Nama Jamaah', d.nama],['No. Booking', d.noBooking]]} />
      <DocTable headers={['No','Layanan','Qty','Harga','Subtotal']} rows={[
        ['1','Handling Bagasi VIP','1', fmtRp(500000), fmtRp(500000)],['2','City Tour Madinah','1', fmtRp(1500000), fmtRp(1500000)],['3','Laundry 5kg','1', fmtRp(200000), fmtRp(200000)],
      ]} showTotal totalLabel="TOTAL" totalValue={fmtRp(2200000)} />
    </div>);
    case 'bukti_bayar_layanan': return (<div>
      <SectionTitle>Bukti Pembayaran Layanan</SectionTitle>
      <InfoGrid items={[['Nama', d.nama],['No. Invoice','INV-LYN-001'],['Metode','Cash']]} />
      <DocTable headers={['Keterangan','Nominal']} rows={[['Pembayaran layanan tambahan', fmtRp(2200000)]]} showTotal totalLabel="LUNAS" totalValue={fmtRp(2200000)} />
    </div>);
    case 'riwayat_bayar_layanan': return (<div>
      <SectionTitle>Riwayat Pembayaran Layanan</SectionTitle>
      <InfoGrid items={[['Nama', d.nama],['No. Booking', d.noBooking]]} />
      <DocTable headers={['No','Tanggal','Layanan','Nominal','Status']} rows={[
        ['1','29 Apr 2026','Handling Bagasi VIP', fmtRp(500000),'Lunas'],['2','29 Apr 2026','City Tour Madinah', fmtRp(1500000),'Lunas'],
      ]} showTotal totalLabel="TOTAL" totalValue={fmtRp(2000000)} />
    </div>);
    case 'surat_perlengkapan': return (<div>
      <p style={{fontSize:12,marginBottom:16}}>Perihal: <strong>Surat Pengeluaran Produk Perlengkapan Umroh</strong></p>
      <SectionTitle>Penerima</SectionTitle>
      <InfoGrid items={[['Nama', d.nama],['No. Booking', d.noBooking],['Paket', d.paket]]} />
      <SectionTitle>Daftar Perlengkapan</SectionTitle>
      <DocTable headers={['No','Item','Qty','Keterangan']} rows={[
        ['1','Koper Umroh 24"','1','Warna hitam'],['2','Kain Ihram (Pria)','1','Putih'],['3','Mukena Travel','1','Putih'],['4','Buku Doa & Manasik','1','-'],['5','ID Card & Lanyard','1','Mandala 525'],
      ]} />
      <p style={{fontSize:11,color:'#666',marginTop:16}}>Perlengkapan di atas telah diserahkan dan diterima dalam kondisi baik.</p>
    </div>);
    case 'bukti_bonus_agent': return (<div>
      <SectionTitle>Bukti Pembayaran Bonus Agent</SectionTitle>
      <InfoGrid items={[['Nama Agent','Budi Santoso'],['Kode Agent','AGT-001'],['No. Rekening','BCA 1234567890'],['Periode','April 2026']]} />
      <DocTable headers={['No','Jamaah Referral','Paket','Komisi']} rows={[
        ['1','Ahmad Fauzi','Paket Gold', fmtRp(1500000)],['2','Siti Aminah','Paket Gold', fmtRp(1500000)],
      ]} showTotal totalLabel="TOTAL BONUS" totalValue={fmtRp(3000000)} />
    </div>);
    case 'riwayat_bonus_agent': return (<div>
      <SectionTitle>Riwayat Pembayaran Bonus Agent</SectionTitle>
      <InfoGrid items={[['Nama Agent','Budi Santoso'],['Kode Agent','AGT-001']]} />
      <DocTable headers={['No','Periode','Jumlah Referral','Total Bonus','Status']} rows={[
        ['1','Maret 2026','3', fmtRp(4500000),'Dibayar'],['2','April 2026','2', fmtRp(3000000),'Dibayar'],
      ]} showTotal totalLabel="TOTAL KESELURUHAN" totalValue={fmtRp(7500000)} />
    </div>);
    default: return <p>Template belum tersedia</p>;
  }
}

// Get document label/title
function getDocLabel(id) {
  for (const cat of DOC_CATEGORIES) for (const item of cat.items) if (item.id === id) return item.label;
  return id;
}

// ══════════════════════════════════════
// MAIN PANEL
// ══════════════════════════════════════
export default function DokumenSuratPanel({ showToast }) {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [search, setSearch] = useState('');

  const allDocs = DOC_CATEGORIES.flatMap(c => c.items);
  const filtered = search ? allDocs.filter(d => d.label.toLowerCase().includes(search.toLowerCase())) : null;

  return (<div>
    <div className="page-header"><h1>📄 Dokumen & Surat</h1><p>Generate 25 jenis dokumen resmi Mandala 525</p></div>

    <div className="card" style={{padding:16,marginBottom:20}}>
      <input className="input-field" placeholder="🔍 Cari dokumen..." value={search} onChange={e=>setSearch(e.target.value)} />
    </div>

    {filtered ? (
      <div className="card" style={{padding:20}}>
        <h3 style={{marginBottom:12,fontSize:14}}>Hasil Pencarian ({filtered.length})</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {filtered.map(d => (
            <button key={d.id} className="btn btn-outline" style={{justifyContent:'flex-start',textAlign:'left',padding:'10px 16px'}} onClick={()=>setSelectedDoc(d.id)}>📄 {d.label}</button>
          ))}
        </div>
      </div>
    ) : (
      DOC_CATEGORIES.map((cat, ci) => (
        <div key={ci} className="card" style={{padding:20,marginBottom:16}}>
          <h3 style={{marginBottom:12,fontSize:14,color:'var(--gold-300)',borderBottom:'1px solid var(--border-default)',paddingBottom:8}}>{cat.section}</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {cat.items.map(d => (
              <button key={d.id} className="btn btn-outline" style={{justifyContent:'flex-start',textAlign:'left',padding:'10px 16px',fontSize:13}} onClick={()=>setSelectedDoc(d.id)}>📄 {d.label}</button>
            ))}
          </div>
        </div>
      ))
    )}

    {selectedDoc && (
      <DocumentTemplate title={getDocLabel(selectedDoc)} docNo={genDocNo(selectedDoc.toUpperCase().slice(0,3))} date={new Date().toISOString()} onClose={()=>setSelectedDoc(null)}>
        <DocContent docId={selectedDoc} data={getSampleData(selectedDoc)} />
      </DocumentTemplate>
    )}
  </div>);
}
