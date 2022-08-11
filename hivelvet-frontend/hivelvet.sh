#!/bin/bash

#
# Hivelvet open source platform - https://riadvice.tn/
#
# Copyright (c) 2022 RIADVICE SUARL and by respective authors (see below).
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
#   2022-02-06 GTR Initial Version

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
GIT_BRANCH=$(git --git-dir="$BASEDIR/../.git" branch | sed -n '/\* /s///p')

# Git tag, commits ahead & commit id under format '0.4-160-g3bb256c'
GIT_VERSION=$(git --git-dir="$BASEDIR/../.git" describe --tags --always HEAD)

#
# Display usage
#
usage() {
  echo
  echo "#========================================================================================================"
  echo "#"
  echo "# hivelvet Configuration Utility for Hivelvet - Version $GIT_VERSION on $GIT_BRANCH branch"
  echo "#"
  echo "#    hivelvet [options]"
  echo "#"
  echo "# Configuration:"
  echo "#    --version                        Display Hivelvet version"
  echo "#    --selfinstall                    Make hivelvet runnable from anywhere"
  echo "#    --enableinstaller                Enable Hivelvet installer app"
  echo "#    --enableweb                      Enable Hivelvet Web app"
  echo "#"
  echo "# Development:"
  echo "#    --enabletests                    Enable running unit tests"
  echo "#    --test <-c> <name>               Run unit tests with a test name. Use for -c coverage"
  echo "#    --fix                            Fix php code style"
  echo "#    --migrate                        Run database migrations"
  echo "#    --metrics                        Generates code metrics"
  echo "#"
  echo "# Monitoring:"
  echo "#    --check                          Check configuration files and processes for problems"
  echo "#"
  echo "# Administration:"
  echo "#    --restart                        Restart Hivelvet"
  echo "#    --stop                           Stop Hivelvet"
  echo "#    --start                          Start Hivelvet"
  echo "#    --clean                          Restart and clean all log files"
  echo "#    --cleansessions                  Cleans sessions from the database"
  echo "#    --status                         Display running status of components"
  echo "#    --zip                            Zip up log files for reporting an error"
  echo "#"
  echo "#========================================================================================================"
  echo
}

#
# Check file
#
check_file() {
  if [ ! -f "$1" ]; then
    echo "✘ File does not exist: $1"
    # m option means that the file is mandatory and the script cannot continue running
    if [ "$2" == "m" ]; then
      echo "✘ File $1 is mandatory. Script execution is interrupted"
      exit 1
    fi
  fi
}

need_production() {
  if [ "$ENVIRONMENT" != "production" ]; then
    echo "✘ Command can only be run in production environment"
    exit 1
  fi
}

#
# Display installed Hivelvet & servers version
#
display_version() {
  echo "■ Hivelvet     :  $GIT_VERSION"
  echo "■ Nginx      :  $(nginx -v)"
  echo "■ PHP        :  $(php -v | sed -n 1p)"
  echo "■ Redis      :  $(redis-server --version)"
  echo "■ PostgreSQL :  $(psql -V)"
}

#
# Install hivelvet to make runnable from anywhere
#
self_install() {
  if [ -f /usr/local/bin/hivelvet ]; then
    echo "✘ hivelvet already installed"
  else
    sudo ln -s "$SCRIPT" /usr/local/bin/hivelvet
    echo "✔ hivelvet successfully installed"
  fi
}

#
# Clean server status
#
display_status() {
  units="nginx php-fpm postgresql redis"
  echo
  line='————————————————————►'
  for unit in $units; do
    if [ $(pgrep -c "$unit") != 0 ]; then
      printf "%s %s [✔ - UP]\n" $unit "${line:${#unit}}"
    else
      printf "%s %s [✘ - DOWN]\n" $unit "${line:${#unit}}"
    fi
  done
  echo
}

