#!/usr/bin/env bash

source /app/vagrant/provision/common.sh

#== Provision script ==

info "Provision-script user: `whoami`"

info "Install project dependencies"
cd /app/hivelvet-backend/
composer --no-progress --prefer-dist install
"vendor/bin/phinx" migrate -vvv

info "Create bash-alias 'app' for vagrant user"
echo 'alias app="cd /app"' | tee /home/vagrant/.bash_aliases

info "Enabling colorized prompt for guest console"
sed -i "s/#force_color_prompt=yes/force_color_prompt=yes/" /home/vagrant/.bashrc
