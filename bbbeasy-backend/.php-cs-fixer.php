<?php

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

declare(strict_types=1);

$header = <<<'EOF'
BBBEasy open source platform - https://riadvice.tn/

Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).

This program is free software; you can redistribute it and/or modify it under the
terms of the GNU Affero General Public License as published by the Free Software
Foundation; either version 3.0 of the License, or (at your option) any later
version.

BBBeasy is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along
with BBBeasy. If not, see <https://www.gnu.org/licenses/>
EOF;

$finder = PhpCsFixer\Finder::create()
    ->files()
    ->name(['*.php', '*.ini'])
    ->in(__DIR__ . '/app/src')
    ->in(__DIR__ . '/app/i18n')
    ->in(__DIR__ . '/db')
    ->in(__DIR__ . '/tests');

$config = new PhpCsFixer\Config();
$config
    ->setRiskyAllowed(true)
    ->setRules([
        '@PHP82Migration' => true,
        '@PhpCsFixer' => true,
        '@PhpCsFixer:risky' => true,
        'general_phpdoc_annotation_remove' => ['annotations' => ['expectedDeprecation']], // one should use PHPUnit built-in method instead
        'header_comment' => ['header' => $header],
        'concat_space' => ['spacing' => 'one'],
        'function_declaration' => ['closure_function_spacing' => 'none'],
        'constant_case' => ['case' => 'lower'],
        'single_quote' => true,
        'mb_str_functions' => true,
        'array_syntax' => ['syntax' => 'short'],
        'binary_operator_spaces' => ['operators' =>
            ['=>' => 'align_single_space_minimal', '=' => 'align_single_space_minimal']
        ],
    ])
    ->setFinder($finder);

return $config;
