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
    /**
     * @param \Exception $exception
     */
    public function sendExceptionEmail($exception): void
    {
        $hash         = mb_substr(md5(preg_replace('~(Resource id #)\d+~', '$1', (string) $exception)), 0, 10);
        $mailSentPath = $this->f3->get('ROOT') . '/' . $this->f3->get('LOGS') . 'email-sent-' . $hash;
        $snooze       = strtotime('1 day') - time();
        $messageId    = $this->generateId();
        if (@filemtime($mailSentPath) + $snooze < time() && @file_put_contents($mailSentPath, 'sent')) {
            $this->f3->set('mailer.from_name', 'BBBEasy Debugger');
            $subject = 'PHP: An error occurred on server ' . Environment::getHostName() . " ERROR ID '{$hash}'";
            $message = 'An error occurred on <b>' . Environment::getHostName() . '</b><br />' . nl2br($exception->getTraceAsString());
            $this->smtpSend(null, $this->f3->get('debug.email'), 'BBBEasy DevOps', $subject, $message, $messageId);
        }
    }

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

    /**
     * Check that the configured SMTP server accepts connections.
     */
    protected function smtpIsReachable(): bool
    {
        $host = (string) $this->f3->get('mailer.smtp.host');
        $port = (int) ($this->f3->get('mailer.smtp.port') ?: 25);

        if ('' === $host) {
            return false;
        }

        $socket = @fsockopen(mb_strtolower($host), $port, $errno, $error, 2);
        if (!$socket) {
            return false;
        }
        fclose($socket);

        return true;
    }

    protected function smtpSend($from, $to, $title, $subject, $message, $messageId): bool
    {
        if (\is_array($to)) {
            foreach ($to as $email) {
                $this->mailer->addTo($email);
            }
        } else {
            $this->mailer->addTo($to, $title);
        }

        if (null !== $from) {
            $this->mailer->setFrom($from);
        }
        $this->mailer->setHTML($message);
        $this->mailer->set('Message-Id', $messageId);

        // The SMTP transport aborts the whole request when the server cannot be
        // reached, check the connection first and report the failure to the caller.
        if (!$this->smtpIsReachable()) {
            $this->logger->error('Sending email failed, the SMTP server is unreachable', [
                'host' => $this->f3->get('mailer.smtp.host'),
                'port' => $this->f3->get('mailer.smtp.port'),
            ]);

            return false;
        }

        $sent = $this->mailer->send($subject, Environment::isNotProduction());
        if ($sent && Environment::isNotProduction()) {
            @file_put_contents(
                $this->f3->get('MAIL_STORAGE') . mb_substr($messageId, 1, -1) . '.eml',
                explode("354 Go ahead\n", explode("250 OK\nQUIT", (string) $this->mailer->log())[0])[1]
            );
        }

        $this->logger->info('Sending email | Status: ' . ($sent ? 'true' : 'false') . " | Log:\n" . $this->mailer->log());

        return (bool) $sent;
    }
}
