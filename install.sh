#!/bin/bash

#
# BBBEasy open source platform - https://riadvice.tn/
#
# Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
#
# This program is free software; you can redistribute it and/or modify it under the
# terms of the GNU Lesser General Public License as published by the Free Software
# Foundation; either version 3.0 of the License, or (at your option) any later
# version.
#
# BBBEasy is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
# PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with BBBEasy; if not, see <http://www.gnu.org/licenses/>.
#
#
#
# Author(s):
#       Ghazi Triki <ghazi.triki@riadvice.tn>
#
# Changelog:
#   2023-02-22 GTR Initial Version

if [ "$(whoami)" != "root" ]; then
  echo "Error: You must be root to run this script"
  exit 1
fi

# The real location of the script
SCRIPT=$(readlink -f "$0")

# Current unix username
USER=$(whoami)

# Directory where the script is located
BASEDIR=$(dirname "$SCRIPT")

# Formatted current date
NOW=$(date +"%Y-%m-%d_%H.%M.%S")

# Production BBBEasy directory
APP_DIR=$BASEDIR/../

# Current git branch name transforms '* dev-0.5' to 'dev-0.5'
# GIT_BRANCH=$(git --git-dir="$BASEDIR/../.git" branch | sed -n '/\* /s///p')

# Git tag, commits ahead & commit id under format '0.4-160-g3bb256c'
# GIT_VERSION=$(git --git-dir="$BASEDIR/../.git" describe --tags --always HEAD)

echo "BBBEASY - INSTALL SCRIPT"

# Setup default values
HV_HOST=$(hostname)
INSTALL_TYPE="docker"
INSTALL_DIR="/opt/bbbeasy"
ADMIN_EMAIL=$(grep '^root:' /etc/passwd | awk -F'[<>]' '{print $2}')

# Read CLI options
read_options() {
  while [[ $# -gt 0 ]]; do
    case $1 in
    -h | --host)
      HV_HOST="$2"
      shift
      ;;
    -t | --type)
      case "$2" in
      docker | git)
        INSTALL_TYPE="$2"
        shift
        ;;
      *)
        echo "Error: option --type only accepts \"docker\" or \"git\""
        exit 1
        ;;
      esac
      shift
      ;;
    -d | --dir)
      INSTALL_DIR="$2"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
    esac
    shift
  done
  # TODO: capture admin email option
  echo "---- INSTALL OPTIONS ----"
  echo "Hostname  : $HV_HOST"
  echo "Type      : $INSTALL_TYPE"
  echo "Directory : $INSTALL_DIR"
  echo "Email     : $ADMIN_EMAIL"
  echo "-------------------------"
}

install_docker_deps() {
  apt install -y certbot
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list >/dev/null
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
}

install_deps() {
  cd /tmp
  echo "adding ondrej/php repository"
  sudo add-apt-repository -y ppa:ondrej/php

  echo "Enable Percoan PostgreSQL distribution"
  wget https://repo.percona.com/apt/percona-release_latest.generic_all.deb
  sudo dpkg -i percona-release_latest.generic_all.deb
  rm percona-release_latest.generic_all.deb

  echo "Update OS software"
  sudo apt-get update
  sudo apt-get upgrade -y

  echo "Install basic dependencies"
  sudo apt-get install git gcc g++ make

  echo "Install ubuntu tools"
  sudo apt-get install -y wget gnupg2 lsb-release curl zip unzip nginx-full bc ntp

  echo "Install Redis for caching"
  sudo apt-get install -y redis-server

  echo "Install node.js"
  curl -sL https://deb.nodesource.com/setup_18.x -o nodesource_setup.sh
  sudo bash nodesource_setup.sh
  rm nodesource_setup.sh
  sudo apt-get -y install nodejs

  echo "Install yarn"
  curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
  sudo apt remove cmdtest
  sudo apt update && sudo apt install yarn
  sudo yarn set version berry
  sudo npm install -g pm2
}

install_docker() {
  sudo mkdir -p "$INSTALL_DIR"
  cd "$INSTALL_DIR"
  wget -nc https://raw.githubusercontent.com/riadvice/bbbeasy/master/docker-compose.yml

  # Create docker directory
  mkdir -p "docker"
  # Create docker data directory
  mkdir -p "docker/data/postgres"

  cd "docker"
  # Download docker configuration files
  wget -nc https://raw.githubusercontent.com/riadvice/bbbeasy/master/docker/default.ini
  wget -nc https://raw.githubusercontent.com/riadvice/bbbeasy/master/docker/config-production.ini
  wget -nc https://raw.githubusercontent.com/riadvice/bbbeasy/master/docker/bbbeasy.conf
  wget -nc https://raw.githubusercontent.com/riadvice/bbbeasy/master/docker/phinx.yml
  wget -nc https://raw.githubusercontent.com/riadvice/bbbeasy/master/docker/php.ini
  wget -nc https://raw.githubusercontent.com/riadvice/bbbeasy/master/docker/www-bbbeasy.conf

  cd "$INSTALL_DIR"

  generate_passwords
  setup_host
  generate_ssl
}

generate_passwords() {
  CURRENT_PASSWORD=$(grep "POSTGRES_PASSWORD=" docker-compose.yml | cut -d= -f2)
  # If docker-compose.yml has not been configured
  if [[ "$CURRENT_PASSWORD" == "bbbeasy" ]]; then
    PG_PASS=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
    sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$PG_PASS/g" docker-compose.yml
    sed -i "s/db.password =.*/db.password = $PG_PASS/g" docker/config-production.ini
    sed -i "/\(pass:\).*/{s//pass: $PG_PASS/;:a;n;ba}" docker/phinx.yml
  fi
}

setup_host() {
  sed -i "s/server_name.*/server_name $HV_HOST;/g" docker/bbbeasy.conf
  sed -i "s|return 301 https.*|return 301 https://$HV_HOST\$request_uri;|g" docker/bbbeasy.conf
}

generate_ssl() {
  sudo certbot certonly --standalone --non-interactive --preferred-challenges http -d $HV_HOST --email $ADMIN_EMAIL --agree-tos -n
  # Create ssl certificates directory
  mkdir -p "$INSTALL_DIR/docker/certs"
  ln -s /etc/letsencrypt/live/meetings.riadvice.ovh/fullchain.pem docker/certs/fullchain.pem
  ln -s /etc/letsencrypt/live/meetings.riadvice.ovh/privkey.pem docker/certs/privkey.pem
}

clone_repo() {
  sudo mkdir -p "$INSTALL_DIR"
  sudo chown -R "$USER" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
  git clone https://github.com/riadvice/bbbeasy.git
}

install() {
  read_options "$@"
  if [[ "$INSTALL_TYPE" == "docker" ]]; then
    install_docker_deps
    install_docker
  elif [[ "$INSTALL_TYPE" == "git" ]]; then
    install_deps
    clone_repo
  fi
}

install "$@" 2>&1 | tee -a "/tmp/bbbeasy-install-$NOW.log"
