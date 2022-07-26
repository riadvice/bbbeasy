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

namespace Actions\Labels;

use Actions\Base as BaseAction;
use Enum\ResponseCode;
use Models\Label;
use Respect\Validation\Validator;
use Validation\DataChecker;
use Actions\RequirePrivilegeTrait;
/**
 * Class Edit.
 */
class Edit extends BaseAction
{use RequirePrivilegeTrait;
     /**
     * @param $f3
     * @param $params
     *
     * @throws \JsonException
     */

    public function save($f3, $params): void
    {
        $body = $this->getDecodedBody();
        $form = $body['data'];
        $id = $params['id'];
        $label= $this->loadData($id);
        if ($label->valid())
        {
            $dataChecker = new DataChecker();
            $dataChecker->verify($form['name'], Validator::notEmpty()->setName('name'));
            $dataChecker->verify($form['color'], Validator::hexRgbColor()->setName('color')); 

            if ($dataChecker->allValid())
            {
                $checklabel = new Label();
                $label->name = $form['name'];
                $label->description =$form['description'];
                $label->color = $form['color'];
                if ($checklabel->nameExists($label->name))
                {
                    $this->logger->error('Labelcould not be updated', ['error' => 'Name already exist']);
                    $this->renderJson(['errors' => ['name' => 'Name already exist']], ResponseCode::HTTP_PRECONDITION_FAILED);

                    return;
                }
            }else
                {
                    $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);

                    return;
                }  
                
        
        try {
            $label->save();
            } 
        catch (\Exception $e) 
            {
            $this->logger->error('Label could not be updated', ['error' => $e->getMessage()]);
            $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

            return;
            }

        $role = $this->loadData($label->id);
        $this->logger->info('Label successfully updated', ['Label' => $label->toArray()]);
        $this->renderJson(['result' => 'success', 'label' => $label->getLabelInfos()]);
    } 
    else {
        $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
    }
} 
    /**
     * @param int $id
     */
    public function loadData($id): Label
    {
        $label = new Label();
        $label->load(['id = ?', [$id]]);

        return $label;
    }
}