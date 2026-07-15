import React, { useEffect, useState } from 'react';
import { getAll, put, remove, newId } from '../utils/db.js';

const DEFAULT_CATEGORIES = [
  'Food & Drinks', 'Movies & Shows', 'Music', 'Colors', 'Hobbies & Interests',
  'Gift Ideas', 'Comfort & Self-care', 'Sizes', 'Things She Dislikes', 'Little Things',
];

export default function Preferences() {
  const [items, setItems] = useState([]);
  const [openCat, setOpenCat] = useState(null);
  const [adding, setAdding] = useState(null); // category being added to
  const [text, setText] = useState('');
  const [newCatMode, setNewCatMode] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const load = async () => setItems(await getAll('preferences'));
  useEffect(() => { load(); }, []);

  const categories = Array.from(new Set([...DEFAULT_CATEGORIES, ...items.map((i) => i.category)]));

  const addItem = async (category) => {
    if (!text.trim()) return;
    await put('preferences', { id: newId(), category, text: text.trim(), createdAt: Date.now() });
    setText('');
    setAdding(null);
    load();
  };

  const deleteItem = async (id) => {
    await remove('preferences', id);
    load();
  };

  const addCategory = () => {
    if (!newCatName.trim()) return;
    setOpenCat(newCatName.trim());
    setAdding(newCatName.trim());
    setNewCatName('');
    setNewCatMode(false);
  };

  return (
    <div style={styles.page}>
      <p style={styles.eyebrow}>chapter one</p>
      <h1 style={styles.title}>Her Likes</h1>
      <p style={styles.sub}>everything that makes her, her</p>

      {categories.map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        const isOpen = openCat === cat;
        return (
          <div key={cat} style={styles.section}>
            <button style={styles.sectionHeader} onClick={() => setOpenCat(isOpen ? null : cat)}>
              <span style={styles.sectionTitle}>{cat}</span>
              <span style={styles.sectionMeta}>
                {catItems.length > 0 && <span style={styles.countBadge}>{catItems.length}</span>}
                <span style={{ ...styles.chevron, transform: isOpen ? 'rotate(90deg)' : 'none' }}>›</span>
              </span>
            </button>

            {isOpen && (
              <div style={styles.sectionBody}>
                {catItems.length === 0 && <p style={styles.empty}>Nothing here yet</p>}
                <div style={styles.chipWrap}>
                  {catItems.map((it) => (
                    <span key={it.id} style={styles.itemChip}>
                      {it.text}
                      <button style={styles.chipX} onClick={() => deleteItem(it.id)}>×</button>
                    </span>
                  ))}
                </div>

                {adding === cat ? (
                  <div style={styles.addRow}>
                    <input
                      autoFocus
                      style={styles.input}
                      placeholder="e.g. Butterscotch ice cream"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addItem(cat)}
                    />
                    <button style={styles.saveBtn} onClick={() => addItem(cat)}>Add</button>
                  </div>
                ) : (
                  <button style={styles.addBtn} onClick={() => { setAdding(cat); setText(''); }}>+ add</button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {newCatMode ? (
        <div style={{ ...styles.addRow, marginTop: 10 }}>
          <input
            autoFocus
            style={styles.input}
            placeholder="New category name"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
          />
          <button style={styles.saveBtn} onClick={addCategory}>Add</button>
        </div>
      ) : (
        <button style={styles.newCatBtn} onClick={() => setNewCatMode(true)}>+ new category</button>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '22px 20px 40px' },
  eyebrow: { fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--accent-deep)', fontSize: 13, margin: '0 0 2px' },
  title: { fontFamily: 'var(--font-display)', fontSize: 32, margin: '0 0 4px', color: 'var(--ink)' },
  sub: { fontSize: 13, color: 'var(--ink-soft)', margin: '0 0 20px' },
  section: { marginBottom: 10, borderRadius: 16, background: 'var(--card)', border: '1px solid var(--line)', overflow: 'hidden' },
  sectionHeader: { width: '100%', background: 'transparent', border: 'none', padding: '15px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 16.5, color: 'var(--ink)' },
  sectionMeta: { display: 'flex', alignItems: 'center', gap: 8 },
  countBadge: { fontSize: 11, background: 'var(--accent-pale)', color: 'var(--accent-deep)', borderRadius: 999, padding: '2px 8px', fontWeight: 700 },
  chevron: { color: 'var(--ink-faint)', fontSize: 18, transition: 'transform 0.15s ease' },
  sectionBody: { padding: '0 16px 16px' },
  empty: { fontSize: 13, color: 'var(--ink-faint)', fontStyle: 'italic', margin: '0 0 10px' },
  chipWrap: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  itemChip: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-pale)', color: 'var(--accent-deep)', borderRadius: 999, padding: '7px 8px 7px 13px', fontSize: 13.5, fontWeight: 500 },
  chipX: { background: 'transparent', border: 'none', color: 'var(--accent-deep)', fontSize: 15, opacity: 0.6, padding: '0 4px', lineHeight: 1 },
  addRow: { display: 'flex', gap: 8 },
  input: { flex: 1, border: '1.5px solid var(--line)', borderRadius: 12, padding: '10px 12px', fontSize: 14, background: 'var(--paper)', color: 'var(--ink)' },
  saveBtn: { background: 'var(--accent-deep)', color: '#fff', border: 'none', borderRadius: 12, padding: '0 16px', fontSize: 13.5, fontWeight: 600 },
  addBtn: { background: 'transparent', border: '1.5px dashed var(--accent-pale)', color: 'var(--accent-deep)', borderRadius: 12, padding: '8px 14px', fontSize: 13, fontWeight: 600 },
  newCatBtn: { width: '100%', background: 'transparent', border: '1.5px dashed var(--line)', color: 'var(--ink-soft)', borderRadius: 14, padding: '12px', fontSize: 13.5, marginTop: 6 },
};
