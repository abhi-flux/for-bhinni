import React, { useRef, useState } from 'react';
import { exportAll, importAll } from '../utils/db.js';
import { setPin, clearPin } from '../utils/pin.js';

export default function Settings({ onClose }) {
  const fileRef = useRef(null);
  const [msg, setMsg] = useState('');
  const [changingPin, setChangingPin] = useState(false);
  const [pinA, setPinA] = useState('');
  const [pinB, setPinB] = useState('');

  const doExport = async () => {
    const data = await exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `for-bhinni-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg('Backup downloaded ✓');
  };

  const doImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importAll(data);
      setMsg('Restored from backup ✓');
    } catch (err) {
      setMsg('Could not read that file');
    }
    e.target.value = '';
  };

  const savePin = async () => {
    if (pinA.length !== 4 || pinA !== pinB) {
      setMsg("PINs didn't match — try again");
      return;
    }
    await setPin(pinA);
    setMsg('PIN updated ✓');
    setChangingPin(false);
    setPinA(''); setPinB('');
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <p style={styles.eyebrow}>settings</p>
        <h2 style={styles.title}>Keep it safe</h2>

        <button style={styles.row} onClick={doExport}>
          <span>Export backup (.json)</span>
          <span style={styles.rowArrow}>›</span>
        </button>
        <button style={styles.row} onClick={() => fileRef.current?.click()}>
          <span>Restore from backup</span>
          <span style={styles.rowArrow}>›</span>
        </button>
        <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={doImport} />

        {!changingPin ? (
          <button style={styles.row} onClick={() => setChangingPin(true)}>
            <span>Change PIN</span>
            <span style={styles.rowArrow}>›</span>
          </button>
        ) : (
          <div style={styles.pinBox}>
            <input style={styles.pinInput} type="password" inputMode="numeric" maxLength={4} placeholder="New 4-digit PIN" value={pinA} onChange={(e) => setPinA(e.target.value.replace(/\D/g, ''))} />
            <input style={styles.pinInput} type="password" inputMode="numeric" maxLength={4} placeholder="Confirm PIN" value={pinB} onChange={(e) => setPinB(e.target.value.replace(/\D/g, ''))} />
            <button style={styles.saveBtn} onClick={savePin}>Save PIN</button>
          </div>
        )}

        {msg && <p style={styles.msg}>{msg}</p>}

        <p style={styles.note}>Everything here stays on this phone — nothing is uploaded anywhere. Export a backup now and then so you never lose it.</p>

        <button style={styles.closeBtn} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(67,48,58,0.75)', display: 'flex', alignItems: 'flex-end', zIndex: 60 },
  sheet: { background: 'var(--paper)', borderRadius: '22px 22px 0 0', padding: '20px 18px', width: '100%', maxHeight: '85vh', overflowY: 'auto' },
  eyebrow: { fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--accent-deep)', fontSize: 13, margin: '0 0 2px' },
  title: { fontFamily: 'var(--font-display)', fontSize: 24, margin: '0 0 16px', color: 'var(--ink)' },
  row: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: '14px 16px', marginBottom: 10, fontSize: 14.5, color: 'var(--ink)' },
  rowArrow: { color: 'var(--ink-faint)', fontSize: 18 },
  pinBox: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 },
  pinInput: { border: '1.5px solid var(--line)', borderRadius: 10, padding: '10px 12px', fontSize: 16, letterSpacing: 4, textAlign: 'center', background: 'var(--card)' },
  saveBtn: { background: 'var(--accent-deep)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px', fontSize: 14, fontWeight: 600 },
  msg: { fontSize: 13, color: 'var(--accent-deep)', fontWeight: 600, textAlign: 'center', margin: '4px 0 10px' },
  note: { fontSize: 12, color: 'var(--ink-faint)', lineHeight: 1.5, marginTop: 4 },
  closeBtn: { width: '100%', background: 'transparent', border: '1.5px solid var(--line)', color: 'var(--ink-soft)', borderRadius: 12, padding: '11px', fontSize: 13.5, marginTop: 16 },
};
