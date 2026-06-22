<?php

declare(strict_types=1);

/*
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
 * with BBBeasy. If not, see <https://www.gnu.org/licenses/>
 */

return [
    'i18n' => [
        'label' => [
            'core' => [
                'email'         => 'Email',
                'password'      => 'Password',
                'password_hint' => 'Password (8 characters at minimum)',
                'first_name'    => 'First Name',
                'last_name'     => 'Last Name',
                'back'          => 'Back',
                'submit'        => 'Submit',
                'confirm'       => 'Approve',
                'cancel'        => 'Cancel',
            ],

            'menu' => [
                'users' => 'Users',
            ],

            'dashboard' => [
                'sessions' => 'Sessions',
            ],

            'user' => [
                'users'  => 'Users',
                'user'   => 'User',
                'email'  => 'Email',
                'role'   => 'Role',
                'status' => 'Status',
            ],
            'mail' => [
                'hi'               => 'Hi there',
                'received_request' => 'We\'ve received a request to reset the password for the BBBEasy account  associated with',
                'no_changes'       => 'No changes have been made to your account yet',
                'reset_label'      => 'You can reset your password by clicking the link below',
                'reset_link'       => 'Reset your password',
                'expires_at'       => 'this link is valid for 15 minutes it will expires at',
            ],
        ],
    ],
];
