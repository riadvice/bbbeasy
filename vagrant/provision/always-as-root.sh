#!/usr/bin/env bash

#
# BBBEasy open source platform - https://riadvice.com/
#
# Copyright (c) 2022-2026 RIADVICE SUARL and by respective authors (see below).
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

source /app/vagrant/provision/common.sh

#== Provision script ==

info "Provision-script user: $(whoami)"

info "Restart web-stack"
# TODO: get param from the vagrant provision config
hostnamectl set-hostname bbbeasy.test
service php8.5-fpm restart
service nginx restart
service postgresql restart