#
# Clean Hivelvet cache
#
clean_cache() {
  echo "► Deleting cache"
  find "$BASEDIR/../hivelvet-backend/bin/" ! -name '.gitkeep' -type f -exec rm -rfv {} \;
  find "$BASEDIR/../hivelvet-backend/tmp/" ! -name '.gitkeep' -type f -exec rm -rfv {} \;
  find "$BASEDIR/../hivelvet-backend/tmp/cache/" ! -name '.gitkeep' -type f -exec rm -rfv {} \;
  find "$BASEDIR/../hivelvet-backend/tmp/mail/" -name '*.eml' -type f -exec rm -v {} \;
  find "$BASEDIR/../hivelvet-backend/uploads/tmp/" -type f -exec rm -v {} \;
  find "$BASEDIR/../hivelvet-backend/public/minified/" ! -name '.gitkeep' -type f -exec rm -v {} \;
  echo "✔ Cache deleted"
}

#
# Clean Hivelvet cache
#
clean_logs() {
  echo "► Cleaning logs"

  find "$BASEDIR/../hivelvet-backend/logs/" ! -name '.gitkeep' -type f -exec rm -v {} \;

  echo "✔ Cleaned logs folder"
}

#
# Clean sessions from the database
#
clean_sessions() {
  sudo -u postgres psql -d bbb_lb -c "SELECT setval('users_sessions_id_seq'::regclass, 1);"
  sudo -u postgres psql -d bbb_lb -c "TRUNCATE users_sessions;"
}

#
# Archive logs for debugging
#
zip_logs() {
  echo "► Archiving logs"

  ARCHIVE="/home/$USER/logs/logs-$NOW.tar.gz"
  mkdir -p "/home/$USER/logs/"

  touch /tmp/empty
  tar cfv "$ARCHIVE" /tmp/empty
  tar rfv "$ARCHIVE" "$BASEDIR/../logs/" --exclude='.gitkeep'
  sudo tar rfv "$ARCHIVE" /var/log/nginx/
  echo "✔ Logs archived at $ARCHIVE"
}

#
# Run PHP Code Style Fixer
#
fix_styles() {
  echo "► Running PHP Code Style Fixer"
  cd "$BASEDIR/../hivelvet-backend/"
  composer csfix
  echo "✔ PHP Code Style Fixed"
}

#
# Enable backend installer app
#
enable_installer() {
  echo "► Enabling backend installer app"
    if [ $(grep -c "config.extension =" "$BASEDIR/../hivelvet-backend/app/config/config-$ENVIRONMENT.ini") != 0 ]; then
      sed -i '/config.extension =/ c config.extension = -install' "$BASEDIR/../hivelvet-backend/app/config/config-$ENVIRONMENT.ini"
      printf "%s %s [✔ - DONE]\n"
    fi
    #c cmd to update .ant-card-body and .presets-grid css classes
    for i in $(sed -n '/^\/\/ .ant-card-body {/=' "$BASEDIR/../hivelvet-frontend/src/App.less"); do
      for j in $(sed -n '/^\/\/   display: flex;/=' "$BASEDIR/../hivelvet-frontend/src/App.less"); do
        for k in $(sed -n '/^\/\/   flex-wrap: wrap;/=' "$BASEDIR/../hivelvet-frontend/src/App.less"); do
          for l in $(sed -n '/^\/\/ }/=' "$BASEDIR/../hivelvet-frontend/src/App.less"); do
            if [ $j == `expr $i + 1` ] && [ $k == `expr $j + 1` ] && [ $l == `expr $k + 1` ]; then
              sed -i "${i}d" "$BASEDIR/../hivelvet-frontend/src/App.less"
              sed -i "${i}i .ant-card-body {" "$BASEDIR/../hivelvet-frontend/src/App.less"
              sed -i "${j}d" "$BASEDIR/../hivelvet-frontend/src/App.less"
              sed -i "${j}i \  display: flex;" "$BASEDIR/../hivelvet-frontend/src/App.less"
              sed -i "${k}d" "$BASEDIR/../hivelvet-frontend/src/App.less"
              sed -i "${k}i \  flex-wrap: wrap;" "$BASEDIR/../hivelvet-frontend/src/App.less"
              sed -i "${l}d" "$BASEDIR/../hivelvet-frontend/src/App.less"
              sed -i "${l}i }" "$BASEDIR/../hivelvet-frontend/src/App.less"
              unset i j k l
              for i in $(sed -n '/^.presets-grid {/=' "$BASEDIR/../hivelvet-frontend/src/App.less"); do
                for j in $(sed -n '/^  width: 25%;/=' "$BASEDIR/../hivelvet-frontend/src/App.less"); do
                  for k in $(sed -n '/^  box-shadow: none;/=' "$BASEDIR/../hivelvet-frontend/src/App.less"); do
                    for l in $(sed -n '/^}/=' "$BASEDIR/../hivelvet-frontend/src/App.less"); do
                      if [ $j == `expr $i + 1` ] && [ $k == `expr $j + 1` ] && [ $l == `expr $k + 1` ]; then
                        sed -i "${j}d" "$BASEDIR/../hivelvet-frontend/src/App.less"
                        sed -i "${j}i \  width: 215px;" "$BASEDIR/../hivelvet-frontend/src/App.less"
                        exit
                      fi
                    done
                  done
                done
              done
            fi
          done
        done
      done
    done
  echo "✔ Installer app enabled"
}

