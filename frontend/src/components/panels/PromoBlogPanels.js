import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export function PromoBannerPanel({ showToast }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', image: null });

  const load = () => {
    setLoading(true);
    api.getBanners().then(res => { setBanners(Array.isArray(res) ? res : res.data || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) return showToast('Pilih gambar banner', 'error');
    
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('image', form.image);

    try {
      await api.createBanner(formData);
      showToast('Banner berhasil diupload!');
      setShowForm(false);
      setForm({ title: '', image: null });
      load();
    } catch (err) {
      showToast('Gagal upload banner', 'error');
    }
  };

  const toggle = async (id) => {
    await api.toggleBanner(id);
    load();
  };

  const hapus = async (id) => {
    if (confirm('Yakin hapus banner ini?')) {
      await api.deleteBanner(id);
      load();
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="fade-in">
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <h2><span className="icon">🖼️</span> Promo Banners</h2>
        <button className="btn btn-gold" onClick={() => setShowForm(true)}>+ Upload Banner</button>
      </div>

      <div className="grid-3">
        {banners.map(b => (
          <div key={b.id} className="card" style={{ padding: 10 }}>
            <img src={`http://127.0.0.1:8000${b.image_path}`} alt="Banner" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
            <div style={{ marginTop: 10, fontWeight: 600 }}>{b.title || 'Tanpa Judul'}</div>
            <div className="flex-between" style={{ marginTop: 10 }}>
              <button className={`btn btn-sm ${b.is_active ? 'btn-gold' : 'btn-outline'}`} onClick={() => toggle(b.id)}>
                {b.is_active ? 'Aktif' : 'Nonaktif'}
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => hapus(b.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Upload Banner</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Judul (Opsional)</label>
                <input className="input-field" type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Gambar (Landscape Disarankan)</label>
                <input className="input-field" type="file" accept="image/*" onChange={e => setForm({ ...form, image: e.target.files[0] })} required />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="submit" className="btn btn-gold">Upload</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function ArticlePanel({ showToast }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', image: null });

  const load = () => {
    setLoading(true);
    api.getArticles().then(res => { setArticles(Array.isArray(res) ? res : res.data || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('content', form.content);
    if (form.image) formData.append('image', form.image);

    try {
      await api.createArticle(formData);
      showToast('Artikel berhasil diterbitkan!');
      setShowForm(false);
      setForm({ title: '', content: '', image: null });
      load();
    } catch (err) {
      showToast('Gagal menerbitkan artikel', 'error');
    }
  };

  const hapus = async (id) => {
    if (confirm('Yakin hapus artikel ini?')) {
      await api.deleteArticle(id);
      load();
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="fade-in">
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <h2><span className="icon">📝</span> Manajemen Blog / Artikel</h2>
        <button className="btn btn-gold" onClick={() => setShowForm(true)}>+ Tulis Artikel</button>
      </div>

      <div className="table-container card">
        <table>
          <thead>
            <tr><th>Judul</th><th>Penulis</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {articles.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600 }}>{a.title}</td>
                <td>{a.author?.name}</td>
                <td>{new Date(a.created_at).toLocaleDateString('id-ID')}</td>
                <td><span className={`badge ${a.is_published ? 'badge-completed' : 'badge-pending'}`}>{a.is_published ? 'Published' : 'Draft'}</span></td>
                <td><button className="btn btn-sm btn-danger" onClick={() => hapus(a.id)}>🗑️ Hapus</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '600px', maxWidth: '95%' }}>
            <h2 className="modal-title">Tulis Artikel Baru</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Judul Artikel</label>
                <input className="input-field" type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>Gambar Thumbnail</label>
                <input className="input-field" type="file" accept="image/*" onChange={e => setForm({ ...form, image: e.target.files[0] })} />
              </div>
              <div className="input-group">
                <label>Isi Konten Artikel</label>
                <textarea className="input-field" style={{ minHeight: '200px' }} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="submit" className="btn btn-gold">Terbitkan Artikel</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
