# GitHub Pages 自动部署（静态站）

## 1) 建仓并推送（首次）
1. 在 GitHub 创建一个新仓库（例如：baimo-model-site）。
2. 在本地把站点当作仓库目录初始化：

```bash
cd '/Users/beverley/Documents/ChatGPT/室内设计/白模项目'
git init
git branch -M main
git add .
git commit -m "feat: add static white model site"

# 连接你的远程仓库
git remote add origin git@github.com:<你的用户名>/<你的仓库名>.git
# 或 git remote add origin https://github.com/<你的用户名>/<你的仓库名>.git

git push -u origin main
```

## 2) 启用 GitHub Pages
1. 打开仓库页面 -> Settings -> Pages。
2. Source 选择：GitHub Actions。
3. 等待 Action `Deploy to GitHub Pages` 自动运行完成。
4. 页面发布地址会显示在同一页面上：
   - 完整版：`https://<你的用户名>.github.io/<仓库名>/`
   - 邻居版：`https://<你的用户名>.github.io/<仓库名>/neighbor.html`

## 3) 每次更新发布（自动）
你只要推送到 main：

```bash
git add .
git commit -m "update site"
git push
```

Action 会自动触发并发布。

## 4) 版本入口说明
- `index.html`：完整版（保留全部功能）。
- `neighbor.html`：跳转到 `index.html?mode=neighbor`，用于邻居演示（公开展示版）。

## 5) 可选：自定义域名（后续）
1. 在仓库根目录添加 `CNAME` 文件（内容如 `xxx.yourdomain.com`）。
2. 在仓库 Pages 设置里配置 custom domain。
3. 在域名服务商加好 DNS CNAME 记录。
