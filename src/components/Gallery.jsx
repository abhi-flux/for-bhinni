import React, { useEffect, useRef, useState } from 'react';
import { getAll, put, remove, newId } from '../utils/db.js';

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressImage(dataUrl, maxSize = 1280, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        const scale = maxSize / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
}

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    const all = await getAll('photos');
    all.sort((a, b) => b.createdAt - a.createdAt);
    setPhotos(all);
  };
  useEffect(() => { load(); }, []);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    for (const file of files) {
      const raw = await fileToDataUrl(file);
      const compressed = await compressImage(raw);
      await put('photos', { id: newId(), data: compressed, caption: '', createdAt: Date.now() });
    }
    setBusy(false);
    e.target.value = '';
    load();
  };

  const deletePhoto = async (id) => {
    await remove('photos', id);
    setViewing(null);
    load();
  };

  const saveCaption = async () => {
    if (!viewing) return;
    const updated = { ...viewing, caption };
    await put('photos', updated);
    setViewing(updated);
    load();
  };

  return (
    <div style={styles.page}>
      <p style={styles.eyebrow}>chapter two</p>
      <h1 style={styles.title}>Gallery</h1>
      <p style={styles.sub}>little moments worth keeping</p>

      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />
      <button style={styles.uploadBtn} onClick={() => fileRef.current?.click()} disabled={busy}>
        {busy ? 'Adding photos…' : '+ Add photos'}
      </button>

      {photos.length === 0 ? (
        <p style={styles.empty}>No photos yet — add the ones that make you smile.</p>
      ) : (
        <div style={styles.grid}>
          {photos.map((p) => (
            <button key={p.id} style={styles.thumbWrap} onClick={() => { setViewing(p); setCaption(p.caption || ''); }}>
              <img src={p.data} alt={p.caption || 'photo'} style={styles.thumb} />
            </button>
          ))}
        </div>
      )}

      {viewing && (
        <div style={styles.modalOverlay} onClick={() => setViewing(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <img src={viewing.data} alt="" style={styles.modalImg} />
            <input
              style={styles.captionInput}
              placeholder="Add a caption…"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onBlur={saveCaption}
            />
            <div style={styles.modalActions}>
              <button style={styles.deleteBtn} onClick={() => deletePhoto(viewing.id)}>Delete</button>
              <button style={styles.closeBtn} onClick={() => setViewing(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '22px 20px 40px' },
  eyebrow: { fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--accent-deep)', fontSize: 13, margin: '0 0 2px' },
  title: { fontFamily: 'var(--font-display)', fontSize: 32, margin: '0 0 4px', color: 'var(--ink)' },
  sub: { fontSize: 13, color: 'var(--ink-soft)', margin: '0 0 18px' },
  uploadBtn: { width: '100%', background: 'var(--accent-deep)', color: '#fff', border: 'none', borderRadius: 14, padding: '13px', fontSize: 14.5, fontWeight: 600, marginBottom: 18 },
  empty: { fontSize: 13.5, color: 'var(--ink-faint)', fontStyle: 'italic', textAlign: 'center', marginTop: 30 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  thumbWrap: { padding: 0, border: 'none', borderRadius: 12, overflow: 'hidden', aspectRatio: '1', background: 'var(--accent-pale)' },
  thumb: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(67,48,58,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 },
  modal: { background: 'var(--paper)', borderRadius: 18, padding: 14, maxWidth: 420, width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', gap: 10 },
  modalImg: { width: '100%', borderRadius: 12, maxHeight: '55vh', objectFit: 'contain', background: '#000' },
  captionInput: { border: '1.5px solid var(--line)', borderRadius: 10, padding: '9px 12px', fontSize: 14, background: 'var(--card)' },
  modalActions: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  deleteBtn: { background: 'transparent', color: '#a6455b', border: '1.5px solid var(--accent-pale)', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 600 },
  closeBtn: { background: 'var(--accent-deep)', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600 },
};
