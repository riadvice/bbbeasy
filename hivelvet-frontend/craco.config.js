/**
 * Hivelvet open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * Hivelvet is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with Hivelvet; if not, see <http://www.gnu.org/licenses/>.
 */

/* craco.config.js */
const CracoLessPlugin = require('craco-less');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin')
const webpack = require('webpack')
const path = require('path');

module.exports = {
    webpack: {
        output: {
            clean: true,
        },
        plugins: [
            new SimpleProgressWebpackPlugin(),
            new webpack.DefinePlugin({
                'INSTALLER_FEATURE': JSON.stringify(process.env.INSTALLER_FEATURE),
            }),
        ]
    },
    babel: {
        presets: [],
        plugins: []
    },
    plugins: [
        {
            plugin: CracoLessPlugin,
            options: {
                lessLoaderOptions: {
                    lessOptions: {
                        modifyVars: {
                            '@primary-color': '#fbbc0b', // primary color for all components
                            '@border-color-base': '#dddfe1', // major border color
                        },
                        javascriptEnabled: true,
                    },
                },
            },
        },
    ],
};
