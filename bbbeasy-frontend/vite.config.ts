/**
 * BBBEasy open source platform - https://riadvice.com/
 *
 * Copyright (c) 2022-2026 RIADVICE SUARL and by respective authors (see below).
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

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import istanbul from 'vite-plugin-istanbul';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [
            react(),
            tsconfigPaths(),
            istanbul({
                include: 'src/*',
                exclude: ['node_modules', 'test/', 'tests/'],
                extension: ['.ts', '.tsx'],
                requireEnv: true,
                cypress: true,
            }),
        ],

        build: {
            outDir: 'dist',
            sourcemap: env.GENERATE_SOURCEMAP !== 'false',
            emptyOutDir: true,
        },
        server: {   
            host: true,
            port: 3300,
            strictPort: true,   
            allowedHosts: ['bbbeasy.test', 'localhost', '127.0.0.1',"snooper-foe-cosigner.ngrok-free.dev"],
            open: env.NODE_ENV === 'development' ? 'http://bbbeasy.test/' : false,
            proxy: {
                '/api': {
                    target: env.VITE_API_URL ?? 'http://bbbeasy.test/api',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, '/api'),
                },
            },
        },
        css: {
            preprocessorOptions: {
                less: {
                    javascriptEnabled: true,
                },
            },
        },
    };
});
