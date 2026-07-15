import React, { useEffect, useState } from 'react';
import { getAll, put, remove, newId } from '../utils/db.js';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [editing, setEditing] = useState(null); // note object or 'new'
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  const load = async () => {
    const all = await getAll('notes');
    all.sort((a, b) => b.createdAt - a.createdAt);
    setNotes(all);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing('new'); setTitle(''); setText(''); };
  const openEdit = (n) => { setEditing(n); setTitle(n.title || ''); setText(n.text || ''); };

  const save = async () => {
    if (!text.trim()) { setEditing(null); return; }
    if (editing === 'new') {
      await put('notes', { id: newId(), title: title.trim(), text: text.trim(), createdAt: Date.now() });
    } else {
      await put('notes', { ...editing, title: title.trim(), text: text.trim() });
    }
    setEditing(null);
    load();
  };

  const del = async (id) => {
    await remove('notes', id);
    setEditing(null);
    load();
  };

  const fmtDate = (ts) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={styles.page}>
      <p style={styles.eyebrow}>chapter four</p>
      <h1 style={styles.title}>Love Notes</h1>
      <p style={styles.sub}>little memories, in your own words</p>

      <button style={styles.addBtn} onClick={openNew}>+ write a note</button>

      {notes.length === 0 && <p style={styles.empty}>Nothing written yet — start with today.</p>}

      {notes.map((n) => (
        <button key={n.id} style={styles.card} onClick={() => openEdit(n)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <p style={styles.cardTitle}>{n.title || 'Untitled'}</p>
            <p style={styles.cardDate}>{fmtDate(n.createdAt)}</p>
          </div>
          <p style={styles.cardPreview}>{n.text.slice(0, 120)}{n.text.length > 120 ? '…' : ''}</p>
        </button>
      ))}

      {editing && (
        <div style={styles.overlay} onClick={() => setEditing(null)}>
          <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <input
              style={styles.titleInput}
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              autoFocus
              style={styles.textarea}
              placeholder="What do you want to remember?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div style={styles.sheetActions}>
              {editing !== 'new' && (
                <button style={styles.deleteBtn} onClick={() => del(editing.id)}>Delete</button>
              )}
              <div style={{ flex: 1 }} />
              <button style={styles.cancelBtn} onClick={() => setEditing(null)}>Cancel</button>
              <button style={styles.saveBtn} onClick={save}>Save</button>
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
  addBtn: { width: '100%', background: 'var(--accent-deep)', color: '#fff', border: 'none', borderRadius: 14, padding: '13px', fontSize: 14.5, fontWeight: 600, marginBottom: 18 },
  empty: { fontSize: 13.5, color: 'var(--ink-faint)', fontStyle: 'italic', textAlign: 'center', margin: '30px 0' },
  card: { display: 'block', width: '100%', textAlign: 'left', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: '14px 16px', marginBottom: 10 },
  cardTitle: { margin: 0, fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)' },
  cardDate: { margin: 0, fontSize: 11, color: 'var(--ink-faint)' },
  cardPreview: { margin: '6px 0 0', fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.5 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(67,48,58,0.75)', display: 'flex', alignItems: 'flex-end', zIndex: 50 },
  sheet: { background: 'var(--paper)', borderRadius: '22px 22px 0 0', padding: 18, width: '100%', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '80vh' },
  titleInput: { border: 'none', borderBottom: '1.5px solid var(--line)', padding: '6px 2px', fontSize: 18, fontFamily: 'var(--font-display)', background: 'transparent', color: 'var(--ink)' },
  textarea: { border: '1.5px solid var(--line)', borderRadius: 12, padding: 12, fontSize: 14.5, minHeight: 140, resize: 'vertical', background: 'var(--card)', color: 'var(--ink)', lineHeight: 1.55 },
  sheetActions: { display: 'flex', alignItems: 'center', gap: 8 },
  deleteBtn: { background: 'transparent', color: '#a6455b', border: '1.5px solid var(--accent-pale)', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 600 },
  cancelBtn: { background: 'transparent', border: 'none', color: 'var(--ink-soft)', fontSize: 13.5, padding: '8px 10px' },
  saveBtn: { background: 'var(--accent-deep)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13.5, fontWeight: 600 },
};
