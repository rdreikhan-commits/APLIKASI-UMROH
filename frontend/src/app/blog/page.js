'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function BlogList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPublishedArticles().then(res => {
      setArticles(Array.isArray(res) ? res : res.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="page-container" style={{ paddingTop: '100px', minHeight: '100vh' }}>
        <div className="page-header">
          <h1>Berita & Update Terbaru</h1>
          <p>Kumpulan informasi seputar travel umroh dan tips ibadah</p>
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner"/></div>
        ) : articles.length === 0 ? (
          <div className="empty-state"><h3>Belum ada artikel</h3></div>
        ) : (
          <div className="grid-3" style={{ marginBottom: '60px' }}>
            {articles.map(a => (
              <a href={`/blog/${a.slug}`} key={a.id} className="card card-gold" style={{ display: 'block', textDecoration: 'none', color: 'inherit', padding: 0, overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '200px', backgroundColor: '#2a2a2a' }}>
                  {a.image_path && <img src={`http://127.0.0.1:8000${a.image_path}`} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--gold-400)', marginBottom: '8px' }}>
                    {new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', lineHeight: 1.4 }}>{a.title}</h3>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Baca selengkapnya →</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
