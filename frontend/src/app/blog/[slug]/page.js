'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function ArticleDetail({ params }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getArticle(params.slug).then(res => {
      setArticle(res.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [params.slug]);

  if (loading) return <><Navbar /><div className="loading-page"><div className="spinner"/></div></>;
  if (!article) return <><Navbar /><div className="page-container" style={{paddingTop:'100px'}}><div className="empty-state"><h3>Artikel tidak ditemukan</h3></div></div></>;

  return (
    <>
      <Navbar />
      <article className="page-container" style={{ paddingTop: '100px', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
        
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--gold-400)', marginBottom: '16px', fontWeight: 600 }}>
            {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} • Oleh {article.author?.name}
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '24px', lineHeight: 1.3 }}>{article.title}</h1>
        </div>

        {article.image_path && (
          <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <img src={`http://127.0.0.1:8000${article.image_path}`} alt={article.title} style={{ width: '100%', maxHeight: '450px', objectFit: 'cover' }} />
          </div>
        )}

        <div 
          style={{ fontSize: '18px', lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}
          dangerouslySetInnerHTML={{ __html: article.content }} 
        />
        
        <div style={{ marginTop: '80px', borderTop: '1px solid var(--border-default)', paddingTop: '40px', textAlign: 'center' }}>
          <a href="/blog" className="btn btn-outline">← Kembali ke Berita</a>
        </div>
      </article>
    </>
  );
}
