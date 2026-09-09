<?php

declare(strict_types=1);

/*
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
 * with BBBeasy. If not, see <https://www.gnu.org/licenses/>
 */

namespace Application;

use Core\Session;
use Models\Role;
use Sukarix\Application\Bootstrap as SukarixBootstrap;

/**
 * BBBEasy application initialisation.
 */
class Bootstrap extends SukarixBootstrap
{
    protected function setPhpVariables(): void
    {
        parent::setPhpVariables();

        // Fat-Free forces its own error reporting level, drop deprecations from it:
        // the Cortex ORM still calls ReflectionProperty::setAccessible() which PHP 8.5
        // deprecates and which the framework turns into a fatal error.
        error_reporting(error_reporting() & ~E_DEPRECATED);
    }

    /**
     * BBBEasy authenticates with stateless JWT access tokens, the session is
     * therefore not the database backed one the framework expects.
     */
    public function prepareSession(): void
    {
        $className = $this->f3->get('classes.session');
        \Registry::set('session', new $className());
    }

    protected function loadConfiguration(): void
    {
        parent::loadConfiguration();

        if (!file_exists('config/config-' . $this->environment . '.ini')) {
            throw new \RuntimeException('Could not find configuration file "config-' . $this->environment . '.ini"');
        }
    }

    protected function loadAppSetting(): void
    {
        $locale = $this->getSession()->get('locale');
        if (!empty($locale)) {
            $this->f3->set('LANGUAGE', $locale);
        }
    }

    protected function loadRoutesAndAccess(): void
    {
        $extension = $this->f3->get('config.extension');

        $this->f3->config('config/routes' . $extension . '.ini');
        $this->f3->config('config/routes-' . $this->environment . '.ini');

        if ($this->isCli) {
            $this->f3->config('config/access-cli.ini');
        } else {
            $this->f3->config('config/access' . $extension . '.ini');
            $this->sendCorsHeaders();
        }

        $this->allowRoutesDynamically();
    }

    /**
     * Allow cross-origin requests coming from the React frontend.
     */
    protected function sendCorsHeaders(): void
    {
        header('Access-Control-Allow-Origin: ' . $this->f3->get('webapps.allowed'));
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Content-Type, Origin, Authorization, X-Authorization, Accept, Accept-Language, Access-Control-Request-Method');
        header('Access-Control-Expose-Headers: Authorization, X-Authorization');
    }

    /**
     * Allow routes according to the role permissions of the logged in user.
     */
    protected function allowRoutesDynamically(): void
    {
        $roleId = $this->getSession()->getRoleId();
        if (0 === $roleId) {
            return;
        }

        $role = new Role();
        $role->load(['id = ?', [$roleId]]);

        $permissions = $role->getRolePermissions();
        if (!\is_array($permissions)) {
            return;
        }

        $access = \Access::instance();
        foreach ($permissions as $group => $actions) {
            foreach ($actions as $action) {
                $access->allow($this->getRouteByGroupAndAction($group, $action), $role->name);
            }
        }
    }

    protected function getSession(): Session
    {
        return \Registry::get('session');
    }

    protected function getRouteByGroupAndAction(string $group, string $action): string
    {
        $method = match ($action) {
            'add', 'start' => 'POST',
            'edit'         => 'PUT',
            'delete'       => 'DELETE',
            'collect'      => 'GET|POST',
            default        => 'GET',
        };
        if (str_contains($action, 'edit')) {
            $method = 'PUT';
        }
        if ('delete' === $action) {
            $acl = '@' . mb_substr($group, 0, -1) . '_' . $action;
        } else {
            $acl = '@' . $group . '_' . $action;
        }

        return $method . ' ' . $acl;
    }
}
