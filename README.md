# iOT 预言机 · Black & Gold Starter

黑金主题的 Next.js (App Router) + Tailwind 起步项目，内置首页与 `/docs` 文档页。

## 快速开始

```bash
# 使用 npm
npm i
npm run dev

# 或使用 pnpm / yarn
pnpm i && pnpm dev
# yarn && yarn dev
```

访问：<http://localhost:3000>

## 主要特性
- 黑金主题（Tailwind 自定义色）
- 首页 Hero、要点卡片、Demo 占位
- 文档中心 `/docs`（可扩展为多级）
- 申请试点表单 `/contact` + `/api/lead`

## 待接入（建议）
- 表单入库与邮件发送（Supabase / Resend / SendGrid）
- 状态页与分析埋点（Better Uptime / Vercel Analytics）
- i18n、多语言内容（next-intl）
- 真实 Demo 图表与链上浏览器链接

## 新增页面（本次增量）
- `/solutions` 以及行业子页：`/solutions/manufacturing`, `/solutions/agriculture`, `/solutions/cold-chain`, `/solutions/energy`
- `/pricing` 定价页（含三个套餐示例与计费口径）
- `/cases` 客户案例页（3 个模板卡片）
- 导航已切换为使用黑金 LOGO（`/public/logo.svg`）

## 新增（本次增量）
- 案例详情页（中文）：`/cases/manufacturing-line`, `/cases/seasia-cold-chain`, `/cases/green-energy-park`
- 英文版本（/en）：`/en`, `/en/docs`, `/en/solutions/*`, `/en/cases/*` 等
- 导航增加语言快捷链接（ZH / EN）
