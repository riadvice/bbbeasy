#!/bin/bash

pm2 delete all
pm2 reset all
pm2 start ../ecosystem/ecosystem.config.js
pm2 stop hivelvet-webapp-service
