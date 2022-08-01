#!/bin/bash

pm2 delete all
pm2 reset all
pm2 start ./start-server.sh   --name docs-app

