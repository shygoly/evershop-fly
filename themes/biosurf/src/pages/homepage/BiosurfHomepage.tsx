import React from 'react';

const discoveryFilters = [
  { label: '抗体', value: 'antibodies' },
  { label: 'ELISA 试剂盒', value: 'elisa' },
  { label: '细胞', value: 'cells' },
  { label: '培养基', value: 'media' }
];

const discoveryProducts = [
  {
    name: 'Anti-GAPDH 抗体',
    price: '$129.00',
    badge: 'AI 推荐',
    description: '适用于人源细胞，交叉反应小于 0.5%'
  },
  {
    name: 'PCR Master Mix (HR)',
    price: '$85.00',
    badge: '库存充足',
    description: '预混体系，室温稳定 14 天'
  },
  {
    name: 'Human IL-6 ELISA Kit',
    price: '$150.00',
    badge: '临床级',
    description: '灵敏度 0.8 pg/mL'
  },
  {
    name: 'BSA (Bovine Serum)',
    price: '$65.00',
    badge: '热门',
    description: '≥ 98% 纯度，低内毒素'
  }
];

const dailyRitual = [
  {
    title: 'Bio-Active Serum',
    subtitle: '深层再生配方',
    price: '$59.99',
    insight: 'AI 建议搭配维稳肽精华'
  },
  {
    title: 'Cellular Renewal Cream',
    subtitle: '夜间修护 · 强韧屏障',
    price: '$42.00',
    insight: '推荐每周搭配光疗面膜'
  },
  {
    title: 'Hydro-Boosting Cleanser',
    subtitle: '低泡氨基酸 · 无皂基',
    price: '$24.99',
    insight: '与你的皮肤生物钟匹配'
  }
];

const researchHighlights = [
  {
    title: 'Human EGF',
    price: '$180.00',
    description: '重组来源 · GMP 级纯化',
    accent: 'from-[#c5ffe8] to-[#74e2c1]'
  },
  {
    title: 'HEK 293 Cell Line',
    price: '$450.00',
    description: '冻存包 · 1.2 x 10⁷ cells/vial',
    accent: 'from-[#b3e9ff] to-[#5fbef5]'
  },
  {
    title: 'CRISPR-Cas9 Kit',
    price: '$620.00',
    description: '含 gRNA 设计工具与质粒',
    accent: 'from-[#fff1c5] to-[#ffd369]'
  }
];

