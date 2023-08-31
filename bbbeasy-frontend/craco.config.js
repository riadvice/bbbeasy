/**
 * BBBEasy open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Affero General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BBBeasy is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with BBBEasy; if not, see <http://www.gnu.org/licenses/>.
 */

/* craco.config.js */

const path = require('path');
const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const CracoLessPlugin = require('craco-less');
const child_process = require('child_process');
const FastRefreshCracoPlugin = require('craco-fast-refresh');
const reactHotReloadPlugin = require('craco-plugin-react-hot-reload');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const cp = require('child_process');
function git(command) {
    return cp.execSync(`git ${command}`, { encoding: 'utf8' }, { shell: false }).trim();
}
module.exports = {
    webpack: {
        output: {
            clean: true,
        },
        plugins: [
            new WebpackBar({ profile: true }),
            new webpack.DefinePlugin({
                'INSTALLER_FEATURE': JSON.parse(process.env.INSTALLER_FEATURE),
            }),
            new CircularDependencyPlugin({
                exclude: /node_modules/,
                include: /src/,
                failOnError: true,
                allowAsyncCycles: false,
                cwd: process.cwd(),
            }),
            new webpack.EnvironmentPlugin({
                GIT_VERSION: git('describe --always'),
                GIT_AUTHOR_DATE: git('log -1 --format=%aI'),
            }),
        ],
        configure: (webpackConfig, { env, paths }) => {
            // paths.appPath='public'
            paths.appBuild = 'dist';
            webpackConfig.output = {
                ...webpackConfig.output,
                // ...{
                //   filename: whenDev(() => 'static/js/bundle.js', 'static/js/[name].js'),
                //   chunkFilename: 'static/js/[name].js'
                // },
                path: path.resolve(__dirname, 'dist'), // modify the output file directory
                publicPath: '/',
            };
            return webpackConfig;
        },
    },
    babel: {
        presets: [
            [
                '@babel/preset-env',
                {
                    modules: false, // do not convert the module file of ES6, so as to use tree shaping, sideeffects, etc
                    useBuiltIns: 'entry', // all gaskets not supported by browserlist environment are imported
                    // https://babeljs.io/docs/en/babel-preset-env#usebuiltins
                    // https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md
                    corejs: {
                        version: '3', // using core-js@3
                        proposals: true,
                    },
                },
            ],
        ],
        plugins: [
            'istanbul',
            //Configure parser
            ['@babel/plugin-proposal-decorators', { 'legacy': true }],
            ['@babel/plugin-proposal-class-properties', { 'loose': true }],
            ['@babel/plugin-proposal-private-methods', { 'loose': true }],
            ['@babel/plugin-proposal-private-property-in-object', { 'loose': true }],
            ['babel-plugin-styled-components', { 'displayName': true }],
        ],
        loaderOptions: (babelLoaderOptions, { env, paths }) => {
            return babelLoaderOptions;
        },
        plugin: [reactHotReloadPlugin, FastRefreshCracoPlugin],
    },
    plugins: [
        {
            plugin: CracoLessPlugin,
            options: {
                lessLoaderOptions: {
                    lessOptions: {
                        javascriptEnabled: true,
                    },
                },
            },
        },
    ],
    resolve: {
        alias: {
            'react-dom': '@hot-loader/react-dom',
        },
    },
};
