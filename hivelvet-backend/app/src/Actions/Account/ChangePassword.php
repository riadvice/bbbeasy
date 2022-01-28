<?php

namespace Actions\Account;
use Actions\Base as BaseAction;
use Enum\ResponseCode;
use Enum\UserRole;
use Enum\UserStatus;
use Models\User;


/**
 * Class ChangePassword
 * @package Actions\Account
 */
class ChangePassword  extends BaseAction
{
    public function __construct()
    {
        parent::__construct();
    }

    public function execute($f3): void
    {
        $user   = new User();

        $form   = $this->getDecodedBody();

        $token  =  $form['token'] ;
        $password  =  $form['password'] ;

        $user = $user->getByResetToken($token);

        $tokenExist     = $user->load(['token = ?', $form['token']]);

        if ( $tokenExist ) {
            $user->password=$password;


            try{
                $user->save();
            }
            catch (\Exception $e){
                $message = $e->getMessage();
                $this->logger->error('reset password error : password could not be changed', ['error' => $message]);
                $this->renderJson(['message' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                return;
            }
            $user->token=null;
            echo $user->token;
            $this->renderJson(['message' => "password changed successfully","user"=>$user->toArray()]);
        }
        else {

            $this->logger->error('user does not exist with this email', ['user' => $user->toArray()]);
            $this->renderJson(['message' => 'user does not exist',ResponseCode::HTTP_INTERNAL_SERVER_ERROR]);
        }
    }


}