#!/usr/bin/env bash

source /app/vagrant/provision/common.sh

#== Provision script ==

info "Provision-script user: $(whoami)"
sudo usermod -aG docker $USER

info "Install project dependencies"
cd /app/bbbeasy-backend/
composer --no-progress --prefer-dist install --ignore-platform-req=ext-xdebug
"vendor/bin/phinx" migrate -vvv

cd /app/bbbeasy-frontend/
yarn set version berry
sudo chown -R vagrant: /home/vagrant/.yarn/
yarn install
pm2 install pm2-logrotate
yarn add global serve
yarn add global ts-node

info "Create bash-alias 'app' for vagrant user"
echo 'alias app="cd /app"' | tee /home/vagrant/.bash_aliases

info "Enabling colorized prompt for guest console"
sed -i "s/#force_color_prompt=yes/force_color_prompt=yes/" /home/vagrant/.bashrc