#
# Enable backend web app
#
enable_web() {
  echo "► Enabling backend web app"
    if [ $(grep -c "config.extension = -install" "$BASEDIR/../hivelvet-backend/app/config/config-$ENVIRONMENT.ini") != 0 ]; then
      sed -i '/config.extension = -install/ c config.extension =' "$BASEDIR/../hivelvet-backend/app/config/config-$ENVIRONMENT.ini"
      printf "%s %s [✔ - DONE]\n"
    fi
    #c cmd to update .ant-card-body and .presets-grid css classes
    for i in $(sed -n '/^.ant-card-body {/=' "$BASEDIR/../hivelvet-frontend/src/App.less"); do
      for j in $(sed -n '/^  display: flex;/=' "$BASEDIR/../hivelvet-frontend/src/App.less"); do
        for k in $(sed -n '/^  flex-wrap: wrap;/=' "$BASEDIR/../hivelvet-frontend/src/App.less"); do
          for l in $(sed -n '/^}/=' "$BASEDIR/../hivelvet-frontend/src/App.less"); do
            if [ $j == `expr $i + 1` ] && [ $k == `expr $j + 1` ] && [ $l == `expr $k + 1` ]; then
              sed -i "${i}d" "$BASEDIR/../hivelvet-frontend/src/App.less"
              sed -i "${i}i /\/\ .ant-card-body {" "$BASEDIR/../hivelvet-frontend/src/App.less"
              sed -i "${j}d" "$BASEDIR/../hivelvet-frontend/src/App.less"
              sed -i "${j}i /\/\   display: flex;" "$BASEDIR/../hivelvet-frontend/src/App.less"
              sed -i "${k}d" "$BASEDIR/../hivelvet-frontend/src/App.less"
              sed -i "${k}i /\/\   flex-wrap: wrap;" "$BASEDIR/../hivelvet-frontend/src/App.less"
              sed -i "${l}d" "$BASEDIR/../hivelvet-frontend/src/App.less"
              sed -i "${l}i /\/\ }" "$BASEDIR/../hivelvet-frontend/src/App.less"
              unset i j k l
              for i in $(sed -n '/^.presets-grid {/=' "$BASEDIR/../hivelvet-frontend/src/App.less"); do
                for j in $(sed -n '/^  width: 215px;/=' "$BASEDIR/../hivelvet-frontend/src/App.less"); do
                  for k in $(sed -n '/^  box-shadow: none;/=' "$BASEDIR/../hivelvet-frontend/src/App.less"); do
                    for l in $(sed -n '/^}/=' "$BASEDIR/../hivelvet-frontend/src/App.less"); do
                      if [ $j == `expr $i + 1` ] && [ $k == `expr $j + 1` ] && [ $l == `expr $k + 1` ]; then
                        sed -i "${j}d" "$BASEDIR/../hivelvet-frontend/src/App.less"
                        sed -i "${j}i \  width: 25%;" "$BASEDIR/../hivelvet-frontend/src/App.less"
                        exit
                      fi
                    done
                  done
                done
              done
            fi
          done
        done
      done
    done
  echo "✔ Web app enabled"
}

