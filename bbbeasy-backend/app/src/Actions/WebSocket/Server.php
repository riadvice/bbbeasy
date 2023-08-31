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

namespace Actions\WebSocket;

use CLI\Agent;
use CLI\WS;
use Log\LogWriterTrait;

class Server
{
    use LogWriterTrait;

    public function __construct()
    {
        $this->initLogger();
        $ws = new WS('tcp://127.0.0.1:8800');
        $this->register($ws);
        $ws->run();
    }

    public function onStart(WS $ws): void
    {
        $this->logger->info('WebSocket server started');
    }

    public function onError(WS $ws): void
    {
        $this->logger->error(__METHOD__);

        if ($err = socket_last_error()) {
            $this->logger->debug(socket_strerror($err));
            socket_clear_error();
        }

        if ($err = error_get_last()) {
            $this->logger->debug($err['message']);
        }
    }

    public function onStop(WS $ws): void
    {
        $this->logger->debug('Shutting down');
    }

    public function onConnect(Agent $agent): void
    {
        $this->logger->debug('Agent ' . $agent->id() . ' connected');

        $this->sendMessageToAllClients($agent->server(), sprintf('Client with ID %s joined', $agent->id()));
    }

    public function onDisconnect(Agent $agent): void
    {
        $this->logger->debug('Agent ' . $agent->id() . ' disconnected');

        if ($err = socket_last_error()) {
            $this->debug(socket_strerror($err));
            socket_clear_error();
        }

        $this->sendMessageToAllClients($agent->server(), sprintf('Client with ID %s left', $agent->id()));
    }

    public function onIdle(Agent $agent): void
    {
        $this->logger->debug('Agent ' . $agent->id() . ' idles');
    }

    public function onReceive(Agent $agent, int $op, string $data): void
    {
        // This example is only utilizing text frames for application-specific payload.
        if (WS::Text !== $op) {
            $this->logger->debug(sprintf('Agent %s sent a message with ignored opcode %s.', $agent->id(), $op));

            return;
        }

        $this->logger->debug(sprintf('Agent %s sent a message: %s', $agent->id(), $data));

        /**
         * Forward received message to all clients.
         */
        $message = json_encode([
            'author'  => $agent->id(),
            'message' => trim($data),
        ]);

        $this->logger->debug('Forward message to all clients: ' . $message);
        $this->sendMessageToAllClients($agent->server(), $message);
    }

    public function onSend(Agent $agent, int $op, string $data): void
    {
        $this->logger->debug(sprintf('Agent %s will receive a message: %s', $agent->id(), $data));
    }

    /**
     * Registers the event listeners.
     */
    private function register(WS $ws): void
    {
        $ws
            ->on('start', [$this, 'onStart'])
            ->on('error', [$this, 'onError'])
            ->on('stop', [$this, 'onStop'])
            ->on('connect', [$this, 'onConnect'])
            ->on('disconnect', [$this, 'onDisconnect'])
            ->on('idle', [$this, 'onIdle'])
            ->on('receive', [$this, 'onReceive'])
            ->on('send', [$this, 'onSend'])
        ;
    }

    /**
     * Sends the provided message to all connected clients of the given server.
     */
    private function sendMessageToAllClients(WS $ws, string $message): void
    {
        /** @var Agent $agent */
        foreach ($ws->agents() as $agent) {
            $agent->send(WS::Text, $message);
        }
    }

    /**
     * Writes a debug message to `STDOUT`.
     */
    private function debug(string $message): void
    {
        $date   = date('Y-m-d H:i:s');
        $memory = round(memory_get_usage(true) / 1000 / 1000, 3) . ' MB';

        fwrite(STDOUT, $date . ' | ' . $memory . ' | ' . $message . "\n");
    }
}
