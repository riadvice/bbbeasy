#!/bin/bash

yarn run lint
yarn run format
pm2 delete all
pm2 reset all
pm2 start ../ecosystem/ecosystem.config.js
