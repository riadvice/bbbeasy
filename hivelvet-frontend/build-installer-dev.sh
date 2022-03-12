#!/bin/bash

yarn run lint
yarn run format
yarn build-installer
mkdir -p dist/installer
rm -rf dist/installer/*.*
rclone copy build/ dist/installer/
