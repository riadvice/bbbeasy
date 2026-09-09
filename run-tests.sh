#!/bin/sh
# Runs the Statera backend suite in the test container with the working tree
# mounted, so a run does not need an image rebuild.
B=/var/www/html/bbbeasy-backend
exec docker compose --profile test run --rm --no-deps \
    -v "$PWD/bbbeasy-backend/app/src:$B/app/src:ro" \
    -v "$PWD/bbbeasy-backend/app/config:$B/app/config:ro" \
    -v "$PWD/bbbeasy-backend/tests:$B/tests:ro" \
    -v "$PWD/bbbeasy-backend/tools:$B/tools:ro" \
    tests tools/statera.sh "${1:-all}"
