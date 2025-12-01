import React from 'react';

export default function ChatbotDemo() {
  return (
    <div style={{ minHeight: '60vh', padding: '24px' }}>
      <h1>Chatbot demo</h1>
      <p>此页仅用于验证扩展前端渲染与静态样式。</p>

      <button
        id="hello-float-btn"
        title="Hello"
        onClick={() => {
          const p = document.getElementById('hello-float-panel');
          if (p) p.style.display = p.style.display === 'none' ? 'block' : 'none';
        }}
        style={{
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
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px'
        }}
      >
        💬
      </button>

      <div
        id="hello-float-panel"
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '86px',
          width: '260px',
          background: '#fff',
          color: '#111827',
          borderRadius: '12px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
          padding: '14px 16px',
          zIndex: 9999,
          display: 'none'
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Hello, world! 👋</div>
        <div style={{ fontSize: 14, lineHeight: 1.5 }}>
          这是一个测试浮窗。用于验证扩展已成功渲染到前端。
        </div>
      </div>
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 1
};


