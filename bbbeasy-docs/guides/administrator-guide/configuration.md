---
sidebar_position: 1
title: 'Configuration'
sidebar_label: 'Configuration files'
---

# Configuration

## Backend

The backend reads its settings from `.ini` files in `bbbeasy-backend/app/config/`. The
values that differ per deployment — and the secrets — are read from the environment
instead, so `docker/config-production.ini`, which is tracked in the repository, does not
have to hold them.

### Outgoing mail

The Compose stack catches mail in [mailpit](http://localhost:8025), so a development
instance sends nothing outside. Point a deployment at a real server with these variables.
Anything left unset keeps the value in `app/config/smtp.ini`:

| Variable | Sets |
|---|---|
| `BBBEASY_SMTP_HOST` | Server host name |
| `BBBEASY_SMTP_PORT` | Server port |
| `BBBEASY_SMTP_SCHEME` | `ssl`, `tls`, or empty for none |
| `BBBEASY_SMTP_USERNAME` | Account BBBEasy signs in with |
| `BBBEASY_SMTP_PASSWORD` | Password for that account |
| `BBBEASY_SMTP_FROM_EMAIL` | Address the mail comes from |
| `BBBEASY_SMTP_SENDER_NAME` | Name shown beside that address |

A relay such as [Postal](https://docs.postalserver.io/) signs in as one identity and sends
as another, so the account, the address and the name are three separate settings:

```bash
BBBEASY_SMTP_HOST=postal.example.org
BBBEASY_SMTP_PORT=587
BBBEASY_SMTP_USERNAME=rooms-app-7f3c
BBBEASY_SMTP_PASSWORD=…
BBBEASY_SMTP_FROM_EMAIL=notifications@rooms.example.org
BBBEASY_SMTP_SENDER_NAME=Example Rooms
```

`docker-compose.yml` passes all seven through to the backend container, so they can be set
in the shell or in a `.env` file beside it.

:::note
A server BBBEasy cannot reach is reported to the caller rather than aborting the request:
the password reset page shows an error and the reason is written to
`bbbeasy-backend/logs/`.
:::

### BigBlueButton

`bbb.server` and `bbb.shared_secret` in `docker/config-production.ini` point BBBEasy at the
BigBlueButton server. Both must be set before a room can be started; the status endpoint
calls `getApiVersion` to check them, so a wrong secret or an unreachable server is reported
rather than assumed to be working.

## Installer

## Frontend
