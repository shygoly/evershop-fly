/**
 * Minimal floating Hello World widget
 * Renders a bottom-right button and a small popup panel
 */

import React, { useState } from 'react';

export default function HelloFloat() {
  const [open, setOpen] = useState(false);

  const btnStyle = {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    width: '56px',
    height: '56px',
    borderRadius: '28px',
    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(220,38,38,0.35)',
    zIndex: 9999
  } as React.CSSProperties;

  const panelStyle = {
    position: 'fixed',
    right: '20px',
    bottom: '86px',
    width: '260px',
    background: '#ffffff',
    color: '#111827',
    borderRadius: '12px',
    boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
    padding: '14px 16px',
    zIndex: 9999
  } as React.CSSProperties;

  return (
    <>
      {open && (
        <div style={panelStyle}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Hello, world! 👋</div>
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>
            这是一个测试浮窗。组件始终显示在页面右下角。
          </div>
        </div>
      )}
      <button aria-label="Hello widget" onClick={() => setOpen(!open)} style={btnStyle}>
        {open ? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor" />
          </svg>
        )}
      </button>
    </>
  );
}

export const layout = {
  areaId: 'body',
  sortOrder: 1100
};


