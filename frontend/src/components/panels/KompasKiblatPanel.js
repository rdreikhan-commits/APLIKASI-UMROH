'use client';
import { useState, useEffect } from 'react';

// ══════════════════════════════════════
// KOMPAS KIBLAT — Jamaah View
// ══════════════════════════════════════
export function KompasKiblatPanel() {
  const [qibla, setQibla] = useState(null);
  const [heading, setHeading] = useState(0);
  const [error, setError] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);

  // 1. Dapatkan lokasi untuk menghitung sudut Kiblat
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          // Hitung arah kiblat
          const meccaLat = (21.422487 * Math.PI) / 180;
          const meccaLon = (39.826206 * Math.PI) / 180;
          const latRad = (latitude * Math.PI) / 180;
          const lonRad = (longitude * Math.PI) / 180;
          
          const y = Math.sin(meccaLon - lonRad);
          const x = Math.cos(latRad) * Math.tan(meccaLat) - Math.sin(latRad) * Math.cos(meccaLon - lonRad);
          let qAngle = Math.atan2(y, x);
          qAngle = (qAngle * 180) / Math.PI;
          qAngle = (qAngle + 360) % 360;
          setQibla(qAngle);
        },
        err => setError('Akses lokasi ditolak. Kompas tidak bisa menghitung arah Kiblat.')
      );
    } else {
      setError('Geolocation tidak didukung di perangkat ini.');
    }
  }, []);

  // 2. Dapatkan orientasi perangkat
  const requestCompassPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          startCompass();
        } else {
          setError('Izin sensor kompas ditolak.');
        }
      } catch (e) {
        setError('Gagal meminta izin kompas.');
      }
    } else {
      setPermissionGranted(true);
      startCompass();
    }
  };

  const startCompass = () => {
    const handler = (e) => {
      let compassHeading = e.webkitCompassHeading;
      if (compassHeading === undefined || compassHeading === null) {
        compassHeading = 360 - e.alpha; // Android fallback
      }
      setHeading(compassHeading || 0);
    };
    window.addEventListener('deviceorientationabsolute', handler, true);
    // Fallback if deviceorientationabsolute doesn't work (some iOS versions)
    window.addEventListener('deviceorientation', handler, true);
  };

  return (
    <div className="card" style={{ padding: 24, textAlign: 'center' }}>
      <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: 'var(--gold-400)' }}>🕋 Kompas Kiblat</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Arahkan HP Anda untuk menemukan Ka'bah</p>

      {error ? (
        <div style={{ padding: 16, background: 'rgba(239,68,68,0.1)', color: 'var(--red-400)', borderRadius: 12, fontSize: 14 }}>
          {error}
        </div>
      ) : !permissionGranted ? (
        <div style={{ padding: 24 }}>
          <p style={{ fontSize: 14, marginBottom: 16 }}>Kompas membutuhkan izin sensor orientasi perangkat Anda.</p>
          <button className="btn btn-gold" onClick={requestCompassPermission}>Buka Kompas</button>
        </div>
      ) : qibla === null ? (
        <div className="spinner" style={{ margin: '0 auto' }}></div>
      ) : (
        <div style={{ position: 'relative', width: 250, height: 250, margin: '0 auto' }}>
          {/* Compass Background (North) */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid var(--border-gold)',
            transform: `rotate(${-heading}deg)`, transition: 'transform 0.1s ease-out'
          }}>
            <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', fontWeight: 800, color: 'var(--red-400)' }}>U</div>
            <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', fontWeight: 600, color: 'var(--text-muted)' }}>S</div>
            <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--text-muted)' }}>T</div>
            <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--text-muted)' }}>B</div>
          </div>

          {/* Qibla Needle */}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `rotate(${qibla - heading}deg)`, transition: 'transform 0.1s ease-out'
          }}>
            <div style={{
              width: 4, height: 120, background: 'linear-gradient(to top, transparent 50%, var(--gold-400) 50%)',
              position: 'relative', borderRadius: 2
            }}>
              <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', fontSize: 24 }}>🕋</div>
            </div>
          </div>
        </div>
      )}

      {qibla !== null && permissionGranted && !error && (
        <div style={{ marginTop: 24, fontSize: 14 }}>
          Derajat Kiblat: <strong style={{ color: 'var(--emerald-400)' }}>{Math.round(qibla)}°</strong>
          <br/>
          Arah Anda: <strong style={{ color: 'var(--text-primary)' }}>{Math.round(heading)}°</strong>
        </div>
      )}
    </div>
  );
}
