#!/usr/bin/env bash

# The real location of the script
SCRIPT=$(readlink -f "$0")

# Current unix username
USER=$(whoami)

# Directory where the script is located
BASEDIR=$(dirname "$SCRIPT")

# Build directory
BUILD_WORKSPACE="$BASEDIR/workspace"

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
}

build_backend() {
  clean_workspace
  cp -r "$BASEDIR/backend.Dockerfile" "$BUILD_WORKSPACE/Dockerfile"
  cp -r "$BASEDIR/backend.dockerignore" "$BUILD_WORKSPACE/.dockerignore"
  cp -r "$BASEDIR/../hivelvet-backend/app/" "$BUILD_WORKSPACE/app"
  cp -r "$BASEDIR/../hivelvet-backend/db/" "$BUILD_WORKSPACE/db"
  cp -r "$BASEDIR/../hivelvet-backend/logs/" "$BUILD_WORKSPACE/logs"
  cp -r "$BASEDIR/../hivelvet-backend/public/" "$BUILD_WORKSPACE/public"
  cp -r "$BASEDIR/../hivelvet-backend/tmp/" "$BUILD_WORKSPACE/tmp"
  cp -r "$BASEDIR/../hivelvet-backend/uploads/" "$BUILD_WORKSPACE/uploads"
  cp -r "$BASEDIR/../hivelvet-backend/composer.json" "$BUILD_WORKSPACE/composer.json"
  cp -r "$BASEDIR/../hivelvet-backend/composer.lock" "$BUILD_WORKSPACE/composer.lock"
  cp -r "$BASEDIR/../hivelvet-backend/phinx.yml" "$BUILD_WORKSPACE/phinx.yml"
  # Todo add tag to publish riadvice/hivelvet-backend:tagname
  open_workspace
  docker build -t riadvice/hivelvet-backend .
}

build_installer() {
  cp -r "$BASEDIR/installer.Dockerfile" "$BUILD_WORKSPACE/Dockerfile"
  cp -r "$BASEDIR/installer.dockerignore" "$BUILD_WORKSPACE/.dockerignore"
  cd "$BASEDIR/../hivelvet-frontend/"
  rm -rf dist/
  NODE_ENV=production yarn install
  yarn build-installer
  cp -r "$BASEDIR/../hivelvet-frontend/dist/" "$BUILD_WORKSPACE/dist"
  open_workspace
  docker build -t riadvice/hivelvet-installer .
}

build_webapp() {
  cp -r "$BASEDIR/webapp.Dockerfile" "$BUILD_WORKSPACE/Dockerfile"
  cp -r "$BASEDIR/webapp.dockerignore" "$BUILD_WORKSPACE/.dockerignore"
  cd "$BASEDIR/../hivelvet-frontend/"
  rm -rf dist/
  NODE_ENV=production yarn install
  yarn build
  cp -r "$BASEDIR/../hivelvet-frontend/dist/" "$BUILD_WORKSPACE/dist"
  open_workspace
  docker build -t riadvice/hivelvet-webapp .
}

open_workspace() {
  cd "$BUILD_WORKSPACE"
}

run() {
  build_backend
  clean_workspace

  build_installer
  clean_workspace

  build_webapp
  # Finally clean workspace
  clean_workspace
}

run 2>&1 | tee -a "$BASEDIR/logs/build-hivelvet-$NOW.log"
