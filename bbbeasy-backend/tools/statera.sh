#!/bin/sh
# Resets the test database, brings the schema up to date and runs the suite.
set -e
cd "$(dirname "$0")/.."
php tools/reset-database.php testing
php vendor/bin/phinx migrate -e testing
exec php tools/statera.php "/api?statera&test=${1:-all}"
