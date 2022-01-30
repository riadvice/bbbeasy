<?php

namespace Actions\Account;

use Actions\Base as BaseAction;
use Enum\ResponseCode;
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
        if ($user->tokenExists($token)) {

            $this->renderJson(['user' => $user->toArray(),ResponseCode::HTTP_OK]);
        }else{
            $this->renderJson(['message' => "request timed out "], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
         }

    /*   if($user->id){
           echo "no user";
          // $this->logger->error('user does not exist with this email', ['user' => $user->toArray()]);
          // $this->renderJson(['message' => 'You cannot access to this page request timed out',ResponseCode::HTTP_NOT_FOUND]);
       }*/

    }
}
