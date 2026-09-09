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

import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['dist', 'node_modules', 'tests', 'public', 'build'] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended, react.configs.flat.recommended],
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
        },
        rules: {
            'react/prop-types': 'off',
            // Destructuring a prop only to keep it out of the rest element is how a
            // component stops a non DOM prop reaching the element it spreads onto.
            '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
            'react/react-in-jsx-scope': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-interface': 'warn',
            'no-shadow': 'off',
            '@typescript-eslint/no-shadow': 'off',
            'no-use-before-define': 'off',
            '@typescript-eslint/no-use-before-define': 'error',
            'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
            complexity: ['error', 15],
            'no-await-in-loop': 'warn',
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'prefer-promise-reject-errors': 'warn',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            eqeqeq: ['error', 'always', { null: 'ignore' }],
            'no-implicit-coercion': ['error', { boolean: true, number: false, string: false }],
            'react/jsx-boolean-value': ['error', 'never'],
            'react/jsx-no-useless-fragment': 'error',
            'react/jsx-key': 'error',
            'prefer-template': 'error',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    }
);
