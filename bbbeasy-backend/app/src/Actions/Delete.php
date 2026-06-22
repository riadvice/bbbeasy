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

namespace Actions;

use Actions\Base as BaseAction;
use Enum\ResponseCode;
use Models\Base as Model;
use Nette\Utils\Strings;

/**
 * Class Delete.
 */
abstract class Delete extends BaseAction
{
    protected $recordId;

    /**
     * @var \ReflectionClass
     */
    protected $class;

    /**
     * @var string
     */
    protected $model;

    /**
     * @var Model
     */
    protected $modelInstance;

    /**
     * @var string
     */
    protected $deleteMethodName = 'erase';

    /**
     * @var string
     */
    protected $messageArg;

    /**
     * @param \Base $f3
     * @param array $params
     *
     * @throws
     */
    public function execute($f3, $params): void
    {
        $this->recordId = $params['id'];

        if (null === $this->model) {
            $this->model = $f3->camelcase(Strings::capitalize(str_replace('-', '_', Strings::before($f3->get('ALIAS'), '_delete'))));
        }

        $this->class         = new \ReflectionClass("Models\\{$this->model}");
        $this->modelInstance = $this->class->newInstance();

        $this->modelInstance->load($this->getFilter());
        $this->logger->info('Built delete action for entity', ['model' => $this->model, 'id' => $this->recordId]);
        if ($this->modelInstance->valid()) {
            try {
                $deleteResult = \call_user_func_array([$this->modelInstance, $this->deleteMethodName], []);
            } catch (\Exception $e) {
                $this->logger->critical('Error occurred while deleting entity', ['model' => $this->model, 'id' => $this->recordId]);
                $this->renderJson([], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                return;
            }

            if (false === $deleteResult) {
                $this->logger->critical('Error occurred while deleting entity', ['model' => $this->model, 'id' => $this->recordId]);
                $this->renderJson([], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                return;
            }

            [$resultMsg, $resultCode] = \is_array($deleteResult) && 2 === \count($deleteResult) ? $deleteResult : [['result' => 'success'], ResponseCode::HTTP_OK];

            $this->logger->info('Entity successfully deleted', ['model' => $this->model, 'id' => $this->recordId]);
            $this->renderJson($resultMsg, $resultCode);
        } else {
            $this->logger->error('Entity could not be deleted', ['model' => $this->model, 'id' => $this->recordId]);
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
    }

    protected function getFilter(): array
    {
        return ['id = ?', $this->recordId];
    }
}
