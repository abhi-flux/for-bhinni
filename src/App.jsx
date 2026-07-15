import React, { useState, useEffect } from 'react';
import Lock from './components/Lock.jsx';
import Dashboard from './components/Dashboard.jsx';
import Preferences from './components/Preferences.jsx';
import Gallery from './components/Gallery.jsx';
import Dates from './components/Dates.jsx';
import Notes from './components/Notes.jsx';
import Settings from './components/Settings.jsx';

const TABS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'prefs', label: 'Her Likes', icon: '🌸' },
  { id: 'gallery', label: 'Gallery', icon: '🖼' },
  { id: 'dates', label: 'Dates', icon: '📅' },
  { id: 'notes', label: 'Notes', icon: '✎' },
];

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState('home');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    document.body.style.background = 'var(--bg)';
  }, []);

  if (!unlocked) {
    return <Lock onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div style={styles.app}>
      <div style={styles.content} className="scrollY">
        {tab === 'home' && <Dashboard onNavigate={setTab} onOpenSettings={() => setSettingsOpen(true)} />}
        {tab === 'prefs' && <Preferences />}
        {tab === 'gallery' && <Gallery />}
        {tab === 'dates' && <Dates />}
        {tab === 'notes' && <Notes />}
      </div>

      <nav style={styles.nav}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              ...styles.navBtn,
              color: tab === t.id ? 'var(--accent-deep)' : 'var(--ink-faint)',
            }}
          >
            <span style={{ fontSize: 19, opacity: tab === t.id ? 1 : 0.6 }}>{t.icon}</span>
            <span style={{ fontSize: 10.5, fontWeight: tab === t.id ? 700 : 500 }}>{t.label}</span>
            {tab === t.id && <span style={styles.navDot} />}
          </button>
        ))}
      </nav>

      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
    background: 'var(--bg)',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: 8,
  },
  nav: {
    display: 'flex',
    borderTop: '1px solid var(--line)',
    background: 'var(--paper)',
    paddingBottom: 'env(safe-area-inset-bottom, 6px)',
    paddingTop: 6,
  },
  navBtn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    background: 'transparent',
    border: 'none',
    padding: '4px 0 8px',
    position: 'relative',
  },
  navDot: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: 'var(--accent-deep)',
  },
};
