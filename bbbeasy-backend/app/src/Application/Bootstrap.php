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
use Tracy\Debugger;
use Utils\RoutePrivileges;

/**
 * BBBEasy application initialisation.
 */
class Bootstrap extends SukarixBootstrap
{
    /**
     * Mail settings a deployment has to set for itself, and the hive keys they
     * stand in for.
     *
     * A relay such as Postal authenticates as one identity and sends as another,
     * so the account it signs in with, the address the mail comes from and the
     * name shown beside that address are three separate values. They live in the
     * environment because the configuration file that would otherwise hold them
     * is tracked, and a password does not belong in the repository.
     */
    private const MAILER_ENVIRONMENT = [
        'BBBEASY_SMTP_HOST'        => 'mailer.smtp.host',
        'BBBEASY_SMTP_PORT'        => 'mailer.smtp.port',
        'BBBEASY_SMTP_SCHEME'      => 'mailer.smtp.scheme',
        'BBBEASY_SMTP_USERNAME'    => 'mailer.smtp.user',
        'BBBEASY_SMTP_PASSWORD'    => 'mailer.smtp.pw',
        'BBBEASY_SMTP_FROM_EMAIL'  => 'mailer.from_mail',
        'BBBEASY_SMTP_SENDER_NAME' => 'mailer.from_name',
    ];

    /**
     * BBBEasy authenticates with stateless JWT access tokens, the session is
     * therefore not the database backed one the framework expects.
     */
    public function prepareSession(): void
    {
        $className = $this->f3->get('classes.session');
        \Registry::set('session', new $className());
    }

    protected function handleException(): void
    {
        parent::handleException();

        // Both Fat-Free and Tracy force their own error reporting level, so the mask
        // has to be applied last: the Cortex ORM still calls
        // ReflectionProperty::setAccessible(), which PHP 8.5 deprecates, and the
        // frameworks turn that deprecation into a fatal error on every query.
        error_reporting(error_reporting() & ~E_DEPRECATED);
        Debugger::$scream = false;
    }

    protected function loadConfiguration(): void
    {
        parent::loadConfiguration();

        if (!file_exists('config/config-' . $this->environment . '.ini')) {
            throw new \RuntimeException('Could not find configuration file "config-' . $this->environment . '.ini"');
        }

        $this->loadMailerEnvironment();
    }

    /**
     * Let the environment have the last word on the mail settings. A variable that
     * is unset or empty leaves the configured value alone, so a deployment
     * overrides only what it needs to.
     */
    protected function loadMailerEnvironment(): void
    {
        foreach (self::MAILER_ENVIRONMENT as $variable => $key) {
            $value = getenv($variable);
            if (false !== $value && '' !== $value) {
                $this->f3->set($key, $value);
            }
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
        foreach (RoutePrivileges::routesFor($permissions) as $route) {
            $access->allow($route, $role->name);
        }
    }

    protected function getSession(): Session
    {
        return \Registry::get('session');
    }
}
