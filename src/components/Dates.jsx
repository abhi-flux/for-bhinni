import React, { useEffect, useState } from 'react';
import { getAll, put, remove, newId } from '../utils/db.js';

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split('-').map(Number);
  let target = new Date(today.getFullYear(), m - 1, d);
  if (target < today) target = new Date(today.getFullYear() + 1, m - 1, d);
  const diff = Math.round((target - today) / 86400000);
  return diff;
}

function formatNice(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

const ICONS = { Birthday: '🎂', Anniversary: '💍', Other: '✦' };

export default function Dates() {
  const [dates, setDates] = useState([]);
  const [form, setForm] = useState(false);
  const [label, setLabel] = useState('');
  const [type, setType] = useState('Other');
  const [date, setDate] = useState('');

  const load = async () => {
    const all = await getAll('dates');
    all.sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
    setDates(all);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!label.trim() || !date) return;
    await put('dates', { id: newId(), label: label.trim(), type, date, createdAt: Date.now() });
    setLabel(''); setDate(''); setType('Other'); setForm(false);
    load();
  };

  const del = async (id) => { await remove('dates', id); load(); };

  return (
    <div style={styles.page}>
      <p style={styles.eyebrow}>chapter three</p>
      <h1 style={styles.title}>Important Dates</h1>
      <p style={styles.sub}>the days worth planning for</p>

      {dates.map((d) => {
        const days = daysUntil(d.date);
        return (
          <div key={d.id} style={styles.card}>
            <div style={styles.iconWrap}>{ICONS[d.type] || '✦'}</div>
            <div style={{ flex: 1 }}>
              <p style={styles.cardTitle}>{d.label}</p>
              <p style={styles.cardMeta}>{formatNice(d.date)} · {d.type}</p>
            </div>
            <div style={styles.countdownWrap}>
              <p style={styles.countdownNum}>{days === 0 ? 'Today' : days}</p>
              {days !== 0 && <p style={styles.countdownLabel}>days</p>}
            </div>
            <button style={styles.delBtn} onClick={() => del(d.id)}>×</button>
          </div>
        );
      })}

      {dates.length === 0 && !form && <p style={styles.empty}>No dates saved yet.</p>}

      {form ? (
        <div style={styles.formCard}>
          <input style={styles.input} placeholder="What's the occasion?" value={label} onChange={(e) => setLabel(e.target.value)} />
          <div style={styles.typeRow}>
            {['Birthday', 'Anniversary', 'Other'].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{ ...styles.typeBtn, ...(type === t ? styles.typeBtnActive : {}) }}
              >
                {ICONS[t]} {t}
              </button>
            ))}
          </div>
          <input type="date" style={styles.input} value={date} onChange={(e) => setDate(e.target.value)} />
          <div style={styles.formActions}>
            <button style={styles.cancelBtn} onClick={() => setForm(false)}>Cancel</button>
            <button style={styles.saveBtn} onClick={save}>Save date</button>
          </div>
        </div>
      ) : (
        <button style={styles.addBtn} onClick={() => setForm(true)}>+ add a date</button>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '22px 20px 40px' },
  eyebrow: { fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--accent-deep)', fontSize: 13, margin: '0 0 2px' },
  title: { fontFamily: 'var(--font-display)', fontSize: 32, margin: '0 0 4px', color: 'var(--ink)' },
  sub: { fontSize: 13, color: 'var(--ink-soft)', margin: '0 0 18px' },
  card: { display: 'flex', alignItems: 'center', gap: 12, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: '13px 14px', marginBottom: 10 },
  iconWrap: { width: 38, height: 38, borderRadius: '50%', background: 'var(--accent-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 },
  cardTitle: { margin: 0, fontFamily: 'var(--font-display)', fontSize: 16.5, color: 'var(--ink)' },
  cardMeta: { margin: '2px 0 0', fontSize: 12, color: 'var(--ink-faint)' },
  countdownWrap: { textAlign: 'center', minWidth: 40 },
  countdownNum: { margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--accent-deep)' },
  countdownLabel: { margin: 0, fontSize: 9.5, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' },
  delBtn: { background: 'transparent', border: 'none', color: 'var(--ink-faint)', fontSize: 18, padding: '0 2px' },
  empty: { fontSize: 13.5, color: 'var(--ink-faint)', fontStyle: 'italic', textAlign: 'center', margin: '30px 0' },
  formCard: { background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 },
  input: { border: '1.5px solid var(--line)', borderRadius: 10, padding: '10px 12px', fontSize: 14, background: 'var(--paper)', color: 'var(--ink)' },
  typeRow: { display: 'flex', gap: 8 },
  typeBtn: { flex: 1, border: '1.5px solid var(--line)', background: 'var(--paper)', borderRadius: 10, padding: '8px 4px', fontSize: 12.5, color: 'var(--ink-soft)' },
  typeBtnActive: { background: 'var(--accent-pale)', borderColor: 'var(--accent)', color: 'var(--accent-deep)', fontWeight: 700 },
  formActions: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 },
  cancelBtn: { background: 'transparent', border: 'none', color: 'var(--ink-soft)', fontSize: 13.5, padding: '8px 10px' },
  saveBtn: { background: 'var(--accent-deep)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13.5, fontWeight: 600 },
  addBtn: { width: '100%', background: 'transparent', border: '1.5px dashed var(--line)', color: 'var(--ink-soft)', borderRadius: 14, padding: '12px', fontSize: 13.5, marginTop: 4 },
};