const BiosurfHomepage: React.FC = () => {
  return (
    <div className="space-y-24 bg-[color:var(--page-bg)] pb-24 text-[color:var(--text-primary)]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f3b62] via-[#145b7b] to-[#0d937a]">
        <div className="absolute inset-0 opacity-40 mix-blend-screen">
          <div className="absolute -left-32 top-16 h-72 w-72 rounded-full bg-[#3cf0c5]/30 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-[#7cf0ff]/20 blur-3xl" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 py-20 lg:flex-row lg:items-center">
          <div className="max-w-xl space-y-8 text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#3cf0c5]" />
              BioSurf·AI 智能配方推荐
            </div>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              为医疗与科研实验室打造的生物材料电商体验
            </h1>
            <p className="text-lg text-white/80">
              借助 AI 驱动的产品知识库与智能助理，快速找到符合实验场景的涂层材料、细胞试剂与仪器耗材。
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="/collections/all"
                className="button rounded-full px-6 py-3 text-base font-semibold shadow-lg shadow-[#3cf0c5]/30"
              >
                浏览全部产品
              </a>
              <a
                href="/account/register"
                className="rounded-full border border-white/40 px-6 py-3 text-base font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                注册企业账号
              </a>
            </div>
            <dl className="grid grid-cols-2 gap-6 text-sm text-white/70 sm:grid-cols-4">
              <div>
                <dt className="font-semibold text-white">1,200+</dt>
                <dd>全球合作实验室</dd>
              </div>
              <div>
                <dt className="font-semibold text-white">48 小时</dt>
                <dd>重点城市加急配送</dd>
              </div>
              <div>
                <dt className="font-semibold text-white">ISO 13485</dt>
                <dd>医疗级生产体系</dd>
              </div>
              <div>
                <dt className="font-semibold text-white">AI Copilot</dt>
                <dd>实时协议建议</dd>
              </div>
            </dl>
          </div>
          <div className="relative w-full max-w-md self-stretch">
            <div className="absolute inset-0 rounded-[2.75rem] border border-white/20 bg-white/5 backdrop-blur" />
            <div className="relative flex h-full flex-col justify-between rounded-[2.75rem] bg-white/95 p-8 text-[color:var(--text-primary)] shadow-2xl">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#e9fbf6] px-3 py-1 text-xs font-semibold text-[#0f937b]">
                  新品
                </span>
                <h2 className="text-2xl font-bold">Bio-Enzyme Cleaning Agent</h2>
                <p className="text-sm text-[color:var(--text-muted)]">
                  高分子生物酶复合配方，在 5 分钟内分解 99.9% 生物膜。
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="rounded-2xl bg-[#f1faf8] p-3">
                  <p className="font-semibold text-[#0f937b]">pH 7.2</p>
                  <p className="text-[color:var(--text-muted)]">中性温和</p>
                </div>
                <div className="rounded-2xl bg-[#eef6ff] p-3">
                  <p className="font-semibold text-[#146a88]">医用级</p>
                  <p className="text-[color:var(--text-muted)]">ISO 认证</p>
                </div>
                <div className="rounded-2xl bg-[#fdf0ff] p-3">
                  <p className="font-semibold text-[#8a3ed1]">AI 评分</p>
                  <p className="text-[color:var(--text-muted)]">4.9 / 5</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#0f937b] px-5 py-4 text-white shadow-lg">
                <div>
                  <p className="text-sm">实验室到货价</p>
                  <p className="text-2xl font-bold">$29.99</p>
                </div>
                <a href="/product/bio-enzyme-cleaning-agent" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0f937b]">
                  查看详情
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="lg:w-1/3">
            <h2 className="text-2xl font-semibold">AI 助手 · 即问即答</h2>
            <p className="mt-3 text-[color:var(--text-muted)]">
              上传实验方案或输入目标指标，BioSurf AI 将为你匹配适用的材料、提供用量建议并提醒存储要求。
            </p>
            <div className="mt-6 space-y-3">
              {discoveryFilters.map((filter) => (
                <div
                  key={filter.value}
                  className="flex items-center justify-between rounded-2xl border border-[color:var(--card-border)] bg-white px-4 py-3"
                >
                  <span className="font-medium">{filter.label}</span>
                  <span className="text-xs text-[color:var(--text-muted)]">AI 目前推荐 18 款</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid flex-1 gap-6 sm:grid-cols-2">
            {discoveryProducts.map((product) => (
              <article
                key={product.name}
                className="group relative overflow-hidden rounded-3xl border border-[color:var(--card-border)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="absolute right-4 top-4 rounded-full bg-[#0f937b]/10 px-3 py-1 text-xs font-semibold text-[#0f937b]">
                  {product.badge}
                </span>
                <div className="flex h-full flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">{product.name}</h3>
                    <p className="text-sm text-[color:var(--text-muted)]">{product.description}</p>
                  </div>
                  <p className="text-xl font-semibold text-[#0f937b]">{product.price}</p>
                  <a
                    href="/collections/all"
                    className="text-sm font-semibold text-[#146a88] transition group-hover:text-[#0f937b]"
                  >
                    加入购物车 →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#f1faf8] via-white to-[#eef6ff] p-10 shadow-lg">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
            <div className="lg:w-1/3">
              <h2 className="text-2xl font-semibold text-[color:var(--text-primary)]">临床护理专属系列</h2>
              <p className="mt-3 text-[color:var(--text-muted)]">
                针对皮肤微生态与屏障修护研发，涵盖清洁、修护、保湿三大环节。AI 会基于肤质、气候和使用频次推荐合适的组合方案。
              </p>
            </div>
            <div className="grid flex-1 gap-6 md:grid-cols-3">
              {dailyRitual.map((item) => (
                <article
                  key={item.title}
                  className="flex flex-col justify-between rounded-3xl bg-white/80 p-6 shadow-md backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm text-[color:var(--text-muted)]">{item.subtitle}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-2xl font-semibold text-[#0f937b]">{item.price}</p>
                    <div className="rounded-2xl bg-[#0f937b]/8 px-3 py-2 text-xs text-[#0f937b]">
                      {item.insight}
                    </div>
                    <a href="/collections/skincare" className="text-sm font-semibold text-[#146a88]">
                      查看搭配方案 →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch">
          <div className="lg:w-1/3 rounded-3xl border border-[color:var(--card-border)] bg-white p-8 shadow-md">
            <h2 className="text-2xl font-semibold">实验室精选补货</h2>
            <p className="mt-3 text-[color:var(--text-muted)]">
              结合月度采购数据与 AI 补货模型，提前补充关键耗材，减少停机等待时间。
            </p>
            <ul className="mt-6 space-y-4 text-sm text-[color:var(--text-muted)]">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#0f937b]" />
                DMEM High Glucose · 7 天内到货
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#146a88]" />
                Protein A/G Agarose · 支持 12 次洗脱
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#3cf0c5]" />
                Human Epidermal Keratinocytes · 双倍质检
              </li>
            </ul>
            <a
              href="/account/login"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#146a88]"
            >
              登录查看 AI 补货建议
              <span aria-hidden>→</span>
            </a>
          </div>
          <div className="grid flex-1 gap-6 md:grid-cols-3">
            {researchHighlights.map((item) => (
              <article
                key={item.title}
                className={`flex flex-col justify-between overflow-hidden rounded-3xl border border-[color:var(--card-border)] bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className={`h-36 w-full rounded-2xl bg-gradient-to-br ${item.accent}`} />
                <div className="mt-6 space-y-2">
                  <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">{item.title}</h3>
                  <p className="text-sm text-[color:var(--text-muted)]">{item.description}</p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xl font-semibold text-[#0f937b]">{item.price}</span>
                  <a href="/collections/research" className="text-sm font-semibold text-[#146a88]">
                    加入清单
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export default BiosurfHomepage;
