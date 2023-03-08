#!/bin/bash

#
# Hivelvet open source platform - https://riadvice.tn/
#
# Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
#
# This program is free software; you can redistribute it and/or modify it under the
# terms of the GNU Lesser General Public License as published by the Free Software
# Foundation; either version 3.0 of the License, or (at your option) any later
# version.
#
# Hivelvet is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
# PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with Hivelvet; if not, see <http://www.gnu.org/licenses/>.
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

# Production Hivelvet directory
APP_DIR=$BASEDIR/../

# Current git branch name transforms '* dev-0.5' to 'dev-0.5'
# GIT_BRANCH=$(git --git-dir="$BASEDIR/../.git" branch | sed -n '/\* /s///p')

# Git tag, commits ahead & commit id under format '0.4-160-g3bb256c'
# GIT_VERSION=$(git --git-dir="$BASEDIR/../.git" describe --tags --always HEAD)

echo "HIVELVET - INSTALL SCRIPT"

# Setup default values
HV_HOST=$(hostname)
INSTALL_TYPE="docker"
INSTALL_DIR="/opt/hivelvet"

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
  echo "---- INSTALL OPTIONS ----"
  echo "Hostname  : $HV_HOST"
  echo "Type      : $INSTALL_TYPE"
  echo "Directory : $INSTALL_DIR"
  echo "-------------------------"
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
  wget -nc https://raw.githubusercontent.com/riadvice/hivelvet/master/docker-compose.yml

  # Create docker directory
  mkdir -p "docker"
  # Create docker data directory
  mkdir -p "docker/data/postgres"

  cd "docker"
  # Download docker configuration files
  wget -nc https://raw.githubusercontent.com/riadvice/hivelvet/master/docker/default.ini
  wget -nc https://raw.githubusercontent.com/riadvice/hivelvet/master/docker/config-production.ini
  wget -nc https://raw.githubusercontent.com/riadvice/hivelvet/master/docker/hivelvet.conf
  wget -nc https://raw.githubusercontent.com/riadvice/hivelvet/master/docker/phinx.yml
  wget -nc https://raw.githubusercontent.com/riadvice/hivelvet/master/docker/php.ini
  wget -nc https://raw.githubusercontent.com/riadvice/hivelvet/master/docker/www-hivelvet.conf
}

clone_repo() {
  sudo mkdir -p "$INSTALL_DIR"
  sudo chown -R "$USER" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
  git clone https://github.com/riadvice/hivelvet.git
}

install() {
  read_options "$@"
  if [[ "$INSTALL_TYPE" == "docker" ]]; then
    install_docker
  elif [[ "$INSTALL_TYPE" == "git" ]]; then
    install_deps
    clone_repo
  fi
}

install "$@" 2>&1 | tee -a "/tmp/hivelvet-install-$NOW.log"
