# BBBEasy project notes for agents

## Running the stack

Everything runs from `docker compose` at the repository root. Vagrant is still in the tree
but is no longer the supported path.

```
docker compose up -d
docker compose exec bbbeasy php vendor/bin/phinx migrate -e production
```

| Service   | Where                                    |
| --------- | ---------------------------------------- |
| Web app   | http://localhost:8080                     |
| API       | http://localhost:8080/api                 |
| Mail      | http://localhost:8025 (mailpit)           |
| Postgres  | localhost:55432 (5432 is taken on the VM) |

`docker/Dockerfile` builds three targets: `frontend` (Vite build), `backend` (PHP-FPM) and
`web` (nginx serving the built frontend and proxying `/api`). Rebuild after a code change
with `docker compose build <service>` — the sources are baked into the image, not mounted.

`docker/config-production.ini` is tracked and must only ever hold placeholder BigBlueButton
credentials. Set real ones locally to test, then scrub before committing.

## Build / test commands

- Backend dependencies: `cd bbbeasy-backend && composer install --ignore-platform-req=ext-xdebug`
- Fix PHP code style: `cd bbbeasy-backend && PHP_CS_FIXER_IGNORE_ENV=true vendor/bin/php-cs-fixer fix`
- Backend migrations: `vendor/bin/phinx migrate -e production` (inside the container)
- Frontend dependencies: `cd bbbeasy-frontend && corepack yarn install`
- Frontend build: `yarn build` or `yarn build-installer`
- Frontend lint: `yarn lint`, types: `yarn tsc --noEmit -p tsconfig.json`
- Backend suite: `./run-tests.sh` at the repository root, or one group with
  `./run-tests.sh models`. It runs Statera in the `tests` container with the working
  tree mounted, so no image rebuild is needed. Each run drops and migrates the
  `bbbeasy_test` schema first, the suite is not transactional and leaves its fixtures
  behind.
- End to end: `PGPORT=55432 VITE_APP_URL=http://localhost:8080 yarn test:e2e`
  (`installer.spec.ts` needs a build made with `VITE_INSTALLER_FEATURE=true`)

## Stack

- PHP 8.5, Sukarix 0.4.0 on Fat-Free 3.9, Phinx 0.16, PostgreSQL 18, Redis 8, nginx 1.29
- React 19, Ant Design 6, Vite 7, TypeScript 5, Playwright 1.63
- BigBlueButton API library 3.0 — typed enums, `setGuestPolicy` and `JoinMeetingParameters`
  take `BigBlueButton\Enum\*` values rather than strings

## Framework notes

- The application is bootstrapped by `Sukarix\Application\Bootstrap`; `Application\Bootstrap`
  only overrides what BBBEasy needs (JWT session, CORS headers, dynamic route access).
- `classes.ini` maps the injector aliases (`session`, `i18n`, `access`, `mailer`, `assets`).
- `Core\Session` is a stateless JWT session, not the framework's SQL session. It registers
  itself in the registry before hydrating, because loading the user goes back through the
  injector.
- Uniqueness checks go through `Models\Base::excludeId()`. Never write
  `... and id != ?` with a possibly null identifier: in SQL that matches nothing and the
  whole check silently passes.
- `ikkez/f3-cortex` still calls `ReflectionProperty::setAccessible()`, deprecated in PHP 8.5.
  Both Fat-Free and Tracy force their own error level, so `Application\Bootstrap::handleException()`
  masks `E_DEPRECATED` last. Remove it once Cortex is fixed.
- Mailer settings live under the `mailer.*` hive prefix, not at the top level.
- PostgreSQL identity columns carry no `nextval` default, so Fat-Free does not treat
  them as auto increment and the reload it runs after an insert matches nothing.
  `Models\Base::insert()` reads the record back, without it every model is blank in
  memory right after `save()`.
- A route alias is the privilege it belongs to: `<group>_<action>`, matching what
  `Utils\PrivilegeUtils` discovers from the action namespaces. `Utils\RoutePrivileges`
  turns a role permission into the routes it opens and `RoutePrivilegesTest` fails as
  soon as the two drift apart.
- Every call to BigBlueButton goes through `BigBlueButtonRequester::send()`, the
  library throws on transport errors and an unreachable server would otherwise be a
  500 on every page that talks to it.

## Ant Design 6 notes

The stylesheets target Ant Design class names, and version 6 renamed several. Aliases live
in `App-webapp.css` / `App-installer.css`:

- `.ant-modal-content` → `.ant-modal-container`
- `.ant-select-selector` → `.ant-select-content`
- `.ant-select-selection-placeholder` → `.ant-select-placeholder`
- `.ant-card-meta-detail` → `.ant-card-meta-section`
- The number input is now a plain `<input>` inside `.ant-input-number`

`PageHeader` is a local component (`src/components/PageHeader.tsx`); the package that used to
provide it is pinned to Ant Design 5.
