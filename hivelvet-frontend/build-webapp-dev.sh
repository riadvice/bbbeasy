#!/bin/bash

yarn run lint
yarn run format
yarn build
mkdir -p dist/webapp
rm -rf dist/webapp/*.*
rclone copy build/ dist/webapp/
