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

namespace Acl;

/**
 * Class Access origin https://github.com/ikkez/f3-access/blob/master/lib/access.php.
 */
class Access extends \Prefab
{
    // Constants
    public const DENY  = 'deny';
    public const ALLOW = 'allow';

    /** @var string Default policy */
    protected $policy = self::ALLOW;

    /** @var array */
    protected $rules = [];

    /**
     * Constructor.
     *
     * @param array $config
     */
    public function __construct($config = null)
    {
        if (!isset($config)) {
            $f3     = \Base::instance();
            $config = (array) $f3->get('ACCESS');
        }
        if (isset($config['policy'])) {
            $this->policy($config['policy']);
        }
        if (isset($config['rules'])) {
            foreach ((array) $config['rules'] as $str => $subjects) {
                foreach ([self::DENY, self::ALLOW] as $k => $policy) {
                    if (0 === mb_stripos($str, $policy)) {
                        $this->rule((bool) $k, mb_substr($str, mb_strlen($policy)), $subjects);
                    }
                }
            }
        }
    }

    /**
     * Define an access rule to a route.
     *
     * @param bool         $accept
     * @param string       $route
     * @param array|string $subjects
     *
     * @return self
     */
    public function rule($accept, $route, $subjects = '')
    {
        if (!\is_array($subjects)) {
            $subjects = explode(',', $subjects);
        }
        [$verbs, $path] = $this->parseRoute($route);
        foreach ($subjects as $subject) {
            foreach ($verbs as $verb) {
                $this->rules[$subject ?: '*'][$verb][$path] = $accept;
            }
        }

        return $this;
    }

    /**
     * Give access to a route.
     *
     * @param string       $route
     * @param array|string $subjects
     *
     * @return self
     */
    public function allow($route, $subjects = '')
    {
        return $this->rule(true, $route, $subjects);
    }

    /**
     * Deny access to a route.
     *
     * @param string       $route
     * @param array|string $subjects
     *
     * @return self
     */
    public function deny($route, $subjects = '')
    {
        return $this->rule(false, $route, $subjects);
    }

    /**
     * Get/set the default policy.
     *
     * @param string $default
     *
     * @return self|string
     */
    public function policy($default = null)
    {
        if (!isset($default)) {
            return $this->policy;
        }
        if (\in_array($default = mb_strtolower($default), [self::ALLOW, self::DENY], true)) {
            $this->policy = $default;
        }

        return $this;
    }

    /**
     * Return TRUE if the given subject (or any of the given subjects) is granted access to the given route.
     *
     * @param array|string $route
     * @param array|string $subject
     *
     * @return bool
     */
    public function granted($route, $subject = '')
    {
        [$verbs, $uri] = \is_array($route) ? $route : $this->parseRoute($route);
        if (\is_array($subject)) {
            foreach ($subject ?: [''] as $s) {
                if ($this->granted([$verbs, $uri], $s)) {
                    return true;
                }
            }

            return false;
        }
        $verb     = $verbs[0]; // we shouldn't get more than one verb here
        $specific = $this->rules[$subject][$verb] ?? [];
        $global   = $this->rules['*'][$verb] ?? [];
        $rules    = $specific + $global; // subject-specific rules have precedence over global rules
        // specific paths are processed first:
        $paths = [];
        foreach ($keys = array_keys($rules) as $key) {
            $path = str_replace('@', '*@', $key);
            if ('*' !== mb_substr($path, -1)) {
                $path .= '+';
            }
            $paths[] = $path;
        }
        $vals = array_values($rules);
        array_multisort($paths, SORT_DESC, $keys, $vals);
        $rules = array_combine($keys, $vals);
        foreach ($rules as $path => $rule) {
            if (preg_match('/^' . preg_replace('/@\w*/', '[^\/]+', str_replace('\*', '.*', preg_quote($path, '/'))) . '$/', $uri)) {
                return $rule;
            }
        }

        return self::ALLOW === $this->policy;
    }

    /**
     * Authorize a given subject (or a set of subjects).
     *
     * @param array|string    $subject
     * @param callable|string $ondeny
     *
     * @return bool
     */
    public function authorize($subject = '', $ondeny = null)
    {
        $f3 = \Base::instance();
        if (!$this->granted($route = $f3->VERB . ' ' . $f3->PATH, $subject)
            && (!isset($ondeny) || false === $f3->call($ondeny, [$route, $subject]))) {
            $f3->error($subject ? 403 : 401);

            return false;
        }

        return true;
    }

    /**
     * Parse a route string
     * Possible route formats are:
     * - GET /foo
     * - GET|PUT /foo
     * - /foo
     * - * /foo.
     *
     * @param mixed $str
     *
     * @return array
     */
    protected function parseRoute($str)
    {
        $verbs = $path = '';
        if (preg_match('/^\h*(\*|[\|\w]*)\h*(\H+)/', $str, $m)) {
            [, $verbs, $path] = $m;
            if ('@' === $path[0]) {
                $path = \Base::instance()->get('ALIASES.' . mb_substr($path, 1));
            }
        }
        if (!$verbs || '*' === $verbs) {
            $verbs = \Base::VERBS;
        }

        return [explode('|', $verbs), $path];
    }
}
