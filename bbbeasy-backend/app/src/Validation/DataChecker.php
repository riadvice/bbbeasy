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

namespace Validation;

use Respect\Validation\Exceptions\NestedValidationException;
use Respect\Validation\Validatable;

/**
 * Class Validator.
 */
class DataChecker
{
    private array $errors;

    public function verify($input, Validatable $validator): bool
    {
        if (null !== $validator->getName()) {
            $validationException = null;

            try {
                $validator->assert($input);
            } catch (NestedValidationException $exception) {
                $validationException = $exception;
            }

            $numRules      = \count($validator->getRules());
            $numExceptions = null !== $validationException ? \count($validationException->getChildren()) : 0;
            $summary       = [
                'total'  => $numRules,
                'failed' => $numExceptions,
                'passed' => $numRules - $numExceptions,
            ];
            if (null !== $validationException) {
                $fullName                            = str_replace('_', ' ', $validator->reportError($input, $summary)->getFullMessage());
                $this->errors[$validator->getName()] = $fullName;

                return false;
            }
        } else {
            throw new \RuntimeException('The validator must have a name');
        }

        return true;
    }

    /**
     * @param $popErrors     bool If true errors will be put into f3 hive
     * @param $errorsHiveKey string
     *
     * @return bool
     */

    /**
     * @return bool
     */
    public function allValid($popErrors = true, $errorsHiveKey = 'api_errors')
    {
        if (!empty($this->errors) && $popErrors) {
            \Base::instance()->set($errorsHiveKey, $this->errors);
        }

        return empty($this->errors);
    }

    public function getErrors()
    {
        return !empty($this->errors) ? $this->errors : [];
    }
}
