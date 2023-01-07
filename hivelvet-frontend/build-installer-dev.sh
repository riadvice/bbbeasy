#!/bin/bash

rm -rf dist/
yarn run lint
yarn run format
yarn build-installer
mkdir -p build/installer
rm -rf build/installer/*.*
rclone copy dist/ build/installer/
