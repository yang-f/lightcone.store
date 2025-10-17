AI 导航网站（GitHub Pages）

概述
本项目是一个纯前端的 AI 导航网站，使用 GitHub Pages 托管。包含搜索、分类筛选、收藏、深浅色主题、离线数据（JSON）。

本地预览
- 使用任意静态服务器（推荐 VS Code Live Server 或 `python3 -m http.server`）

目录结构
```
.
├── index.html
├── assets/
│   ├── app.js
│   ├── styles.css
│   └── data.json
└── README.md
```

开发
1. 编辑 `assets/data.json` 以添加或更新站点条目
2. 自定义 `assets/styles.css` 以调整主题与样式
3. 在 `assets/app.js` 中扩展渲染、搜索和筛选逻辑

数据结构（assets/data.json）
```json
{
  "categories": [
    { "id": "models", "name": "大模型" },
    { "id": "tools", "name": "工具" },
    { "id": "agents", "name": "智能体" }
  ],
  "sites": [
    {
      "id": "openai",
      "name": "OpenAI",
      "url": "https://openai.com",
      "description": "GPT 模型与平台",
      "categoryIds": ["models"],
      "tags": ["GPT", "LLM"],
      "icon": "https://www.google.com/s2/favicons?sz=64&domain=openai.com"
    }
  ]
}
```

部署到 GitHub Pages
方法 A：项目主页（main 分支 / 根目录）
1. 将代码推送到 GitHub 仓库，例如 `username/ai-nav`
2. 打开仓库 Settings → Pages
3. Source 选择 `Deploy from a branch`
4. 分支选择 `main`，文件夹选择 `/ (root)`，保存
5. 稍等片刻，访问 `https://username.github.io/ai-nav/`

方法 B：用户/组织主页（`username.github.io` 仓库）
1. 创建名为 `username.github.io` 的仓库
2. 推送本项目代码到该仓库根目录
3. 直接访问 `https://username.github.io/`

（可选）工作流自动部署
在仓库创建 `.github/workflows/pages.yml`：
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - id: deployment
        uses: actions/deploy-pages@v4
```

自定义域名（可选）
1. 在仓库 `Settings → Pages` 添加自定义域名
2. 在 DNS 添加 CNAME 记录指向 `username.github.io`
3. 在仓库根目录创建 `CNAME` 文件，内容为你的域名（例如 `ai.example.com`）

常见问题
- 页面空白：确认 `data.json` 能从站点根路径正确获取；本地需使用静态服务器
- 样式不生效：检查 `assets/styles.css` 引用路径
- 404：GitHub Pages 部署需要 1-5 分钟生效


