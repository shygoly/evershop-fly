import React from 'react';

const Venia: React.FC = () => {
  return (
    <section className="bg-[color:var(--accent-50)] text-[color:var(--accent-900)] py-16 border-b border-[color:var(--border)]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[3fr,2fr] items-center">
          <div className="space-y-6 text-left">
            <span className="uppercase tracking-[0.3em] text-sm text-[color:var(--accent-600)]">
              Venia Collection
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-[color:var(--text)]">
              Elevate every journey with a modern storefront experience
            </h1>
            <p className="text-lg text-[color:var(--textSubdued)] max-w-2xl">
              This EverShop theme ports the clean geometry and blue accents of Magento PWA Studio’s Venia UI. It ships with deliberate spacing, soft backgrounds, and expressive primary actions so content stays front and center.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/collections/all"
                className="button px-6 py-3 rounded-md font-medium shadow-md shadow-[color:var(--accent-100)]"
              >
                Explore products
              </a>
              <a
                href="/collections/new-arrivals"
                className="button bg-[color:var(--surface)] text-[color:var(--accent-700)] border border-[color:var(--accent-200)] hover:bg-[color:var(--accent-100)]"
              >
                View new arrivals
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-[color:var(--accent-100)] to-[color:var(--accent-300)] shadow-xl shadow-[rgba(41,84,255,0.18)]" />
            <div className="absolute inset-6 flex flex-col justify-between text-left text-[color:var(--surface)]">
              <div className="text-sm tracking-widest">Crafted for React & GraphQL</div>
              <div>
                <p className="text-2xl font-semibold">Performance-first components</p>
                <p className="mt-2 text-sm text-[rgba(255,255,255,0.85)]">
                  Modular sections, global tokens, and intuitive defaults inspired by Venia so you can launch quickly and iterate confidently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export default Venia;
