#!/bin/bash

yarn run lint
yarn run format
pm2 start "yarn start" --attach --watch --time --name "hivelvet-frontend"
