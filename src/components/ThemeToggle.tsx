import React from 'react';
import { useTheme } from '../theme';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      style={{
        background: 'transparent',
        color: 'var(--text)',
        border: `1px solid var(--border)`,
        borderRadius: 10,
        padding: '6px 10px',
        cursor: 'pointer'
      }}
    >
      {isDark ? '🌞 Light' : '🌙 Dark'}
    </button>
  );
}