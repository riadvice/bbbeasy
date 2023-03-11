#!/usr/bin/env bash

# The real location of the script
SCRIPT=$(readlink -f "$0")

# Current unix username
USER=$(whoami)

# Directory where the script is located
BASEDIR=$(dirname "$SCRIPT")

# Build directory
BUILD_WORKSPACE="$BASEDIR/workspace"
BACKEND_WORKSPACE="$BUILD_WORKSPACE/bbbeasy-backend"
INSTALLER_WORKSPACE="$BUILD_WORKSPACE/bbbeasy-installer"
WEBAPP_WORKSPACE="$BUILD_WORKSPACE/bbbeasy-webapp"
DOCS_WORKSPACE="$BUILD_WORKSPACE/bbbeasy-docs"

# Formatted current date
NOW=$(date +"%Y-%m-%d_%H.%M.%S")

mkdir -p "$BASEDIR/logs"

#
# clean workspace
#
clean_workspace() {
  echo "Cleaning old workspace"
  rm -rf "$BUILD_WORKSPACE"
  mkdir -p "$BUILD_WORKSPACE"
  mkdir -p "$BACKEND_WORKSPACE"
  mkdir -p "$INSTALLER_WORKSPACE"
  mkdir -p "$WEBAPP_WORKSPACE"
  mkdir -p "$DOCS_WORKSPACE"
}

prepare_dockerfile() {
  cp -r "$BASEDIR/bbbeasy.Dockerfile" "$BUILD_WORKSPACE/Dockerfile"
  cp -r "$BASEDIR/bbbeasy.dockerignore" "$BUILD_WORKSPACE/.dockerignore"
}

build_backend() {
  cp -r "$BASEDIR/../bbbeasy-backend/app/" "$BACKEND_WORKSPACE/app"
  cp -r "$BASEDIR/../bbbeasy-backend/db/" "$BACKEND_WORKSPACE/db"
  cp -r "$BASEDIR/../bbbeasy-backend/logs/" "$BACKEND_WORKSPACE/logs"
  cp -r "$BASEDIR/../bbbeasy-backend/public/" "$BACKEND_WORKSPACE/public"
  cp -r "$BASEDIR/../bbbeasy-backend/tmp/" "$BACKEND_WORKSPACE/tmp"
  cp -r "$BASEDIR/../bbbeasy-backend/uploads/" "$BACKEND_WORKSPACE/uploads"
  cp -r "$BASEDIR/../bbbeasy-backend/composer.json" "$BACKEND_WORKSPACE/composer.json"
  cp -r "$BASEDIR/../bbbeasy-backend/composer.lock" "$BACKEND_WORKSPACE/composer.lock"
  cp -r "$BASEDIR/../bbbeasy-backend/phinx.yml" "$BACKEND_WORKSPACE/phinx.yml"
  # Todo add tag to publish riadvice/bbbeasy-backend:tagname
}

build_installer() {
  cd "$BASEDIR/../bbbeasy-frontend/"
  rm -rf dist/
  yarn cache clean
  NODE_ENV=production yarn install
  yarn build-installer
  cp -a "$BASEDIR/../bbbeasy-frontend/dist/." "$INSTALLER_WORKSPACE"
}

build_webapp() {
  cd "$BASEDIR/../bbbeasy-frontend/"
  rm -rf dist/
  yarn cache clean
  NODE_ENV=production yarn install
  yarn build
  cp -a "$BASEDIR/../bbbeasy-frontend/dist/." "$WEBAPP_WORKSPACE"
}

build_docs() {
  cd "$BASEDIR/../bbbeasy-docs/"
  yarn clear
  NODE_ENV=production yarn install
  yarn docusaurus clear
  yarn build
  cp -a "$BASEDIR/../bbbeasy-docs/build/." "$DOCS_WORKSPACE"
}

open_workspace() {
  cd "$BUILD_WORKSPACE"
}

run() {
  clean_workspace
  prepare_dockerfile
  build_backend
  build_installer
  build_webapp
  build_docs
  open_workspace
  docker build -t riadvice/bbbeasy .

  # Finally clean workspace
  # clean_workspace
}

run 2>&1 | tee -a "$BASEDIR/logs/build-bbbeasy-$NOW.log"
