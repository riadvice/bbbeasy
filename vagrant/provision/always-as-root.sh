#!/usr/bin/env bash

source /app/vagrant/provision/common.sh

#== Provision script ==

info "Provision-script user: `whoami`"

info "Restart web-stack"
# TODO: get param from the vagrant provision config
hostnamectl set-hostname hivelvet.test
service php8.1-fpm restart
service nginx restart
service postgresql restart
