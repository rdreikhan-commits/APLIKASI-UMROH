'use client';

/**
 * DocumentTemplate — Reusable print layout for all Mandala 525 documents
 * Usage: <DocumentTemplate title="Invoice" docNo="INV-001" date="2026-04-29"> ... content ... </DocumentTemplate>
 */
export default function DocumentTemplate({ title, docNo, date, children, onClose, footer }) {
  const handlePrint = () => {
    const printWin = window.open('', '_blank', 'width=800,height=1100');
    const content = document.getElementById('doc-print-area').innerHTML;
    printWin.document.write(`<!DOCTYPE html><html><head><title>${title} - ${docNo}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; color: #1a1a1a; padding: 40px; font-size: 13px; line-height: 1.6; }
        .doc-header { display: flex; align-items: center; gap: 20px; padding-bottom: 16px; border-bottom: 3px solid #d4af37; margin-bottom: 24px; }
        .doc-logo { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid #d4af37; }
        .doc-brand h1 { font-size: 20px; color: #1a1a1a; letter-spacing: 2px; margin: 0; }
        .doc-brand p { font-size: 11px; color: #666; margin: 2px 0 0; }
        .doc-title { text-align: center; margin: 28px 0 24px; }
        .doc-title h2 { font-size: 18px; text-transform: uppercase; letter-spacing: 3px; color: #1a1a1a; border-bottom: 2px solid #d4af37; display: inline-block; padding-bottom: 6px; }
        .doc-meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; color: #555; }
        .doc-content { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th, td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; font-size: 12px; }
        th { background: #f5f0e1; font-weight: 700; color: #333; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-bold { font-weight: 700; }
        .text-gold { color: #b8960c; }
        .amount { font-family: 'Courier New', monospace; font-weight: 700; }
        .total-row { background: #fdf8e8; font-weight: 700; }
        .section-title { font-size: 13px; font-weight: 700; margin: 18px 0 8px; color: #333; border-left: 3px solid #d4af37; padding-left: 10px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; margin: 10px 0; }
        .info-row { display: flex; gap: 8px; font-size: 12px; }
        .info-label { color: #666; min-width: 140px; }
        .info-value { font-weight: 600; color: #1a1a1a; }
        .doc-footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; }
        .signature-area { display: flex; justify-content: space-between; margin-top: 50px; }
        .signature-box { text-align: center; width: 200px; }
        .signature-line { border-bottom: 1px solid #333; margin: 60px 0 8px; }
        .stamp { font-size: 10px; color: #999; text-align: center; margin-top: 30px; padding-top: 10px; border-top: 1px dashed #ccc; }
        @media print { body { padding: 20px; } }
      </style>
    </head><body>${content}</body></html>`);
    printWin.document.close();
    setTimeout(() => printWin.print(), 500);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 800, maxHeight: '90vh', overflow: 'auto', padding: 0 }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-default)', position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>📄 Preview: {title}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm btn-gold" onClick={handlePrint}>🖨️ Cetak / Download PDF</button>
            <button className="btn btn-sm btn-outline" onClick={onClose}>✕ Tutup</button>
          </div>
        </div>

        {/* Print Area */}
        <div id="doc-print-area" style={{ padding: 40, background: '#fff', color: '#1a1a1a', fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.6 }}>
          {/* Header */}
          <div className="doc-header" style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 16, borderBottom: '3px solid #d4af37', marginBottom: 24 }}>
            <img src="/logo-mandala.png" alt="Mandala 525" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #d4af37' }} />
            <div>
              <h1 style={{ fontSize: 20, letterSpacing: 2, margin: 0, color: '#1a1a1a' }}>MANDALA 525</h1>
              <p style={{ fontSize: 11, color: '#666', margin: '2px 0 0' }}>LIMA DUA LIMA | TOUR & TRAVEL</p>
              <p style={{ fontSize: 10, color: '#888', margin: '2px 0 0' }}>Jl. Contoh Alamat No. 123, Jakarta | Telp: (021) 123-4567 | Email: info@mandala525.com</p>
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', margin: '28px 0 24px' }}>
            <h2 style={{ fontSize: 18, textTransform: 'uppercase', letterSpacing: 3, color: '#1a1a1a', borderBottom: '2px solid #d4af37', display: 'inline-block', paddingBottom: 6 }}>{title}</h2>
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 12, color: '#555' }}>
            <span>No. Dokumen: <strong>{docNo}</strong></span>
            <span>Tanggal: <strong>{formatDate(date)}</strong></span>
          </div>

          {/* Content */}
          <div style={{ margin: '20px 0' }}>
            {children}
          </div>

          {/* Footer / Signature */}
          {footer || (
            <div style={{ marginTop: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 50 }}>
                <div style={{ textAlign: 'center', width: 200 }}>
                  <p style={{ fontSize: 12, color: '#666' }}>Disetujui oleh,</p>
                  <div style={{ borderBottom: '1px solid #333', margin: '60px 0 8px' }} />
                  <p style={{ fontWeight: 700, fontSize: 12 }}>Direktur</p>
                  <p style={{ fontSize: 10, color: '#888' }}>Mandala 525 Tour & Travel</p>
                </div>
                <div style={{ textAlign: 'center', width: 200 }}>
                  <p style={{ fontSize: 12, color: '#666' }}>Penerima,</p>
                  <div style={{ borderBottom: '1px solid #333', margin: '60px 0 8px' }} />
                  <p style={{ fontWeight: 700, fontSize: 12 }}>Jamaah</p>
                </div>
              </div>
              <p style={{ fontSize: 10, color: '#999', textAlign: 'center', marginTop: 30, paddingTop: 10, borderTop: '1px dashed #ccc' }}>
                Dicetak pada {formatDate()} — Dokumen ini sah tanpa tanda tangan basah
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Shared helpers for templates ──
export const fmtRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
export const fmtShort = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

export function InfoGrid({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px', margin: '10px 0' }}>
      {items.map(([label, value], i) => (
        <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12 }}>
          <span style={{ color: '#666', minWidth: 140 }}>{label}</span>
          <span style={{ fontWeight: 600, color: '#1a1a1a' }}>: {value || '-'}</span>
        </div>
      ))}
    </div>
  );
}

export function SectionTitle({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 700, margin: '18px 0 8px', color: '#333', borderLeft: '3px solid #d4af37', paddingLeft: 10 }}>{children}</div>;
}

export function DocTable({ headers, rows, showTotal, totalLabel = 'TOTAL', totalValue }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', margin: '12px 0' }}>
      <thead>
        <tr>{headers.map((h, i) => <th key={i} style={{ padding: '8px 12px', border: '1px solid #ddd', background: '#f5f0e1', fontWeight: 700, color: '#333', fontSize: 12, textAlign: i === headers.length - 1 && headers.length > 2 ? 'right' : 'left' }}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>{row.map((cell, j) => <td key={j} style={{ padding: '8px 12px', border: '1px solid #ddd', fontSize: 12, textAlign: j === row.length - 1 && row.length > 2 ? 'right' : 'left' }}>{cell}</td>)}</tr>
        ))}
        {showTotal && (
          <tr style={{ background: '#fdf8e8', fontWeight: 700 }}>
            <td colSpan={headers.length - 1} style={{ padding: '8px 12px', border: '1px solid #ddd', fontSize: 12, textAlign: 'right' }}>{totalLabel}</td>
            <td style={{ padding: '8px 12px', border: '1px solid #ddd', fontSize: 12, textAlign: 'right', fontFamily: 'Courier New, monospace' }}>{totalValue}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
