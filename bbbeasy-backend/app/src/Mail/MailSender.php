<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.com/
 *
 * Copyright (c) 2022-2026 RIADVICE SUARL and by respective authors (see below).
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

namespace Mail;

use Nette\Utils\Strings;
use Sukarix\Configuration\Environment;
use Sukarix\Mail\MailSender as BaseMailSender;

/**
 * MailSender Class.
 */
class MailSender extends BaseMailSender
{
    public function send($template, $vars, $to, $title, $subject): bool
    {
        $messageId         = $this->generateId();
        $vars['date']      = date('l d F H:i:s');
        $vars['messageId'] = Strings::before(mb_substr($messageId, 1, -1), '@');
        $vars['SCHEME']    = $this->f3->get('SCHEME');
        $vars['HOST']      = Environment::getHostName();
        $vars['PORT']      = $this->f3->get('PORT');
        $vars['BASE']      = $this->f3->get('BASE');

        $message = \Template::instance()->render('mail/' . $template . '.phtml', null, $vars);

        return $this->smtpSend($this->f3->get('mailer.from_mail'), $to, $title, $subject, $message, $messageId);
    }

}
