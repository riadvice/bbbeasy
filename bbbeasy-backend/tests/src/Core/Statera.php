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

namespace Core;

use Base;
use ByteUnits\Metric as ByteFormatter;
use Helpers\Time;
use Nette\Utils\Strings;
use SebastianBergmann\CodeCoverage\CodeCoverage;
use SebastianBergmann\CodeCoverage\Driver\XdebugDriver;
use SebastianBergmann\CodeCoverage\Filter;
use SebastianBergmann\CodeCoverage\Report\Clover;
use SebastianBergmann\CodeCoverage\Report\Html\Facade;
use SebastianBergmann\CodeCoverage\Report\Text;
use Suite\AccountActionsTest;
use Suite\CoreActionsTest;
use Suite\LabelsActionsTest;
use Suite\ModelsTest;
use Suite\PresetsActionsTest;
use Suite\PresetSettingsActionsTest;
use Suite\RecordingsActionsTest;
use Suite\RolesActionsTest;
use Suite\RolesPermissionsActionsTest;
use Suite\RoomsActionsTest;
use Suite\SettingsActionsTest;
use Suite\UsersActionsTest;
use Utils\CliUtils;

class Statera
{
    private bool $cli = false;

    private static $coverage;

    private static $coverageEnabled;

    /**
     * @param mixed $f3
     * @param mixed $params
     *
     * @throws \Exception
     */
    public function index($f3, $params): void
    {
        error_reporting(E_ERROR);
        $this->configPHP();
        $this->configF3ForTest($f3);
        $this->detectCli();

        // Test web-application classes
        $classes = [
            ConfigurationTest::class, ReflectionTest::class, ModelsTest::class,
            CoreActionsTest::class,
            AccountActionsTest::class,
            RolesActionsTest::class,
            RolesPermissionsActionsTest::class,
            UsersActionsTest::class,
            LabelsActionsTest::class,
            SettingsActionsTest::class,
            PresetSettingsActionsTest::class,
            PresetsActionsTest::class,
            RoomsActionsTest::class,
            RecordingsActionsTest::class,
            // Always leave CDN test as the last one
            // CdnDistributorTest::class
        ];

        // check what test should be launched
        if (\array_key_exists('help', $_GET)) {
            CliUtils::instance()->write(PHP_EOL . 'Please specify `test` param to set tests which will be launched:');
            CliUtils::instance()->write(str_pad('all', 15) . "\t-> all tests");
            foreach ($classes as $class) {
                $name = preg_replace('/[a-z]{1,}\\\|actionstest|test/', '', mb_strtolower($class), -1);
                CliUtils::instance()->write(str_pad($name, 15) . "\t-> {$class}");
            }

            exit;
        }
        $_GET['test'] = $_GET['test'] ?: 'all';
        $tests        = explode(',', (string) $_GET['test']);
        CliUtils::instance()->write('Selected tests: ' . $_GET['test']);

        // Delete test result file
        @unlink($this->testResultFilePath($f3));

        $f3->set('utest.time', Time::db());
        CliUtils::instance()->write(PHP_EOL . "--- Statera Starting unit tests at {$f3->get('utest.time')} ---");
        $results = [];

        foreach ($classes as $class) {
            if (!\in_array('all', $tests, true) && !\in_array(preg_replace('/[a-z]{1,}\\\|actionstest|test/', '', mb_strtolower($class), -1), $tests, true)) {
                continue;
            }
            $object = new $class();
            CliUtils::instance()->writeSuiteResult($suiteResults = $object->run($f3), Strings::after($class, '\\'));
            $results = array_merge($results, $suiteResults);
        }

        $testContainsFailures = false;
        $totalSuccess         = 0;
        $totalFail            = 0;
        foreach ($results as &$result) {
            $total             = is_countable($result) ? \count($result) : 0;
            $success           = \count(array_filter(array_column($result, 'status')));
            $fail              = $total - $success;
            $result['success'] = $success;
            $result['fail']    = $fail;
            if (!$testContainsFailures && $fail > 0) {
                $testContainsFailures = true;
            }
            $totalSuccess += $success;
            $totalFail += $fail;
        }

        $f3->set('utest.statera_folder', $this->cli ? '' : '/statera/');
        $f3->set('utest.delay', 1);
        $f3->set('utest.success', $totalSuccess);
        $f3->set('utest.fail', $totalFail);
        $f3->set('utest.results', $results);

        if (0 === $totalFail) {
            CliUtils::instance()->write("Exam Unit Testing <passed>{$totalSuccess}/{$totalSuccess}</passed>");
        } else {
            $totalTests = $totalSuccess + $totalFail;
            CliUtils::instance()->write("Exam Unit Testing <failed>{$totalSuccess}/{$totalTests}</failed>");
        }

        self::writeCoverageResult();

        CliUtils::instance()->write($f3->format('Unit tests run in {0} / Memory usage {1}', self::formatTime(1e3 * (microtime(true) - $f3->TIME), 2), ByteFormatter::bytes(memory_get_usage(true))->format()));

        // And finally write the test result
        $f3->write($this->testResultFilePath($f3), $testContainsFailures && $f3->get('utest.fail') > 0 ? 'fail' : 'success');
    }

