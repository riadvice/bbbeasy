<?php

declare(strict_types=1);

/*
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

namespace Actions;

use Acl\Access;
use Core\Session;
use DOMDocument;
use Enum\ResponseCode;
use Enum\UserRole;
use Enum\UserStatus;
use Helpers\I18n;
use Log\LogWriterTrait;
use Models\User;
use SimpleXMLElement;
use Template;
use Utils\Environment;

/**
 * Base Controller Class.
 */
abstract class Base extends \Prefab
{
    use LogWriterTrait;

    public const JSON            = 'Content-Type: application/json; charset=utf-8';
    public const APPLICATION_XML = 'Content-Type: application/xml; charset=UTF-8';
    public const CSV             = 'Content-Type: text/csv; charset=UTF-8';
    public const TEXT            = 'Content-Type: text/plain; charset=utf-8';
    public const XML             = 'Content-Type: text/xml; charset=UTF-8';

    /**
     * f3 instance.
     *
     * @var \Base f3
     */
    protected $f3;

    /**
     * f3 instance.
     *
     * @var Session f3
     */
    protected $session;

    /**
     * f3 instance.
     *
     * @var I18n f3
     */
    protected $i18n;

    /**
     * The view name to render.
     *
     * @var string
     */
    protected $view;

    /**
     * @var Access
     */
    private $access;

    /**
     * @var string
     */
    private $headerAuthorization;

    /**
     * @var string
     */
    private $templatesDir;

    /**
     * initialize controller.
     */
    public function __construct()
    {
        $this->f3      = \Base::instance();
        $this->session = \Registry::get('session');
        $this->i18n    = I18n::instance();
        $this->access  = Access::instance();

        $this->initLogger();
        $this->parseHeaderAuthorization();

        $this->templatesDir = $this->f3->get('ROOT') . $this->f3->get('BASE') . '/../app/ui/';
        $this->f3->set('title', 'Hivelvet');

        $this->f3->set('init.js', ['Locale', 'Plugins', 'Common']);
    }

    public function beforeroute(): void
    {
        $this->access->authorize($this->getRole(), function($route, $subject): void {
            $this->onAccessAuthorizeDeny($route, $subject);
        });
        if ($this->session->isLoggedIn() && $this->f3->get('ALIAS') === $this->f3->get('ALIASES.login')) {
            $this->f3->reroute($this->f3->get('ALIASES.home'));
        } elseif ('POST' === $this->f3->VERB && !$this->session->validateToken()) {
            $this->f3->reroute($this->f3->get('PATH'));
        }
        // Rerouted paged uri having the page value less than one
        if ($this->f3->exists('PARAMS.page') && $this->f3->get('PARAMS.page') < 1) {
            $uri = $this->f3->get('PATH');
            $uri = preg_replace('/\/' . $this->f3->get('PARAMS.page') . '$/', '/1', $uri);
            $this->f3->reroute($uri);
        }
    }

    public function onAccessAuthorizeDeny($route, $subject): void
    {
        $this->logger->warning('Access denied to route ' . $route . ' for subject ' . ($subject ?: 'unknown'));
        $this->f3->error(404);
    }

    /**
     * @throws \JsonException
     */
    public function renderJson(array|string $json, int $statusCode = 200): void
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

    public function renderText(array|string $text, int $statusCode = 200): void
    {
        // @fixme: use HTTP/2.0?
        header('HTTP/1.1 ' . $statusCode);
        header(self::TEXT);
        echo \is_string($text) ? $text : implode("\n", $text);
    }

    public function renderCsv($object): void
    {
        header(self::CSV);
        header('Content-Disposition: attachement; filename="' . $this->f3->hash($this->f3->get('TIME') . '.csv"'));
        echo $object;
    }

    public function renderXML(string $view = null, string $cacheKey = null, int $ttl = 0): void
    {
        if (!empty($view)) {
            $this->view = $view;
        }
        // Set the XML header
        header('Content-Type: text/xml; charset=UTF-8');

        // Use caching only in production
        if (!empty($cacheKey) && Environment::isProduction()) {
            if (!$this->f3->exists($cacheKey)) {
                $this->f3->set($cacheKey, $this->parseXMLView(), $ttl);
            }
            echo $this->f3->get($cacheKey);
        } else {
            echo $this->parseXMLView();
        }
    }

    /**
     * @param $xml SimpleXMLElement
     */
    public function renderRawXml($xml): void
    {
        // Set the XML header
        header('Content-Type: text/xml; charset=UTF-8');
        echo $xml->asXML();
    }

    public function renderXmlString($xml = null): void
    {
        header('Content-Type: text/xml; charset=UTF-8');

        echo $xml;
    }

    /**
     * @return mixed
     */
    public function getDecodedBody(): array
    {
        return json_decode($this->f3->get('BODY'), true);
    }

    protected function parseHeaderAuthorization(): void
    {
        if ($header = $this->f3->get('HEADERS.Authorization')) {
            $this->headerAuthorization = str_replace('Basic ', '', $header);
        }
    }

    protected function isApiUserVerified(): bool
    {
        if ($credentials = $this->getCredentials()) {
            $user = new User();
            $user = $user->getByEmail($credentials[0]);

            return
                $user->valid()
                && UserStatus::ACTIVE === $user->status
                // && UserRole::API === $user->role_id->name
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

    protected function getCredentials(): array
    {
        if (!$this->headerAuthorization) {
            return [];
        }

        $credentials = base64_decode($this->headerAuthorization, true);
        $credentials = explode(':', $credentials);

        if (2 !== \count($credentials)) {
            return [];
        }

        return $credentials;
    }

    private function parseXMLView(string $view = null): string
    {
        $xmlResponse = new SimpleXMLElement(Template::instance()->render($this->view . '.xml'));

        $xmlDocument                     = new DOMDocument('1.0');
        $xmlDocument->preserveWhiteSpace = false;
        $xmlDocument->formatOutput       = true;

        $xmlDocument->loadXML($xmlResponse->asXML());

        return $xmlDocument->saveXML();
    }

    protected function isPasswordCommon(string $username, string $email, string $password, string $error_message, int | null $response_code): bool
    {
        $dictionary = file_GET_contents("http://api.hivelvet.test/dictionary/en-US.json");
        $words = json_decode($dictionary);
        foreach ($words as $word) {
            if (strcmp($password, $username) == 0 || strcmp($password, $email) == 0 || strcmp($password, $word) == 0) {
                $error = 'Avoid choosing a common password';
                $this->logger->error($error_message, ['error' => $error]);
                "$_SERVER[REQUEST_URI]" == '/users/collect-admin' ? $this->renderJson(['message' => $error]) : $this->renderJson(['message' => $error], $response_code);
                return false;
            }
        }
        return true;
    }

    protected function getUsersByUsernameOrEmail(string $username, string $email): array
    {
        $dbname = 'hivelvet'; $user = 'hivelvet'; $secret = 'hivelvet';
        $conn = pg_pconnect("host=localhost dbname=$dbname user=$user password=$secret");
        $result = pg_query_params($conn, 'SELECT username, email FROM public.users WHERE lower(username) = lower($1) OR lower(email) = lower($2)', array($username, $email));
        return pg_fetch_all($result);
    }
}
