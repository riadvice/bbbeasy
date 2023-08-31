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

namespace Application;

use Acl\Access;
use Enum\CacheKey;
use Helpers\Time;
use Mail\MailSender;
use Models\Role;
use Models\Setting;
use Tracy\Debugger;

// load composer autoload
require_once '../vendor/autoload.php';

/**
 * fat-free framework application initialisation.
 */
class Bootstrap extends Boot
{
    public function __construct()
    {
        $this->logFileName = \PHP_SAPI !== 'cli' ? 'app' : 'cli';
        $this->logSession  = true;

        parent::__construct();

        $this->setupMailer();
        $this->handleException();
        $this->createDatabaseConnection();
        $this->prepareSession();
        $this->loadAppSetting();
        $this->detectCli();
        $this->loadRoutesAndAssets();
        $this->allowRoutesDynamically();
    }

    protected function loadConfiguration(): void
    {
        $this->f3->config('config/default.ini');
        if (file_exists('config/config-' . $this->environment . '.ini')) {
            $this->f3->config('config/config-' . $this->environment . '.ini');
        } else {
            throw new \RuntimeException('Could not find configuration file "config-' . $this->environment . '.ini"');
        }

        // Upload configuration
        $this->f3->config('config/upload.ini');

        // custom error handler if debugging
        $this->debug = $this->f3->get('DEBUG');
    }

    protected function handleException(): void
    {
        // Tracy consumes about 300 Ko of memory
        Debugger::enable(3 !== $this->debug ? Debugger::PRODUCTION : Debugger::DEVELOPMENT, __DIR__ . '/../../' . $this->f3->get('LOGS'));
        if (Debugger::$productionMode) {
            Debugger::$onFatalError = [static function($exception): void {
                /**
                 * @var MailSender $mailer
                 */
                $mailer = \Registry::get('mailer');
                $mailer->sendExceptionEmail($exception);
            }];
        }

        // default error pages if site is not being debugged
        if (!$this->isCli && empty($this->debug)) {
            $this->f3->set(
                'ONERROR',
                function(): void {
                    header('Expires:  ' . Time::http(time() + \Base::instance()->get('error.ttl')));
                    if ('404' === \Base::instance()->get('ERROR.code')) {
                        include_once '/templates/error/404.phtml';
                    } else {
                        include_once '/templates/error/error.phtml';
                    }
                }
            );
        }
    }

    protected function loadAppSetting(): void
    {
        if (!$this->f3->get(CacheKey::CONFIG_LOADED)) {
            $this->f3->set(CacheKey::CONFIG_LOADED, true, 3590);
            // Load global settings
            foreach ([] as $entry => $cacheKey) {
                $exists = 'locale' === $entry ? $this->session->get($entry) : $this->f3->exists($entry);
                if (!$exists) {
                    $setting = new Setting();
                    $setting->load();
                    $value = $setting->{$entry};
                    if ('locale' === $entry) {
                        $this->session->set($entry, $value);
                    } else {
                        $this->f3->set($cacheKey, $value, 3600);
                    }
                }
            }
        }
        $this->f3->set('LANGUAGE', $this->session->get('locale'));
    }

    protected function loadRoutesAndAssets(): void
    {
        // setup routes
        // @see http://fatfreeframework.com/routing-engine
        // firstly load routes from ini file then load custom environment routes
        $this->f3->config('config/routes' . $this->f3->get('config.extension') . '.ini');

        if (file_exists('config/routes-' . $this->environment . '.ini')) {
            $this->f3->config('config/routes-' . $this->environment . '.ini');
        }

        if (!$this->isCli) {
            // load routes access policy
            $this->f3->config('config/access' . $this->f3->get('config.extension') . '.ini');
        } else {
            // load routes access policy for CLI
            $this->f3->config('config/access-cli.ini');
        }
        // setup assets
        // @see http://fatfreeframework.com/framework-variables#Customsections
        // assets are save in configuration so we do no need to overload the memory with classes
        $this->f3->config('config/assets.ini');

        // enable cors to allow cross-origin requests from frontend react client
        header('Access-Control-Allow-Origin: ' . $this->f3->get('webapps.allowed'));
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Content-Type, Origin, Authorization, X-Authorization, Accept, Accept-Language, Access-Control-Request-Method');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Expose-Headers: *, PHPSESSID');
    }

    protected function allowRoutesDynamically(): void
    {
        // allow routes according to role permissions of logged user
        $access = Access::instance();
        // get session user role
        $roleId = $this->session->getRoleId();
        if (0 !== $roleId) {
            $role = new Role();
            $role->load(['id = ?', [$roleId]]);
            $roleName = $role->name;
            // load role permissions
            $permissions = $role->getRolePermissions();
            if (\is_array($permissions)) {
                foreach ($permissions as $group => $actions) {
                    foreach ($actions as $action) {
                        $route = $this->getRouteByGroupAndAction($group, $action);
                        // allow user role to access to route
                        $access->allow($route, $roleName);
                    }
                }
            }
        }
    }

    protected function getRouteByGroupAndAction(string $group, string $action): string
    {
        $method = match ($action) {
            'add', 'start' => 'POST',
            'edit'    => 'PUT',
            'delete'  => 'DELETE',
            'collect' => 'GET|POST',
            default   => 'GET',
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
