<?php

namespace Actions\Account;

use Enum\ResponseCode;
use Enum\UserRole;
use Helpers\Time;
use Mail\MailSender;
use Models\User;
use Actions\Base as BaseAction;
use \PHPMailer\PHPMailer\PHPMailer;

use Enum\UserStatus;

class Reset extends  BaseAction
{
    public function __construct()
    {
        parent::__construct();
    }

    public function execute($f3): void
    {
        $user = new User();
        $form = $this->getDecodedBody();

        $email = $form['email'];


        if ($user->emailExists($email)) {
            $user = $user->getByEmail($email);


                // valid credentials
                $this->session->authorizeUser($user);


                $this->session->set('locale', $user->locale);
                $message = 'Valid credentials';
                $mail = new  MailSender();
                $template = "common/header";
                $mail->send($template, [], $email, "reset password", "reset password");

                if ($mail) {

                    $this->renderJson(["message"=> "We have sent a link to reset you password to your mail address "],ResponseCode::HTTP_OK);
                }
            } else {
                // email invalid or user no exist
                $message = 'Email invalid';
                // $this->logger->error('Login error : user could not logged', ['error' => $message]);
                $this->renderJson(['message' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
            }
        }


   }