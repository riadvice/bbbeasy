#!/bin/bash

#
# BBBEasy open source platform - https://riadvice.tn/
#
# Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
#
# This program is free software; you can redistribute it and/or modify it under the
# terms of the GNU Affero General Public License as published by the Free Software
# Foundation; either version 3.0 of the License, or (at your option) any later
# version.
#
# BBBeasy is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
# PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License along
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

echo "BBBeasy - INSTALL SCRIPT"

# Check for the OS
source /etc/lsb-release

if [[ "$DISTRIB_ID" != "Ubuntu" && "$DISTRIB_RELEASE" != "22.04" ]]; then
  echo "Ubuntu 22.04 LTS (jammy) is required to install BBBeasy - https://releases.ubuntu.com/jammy/"
  exit
fi

# Setup default values
HV_HOST=$(hostname)
INSTALL_TYPE="git"
INSTALL_DIR="/opt/bbbeasy"
ADMIN_EMAIL=$(grep '^root:' /etc/passwd | awk -F'[<>]' '{print $2}')
DB_NAME="bbbeasy"

# Additional values
BACKEND_DIR="$INSTALL_DIR/bbbeasy-backend"

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
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list >/dev/null
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
}

install_common_deps() {
  echo "Install basic dependencies"
  apt-get install -y git gcc g++ make curl software-properties-common
}

install_deps() {
  cd /tmp

  echo "adding ondrej/php repository"
  add-apt-repository -y ppa:ondrej/php

  echo "adding redislabs/redis repository"
  add-apt-repository -y ppa:redislabs/redis

  echo "Enable Percoan PostgreSQL distribution"
  wget https://repo.percona.com/apt/percona-release_latest.generic_all.deb
  dpkg -i percona-release_latest.generic_all.deb
  rm percona-release_latest.generic_all.deb

  echo "Update OS software"
  apt-get update
  apt-get upgrade -y

  echo "Install ubuntu tools"
  apt-get install -y wget gnupg2 lsb-release curl zip unzip bc ntp

  echo "Install nginx"
  apt-get install -y nginx-full

  echo "Install Redis for caching"
  apt-get install -y redis-server

  echo "Install node.js"
  apt-get update
  apt-get install -y ca-certificates curl gnupg
  mkdir -p /etc/apt/keyrings
  -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
  NODE_MAJOR=18
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

  echo "Install PHP 8.2 with its dependencies"
  apt-get install -y php8.2-curl php8.2-cli php8.2-intl php8.2-redis php8.2-gd php8.2-fpm php8.2-pgsql \
    php8.2-mbstring php8.2-xml php8.2-bcmath php8.2-xdebug

  echo "Installing PostgreSQL"
  percona-release setup ppg-15.2
  apt-get install -y percona-postgresql-15 \
    percona-postgresql-15-repack \
    percona-postgresql-15-pgaudit \
    percona-pg-stat-monitor15 \
    percona-pgbackrest \
    percona-patroni \
    percona-pgbadger \
    percona-pgaudit15-set-user \
    percona-pgbadger \
    percona-postgresql-15-wal2json \
    percona-pg-stat-monitor15 \
    percona-postgresql-contrib

  # Must apply yarn version in HOME directory of root user
  cd $HOME
  echo "Install yarn"
  curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
  apt update
  apt-get install -y yarn
  yarn set version berry
  npm install -g pm2

  sudo curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer
}

install_docker() {
  mkdir -p "$INSTALL_DIR"
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
  # Create ssl certificates directory
  mkdir -p "$INSTALL_DIR/docker/certs"
  ln -s /etc/letsencrypt/live/meetings.riadvice.ovh/fullchain.pem docker/certs/fullchain.pem
  ln -s /etc/letsencrypt/live/meetings.riadvice.ovh/privkey.pem docker/certs/privkey.pem
}

generate_passwords() {
  if [[ "$INSTALL_TYPE" == "docker" ]]; then
    CURRENT_PASSWORD=$(grep "POSTGRES_PASSWORD=" docker-compose.yml | cut -d= -f2)
    # If docker-compose.yml has not been configured
    if [[ "$CURRENT_PASSWORD" == "bbbeasy" ]]; then
      PG_PASS=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
      sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$PG_PASS/g" docker-compose.yml
      sed -i "s/db.password =.*/db.password = $PG_PASS/g" docker/config-production.ini
      sed -i "/\(pass:\).*/{s//pass: $PG_PASS/;:a;n;ba}" docker/phinx.yml
    fi
  elif [[ "$INSTALL_TYPE" == "git" ]]; then
    if sudo -u postgres psql -c '\l' | grep -q "$DB_NAME"; then
      echo "Database exists"
    else
      cd /tmp
      PG_PASS=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
      info "Initializing dev databases and users for PostgreSQL"
      sudo -u postgres psql -c "CREATE USER $DB_NAME WITH PASSWORD '$PG_PASS'"
      sudo -u postgres psql -c "CREATE DATABASE $DB_NAME WITH OWNER '$DB_NAME'"
      sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_NAME;"
      echo "Update configuration production"
      cd "$INSTALL_DIR/bbbeasy-backend/app/config"
      cp config-production.sample.ini config-production.ini
      sed -i "s/db.password =.*/db.password = $PG_PASS/g" config-production.ini
      cd "$INSTALL_DIR/bbbeasy-backend/"
      sed -i "/\(pass:\).*/{s//pass: $PG_PASS/;:a;n;ba}" phinx.yml
    fi
  fi
}

setup_host() {
  sed -i "s/server_name.*/server_name $HV_HOST;/g" docker/bbbeasy.conf
  sed -i "s|return 301 https.*|return 301 https://$HV_HOST\$request_uri;|g" docker/bbbeasy.conf
}

generate_ssl() {
  apt-get install -y certbot
  certbot certonly --standalone --non-interactive --preferred-challenges http -d $HV_HOST --email $ADMIN_EMAIL --agree-tos -n
}

clone_repo() {
  if [ -d "$INSTALL_DIR" ]; then
    echo "$INSTALL_DIR Directory exists"
  else
    mkdir -p "$INSTALL_DIR"
    chown -R "$USER" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    git clone https://github.com/riadvice/bbbeasy.git .
  fi
}

build_apps() {
  "$INSTALL_DIR/tools/./bbbeasy" -si
  cp "$INSTALL_DIR/package/templates/nginx/bbbeasy.conf" /etc/nginx/sites-available/bbbeasy
  ln -s /etc/nginx/sites-available/bbbeasy /etc/nginx/sites-enabled/bbbeasy
  sed -i "s/server_name.*/server_name $HV_HOST;/g" /etc/nginx/sites-available/bbbeasy
  sed -i "s|return 301 https.*|return 301 https://$HV_HOST\$request_uri;|g" /etc/nginx/sites-available/bbbeasy
  sed -i "s|HV_HOST|$HV_HOST|g" /etc/nginx/sites-available/bbbeasy
  bbbeasy -d
  bbbeasy -ei
}

install() {
  read_options "$@"
  if [[ "$INSTALL_TYPE" == "docker" ]]; then
    echo "-- Installing docker version --"
    install_common_deps
    install_docker_deps
    install_docker
  elif [[ "$INSTALL_TYPE" == "git" ]]; then
    echo "-- Installing git version --"
    install_common_deps
    install_deps
    service nginx stop
    generate_ssl
    clone_repo
    generate_passwords
    build_apps
    service nginx restart
  fi
}

install "$@" 2>&1 | tee -a "/tmp/bbbeasy-install-$NOW.log"
