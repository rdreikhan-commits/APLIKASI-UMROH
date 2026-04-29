'use client';
import { useState, useEffect } from 'react';

export default function CrudTable({ title, api, columns, formFields, showToast }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});

  const load = () => { setLoading(true); api.list().then(r => { setData(r.data || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.create(form); showToast(`${title} ditambahkan!`); setShowForm(false); setForm({}); load(); }
    catch (err) { showToast(err.message || 'Gagal', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus data ini?')) return;
    try { await api.delete(id); showToast('Dihapus.'); load(); }
    catch (err) { showToast(err.message || 'Gagal', 'error'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>{title} ({data.length})</h2>
        <button className="btn btn-sm btn-gold" onClick={() => { setForm({}); setShowForm(true); }}>+ Tambah</button>
      </div>
      {data.length === 0 ? (
        <div className="empty-state"><div className="icon">📋</div><h3>Belum ada data</h3></div>
      ) : (
        <div className="table-container card" style={{ padding: 0 }}>
          <table><thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}<th>Aksi</th></tr></thead>
            <tbody>{data.map(row => (
              <tr key={row.id}>
                {columns.map(c => <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>)}
                <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(row.id)}>🗑</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Tambah {title}</h2>
            <form onSubmit={handleSubmit}>
              {formFields.map(f => (
                <div className="input-group" key={f.name}>
                  <label>{f.label}</label>
                  {f.type === 'select' ? (
                    <select className="input-field" value={form[f.name] || ''} onChange={e => setForm({ ...form, [f.name]: e.target.value })} required={f.required !== false}>
                      <option value="">-- Pilih --</option>
                      {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input className="input-field" type={f.type || 'text'} placeholder={f.placeholder || ''}
                      value={form[f.name] || ''} onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                      required={f.required !== false} />
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="submit" className="btn btn-gold">Simpan</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
