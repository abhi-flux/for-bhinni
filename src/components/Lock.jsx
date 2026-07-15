import React, { useState, useEffect, useRef } from 'react';
import { hasPin, setPin, verifyPin } from '../utils/pin.js';

export default function Lock({ onUnlock }) {
  const [mode, setMode] = useState(hasPin() ? 'enter' : 'create');
  const [pin, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [stage, setStage] = useState('idle'); // idle | shake | opening
  const [error, setError] = useState('');

  const digits = mode === 'create' && confirmPin === '' ? pin : (mode === 'create' ? confirmPin : pin);

  const handleDigit = (d) => {
    if (stage !== 'idle') return;
    setError('');
    if (mode === 'create' && pin.length === 4 && confirmPin.length < 4) {
      const next = confirmPin + d;
      setConfirmPin(next);
      if (next.length === 4) finishCreate(pin, next);
      return;
    }
    const next = pin.length < 4 ? pin + d : pin;
    setPinValue(next);
    if (mode === 'enter' && next.length === 4) {
      tryUnlock(next);
    } else if (mode === 'create' && next.length === 4) {
      // wait for confirm
    }
  };

  const finishCreate = async (p, c) => {
    if (p !== c) {
      setStage('shake');
      setError("Those didn't match — let's try again");
      setTimeout(() => {
        setStage('idle');
        setPinValue('');
        setConfirmPin('');
      }, 500);
      return;
    }
    await setPin(p);
    setStage('opening');
    setTimeout(() => onUnlock(), 700);
  };

  const tryUnlock = async (p) => {
    const ok = await verifyPin(p);
    if (ok) {
      setStage('opening');
      setTimeout(() => onUnlock(), 700);
    } else {
      setStage('shake');
      setError('Wrong PIN, try again');
      setTimeout(() => {
        setStage('idle');
        setPinValue('');
      }, 500);
    }
  };

  const handleDelete = () => {
    if (stage !== 'idle') return;
    if (mode === 'create' && pin.length === 4) {
      setConfirmPin((c) => c.slice(0, -1));
    } else {
      setPinValue((p) => p.slice(0, -1));
    }
  };

  const showingConfirm = mode === 'create' && pin.length === 4;
  const activeCount = showingConfirm ? confirmPin.length : pin.length;

  return (
    <div style={styles.wrap}>
      <div
        style={{
          ...styles.book,
          ...(stage === 'shake' ? styles.shake : {}),
          ...(stage === 'opening' ? styles.opening : {}),
        }}
      >
        <div style={styles.ribbon} />
        <div style={styles.bookInner}>
          <p style={styles.eyebrow}>{mode === 'create' ? (showingConfirm ? 'confirm your pin' : 'set a pin to begin') : 'welcome back'}</p>
          <h1 style={styles.title}>For Bhinni</h1>
          <p style={styles.sub}>{error || (mode === 'create' ? 'this keeps her book just for you' : 'enter your pin')}</p>

          <div style={styles.dots}>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                style={{
                  ...styles.dot,
                  ...(i < activeCount ? styles.dotFilled : {}),
                }}
              />
            ))}
          </div>

          <div style={styles.pad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((k, i) =>
              k === '' ? (
                <div key={i} />
              ) : k === 'del' ? (
                <button key={i} style={styles.key} onClick={handleDelete} aria-label="Delete">
                  ⌫
                </button>
              ) : (
                <button key={i} style={styles.key} onClick={() => handleDigit(k)}>
                  {k}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: 24,
  },
  book: {
    width: '100%',
    maxWidth: 360,
    background: 'linear-gradient(155deg, #c9738a, #a6455b)',
    borderRadius: 24,
    boxShadow: '0 20px 50px rgba(166,69,91,0.28)',
    position: 'relative',
    padding: '10px 10px 26px',
    transition: 'transform 0.5s cubic-bezier(.5,0,.2,1), opacity 0.5s ease',
    transformOrigin: 'left center',
  },
  shake: {
    animation: 'shakeAnim 0.45s',
  },
  opening: {
    transform: 'perspective(1200px) rotateY(-100deg)',
    opacity: 0,
  },
  ribbon: {
    position: 'absolute',
    top: -6,
    right: 34,
    width: 14,
    height: 46,
    background: 'var(--gold)',
    borderRadius: '0 0 4px 4px',
  },
  bookInner: {
    background: 'var(--paper)',
    borderRadius: 18,
    padding: '34px 26px 26px',
    textAlign: 'center',
  },
  eyebrow: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    color: 'var(--accent-deep)',
    fontSize: 13,
    margin: '0 0 6px',
    letterSpacing: '0.03em',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 34,
    margin: '0 0 8px',
    color: 'var(--ink)',
  },
  sub: {
    fontSize: 13,
    color: 'var(--ink-soft)',
    margin: '0 0 22px',
    minHeight: 16,
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 28,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: '1.5px solid var(--accent)',
    display: 'inline-block',
    background: 'transparent',
    transition: 'background 0.15s ease, transform 0.15s ease',
  },
  dotFilled: {
    background: 'var(--accent-deep)',
    transform: 'scale(1.1)',
  },
  pad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 14,
    maxWidth: 260,
    margin: '0 auto',
  },
  key: {
    aspectRatio: '1',
    borderRadius: '50%',
    border: 'none',
    background: '#fff',
    color: 'var(--ink)',
    fontSize: 20,
    boxShadow: 'var(--shadow-soft)',
  },
};

if (typeof document !== 'undefined' && !document.getElementById('lock-keyframes')) {
  const style = document.createElement('style');
  style.id = 'lock-keyframes';
  style.innerHTML = `
    @keyframes shakeAnim {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-6px); }
      80% { transform: translateX(6px); }
    }
  `;
  document.head.appendChild(style);
}
