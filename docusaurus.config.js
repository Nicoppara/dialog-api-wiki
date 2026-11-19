const { themes } = require('prism-react-renderer');

module.exports = {
  title: 'DialogAPI',
  url: 'https://nicoppara.github.io',
  baseUrl: '/dialog-api-wiki/',
  trailingSlash: true,
  organizationName: 'Nicoppara',
  projectName: 'dialog-api-wiki',
  i18n: { defaultLocale: 'zh-Hans', locales: ['zh-Hans'] },
  onBrokenLinks: 'throw',
  markdown: { hooks: { onBrokenMarkdownLinks: 'throw' } },
  presets: [['classic', {
    docs: { routeBasePath: '/', sidebarPath: require.resolve('./sidebars.js') },
    blog: false,
    theme: { customCss: require.resolve('./src/css/custom.css') }
  }]],
  plugins: ['./plugins/ai-docs.mjs'],
  themes: [['@easyops-cn/docusaurus-search-local', {
    hashed: true, language: ['zh', 'en'], docsRouteBasePath: '/', indexBlog: false
  }]],
  themeConfig: {
    colorMode: { respectPrefersColorScheme: true },
    navbar: {
      title: 'DialogAPI',
      items: [
        { type: 'docSidebar', sidebarId: 'guide', label: '使用手册', position: 'left' },
        { href: 'https://github.com/Nicoppara/dialog-api-wiki', label: 'GitHub', position: 'right' }
      ]
    },
    prism: { theme: themes.github, darkTheme: themes.dracula, additionalLanguages: ['java', 'kotlin', 'powershell'] }
  }
};