#
# Enable unit tests
#
enable_tests() {
  echo "► Enabling unit tests"

  rm -rfv "$BASEDIR/../hivelvet-backend/public/statera/"
  mkdir -pv "$BASEDIR/../hivelvet-backend/public/statera/coverage/"
  mkdir -pv "$BASEDIR/../hivelvet-backend/public/statera/result/"
  cp -Rv "$BASEDIR/../hivelvet-backend/tools/statera.php" "$BASEDIR/../hivelvet-backend/public/statera/index.php"
  cp -Rv "$BASEDIR/../hivelvet-backend/tests/ui/css" "$BASEDIR/../hivelvet-backend/public/statera/"
  cp -Rv "$BASEDIR/../hivelvet-backend/tests/ui/images" "$BASEDIR/../hivelvet-backend/public/statera/"
  cp -Rv "$BASEDIR/../hivelvet-backend/tests/ui/css" "$BASEDIR/../hivelvet-backend/public/statera/result"
  cp -Rv "$BASEDIR/../hivelvet-backend/tests/ui/images" "$BASEDIR/../hivelvet-backend/public/statera/result"
  cp "$BASEDIR/../hivelvet-backend/vendor/bcosca/fatfree-core/code.css" "$BASEDIR/../hivelvet-backend/public/statera/css/code.css"
  cp "$BASEDIR/../hivelvet-backend/vendor/bcosca/fatfree-core/code.css" "$BASEDIR/../hivelvet-backend/public/statera/result/css/code.css"

  echo "✔ Unit tests enabled"
}

#
# Run unit test in CLI mode
#
run_tests() {
  echo "► Running unit tests"
  sudo phpenmod -s cli xdebug
  COVERAGE=$1
  USE_COVERAGE=""
  TEST_NAME="all"

  if [[ "$1" != "-c" ]]; then
    if [[ "$1" != "" ]]; then
      TEST_NAME=$1
    fi

    if [[ "$2" == "-c" ]]; then
      USE_COVERAGE="=withCoverage"
    fi
  fi

  if [[ "$1" == "-c" ]]; then
    USE_COVERAGE="=withCoverage"
    if [[ "$2" != "" ]]; then
      TEST_NAME=$2
    fi
  fi

  cd "$(dirname "$BASEDIR")/hivelvet-backend/"
  # Revert database base to the initial state then create it again
  "vendor/bin/phinx" rollback -e testing -t 0 -vvv
  "vendor/bin/phinx" migrate -e testing -vvv

  cd "public"

  php index.php "/?statera$USE_COVERAGE&test=$TEST_NAME" -o="../public/statera/result/index.html"

  SUCCESS=$(cat "statera/test.result")
  if [[ "$SUCCESS" == "success" ]]; then
    echo "✔ Test success"
    exit 0
  else
    echo "✘ Test fail"
    exit 1
  fi
}

#
# Updates composer and reset user home composer ownership
#
update_composer() {
  echo "► Updating composer"
  sudo composer selfupdate
  sudo chown -R "$USER:$USER" "/home/$USER/.composer/"
}

# Install composer dependencies
#
install_dependencies() {
  cd "$(dirname "$BASEDIR")/hivelvet-backend/"
  echo "► Updating composer dependencies"
  composer install -o --no-dev
}

#
# Run database migrations
#
run_migrations() {
  echo "► Running database migration"
  cd "$(dirname "$BASEDIR")/hivelvet-backend/"
  vendor/bin/phinx migrate -e "$ENVIRONMENT"
}

#
# Generate code quality metrics
#
generate_metrics() {
  vendor/bin/phpmetrics --report-html="$BASEDIR/../hivelvet-backend/public/metrics" "$BASEDIR/../hivelvet-backend/app/src/"
}

