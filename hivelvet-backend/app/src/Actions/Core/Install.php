<?php

/**
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

namespace Actions\Core;

use Actions\Base as BaseAction;
use Base;
use Enum\ResponseCode;
use Enum\UserRole;
use Enum\UserStatus;
use Models\Setting;
use Models\User;

/**
 * Class Install
 * @package Actions\Account
 */
class Install extends BaseAction
{

    /**
     * @param Base  $f3
     * @param array $params
     */
    public function execute($f3, $params): void
    {
        // test with the same env var in frontend
        //if ($f3->get('system.installed') === false) {

        $post=$f3->get("POST");
        $this->logger->info('POST', ["POST"=>$f3->get("POST")]);

        $this->logger->info('files', ["files"=>$f3->get("FILES")]);
        $files = \Web::instance()->receive();


        $this->logger->info('files', ["files"=>$files]);


     $user               = new User();
        $user->email        = $post['email'];
        $user->username     = $post['username'];
        $user->password     = $post['password'];
        $user->role         = UserRole::ADMIN;
        $user->status       = UserStatus::ACTIVE;
        $user->created_on   = date('Y-m-d H:i:s');

        try {
       $this->logger->info('App configuration', ['user' => $user->toArray()]);




            $setting                  = new Setting();
           $setting->company_name    = $post['company_name'];
            $setting->company_website = $post['company_url'];
            $setting->platform_name   = $post['platform_name'];
            $setting->terms_use       = $post['term_url'];
            $setting->privacy_policy  = $post['policy_url'];
            $setting->logo = $post['logo_name']   ;
            $setting->primary_color    = $post['primary_color'];
            $setting->secondary_color  = $post['secondary_color'];
            $setting->accent_color     = $post['accent_color'];
            $setting->additional_color = $post['add_color'];

            try {
                $this->logger->info('App configuration', ['setting' => $setting->toArray()]);
                /*
                $user->save();
                $setting->save();
                $this->logger->info('administrator and settings successfully added', ['user' => $user->toArray()]);
                $this->renderJson(['message' => 'Application is ready now !']);
                */
            } catch (\Exception $e) {
                $message = $e->getMessage();
                $this->logger->error('settings could not be added', ['error' => $message]);
                $this->renderJson(['errorStep2' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                return;
            }
        } catch (\Exception $e) {
            $message = $e->getMessage();
            $this->logger->error('administrator could not be added', ['error' => $message]);
            $this->renderJson(['errorStep1' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

            return;
        }

    }
}
