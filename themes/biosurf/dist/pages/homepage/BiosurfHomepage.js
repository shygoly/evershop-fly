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
const BiosurfHomepage = () => {
    return (React.createElement("div", { className: "space-y-24 bg-[color:var(--page-bg)] pb-24 text-[color:var(--text-primary)]" },
        React.createElement("section", { className: "relative overflow-hidden bg-gradient-to-br from-[#0f3b62] via-[#145b7b] to-[#0d937a]" },
            React.createElement("div", { className: "absolute inset-0 opacity-40 mix-blend-screen" },
                React.createElement("div", { className: "absolute -left-32 top-16 h-72 w-72 rounded-full bg-[#3cf0c5]/30 blur-3xl" }),
                React.createElement("div", { className: "absolute bottom-10 right-10 h-80 w-80 rounded-full bg-[#7cf0ff]/20 blur-3xl" })),
            React.createElement("div", { className: "relative mx-auto flex max-w-6xl flex-col gap-16 px-6 py-20 lg:flex-row lg:items-center" },
                React.createElement("div", { className: "max-w-xl space-y-8 text-white" },
                    React.createElement("div", { className: "inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur" },
                        React.createElement("span", { className: "h-2 w-2 rounded-full bg-[#3cf0c5]" }),
                        "BioSurf\u00B7AI \u667A\u80FD\u914D\u65B9\u63A8\u8350"),
                    React.createElement("h1", { className: "text-4xl font-bold leading-tight sm:text-5xl" }, "\u4E3A\u533B\u7597\u4E0E\u79D1\u7814\u5B9E\u9A8C\u5BA4\u6253\u9020\u7684\u751F\u7269\u6750\u6599\u7535\u5546\u4F53\u9A8C"),
                    React.createElement("p", { className: "text-lg text-white/80" }, "\u501F\u52A9 AI \u9A71\u52A8\u7684\u4EA7\u54C1\u77E5\u8BC6\u5E93\u4E0E\u667A\u80FD\u52A9\u7406\uFF0C\u5FEB\u901F\u627E\u5230\u7B26\u5408\u5B9E\u9A8C\u573A\u666F\u7684\u6D82\u5C42\u6750\u6599\u3001\u7EC6\u80DE\u8BD5\u5242\u4E0E\u4EEA\u5668\u8017\u6750\u3002"),
                    React.createElement("div", { className: "flex flex-wrap items-center gap-4" },
                        React.createElement("a", { href: "/collections/all", className: "button rounded-full px-6 py-3 text-base font-semibold shadow-lg shadow-[#3cf0c5]/30" }, "\u6D4F\u89C8\u5168\u90E8\u4EA7\u54C1"),
                        React.createElement("a", { href: "/account/register", className: "rounded-full border border-white/40 px-6 py-3 text-base font-semibold text-white transition hover:border-white hover:bg-white/10" }, "\u6CE8\u518C\u4F01\u4E1A\u8D26\u53F7")),
                    React.createElement("dl", { className: "grid grid-cols-2 gap-6 text-sm text-white/70 sm:grid-cols-4" },
                        React.createElement("div", null,
                            React.createElement("dt", { className: "font-semibold text-white" }, "1,200+"),
                            React.createElement("dd", null, "\u5168\u7403\u5408\u4F5C\u5B9E\u9A8C\u5BA4")),
                        React.createElement("div", null,
                            React.createElement("dt", { className: "font-semibold text-white" }, "48 \u5C0F\u65F6"),
                            React.createElement("dd", null, "\u91CD\u70B9\u57CE\u5E02\u52A0\u6025\u914D\u9001")),
                        React.createElement("div", null,
                            React.createElement("dt", { className: "font-semibold text-white" }, "ISO 13485"),
                            React.createElement("dd", null, "\u533B\u7597\u7EA7\u751F\u4EA7\u4F53\u7CFB")),
                        React.createElement("div", null,
                            React.createElement("dt", { className: "font-semibold text-white" }, "AI Copilot"),
                            React.createElement("dd", null, "\u5B9E\u65F6\u534F\u8BAE\u5EFA\u8BAE")))),
                React.createElement("div", { className: "relative w-full max-w-md self-stretch" },
                    React.createElement("div", { className: "absolute inset-0 rounded-[2.75rem] border border-white/20 bg-white/5 backdrop-blur" }),
                    React.createElement("div", { className: "relative flex h-full flex-col justify-between rounded-[2.75rem] bg-white/95 p-8 text-[color:var(--text-primary)] shadow-2xl" },
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("span", { className: "inline-flex items-center gap-2 rounded-full bg-[#e9fbf6] px-3 py-1 text-xs font-semibold text-[#0f937b]" }, "\u65B0\u54C1"),
                            React.createElement("h2", { className: "text-2xl font-bold" }, "Bio-Enzyme Cleaning Agent"),
                            React.createElement("p", { className: "text-sm text-[color:var(--text-muted)]" }, "\u9AD8\u5206\u5B50\u751F\u7269\u9176\u590D\u5408\u914D\u65B9\uFF0C\u5728 5 \u5206\u949F\u5185\u5206\u89E3 99.9% \u751F\u7269\u819C\u3002")),
                        React.createElement("div", { className: "grid grid-cols-3 gap-4 text-xs" },
                            React.createElement("div", { className: "rounded-2xl bg-[#f1faf8] p-3" },
                                React.createElement("p", { className: "font-semibold text-[#0f937b]" }, "pH 7.2"),
                                React.createElement("p", { className: "text-[color:var(--text-muted)]" }, "\u4E2D\u6027\u6E29\u548C")),
                            React.createElement("div", { className: "rounded-2xl bg-[#eef6ff] p-3" },
                                React.createElement("p", { className: "font-semibold text-[#146a88]" }, "\u533B\u7528\u7EA7"),
                                React.createElement("p", { className: "text-[color:var(--text-muted)]" }, "ISO \u8BA4\u8BC1")),
                            React.createElement("div", { className: "rounded-2xl bg-[#fdf0ff] p-3" },
                                React.createElement("p", { className: "font-semibold text-[#8a3ed1]" }, "AI \u8BC4\u5206"),
                                React.createElement("p", { className: "text-[color:var(--text-muted)]" }, "4.9 / 5"))),
                        React.createElement("div", { className: "flex items-center justify-between rounded-2xl bg-[#0f937b] px-5 py-4 text-white shadow-lg" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm" }, "\u5B9E\u9A8C\u5BA4\u5230\u8D27\u4EF7"),
                                React.createElement("p", { className: "text-2xl font-bold" }, "$29.99")),
                            React.createElement("a", { href: "/product/bio-enzyme-cleaning-agent", className: "rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0f937b]" }, "\u67E5\u770B\u8BE6\u60C5")))))),
        React.createElement("section", { className: "mx-auto max-w-6xl px-6" },
            React.createElement("div", { className: "flex flex-col gap-10 lg:flex-row" },
                React.createElement("div", { className: "lg:w-1/3" },
                    React.createElement("h2", { className: "text-2xl font-semibold" }, "AI \u52A9\u624B \u00B7 \u5373\u95EE\u5373\u7B54"),
                    React.createElement("p", { className: "mt-3 text-[color:var(--text-muted)]" }, "\u4E0A\u4F20\u5B9E\u9A8C\u65B9\u6848\u6216\u8F93\u5165\u76EE\u6807\u6307\u6807\uFF0CBioSurf AI \u5C06\u4E3A\u4F60\u5339\u914D\u9002\u7528\u7684\u6750\u6599\u3001\u63D0\u4F9B\u7528\u91CF\u5EFA\u8BAE\u5E76\u63D0\u9192\u5B58\u50A8\u8981\u6C42\u3002"),
                    React.createElement("div", { className: "mt-6 space-y-3" }, discoveryFilters.map((filter) => (React.createElement("div", { key: filter.value, className: "flex items-center justify-between rounded-2xl border border-[color:var(--card-border)] bg-white px-4 py-3" },
                        React.createElement("span", { className: "font-medium" }, filter.label),
                        React.createElement("span", { className: "text-xs text-[color:var(--text-muted)]" }, "AI \u76EE\u524D\u63A8\u8350 18 \u6B3E")))))),
                React.createElement("div", { className: "grid flex-1 gap-6 sm:grid-cols-2" }, discoveryProducts.map((product) => (React.createElement("article", { key: product.name, className: "group relative overflow-hidden rounded-3xl border border-[color:var(--card-border)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl" },
                    React.createElement("span", { className: "absolute right-4 top-4 rounded-full bg-[#0f937b]/10 px-3 py-1 text-xs font-semibold text-[#0f937b]" }, product.badge),
                    React.createElement("div", { className: "flex h-full flex-col justify-between gap-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("h3", { className: "text-lg font-semibold text-[color:var(--text-primary)]" }, product.name),
                            React.createElement("p", { className: "text-sm text-[color:var(--text-muted)]" }, product.description)),
                        React.createElement("p", { className: "text-xl font-semibold text-[#0f937b]" }, product.price),
                        React.createElement("a", { href: "/collections/all", className: "text-sm font-semibold text-[#146a88] transition group-hover:text-[#0f937b]" }, "\u52A0\u5165\u8D2D\u7269\u8F66 \u2192")))))))),
        React.createElement("section", { className: "mx-auto max-w-6xl px-6" },
            React.createElement("div", { className: "rounded-3xl bg-gradient-to-r from-[#f1faf8] via-white to-[#eef6ff] p-10 shadow-lg" },
                React.createElement("div", { className: "flex flex-col gap-10 lg:flex-row lg:items-center" },
                    React.createElement("div", { className: "lg:w-1/3" },
                        React.createElement("h2", { className: "text-2xl font-semibold text-[color:var(--text-primary)]" }, "\u4E34\u5E8A\u62A4\u7406\u4E13\u5C5E\u7CFB\u5217"),
                        React.createElement("p", { className: "mt-3 text-[color:var(--text-muted)]" }, "\u9488\u5BF9\u76AE\u80A4\u5FAE\u751F\u6001\u4E0E\u5C4F\u969C\u4FEE\u62A4\u7814\u53D1\uFF0C\u6DB5\u76D6\u6E05\u6D01\u3001\u4FEE\u62A4\u3001\u4FDD\u6E7F\u4E09\u5927\u73AF\u8282\u3002AI \u4F1A\u57FA\u4E8E\u80A4\u8D28\u3001\u6C14\u5019\u548C\u4F7F\u7528\u9891\u6B21\u63A8\u8350\u5408\u9002\u7684\u7EC4\u5408\u65B9\u6848\u3002")),
                    React.createElement("div", { className: "grid flex-1 gap-6 md:grid-cols-3" }, dailyRitual.map((item) => (React.createElement("article", { key: item.title, className: "flex flex-col justify-between rounded-3xl bg-white/80 p-6 shadow-md backdrop-blur transition hover:-translate-y-1 hover:shadow-xl" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("h3", { className: "text-lg font-semibold" }, item.title),
                            React.createElement("p", { className: "text-sm text-[color:var(--text-muted)]" }, item.subtitle)),
                        React.createElement("div", { className: "space-y-3" },
                            React.createElement("p", { className: "text-2xl font-semibold text-[#0f937b]" }, item.price),
                            React.createElement("div", { className: "rounded-2xl bg-[#0f937b]/8 px-3 py-2 text-xs text-[#0f937b]" }, item.insight),
                            React.createElement("a", { href: "/collections/skincare", className: "text-sm font-semibold text-[#146a88]" }, "\u67E5\u770B\u642D\u914D\u65B9\u6848 \u2192"))))))))),
        React.createElement("section", { className: "mx-auto max-w-6xl px-6" },
            React.createElement("div", { className: "flex flex-col gap-10 lg:flex-row lg:items-stretch" },
                React.createElement("div", { className: "lg:w-1/3 rounded-3xl border border-[color:var(--card-border)] bg-white p-8 shadow-md" },
                    React.createElement("h2", { className: "text-2xl font-semibold" }, "\u5B9E\u9A8C\u5BA4\u7CBE\u9009\u8865\u8D27"),
                    React.createElement("p", { className: "mt-3 text-[color:var(--text-muted)]" }, "\u7ED3\u5408\u6708\u5EA6\u91C7\u8D2D\u6570\u636E\u4E0E AI \u8865\u8D27\u6A21\u578B\uFF0C\u63D0\u524D\u8865\u5145\u5173\u952E\u8017\u6750\uFF0C\u51CF\u5C11\u505C\u673A\u7B49\u5F85\u65F6\u95F4\u3002"),
                    React.createElement("ul", { className: "mt-6 space-y-4 text-sm text-[color:var(--text-muted)]" },
                        React.createElement("li", { className: "flex items-start gap-3" },
                            React.createElement("span", { className: "mt-1 h-2 w-2 rounded-full bg-[#0f937b]" }),
                            "DMEM High Glucose \u00B7 7 \u5929\u5185\u5230\u8D27"),
                        React.createElement("li", { className: "flex items-start gap-3" },
                            React.createElement("span", { className: "mt-1 h-2 w-2 rounded-full bg-[#146a88]" }),
                            "Protein A/G Agarose \u00B7 \u652F\u6301 12 \u6B21\u6D17\u8131"),
                        React.createElement("li", { className: "flex items-start gap-3" },
                            React.createElement("span", { className: "mt-1 h-2 w-2 rounded-full bg-[#3cf0c5]" }),
                            "Human Epidermal Keratinocytes \u00B7 \u53CC\u500D\u8D28\u68C0")),
                    React.createElement("a", { href: "/account/login", className: "mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#146a88]" },
                        "\u767B\u5F55\u67E5\u770B AI \u8865\u8D27\u5EFA\u8BAE",
                        React.createElement("span", { "aria-hidden": true }, "\u2192"))),
                React.createElement("div", { className: "grid flex-1 gap-6 md:grid-cols-3" }, researchHighlights.map((item) => (React.createElement("article", { key: item.title, className: `flex flex-col justify-between overflow-hidden rounded-3xl border border-[color:var(--card-border)] bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl` },
                    React.createElement("div", { className: `h-36 w-full rounded-2xl bg-gradient-to-br ${item.accent}` }),
                    React.createElement("div", { className: "mt-6 space-y-2" },
                        React.createElement("h3", { className: "text-lg font-semibold text-[color:var(--text-primary)]" }, item.title),
                        React.createElement("p", { className: "text-sm text-[color:var(--text-muted)]" }, item.description)),
                    React.createElement("div", { className: "mt-6 flex items-center justify-between" },
                        React.createElement("span", { className: "text-xl font-semibold text-[#0f937b]" }, item.price),
                        React.createElement("a", { href: "/collections/research", className: "text-sm font-semibold text-[#146a88]" }, "\u52A0\u5165\u6E05\u5355"))))))))));
};
export const layout = {
    areaId: 'content',
    sortOrder: 10
};
export default BiosurfHomepage;
//# sourceMappingURL=BiosurfHomepage.js.map