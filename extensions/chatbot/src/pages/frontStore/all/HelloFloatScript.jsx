import React from 'react';

export default function HelloFloatScript() {
  const code = `
  (function(){
    if (document.getElementById('hello-float-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'hello-float-btn';
    btn.setAttribute('aria-label','Hello widget');
    Object.assign(btn.style, {
      position: 'fixed', right: '20px', bottom: '20px', width: '56px', height: '56px',
      borderRadius: '28px', background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(220,38,38,0.35)', zIndex: 9999
    });
    const panel = document.createElement('div');
    panel.id = 'hello-float-panel';
    Object.assign(panel.style, {
      position: 'fixed', right: '20px', bottom: '86px', width: '260px', background: '#fff', color: '#111827',
      borderRadius: '12px', boxShadow: '0 12px 32px rgba(0,0,0,0.15)', padding: '14px 16px', zIndex: 9999, display: 'none'
    });
    panel.innerHTML = '<div style="font-weight:700;margin-bottom:6px">Hello, world! 👋</div><div style="font-size:14px;line-height:1.5">这是一个测试浮窗。组件始终显示在页面右下角。</div>';
    const icon = document.createElementNS('http://www.w3.org/2000/svg','svg');
    icon.setAttribute('width','26'); icon.setAttribute('height','26'); icon.setAttribute('viewBox','0 0 24 24'); icon.setAttribute('fill','none');
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d','M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z');
    path.setAttribute('fill','currentColor');
    icon.appendChild(path);
    btn.appendChild(icon);
    btn.addEventListener('click', function(){
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
    document.body.appendChild(panel);
    document.body.appendChild(btn);
  })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export const layout = {
  areaId: 'body',
  sortOrder: 1200
};


