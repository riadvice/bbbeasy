<p align="center">
  <img src="https://github.com/riadvice/bbbeasy/blob/develop/bbbeasy-frontend/public/images/logo_02.png" alt="BBBEasy Logo">
</p>

<p align="center">
<a href="https://github.com/riadvice/bbbeasy" target="__blank"><img alt="GitHub forks" src="https://img.shields.io/github/forks/riadvice/bbbeasy?style=social"></a>
<a href="https://github.com/riadvice/bbbeasy" target="__blank"><img alt="GitHub stars" src="https://img.shields.io/github/stars/riadvice/bbbeasy?style=social"></a>
</p>

# BBBEasy

BBBEasy is an open-source  multipurpose meeting rooms manager for BigBlueButton.

## Features

- Smooth installation experience.

- User friendly UI.

- Manage different configuration presets and assign them to rooms.

- Rooms management.

- Users management.

## Components

The web-application is split in two parts:

- A server API.

- A modern front-end.

## 🪴 Project Activity

![Alt](https://repobeats.axiom.co/api/embed/22737fcd7e97f3c37ff740f195ece60264185796.svg "Repobeats analytics image")

## Development

The supported way to run BBBEasy locally is Docker Compose. It builds the frontend, the
backend and nginx from this repository, so no image has to be pulled from a registry.

```bash
cp bbbeasy-backend/app/config/config-development.sample.ini bbbeasy-backend/app/config/config-development.ini
docker compose up -d
docker compose exec bbbeasy php vendor/bin/phinx migrate -e production
```

| Service | Address |
|---|---|
| Web application | http://localhost:8080 |
| API | http://localhost:8080/api |
| Outgoing mail | http://localhost:8025 |
| PostgreSQL | localhost:55432 |

Set your BigBlueButton server and shared secret in `docker/config-production.ini` before
starting a room. The sources are baked into the images, so rebuild after a change:

```bash
docker compose build bbbeasy webserver && docker compose up -d
```

### Vagrant

The Vagrant box is still in the tree for the legacy workflow:

- To launch the backend in the development mode, follow these steps :

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1- Start a Command Prompt as an **Administrator**.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2- Run `cd /path/to/cloned/project/`.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 3- Run `vagrant up && vagrant ssh` and wait until the end of the process.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 4- Run `cp /app/bbbeasy-backend/app/config/config-development.sample.ini /app/bbbeasy-backend/app/config/config-development.ini`.

- To launch the frontend in the development mode, follow these steps :

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1- Run `cd /app/bbbeasy-frontend`.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2- (Optional) Run `sudo /app/tools/bbbeasy --selfinstall` to make `bbbeasy` available globally.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 3- On machines where the hostname is not `bbbeasy.test`, pass `--env development` to `bbbeasy` commands (e.g., `../tools/bbbeasy --env development --enableweb`).

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 4- Run `yarn start-dev-installer` to enable the **installer** app or `yarn start-dev` to enable the **web** app.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; The Vite dev server runs on port 3300 and the browser will open http://bbbeasy.test/ (via nginx).

## Contributing

## Security

## Testing

BBBEasy follows a **pyramid testing strategy** — unit tests form the foundation, with E2E tests covering critical user journeys.

### Backend — Unit Tests

The backend uses [Atoum](https://atoum.org/) as its test framework. Tests cover all API endpoints, models, authentication, and permissions.

| Command | Description |
|---|---|
| `php vendor/bin/atoum -d tests/src` | Run all backend tests |
| `php vendor/bin/atoum -d tests/src/Actions/Account` | Run account-related tests |
| `php vendor/bin/atoum -d tests/src/Actions/Rooms` | Run room-related tests |
| `php vendor/bin/atoum -d tests/src/Models` | Run model tests |

Alternatively, from the browser:

- `http://bbbeasy.test/api?statera` — View test results
- `http://bbbeasy.test/api?statera=withCoverage` — View results with coverage report

### Frontend — E2E Tests

End-to-end tests use [Playwright](https://playwright.dev/) and are organized into two independent suites:

| Suite | File | Command |
|---|---|---|
| **Installer** | `tests/e2e/installer.spec.ts` | `yarn test:e2e:installer` |
| **Web App** | `tests/e2e/webapp.spec.ts` | `yarn test:e2e:webapp` |
| **All** | — | `yarn test:e2e` |

#### Prerequisites

1. Enable the **installer** app as described in the [Development](#development) section;
   `installer.spec.ts` only passes against a build made with `VITE_INSTALLER_FEATURE=true`.
2. Install the Chromium browser: `npx playwright install chromium`
3. Ensure the backend server is running and accessible.

The suite reads its target from the environment, so it can run against the Compose stack:

```bash
PGPORT=55432 VITE_APP_URL=http://localhost:8080 yarn test:e2e:webapp
```

`PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` and `PGDATABASE` select the database the tests
read from, and `VITE_APP_URL` the deployment they drive.

#### Running Tests

```bash
# Run all E2E tests (installer + webapp)
yarn test:e2e

# Run only installer tests
yarn test:e2e:installer

# Run only webapp tests
yarn test:e2e:webapp

# Open interactive Playwright UI for debugging
yarn test:e2e:ui

# Run a specific test by name
npx playwright test -g "Test login"
```

#### Test Coverage

| Module | Installer | Web App |
|---|---|---|
| Installation wizard (3 steps) | ✅ | — |
| Login / Register | — | ✅ |
| Password reset / change | — | ✅ |
| Roles (CRUD + permissions) | — | ✅ |
| Users (CRUD + status) | — | ✅ |
| Rooms (create) | — | ✅ |
| Presets (create) | — | ✅ |
| Labels (add) | — | ✅ |
| Recordings (view) | — | ✅ |
| Branding (view) | — | ✅ |
| Home / Landing / 404 | — | ✅ |

## Technologies

[![Fat-Free Framework](https://github.com/bcosca/fatfree/raw/master/ui/images/logo.png)](https://fatfreeframework.com)

[Node.js](https://nodejs.org/en/)

[React JS](https://reactjs.org/)

[Redis](https://redis.io/)

[Percona Distribution for PostgreSQL](https://www.percona.com/software/postgresql-distribution)

[TypeSCript](https://www.typescriptlang.org/)

[Playwright](https://playwright.dev/)

[NGINX](https://www.nginx.com/)

[Vagrant](https://www.vagrantup.com/)
