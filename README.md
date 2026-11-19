# DialogAPI 中文使用手册

这里维护 DialogAPI 的中文文档和可运行示例。插件作者可以从手册复制 Maven 或 Gradle 配置，在 Paper 与 Folia 上创建原版对话框。[阅读使用手册](https://nicoppara.github.io/dialog-api-wiki/) · [查看实机示例](https://nicoppara.github.io/dialog-api-wiki/composition/)

## 安装文档站依赖

站点使用 Docusaurus。安装 Node.js 22，在本仓库根目录运行：

```sh
npm ci
```

## 本地预览

```sh
npm start
```

打开终端中显示的地址。编辑 `docs/` 下的中文页面时，浏览器会自动刷新。调整阅读顺序请编辑 `sidebars.js`。

## 构建

```sh
npm run build
```

构建会检查文档链接，并在 `build/` 中生成可部署的网站。每页的 Markdown、供 AI 使用的整站文本以及公开 Maven 构件都会随站点发布。

## 部署

推送到 `main` 后，GitHub Actions 会安装锁定的依赖、构建站点，并将 `build/` 直接部署到 GitHub Pages。也可以在仓库的 **Actions → 发布文档** 中手动运行。仓库的 **Settings → Pages → Source** 使用 **GitHub Actions**。[查看部署工作流](.github/workflows/pages.yml)
