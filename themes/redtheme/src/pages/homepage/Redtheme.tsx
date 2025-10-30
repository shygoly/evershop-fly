import React from 'react';

const Redtheme: React.FC = () => {
  return (
    <section className="bg-[color:var(--accent-50)] text-[color:var(--accent-800)] py-16">
      <div className="max-w-5xl mx-auto px-4 text-center space-y-8">
        <span className="uppercase tracking-widest text-sm text-[color:var(--accent-600)]">
          EverShop Red Edition
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold">
          用热情的红色，为你的品牌点燃第一印象
        </h1>
        <p className="text-lg md:text-xl text-[color:var(--accent-700)]">
          这套主题强化了主色调、按钮、导航与强调色，保持原有布局的同时呈现更具冲击力的视觉体验。
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/collections/all"
            className="button px-6 py-3 rounded-md font-medium shadow-md shadow-[color:var(--accent-200)]"
          >
            立即选购
          </a>
          <a
            href="/contact"
            className="button bg-[color:var(--accent-100)] text-[color:var(--accent-700)] border border-[color:var(--accent-200)] hover:bg-[color:var(--accent-200)] hover:text-[color:var(--accent-900)]"
          >
            联系我们
          </a>
        </div>
      </div>
    </section>
  );
};

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export default Redtheme;
