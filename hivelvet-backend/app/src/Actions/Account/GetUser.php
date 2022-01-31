<?php

namespace Actions\Account;

use Actions\Base as BaseAction;
use Enum\ResponseCode;
use Models\ResetTokenPassword;
use Models\User;

class GetUser extends BaseAction
{
    public function __construct()
    {
        parent::__construct();
    }

    public function execute($f3, $params): void
    {
         $token=$f3->get('GET.token') ;

        $user=new User();
        $resettoken=new ResetTokenPassword();
        if ($resettoken->tokenExists($token)) {
            $resettoken->getByToken($token);
            if($resettoken->status =="new") {


                if ($resettoken->expirationDate == date('Y-m-d')) {

                    $resettoken->status = "expired";

                    $this->logger->error('token was expired' );
                    $this->renderJson(['message' => 'token was expired'],ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                }
                $user=$user->getByID($resettoken->userID);
                $this->renderJson(['user' => $user->toArray(),ResponseCode::HTTP_OK]);


            }
          if($resettoken->status =="consumed") {

              $this->logger->error('token was consumed' );
              $this->renderJson(['message' => 'token was consumed'],ResponseCode::HTTP_INTERNAL_SERVER_ERROR);


          }


        }







    }
}
