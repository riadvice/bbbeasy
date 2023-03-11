#!/bin/bash

rm -rf dist/
yarn run lint
yarn run format
yarn build
mkdir -p build/webapp
rm -rf build/webapp/*.*
rclone copy dist/ build/webapp/
