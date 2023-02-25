// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Hivelvet Documentation',
  tagline: 'The Multi-purpose rooms manager for BigBlueButton',
  favicon: 'img/favicon.png',

  // Set the production url of your site here
  url: 'https://your-docusaurus-test-site.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/docs',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'RIADVICE', // Usually your GitHub org/user name.
  projectName: 'hivelvet', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: "guides",
          routeBasePath: "/guides",
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/riadvice/hivelvet/tree/develop/hivelvet-docs',
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
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Hivelvet',
        logo: {
          alt: 'Hivelvet Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'user-guide/congratulations',
            position: 'left',
            sidebarId: 'user',
            label: 'User Guide',
          },
          {
            type: 'doc',
            docId: 'administrator-guide/manage-docs-versions',
            sidebarId: 'administrator',
            position: 'left',
            label: 'Administrator Guide',
          },
          {
            type: 'doc',
            docId: 'developer-guide/hivelvet-configuration-utility',
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
                to: '/administrator-guide/manage-docs-versions',
              },
              {
                label: 'Developer Guide',
                to: '/developer-guide/hivelvet-configuration-utility',
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
        copyright: `Copyright © 2022-${new Date().getFullYear()} Hivelvet, RIADVICE SUARL. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
