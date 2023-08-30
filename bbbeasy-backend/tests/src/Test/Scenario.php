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

namespace Test;

use Base;
use Core\Statera;
use SebastianBergmann\CodeCoverage\CodeCoverage;

class Scenario
{
    protected $group = 'Test Scenario';

    /**
     * @param mixed $f3
     *
     * @throws \ReflectionException
     */
    public function run($f3): array
    {
        /**
         * @var CodeCoverage $coverage
         */
        $class   = new \ReflectionClass($this);
        $methods = $class->getMethods(\ReflectionMethod::IS_PUBLIC);
        $results = [];
        foreach ($methods as $method) {
            // Select methods starting by test and run them
            if (preg_match('/^test/i', $method->name)) {
                $humanisedMethodName = preg_replace('/([a-z0-9])([A-Z])/', '$1 $2', str_replace('test', '', $method->name));
                Statera::startCoverage($this->group . ' :: ' . $humanisedMethodName);
                $results = array_merge($results, \call_user_func_array([$this, $method->name], [$f3]));
                Statera::stopCoverage();
            }
        }

        return [$this->group => $results];
    }

    /**
     * @throws \JsonException
     */
    public function compareTemplateToResponse(string $path): bool
    {
        $f3 = \Base::instance();

        // return empty(array_diff($this->loadResult($path), json_decode($f3->get('RESPONSE'), true, 512, JSON_THROW_ON_ERROR)));
        return empty(array_diff($this->loadResult($path), json_decode($f3->get('RESPONSE'), true) ?? []));
    }

    /**
     * @throws \JsonException
     */
    public function compareArrayToResponse(array $array): bool
    {
        $f3 = \Base::instance();

        // return empty(array_diff($array, json_decode($f3->get('RESPONSE'), true, 512, JSON_THROW_ON_ERROR)));
        return empty(array_diff($array, json_decode($f3->get('RESPONSE'), true) ?? []));
    }

    public function uploadImage($name, $file): string
    {
        // Put the file in the magic variable
        $_FILES = [
            $name => [
                'name'     => $fileName = uniqid($name, false) . '.jpg',
                'type'     => 'image/jpg',
                'size'     => filesize($file),
                'tmp_name' => $file,
                'error'    => 0,
            ],
        ];

        return $fileName;
    }

    /**
     * @return \Test
     */
    protected function newTest()
    {
        // We logout any existing user if there is anyone to force flushing session data
        \Base::instance()->clear('utest.rerouted');
        \Base::instance()->clear('form_errors');
        \Base::instance()->clear('data');
        \Base::instance()->clear('cdn_render');
        \Base::instance()->clear('utest.headers');
        // @fixme: to be activated Base::instance()->mock('GET /logout');
        \Base::instance()->set('utest.number', $this->currentTestNumber() + 1);
        $this->resetErrorHandler();

        $test = new UnitTest();
        $test->setGroup($this->group);

        return $test;
    }

    protected function resetErrorHandler(): void
    {
        $f3 = \Base::instance();

        // Remove error handler in unit test mode
        $f3->set('ONERROR', static function() use ($f3): void {
            // Never use $f3->clear('ERROR'); here as it needs to be done by the developer after checking the error
            $f3->set('utest.errors.' . $f3->hash(serialize($f3->get('ERROR'))), $f3->get('ERROR'));
        });
    }

    protected function currentTestNumber(): int
    {
        return \Base::instance()->get('utest.number');
    }

    protected function postJsonData($array): string
    {
        $array['csrf_token'] = \Registry::get('session')->generateToken();

        return json_encode($array);
    }

    protected function rerouted(): ?string
    {
        return \Base::instance()->get('utest.rerouted');
    }

    /**
     * @param array $params
     * @param mixed $alias
     */
    protected function reroutedTo($alias, $params = []): bool
    {
        return $this->rerouted() === \Base::instance()->alias($alias, $params);
    }

    protected function returnedError($code): bool
    {
        $f3        = \Base::instance();
        $lastError = $f3->get('utest.errors.' . $this->hashError($f3->get('ERROR')));
        $f3->clear('utest.errors.' . $this->hashError($f3->get('ERROR')));

        return $code === $lastError['code'];
    }

    /**
     * @param array $error
     */
    protected function hashError($error): string
    {
        return \Base::instance()->hash(serialize($error));
    }

    /**
     * @param mixed $path
     *
     * @throws \JsonException
     */
    private function loadResult($path)
    {
        $string = file_get_contents('../tests/templates/' . $path);

        return json_decode($string, true, 512, JSON_THROW_ON_ERROR);
    }
}
