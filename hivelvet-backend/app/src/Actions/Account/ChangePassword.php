<?php

namespace Actions\Account;
use Actions\Base as BaseAction;
use Enum\ResponseCode;
use Enum\UserRole;
use Enum\UserStatus;
use Models\ResetTokenPassword;
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
        $resettoken= new ResetTokenPassword();
        $form   = $this->getDecodedBody();

        $token  =  $form['token'] ;
        $password  =  $form['password'] ;






          $resettoken=$resettoken->getByToken($token);



               $user= $user->getByID($resettoken->userID);
                $user->password=$password;
                $resettoken->status="consumed";


                try{
                    $resettoken->save();
                    $user->save();
                }
                catch (\Exception $e){

                    $message ="password could not be changed";
                    $this->logger->error('reset password error : password could not be changed', ['error' => $message]);
                    $this->renderJson(['message' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                    return;
                }


                $this->renderJson(['message' => "password changed successfully","user"=>$user->toArray()]);
            }




}