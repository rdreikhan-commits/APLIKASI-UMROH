'use client';
import { useState, useEffect } from 'react';

/**
 * ═══════════════════════════════════════════════
 * REUSABLE CRUD PANEL COMPONENT
 * ═══════════════════════════════════════════════
 * Generic CRUD table + modal form for any master data module.
 *
 * Props:
 *   title        - Panel heading
 *   subtitle     - Panel description
 *   icon         - Emoji icon
 *   apiClient    - Object with { list, create, update, delete } methods
 *   columns      - Array of { key, label, render? }
 *   formFields   - Array of { name, label, type?, placeholder?, required?, options? }
 *   defaultForm  - Default form values
 *   formatRow?   - Optional row transform before display
 *   showToast    - Toast notification function
 *   idKey?       - Key for record ID (default: 'id')
 */

const formatRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

export default function CrudPanel({
  title, subtitle, icon, apiClient, columns, formFields,
  defaultForm, showToast, idKey = 'id', cardView = false,
  renderCard, extraActions, statsCards, headerActions,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // false | 'create' | 'edit'
  const [form, setForm] = useState(defaultForm || {});
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.list();
      setData(res.data || []);
    } catch (e) {
      showToast('Gagal memuat data ' + title, 'error');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(defaultForm || {});
    setEditId(null);
    setShowForm('create');
  };

  const openEdit = (item) => {
    const f = {};
    formFields.forEach(field => {
      f[field.name] = item[field.name] ?? '';
    });
    setForm(f);
    setEditId(item[idKey]);
    setShowForm('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (showForm === 'edit' && editId) {
        await apiClient.update(editId, form);
        showToast(`${title} berhasil diupdate!`);
      } else {
        await apiClient.create(form);
        showToast(`${title} berhasil ditambahkan!`);
      }
      setShowForm(false);
      load();
    } catch (err) {
      const msg = err.message || err.errors ? Object.values(err.errors || {}).flat().join(', ') : 'Gagal menyimpan';
      showToast(msg, 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (item) => {
    if (!confirm(`Hapus data ini?`)) return;
    try {
      await apiClient.delete(item[idKey]);
      showToast(`${title} berhasil dihapus!`);
      load();
    } catch (err) {
      showToast(err.message || 'Gagal menghapus', 'error');
    }
  };

  // Filter data
  const filtered = searchTerm
    ? data.filter(item =>
        Object.values(item).some(v =>
          String(v || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  if (loading) {
    return (
      <div className="loading-page" style={{minHeight:'40vh'}}>
        <div className="spinner" />
        <span>Memuat {title}...</span>
      </div>
    );
  }

  return (
    <div className="crud-panel">
      {/* Header */}
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16}}>
        <div>
          <h1>{icon} {title}</h1>
          <p>{subtitle}</p>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {headerActions}
          <button className="btn btn-gold" onClick={openCreate} id={`btn-add-${title.toLowerCase().replace(/\s/g,'-')}`}>
            + Tambah {title}
          </button>
        </div>
      </div>

      {/* Stats */}
      {statsCards && (
        <div className="grid-4" style={{marginBottom:24}}>
          {statsCards(data)}
        </div>
      )}

      {/* Search */}
      <div style={{marginBottom:20}}>
        <input
          className="input-field"
          placeholder={`🔍 Cari ${title.toLowerCase()}...`}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{maxWidth:360}}
        />
      </div>

      {/* Data */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">{icon}</div>
          <h3>Belum ada {title.toLowerCase()}</h3>
          <p>Klik tombol tambah untuk menambahkan data baru</p>
        </div>
      ) : cardView && renderCard ? (
        <div className="grid-3">
          {filtered.map((item, idx) => renderCard(item, idx, { onEdit: openEdit, onDelete: handleDelete }))}
        </div>
      ) : (
        <div className="table-container card" style={{padding:0}}>
          <table>
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item[idKey] || idx}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(item) : (item[col.key] ?? '-')}
                    </td>
                  ))}
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(item)} title="Edit">✏️</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item)} title="Hapus" style={{padding:'6px 10px'}}>🗑️</button>
                      {extraActions && extraActions(item, load)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{marginTop:12,fontSize:13,color:'var(--text-muted)'}}>
        Menampilkan {filtered.length} dari {data.length} data
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">
              {showForm === 'edit' ? `Edit ${title}` : `Tambah ${title}`}
            </h2>
            <form onSubmit={handleSubmit}>
              {formFields.map(field => (
                <div className="input-group" key={field.name}>
                  <label>{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      className="input-field"
                      value={form[field.name] || ''}
                      onChange={e => setForm({...form, [field.name]: e.target.value})}
                      required={field.required !== false}
                    >
                      <option value="">-- Pilih --</option>
                      {(field.options || []).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      className="input-field"
                      placeholder={field.placeholder || ''}
                      value={form[field.name] || ''}
                      onChange={e => setForm({...form, [field.name]: e.target.value})}
                      required={field.required !== false}
                    />
                  ) : (
                    <input
                      className="input-field"
                      type={field.type || 'text'}
                      placeholder={field.placeholder || ''}
                      value={form[field.name] || ''}
                      onChange={e => setForm({...form, [field.name]: e.target.value})}
                      required={field.required !== false}
                    />
                  )}
                </div>
              ))}
              <div style={{display:'flex',gap:8,marginTop:20}}>
                <button type="submit" className="btn btn-gold" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
