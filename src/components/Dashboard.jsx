import React, { useEffect, useState } from 'react';
import { getAll } from '../utils/db.js';

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split('-').map(Number);
  let target = new Date(today.getFullYear(), m - 1, d);
  if (target < today) target = new Date(today.getFullYear() + 1, m - 1, d);
  const diff = Math.round((target - today) / 86400000);
  return diff;
}

export default function Dashboard({ onNavigate, onOpenSettings }) {
  const [nextDate, setNextDate] = useState(null);
  const [noteCount, setNoteCount] = useState(0);
  const [prefCount, setPrefCount] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);
  const [latestNote, setLatestNote] = useState(null);

  useEffect(() => {
    (async () => {
      const dates = await getAll('dates');
      if (dates.length) {
        const withDays = dates.map((d) => ({ ...d, days: daysUntil(d.date) }));
        withDays.sort((a, b) => a.days - b.days);
        setNextDate(withDays[0]);
      }
      const notes = await getAll('notes');
      setNoteCount(notes.length);
      if (notes.length) {
        notes.sort((a, b) => b.createdAt - a.createdAt);
        setLatestNote(notes[0]);
      }
      const prefs = await getAll('preferences');
      setPrefCount(prefs.length);
      const photos = await getAll('photos');
      setPhotoCount(photos.length);
    })();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>her book of little things</p>
          <h1 style={styles.title}>Bhinni</h1>
        </div>
        <button style={styles.gear} onClick={onOpenSettings} aria-label="Settings">
          ⚙
        </button>
      </div>

      {nextDate && (
        <div style={{ ...styles.card, ...styles.dateCard }} onClick={() => onNavigate('dates')}>
          <p style={styles.dateLabel}>{nextDate.days === 0 ? "it's today ✦" : `${nextDate.days} day${nextDate.days === 1 ? '' : 's'} away`}</p>
          <p style={styles.dateTitle}>{nextDate.label}</p>
        </div>
      )}

      {latestNote && (
        <div style={styles.card} onClick={() => onNavigate('notes')}>
          <p style={styles.cardEyebrow}>a note you left</p>
          <p style={styles.noteTitle}>{latestNote.title || 'Untitled'}</p>
          <p style={styles.notePreview}>{latestNote.text?.slice(0, 90)}{latestNote.text?.length > 90 ? '…' : ''}</p>
        </div>
      )}

      <div style={styles.grid}>
        <button style={styles.tile} onClick={() => onNavigate('prefs')}>
          <span style={styles.tileIcon}>🌸</span>
          <span style={styles.tileLabel}>Her Likes</span>
          <span style={styles.tileCount}>{prefCount} saved</span>
        </button>
        <button style={styles.tile} onClick={() => onNavigate('gallery')}>
          <span style={styles.tileIcon}>🖼</span>
          <span style={styles.tileLabel}>Gallery</span>
          <span style={styles.tileCount}>{photoCount} photos</span>
        </button>
        <button style={styles.tile} onClick={() => onNavigate('dates')}>
          <span style={styles.tileIcon}>📅</span>
          <span style={styles.tileLabel}>Dates</span>
          <span style={styles.tileCount}>reminders</span>
        </button>
        <button style={styles.tile} onClick={() => onNavigate('notes')}>
          <span style={styles.tileIcon}>✎</span>
          <span style={styles.tileLabel}>Notes</span>
          <span style={styles.tileCount}>{noteCount} written</span>
        </button>
      </div>

      <p style={styles.footer}>made quietly, kept just for you two ✦</p>
    </div>
  );
}

const styles = {
  page: { padding: '22px 20px 30px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  eyebrow: { fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--accent-deep)', fontSize: 13, margin: '0 0 2px' },
  title: { fontFamily: 'var(--font-display)', fontSize: 40, margin: 0, color: 'var(--ink)' },
  gear: { background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '50%', width: 40, height: 40, fontSize: 16, color: 'var(--ink-soft)', boxShadow: 'var(--shadow-soft)' },
  card: {
    background: 'var(--card)', borderRadius: 18, padding: '16px 18px', marginBottom: 14,
    border: '1px solid var(--line)', boxShadow: 'var(--shadow-soft)', textAlign: 'left', width: '100%',
  },
  dateCard: { background: 'linear-gradient(135deg, var(--accent-pale), #fff)' },
  dateLabel: { margin: '0 0 4px', fontSize: 12.5, fontWeight: 700, color: 'var(--accent-deep)', letterSpacing: '0.02em' },
  dateTitle: { margin: 0, fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink)' },
  cardEyebrow: { margin: '0 0 4px', fontSize: 12, color: 'var(--ink-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  noteTitle: { margin: '0 0 4px', fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' },
  notePreview: { margin: 0, fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.5 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 },
  tile: {
    background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '18px 14px',
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, boxShadow: 'var(--shadow-soft)',
  },
  tileIcon: { fontSize: 22 },
  tileLabel: { fontFamily: 'var(--font-display)', fontSize: 16.5, color: 'var(--ink)' },
  tileCount: { fontSize: 11.5, color: 'var(--ink-faint)' },
  footer: { textAlign: 'center', color: 'var(--ink-faint)', fontSize: 12, marginTop: 26, fontStyle: 'italic', fontFamily: 'var(--font-display)' },
};
