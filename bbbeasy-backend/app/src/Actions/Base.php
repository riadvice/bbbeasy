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

namespace Actions;

use Core\Session;
use Enum\ResponseCode;
use Enum\UserRole;
use Enum\UserStatus;
use Models\User;
use Sukarix\Actions\Action;
use Sukarix\Configuration\Environment;
use Utils\SecurityUtils;

/**
 * Base Controller Class.
 */
abstract class Base extends Action
{
    /**
     * BBBEasy replaces the framework session with a stateless JWT one, narrow the
     * inherited property so its own methods resolve.
     *
     * @var Session
     */
    protected $session;

    /**
     * initialize controller.
     */
    public function __construct()
    {
        parent::__construct();

        $this->f3->set('title', 'BBBEasy');
        $this->f3->set('init.js', ['Locale', 'Plugins', 'Common']);
    }

    public function beforeroute(): void
    {
        // The framework keeps its own access instance private, use the singleton.
        \Access::instance()->authorize($this->getRole(), function($route, $subject): void {
            $this->onAccessAuthorizeDeny($route, $subject);
        });
        if ($this->session->isLoggedIn() && $this->f3->get('ALIAS') === $this->f3->get('ALIASES.login')) {
            $this->f3->reroute($this->f3->get('ALIASES.home'));
        }
        // Rerouted paged uri having the page value less than one
        if ($this->f3->exists('PARAMS.page') && $this->f3->get('PARAMS.page') < 1) {
            $uri = $this->f3->get('PATH');
            $uri = preg_replace('/\/' . $this->f3->get('PARAMS.page') . '$/', '/1', $uri);
            $this->f3->reroute($uri);
        }
    }

    /**
     * @param array|string $json
     * @param int          $statusCode
     *
     * @throws \JsonException
     */
    public function renderJson($json, $statusCode = 200): void
    {
        // @fixme: use HTTP/2.0?
        header('HTTP/1.1 ' . $statusCode);
        if (!Environment::isTest()) {
            header(self::JSON);
        }
        // Set the status code in the response everytime we build the response
        if (ResponseCode::HTTP_OK !== $statusCode) {
            if (!empty($this->f3->get('api_errors'))) {
                $json['errors'] = $this->f3->get('api_errors');
            }
            $json['status'] = $statusCode;
        }
        echo \is_string($json) ? $json : json_encode($json, JSON_THROW_ON_ERROR);
    }

    /**
     * @param \SimpleXMLElement $xml
     */
    public function renderRawXml($xml): void
    {
        $this->renderXMLContent($xml);
    }

    public function renderXmlString($xml = null): void
    {
        $this->renderXMLContent($xml);
    }

    /**
     * @return mixed
     */
    public function getDecodedBody(): array
    {
        return json_decode($this->f3->get('BODY'), true) ?: [];
    }

    protected function isApiUserVerified(): bool
    {
        if ($credentials = $this->getCredentials()) {
            $user = new User();
            $user = $user->getByEmail($credentials[0]);

            return
                $user->valid()
                && UserStatus::ACTIVE === $user->status
                && $user->verifyPassword($credentials[1]);
        }

        return false;
    }

    protected function getRole(): string
    {
        if ($this->session->getRole()) {
            return $this->session->getRole();
        }
        if ($this->isApiUserVerified()) {
            return UserRole::API;
        }

        return '';
    }

    protected function credentialsAreValid(string $username, string $email, $password, string $errorMessage, $userId = null): bool
    {
        $user              = new User();
        $credentials_valid = true;
        $passwordExist     = null !== $password;
        $responseCode      = ResponseCode::HTTP_PRECONDITION_FAILED;

        $users = $user->getUsersByUsernameOrEmail($username, $email, $userId);

        $found = $user->userExists($username, $email, $users);
        if ($passwordExist) {
            $compliant = SecurityUtils::isGdprCompliant($password);
            $common    = SecurityUtils::credentialsAreCommon($username, $email, $password);
        }

        if ($found) {
            $this->logger->error($errorMessage, ['error' => $found]);
            $this->renderJson(['message' => $found], $responseCode);
            $credentials_valid = false;
        } elseif ($passwordExist) {
            // A password everybody uses is reported as such, saying it is not strong
            // enough would send the user looking for the wrong fix.
            if ($common) {
                $this->logger->error($errorMessage, ['error' => $common]);
                $this->renderJson(['message' => $common], $responseCode);
                $credentials_valid = false;
            } elseif (true !== $compliant) {
                $this->logger->error($errorMessage, ['error' => $compliant]);
                $this->renderJson(['message' => $compliant], $responseCode);
                $credentials_valid = false;
            }
        }

        return $credentials_valid;
    }

    protected function usernameAndEmailAreValid(string $username, string $email, string $errorMessage, $userId = null): bool
    {
        $user         = new User();
        $responseCode = ResponseCode::HTTP_PRECONDITION_FAILED;

        $users = $user->getUsersByUsernameOrEmail($username, $email, $userId);
        $found = $user->userExists($username, $email, $users);
        if ($found) {
            switch ($found) {
                case 'Username and Email already exist':
                    $found = ['username' => 'Username already exists', 'email' => 'Email already exists'];

                    break;

                case 'Username already exists':
                    $found = ['username' => $found];

                    break;

                case 'Email already exists':
                    $found = ['email' => $found];

                    break;
            }
            $this->logger->error($errorMessage, ['error' => $found]);
            $this->renderJson(['errors' => $found], $responseCode);

            return false;
        }

        return true;
    }
}