#
# Give folders right permissions
#
chmod_folders() {
  cd "$APP_DIR"
  sudo chmod -R 755 -R "$BASEDIR/../hivelvet-backend/data/"
  sudo chmod -R 766 -R "$BASEDIR/../hivelvet-backend/logs/"
  sudo chmod -R 766 -R "$BASEDIR/../hivelvet-backend/tmp/"
  sudo chmod -R 755 -R "$BASEDIR/../hivelvet-backend/uploads/"
  sudo chmod -R 755 -R "$BASEDIR/../hivelvet-backend/public/minified/"
}

#
# Start services
#
start_services() {
  sudo service postgresql start
  sudo service redis start
  sudo service nginx start
  sudo service php8.1-fpm start
}

#
# Stop services
#
stop_services() {
  sudo service postgresql stop
  sudo service redis stop
  sudo service nginx stop
  sudo service php8.1-fpm stop
}

#
# Restart services
#
restart_services() {
  sudo service postgresql restart
  sudo service redis restart
  sudo service nginx restart
  sudo service php8.1-fpm restart
}

run() {

  if [[ $# -eq 0 ]]; then
    usage
    exit 1
  fi

  # Environment
  HOST_TESTER=$(hostname)
  if [[ "$HOST_TESTER" == "hivelvet.test" ]]; then
    ENVIRONMENT="development"
  else
    ENVIRONMENT="production"
  fi

  echo "► Detected environment: \`$ENVIRONMENT\`"

  while [[ $# -gt 0 ]]; do

    if [ "$1" = "--version" -o "$1" = "-version" -o "$1" = "-v" ]; then
      display_version
      shift
      continue
    fi

    if [ "$1" = "--selfinstall" -o "$1" = "-selfinstall" -o "$1" = "-si" ]; then
      self_install
      shift
      continue
    fi

    if [ "$1" = "--enableinstaller" -o "$1" = "-enableinstaller" -o "$1" = "-ei" ]; then
      enable_installer
      shift
      continue
    fi

    if [ "$1" = "--enableweb" -o "$1" = "-enableweb" -o "$1" = "-ew" ]; then
      enable_web
      shift
      continue
    fi

    if [ "$1" = "--enabletests" -o "$1" = "-enabletests" -o "$1" = "-e" ]; then
      enable_tests
      shift
      continue
    fi

    if [ "$1" = "--test" -o "$1" = "-test" -o "$1" = "-t" ]; then
      fix_styles
      run_tests "$2" "$3"

      shift
      shift
      continue
    fi

    if [ "$1" = "--check" -o "$1" = "-check" ]; then
      # todo: nginx config, mysql config, directories permissions...
      echo "not implemented yet"
      shift
      continue
    fi

    if [ "$1" = "--fix" -o "$1" = "-fix" -o "$1" = "-f" ]; then
      fix_styles
      shift
      continue
    fi

    if [ "$1" = "--migrate" -o "$1" = "-migrate" -o "$1" = "-m" ]; then
      run_migrations
      shift
      continue
    fi

    if [ "$1" = "--metrics" -o "$1" = "-metrics" -o "$1" = "-me" ]; then
      generate_metrics
      shift
      continue
    fi

    if [ "$1" = "--clean" -o "$1" = "-clean" ]; then
      clean_cache
      clean_logs
      shift
      continue
    fi

    if [ "$1" = "--cleansessions" -o "$1" = "-cleansessions" -o "$1" = "-cs" ]; then
      clean_sessions
      shift
      continue
    fi

    if [ "$1" = "--restart" -o "$1" = "-restart" -o "$1" = "-r" ]; then
      restart_services
      shift
      continue
    fi

    if [ "$1" = "--stop" -o "$1" = "-stop" -o "$1" = "-sp" ]; then
      stop_services
      shift
      continue
    fi

    if [ "$1" = "--start" -o "$1" = "-start" -o "$1" = "-sr" ]; then
      start_services
      shift
      continue
    fi

    if [ "$1" = "--status" -o "$1" = "-status" ]; then
      display_status
      shift
      continue
    fi

    if [ "$1" = "--zip" -o "$1" = "-zip" -o "$1" = "-z" ]; then
      zip_logs
      shift
      continue
    fi

    usage
    exit 1

  done
}

run "$@" #2>&1 | tee -a "$BASEDIR/../logs/hivelvet-$NOW.log"
