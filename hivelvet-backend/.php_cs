<?php

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

// Invoke the config easily with `php-cs-fixer fix`

$finder = PhpCsFixer\Finder::create()
    ->files()
    ->name('*.php')
    ->in(__DIR__ . '/app/src')
    ->in(__DIR__ . '/app/i18n')
    ->in(__DIR__ . '/db')
    ->in(__DIR__ . '/tests');

return PhpCsFixer\Config::create()
    ->setUsingCache(false)
    ->setRules(array(
        'psr4'                               => true,
        'encoding'                           => true,
        'full_opening_tag'                   => true,
        'braces'                             => true,
        'elseif'                             => true,
        'single_blank_line_at_eof'           => true,
        'no_spaces_after_function_name'      => true,
        'function_declaration'               => true,
        'blank_line_after_namespace'         => true,
        'blank_line_before_statement'        => true,
        'lowercase_constants'                => true,
        'lowercase_keywords'                 => true,
        'method_argument_space'              => true,
        'no_closing_tag'                     => true,
        'no_trailing_whitespace'             => true,
        'visibility_required'                => true,
        'blank_line_after_opening_tag'       => true,
        'no_empty_statement'                 => true,
        'no_extra_blank_lines'               => true,
        'function_typehint_space'            => true,
        'include'                            => true,
        'single_blank_line_before_namespace' => true,
        'no_blank_lines_after_phpdoc'        => true,
        'object_operator_without_whitespace' => true,
        'phpdoc_indent'                      => true,
        'phpdoc_align'                       => true,
        'void_return'                        => true,
        'self_accessor'                      => true,
        'no_trailing_comma_in_list_call'     => true,
        'single_quote'                       => true,
        'cast_spaces'                        => true,
        'standardize_not_equals'             => true,
        'ternary_operator_spaces'            => true,
        'no_unneeded_control_parentheses'    => true,
        'no_unused_imports'                  => true,
        'linebreak_after_opening_tag'        => true,
        'mb_str_functions'                   => true,
        'array_syntax'                       => ['syntax' => 'short'],
        'binary_operator_spaces'             => [
            'align_double_arrow' => true,
            'align_equals'       => true,
        ]
    ))
    ->setFinder($finder);
