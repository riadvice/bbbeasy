#!/usr/bin/env bash

source /app/vagrant/provision/common.sh

#== Import script args ==

timezone=$(echo "$1")

#== Provision script ==

info "Provision-script user: $(whoami)"

export DEBIAN_FRONTEND=noninteractive

info "Configure timezone"
timedatectl set-timezone ${timezone} --no-ask-password

info "adding ondrej/php repository"
sudo add-apt-repository -y ppa:ondrej/php

info "adding bashtop-monitor/bashtop repository"
sudo add-apt-repository -y ppa:bashtop-monitor/bashtop
sudo apt-get install -y bashtop

info "Enable Percoan PostgreSQL distribution"
sudo wget https://repo.percona.com/apt/percona-release_latest.generic_all.deb
sudo dpkg -i percona-release_latest.generic_all.deb
sudo rm percona-release_latest.generic_all.deb

info "Update OS software"
sudo apt-get update
sudo apt-get upgrade -y

info "Install ubuntu tools"
sudo apt-get install -y wget gnupg2 lsb-release curl zip unzip nginx-full bc ntp xmlstarlet bash-completion
sudo curl https://rclone.org/install.sh | sudo bash

info "Install Redis for caching"
sudo apt-get install -y redis-server

info "Install Docker"
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

info "Install Node.js"
sudo apt-get install -y gcc g++ make ca-certificates curl gnupg
sudo apt-get install -y libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
NODE_MAJOR=18
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
sudo apt remove libnode72
sudo apt-get update
sudo apt-get -y install nodejs
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt remove cmdtest
sudo apt update
sudo apt install yarn
sudo yarn set version berry
sudo npm install -g pm2

info "Install PHP 8.2 with its dependencies"
sudo apt-get install -y php8.2-curl php8.2-cli php8.2-intl php8.2-redis php8.2-gd php8.2-fpm php8.2-pgsql \
  php8.2-mbstring php8.2-xml php8.2-bcmath php8.2-zip php8.2-xdebug

info "Installing PostgreSQL"
sudo percona-release setup ppg-15.4
sudo apt-get install -y percona-postgresql-15 \
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

info "Configure PHP-FPM"
sudo rm /etc/php/8.2/fpm/pool.d/www.conf
sudo ln -s /app/vagrant/dev/php-fpm/www.conf /etc/php/8.2/fpm/pool.d/www.conf
sudo rm /etc/php/8.2/mods-available/xdebug.ini
sudo ln -s /app/vagrant/dev/php-fpm/xdebug.ini /etc/php/8.2/mods-available/xdebug.ini
echo "Done!"

info "Configure NGINX"
sudo rm /etc/nginx/nginx.conf
sudo ln -s /app/vagrant/dev/nginx/nginx.conf /etc/nginx/nginx.conf
echo "Done!"

info "Enabling site configuration"
sudo ln -s /app/vagrant/dev/nginx/bbbeasy.conf /etc/nginx/sites-enabled/bbbeasy.conf
echo "Done!"

info "Install composer"
sudo curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer

info "set the default to listen to all addresses"
sudo sed -i "/port*/a listen_addresses = '*'" /etc/postgresql/15/main/postgresql.conf

info "allow any authentication mechanism from any client"
sudo sed -i "$ a host all all all trust" /etc/postgresql/15/main/pg_hba.conf

info "Initializing dev databases and users for PostgreSQL"
sudo -u postgres psql -c "CREATE USER bbbeasy WITH PASSWORD 'bbbeasy'"
sudo -u postgres psql -c "CREATE DATABASE bbbeasy WITH OWNER 'bbbeasy'"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bbbeasy TO bbbeasy;"
echo "Done!"

info "Initializing test databases and users for PostgreSQL"
sudo -u postgres psql -c "CREATE USER bbbeasy_test WITH PASSWORD 'bbbeasy_test'"
sudo -u postgres psql -c "CREATE DATABASE bbbeasy_test WITH OWNER 'bbbeasy_test'"
sudo -u postgres psql -c "ALTER ROLE bbbeasy_test SUPERUSER;"
echo "Done!"