    /**
     * Starts a new coverage.
     *
     * @param $id string Coverage id
     */
    public static function startCoverage($id): void
    {
        if (self::isCoverageEnabled()) {
            self::$coverage->start($id);
        }
    }

    /**
     * Stops test coverage.
     */
    public static function stopCoverage(): void
    {
        if (self::isCoverageEnabled()) {
            self::$coverage->stop();
        }
    }

    public static function writeCoverageResult(): void
    {
        if (self::isCoverageEnabled()) {
            CliUtils::instance()->write('Generating test coverage [HTML]');
            $publicFolder = \dirname(__DIR__, 3) . \DIRECTORY_SEPARATOR . 'public' . \DIRECTORY_SEPARATOR . 'statera';
            $writer       = new Facade();
            $writer->process(self::$coverage, $publicFolder . \DIRECTORY_SEPARATOR . 'coverage');

            CliUtils::instance()->write('Generating test coverage [Clover XML]');
            $writer = new Clover();
            $writer->process(self::$coverage, $publicFolder . \DIRECTORY_SEPARATOR . 'coverage/clover.xml');

            if (\PHP_SAPI === 'cli') {
                CliUtils::instance()->write('Generating test coverage [TEXT]');
                $writer = new Text();
                CliUtils::instance()->write($writer->process(self::$coverage, true));
            }
        }
    }

    public function afterroute(): void
    {
        \Base::instance()->set('UI', '../tests/ui/');
        $result = \Preview::instance()->render('statera.htm');
        if (!$this->cli) {
            echo $result;
        } else {
            // CliUtils::instance()->writeTestPassed('All teest passed');
            foreach (\Base::instance()->get('SERVER')['argv'] as $arg) {
                if (str_starts_with($arg, '-o=')) {
                    \Base::instance()->write(Strings::after($arg, '-o='), $result);
                }
            }
        }
    }

    public static function formatTime($value, $decimals)
    {
        if ($value > 6e4) {
            $result = floor($value / 6e4) . ' min ' . (round($value / 1e3, 0) - floor($value / 6e4) * 60) . ' sec';
        } elseif ($value > 1e3) {
            $result = round($value / 1e3, $decimals) . ' sec';
        } else {
            $result = round($value, $decimals) . ' ms';
        }

        return $result;
    }

    private function configPHP(): void
    {
        set_time_limit(600);
        ini_set('memory_limit', '-1');
    }

    private function detectCli(): void
    {
        $this->cli = \PHP_SAPI === 'cli';
    }

    private static function isCoverageEnabled()
    {
        if (null === self::$coverageEnabled) {
            self::$coverageEnabled = \array_key_exists('statera', $_GET) && 'withCoverage' === $_GET['statera'];
            if (self::$coverageEnabled && null === self::$coverage) {
                $filter = new Filter();
                $filter->includeDirectory(getcwd() . \DIRECTORY_SEPARATOR . 'src');
                self::$coverage = new CodeCoverage(new XdebugDriver($filter), $filter);
            }
        }

        return self::$coverageEnabled;
    }

    /**
     * @param \Base $f3
     */
    private function configF3ForTest($f3): void
    {
        // Do not halt on error
        $f3->set('HALT', false);
        $f3->set('utest.errors', []);
        // Set custom reroute handler for unit tests
        $f3->set(
            'ONREROUTE',
            static function($url, $permanent) use ($f3): void {
                $f3->set('utest.rerouted', $url);
            }
        );
        $f3->set('utest.number', 0);
    }

    /**
     * @param $f3 Base
     *
     * @return string
     */
    private function testResultFilePath($f3)
    {
        return $f3->get('ROOT') . \DIRECTORY_SEPARATOR . 'statera' . \DIRECTORY_SEPARATOR . 'test.result';
    }
}

class Map
{
    public function get(): void
    {
    }

    public function post(): void
    {
    }
}
