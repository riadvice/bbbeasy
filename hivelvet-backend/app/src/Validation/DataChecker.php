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

namespace Validation;

use Respect\Validation\Validator;
use Tracy\Debugger;

/**
 * Class Validator.
 */
class Verifier
{
    private array $errors;

    public array $validators = [];

    public function &newValidator($name, $value): Validator
    {
        $this->validators[$name]['rule'] = new Validator();
        $this->validators[$name]['value'] = $value;
        return $this->validators[$name]['rule'];
    }

    /**
     * @param $name
     * @param $input
     * @param $messages
     *
     * @return $this|bool
     */
    public function verify($name, $input = null, $messages = null): static|bool
    {
      //  Debugger::dump($this->validators);

        $exception = null;
        foreach ($this->validators as $rule) {
            try {
                Debugger::dump($rule['rule']);
                Debugger::dump($rule['value']);
                $rule['rule']->check($rule['value']); // true
            } catch(\Exception $exception) {
                \Tracy\Debugger::dump($exception);
                break;
            }
        //   Debugger::dump($this->validators);
        }
        exit;
        $exceptions = $this->v->check($input);
        $numRules = \count($this->rules);
        $numExceptions = is_countable($exceptions) ? \count($exceptions) : 0;
        $summary = [
            'total' => $numRules,
            'failed' => $numExceptions,
            'passed' => $numRules - $numExceptions,
        ];

        // Remove rules once the validation has been finished
        $this->removeRules();
        if (!empty($exceptions)) {
            $exception = $this->reportError($input, $summary)->setRelated($exceptions);
            $this->errors[$name] = $messages ? $exception->findMessages($messages) : $exception->getFullMessage();

            return false;
        }

        return true;
    }

    /**
     * @param $popErrors     bool If true errors will be put into f3 hive
     * @param $errorsHiveKey string
     *
     * @return bool
     */
    public function allValid($popErrors = true, $errorsHiveKey = 'form_errors')
    {
        if (!empty($this->errors) && $popErrors) {
            foreach ($this->getErrors() as $key => $errors) {
                if (\is_array($errors)) {
                    \Base::instance()->set($errorsHiveKey . '.' . $key, array_values($errors)[0]);
                }
            }
        }

        return empty($this->errors);
    }

    public function getErrors()
    {
        return $this->errors;
    }
}
