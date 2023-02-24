// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Hivelvet Documentation',
  tagline: 'The Multi-purpose rooms manager for BigBlueButton',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/docs/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.png',
  organizationName: 'RIADVICE', // Usually your GitHub org/user name.
  projectName: 'hivelvet', // Usually your repo name.

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/riadvice/hivelvet/tree/develop/hivelvet-docs',
        },
        theme: {
          customCss: require.resolve('./src/css/hivelvet.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Hivelvet',
        logo: {
          alt: 'Hivelvet Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'user-guide/introduction/introduction-welcome',
            position: 'left',
            sidebarId: 'user',
            label: 'User Guide',
          },
          {
            type: 'doc',
            docId: 'administrator-guide/translate-your-site',
            sidebarId: 'administrator',
            position: 'left',
            label: 'Administrator Guide',
          },
          {
            type: 'doc',
            docId: 'developer-guide/translate-your-site',
            sidebarId: 'developer',
            position: 'left',
            label: 'Developer Guide',
          },
          {
            type: 'doc',
            docId: 'api-reference/overview',
            position: 'left',
            sidebarId: 'api',
            label: 'API',
          },
          {
            label: 'Discussions',
            href: 'https://github.com/riadvice/hivelvet/discussions',
            position: 'right',
          },
          {
            href: 'https://github.com/facebook/docusaurus',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'User Guide',
                to: '/user-guide/introduction/welcome',
              },
              {
                label: 'Administrator Guide',
                to: '/administrator-guide/translate-your-site',
              },
              {
                label: 'Developer Guide',
                to: '/developer-guide/translate-your-site',
              },
              {
                label: 'API',
                to: '/api-reference/overview',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discussions',
                href: 'https://github.com/riadvice/hivelvet/discussions',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/riadvice/hivelvet',
              },
            ],
          },
          {
            title: 'Commercial Support',
            items: [
              {
                label: 'RIADVICE',
                href: 'https://riadvice.tn/',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Hivelvet, RIADVICE SUARL. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
