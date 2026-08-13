# 资产折旧管家（Depreciation Tracker）

一个**自用**的移动端 Web App（PWA），用来记录你买的东西、按天数或按次数计算折旧，并实时显示「今日折旧金额」。还支持：

- 后续处置回本（如旧手机卖掉换了 1000 元，自动重算日均摊销）
- 保质期提醒（食品等临期 / 过期高亮）
- 大 / 小分类自由管理（重命名、增删都不破坏历史记录）
- 本地存储 + JSON 导出 / 导入备份
- 可「添加到主屏幕」当作原生 App 使用

## 功能说明

| 页面 | 作用 |
| --- | --- |
| 首页 | 显示**今日折旧总额**（按天数法 / 按次数法拆分），列出所有在用物品卡片 |
| 汇总 | 所有卡片，**在用排前面、已处置排后面（灰色）**，可按分类筛选 |
| 提醒 | 有保质期的物品，按剩余天数升序，临期 / 过期高亮 |
| 分类 | 管理大分类与小分类，可新增 / 改名 / 删除 |
| 设置 | 导出 / 导入 JSON 备份、清空数据 |

### 折旧计算

- **按天数**：每张卡片显示两个金额
  - 预计日均摊销 = 实际摊销金额 ÷ 预计使用总天数（年×365 / 月×30 / 日×1）
  - 已用天数日均 = 实际摊销金额 ÷ 已使用天数
- **按次数**：显示「每次摊销」与「已摊销金额」，可点「记录一次使用」累计
- **后续处置**：实际摊销金额 = 购置价 − 回本金额（如卖掉所得），处置后卡片显示「最终日均摊销」

> 实际摊销金额在物品「已处置」时自动扣减回本金额，因此摊销更准确。

每张卡片可单独开关「计入今日折旧」，未勾选的物品不汇入首页的今日总额。

## 本地运行

```bash
npm install
npm run dev      # 本地开发，浏览器打开提示的地址
npm run build    # 类型检查 + 打包到 dist/
npm run preview  # 预览打包结果
```

## 部署到 GitHub Pages（免费）

1. 把整个仓库 `git push` 到 GitHub
2. 仓库 **Settings → Pages**，Source 选择 `GitHub Actions` 或 `Deploy from a branch` → `main` / `dist`
3. 项目已设置 `base: './'`，可直接以子路径访问

想用官方 actions 自动部署，可在 `.github/workflows/deploy.yml` 加一段：

```yaml
name: Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm install && npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    permissions: { pages: write, id-token: write }
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

## 数据存储

所有数据保存在浏览器 `localStorage`（键名 `depreciation-tracker`）。换手机或清缓存前，请到「设置 → 导出备份」下载 JSON；新设备导入即可恢复。

## 目录结构

```
depreciation-tracker/
├── public/            # 静态资源（PWA 图标、manifest、service worker）
├── src/
│   ├── components/    # ItemCard / ItemForm / DisposalForm / Modal / CategoryBadge
│   ├── lib/           # calc(折旧计算) / date / id / useNow
│   ├── pages/         # Dashboard / Summary / Reminders / Categories / Settings
│   ├── store/         # useStore (Zustand + 持久化)
│   ├── types.ts       # 数据模型
│   ├── App.tsx        # 导航与模态
│   ├── main.tsx
│   └── styles.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 技术栈

React 18 + TypeScript + Vite + Zustand。无后端，纯前端 PWA。
