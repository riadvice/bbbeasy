#!/usr/bin/env bash

source /app/vagrant/provision/common.sh

#== Import script args ==

timezone=$(echo "$1")

#== Provision script ==

info "Provision-script user: `whoami`"

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

info "Install Redis for caching"
sudo apt-get install -y redis

info "Install Node.js"
sudo apt-get install gcc g++ make
curl -sL https://deb.nodesource.com/setup_16.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
rm nodesource_setup.sh
sudo apt-get install nodejs
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt remove cmdtest
sudo apt update && sudo apt install yarn
# sudo npm install -g pm2@5 npm@8.3.0 yarn tar@6 svgo@2 uuid@8.3.2
sudo yarn global add pm2 tar svgo uuid
info "Install PHP 8.0 with its dependencies"
sudo apt-get install -y php8.0-curl php8.0-cli php8.0-intl php8.0-redis php8.0-gd php8.0-fpm php8.0-pgsql php8.0-mbstring php8.0-xml php8.0-bcmath php-xdebug
sudo update-alternatives --set php /usr/bin/php8.0

info "Installing PostgreSQL"
sudo percona-release setup ppg-14.1
sudo apt-get install -y percona-postgresql-14 percona-postgresql-14-pgaudit percona-pg-stat-monitor14

info "Configure PHP-FPM"
sudo rm /etc/php/8.0/fpm/pool.d/www.conf
sudo ln -s /app/vagrant/dev/php-fpm/www.conf /etc/php/8.0/fpm/pool.d/www.conf
sudo rm /etc/php/8.0/mods-available/xdebug.ini
sudo ln -s /app/vagrant/dev/php-fpm/xdebug.ini /etc/php/8.0/mods-available/xdebug.ini
echo "Done!"


info "Configure NGINX"
sudo sed -i 's/user www-data/user vagrant/g' /etc/nginx/nginx.conf
echo "Done!"

info "Enabling site configuration"
sudo ln -s /app/vagrant/dev/nginx/app.conf /etc/nginx/sites-enabled/app.conf
echo "Done!"

info "Install composer"
sudo curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer

info "set the default to listen to all addresses"
sudo sed -i "/port*/a listen_addresses = '*'" /etc/postgresql/14/main/postgresql.conf

info "allow any authentication mechanism from any client"
sudo sed -i "$ a host all all all trust" /etc/postgresql/14/main/pg_hba.conf

info "Initializing dev databases and users for PostgreSQL"
sudo -u postgres psql -c "CREATE USER hivelvet WITH PASSWORD 'hivelvet'"
sudo -u postgres psql -c "CREATE DATABASE hivelvet WITH OWNER 'hivelvet'"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE hivelvet TO hivelvet;"
echo "Done!"

info "Initializing test databases and users for PostgreSQL"
sudo -u postgres psql -c "CREATE USER hivelvet_test WITH PASSWORD 'hivelvet_test'"
sudo -u postgres psql -c "CREATE DATABASE hivelvet_test WITH OWNER 'hivelvet_test'"
sudo -u postgres psql -c "ALTER ROLE hivelvet_test SUPERUSER;"
echo "Done!"
