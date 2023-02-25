#!/usr/bin/env bash

# The real location of the script
SCRIPT=$(readlink -f "$0")

# Current unix username
USER=$(whoami)

# Directory where the script is located
BASEDIR=$(dirname "$SCRIPT")

# Build directory
BUILD_WORKSPACE="$BASEDIR/workspace"
BACKEND_WORKSPACE="$BUILD_WORKSPACE/hivelvet-backend"
INSTALLER_WORKSPACE="$BUILD_WORKSPACE/hivelvet-installer"
WEBAPP_WORKSPACE="$BUILD_WORKSPACE/hivelvet-webapp"

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
}

build_backend() {
  clean_workspace
  cp -r "$BASEDIR/backend.Dockerfile" "$BUILD_WORKSPACE/Dockerfile"
  cp -r "$BASEDIR/backend.dockerignore" "$BUILD_WORKSPACE/.dockerignore"
  cp -r "$BASEDIR/../hivelvet-backend/app/" "$BACKEND_WORKSPACE/app"
  cp -r "$BASEDIR/../hivelvet-backend/db/" "$BACKEND_WORKSPACE/db"
  cp -r "$BASEDIR/../hivelvet-backend/logs/" "$BACKEND_WORKSPACE/logs"
  cp -r "$BASEDIR/../hivelvet-backend/public/" "$BACKEND_WORKSPACE/public"
  cp -r "$BASEDIR/../hivelvet-backend/tmp/" "$BACKEND_WORKSPACE/tmp"
  cp -r "$BASEDIR/../hivelvet-backend/uploads/" "$BACKEND_WORKSPACE/uploads"
  cp -r "$BASEDIR/../hivelvet-backend/composer.json" "$BACKEND_WORKSPACE/composer.json"
  cp -r "$BASEDIR/../hivelvet-backend/composer.lock" "$BACKEND_WORKSPACE/composer.lock"
  cp -r "$BASEDIR/../hivelvet-backend/phinx.yml" "$BACKEND_WORKSPACE/phinx.yml"
  # Todo add tag to publish riadvice/hivelvet-backend:tagname
}

build_installer() {
  cd "$BASEDIR/../hivelvet-frontend/"
  rm -rf dist/
  NODE_ENV=production yarn install
  yarn build-installer
  cp -r "$BASEDIR/../hivelvet-frontend/dist/" "$INSTALLER_WORKSPACE"
}

build_webapp() {
  cd "$BASEDIR/../hivelvet-frontend/"
  rm -rf dist/
  NODE_ENV=production yarn install
  yarn build
  cp -r "$BASEDIR/../hivelvet-frontend/dist/" "$WEBAPP_WORKSPACE"
}

build_docs() {
    cd "$BASEDIR/../hivelvet-docs/"
    yarn build
}

open_workspace() {
  cd "$BUILD_WORKSPACE"
}

run() {
  build_backend
  build_installer
  build_webapp
  open_workspace
  docker build -t riadvice/hivelvet .

  # Finally clean workspace
  # clean_workspace
}

run 2>&1 | tee -a "$BASEDIR/logs/build-hivelvet-$NOW.log"
