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

setup_zsh_ohmyzsh() {
    log_section "ZSH AND OH MY ZSH SETUP" "Setting up Zsh and Oh My Zsh"

    # Install Oh My Zsh
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

    # Set Zsh as the default shell
    sudo chsh -s "$(which zsh)" "$USER" || echo_red "Failed to change the default shell to zsh."

    # Overwrite the ~/.zshrc file with our configuration
    tee ~/.zshrc >/dev/null <<EOL
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="gnzh"

plugins=(git docker docker-compose ubuntu debian postgres ssh colored-man-pages colorize command-not-found systemd extract firewalld procs themes wd z aliases urltools universalarchive zsh-autosuggestions zsh-syntax-highlighting)

# Auto-update every 7 days
zstyle ':omz:update' frequency 7
zstyle ':omz:update' mode auto

# Set infinite history
HISTFILE=~/.zsh_history
HISTSIZE=1000000
SAVEHIST=1000000

source \$ZSH/oh-my-zsh.sh
EOL

    # Adjust permissions for specific plugins
    chmod g-w,o-w /home/vagrant/.oh-my-zsh/plugins/procs
    chmod g-w,o-w /home/vagrant/.oh-my-zsh/plugins/ssh

    # Clone additional plugins
    ZSH_CUSTOM=${ZSH_CUSTOM:-~/.oh-my-zsh/custom}
    git clone https://github.com/zsh-users/zsh-autosuggestions $ZSH_CUSTOM/plugins/zsh-autosuggestions || echo_yellow "zsh-autosuggestions already exists."
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git $ZSH_CUSTOM/plugins/zsh-syntax-highlighting || echo_yellow "zsh-syntax-highlighting already exists."
    git clone https://github.com/zsh-users/zsh-completions $ZSH_CUSTOM/plugins/zsh-completions || echo_yellow "zsh-completions already exists."

    # Feedback
    echo_green "Zsh and Oh My Zsh setup complete with theme 'gnzh', infinite history, detailed timestamps, auto-update every 7 days, and a rich set of plugins."
}

install_nvm_node() {
    info "Installing nvm and Node.js LTS"
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    # shellcheck source=/dev/null
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install --lts
    nvm alias default lts/*
    nvm use default
    info "Node.js version: $(node -v)"
}

#== Provision script ==

info "Provision-script user: $(whoami)"
sudo usermod -aG docker $USER

info "Setup Zsh and Oh My Zsh"
setup_zsh_ohmyzsh

info "Install nvm and Node.js LTS"
install_nvm_node

info "Enable corepack for yarn"
corepack enable

info "Install pm2 globally"
npm install -g pm2

info "Install project dependencies"
cd /app/bbbeasy-backend/

info "Create backend configuration files from samples"
cp -n /app/bbbeasy-backend/app/config/config-development.sample.ini /app/bbbeasy-backend/app/config/config-development.ini

cp -n /app/bbbeasy-backend/app/config/config-production.sample.ini /app/bbbeasy-backend/app/config/config-production.ini

info "Install backend dependencies"
composer --no-progress --prefer-dist install --ignore-platform-req=ext-xdebug

info "Run database migrations"
"vendor/bin/phinx" migrate -vvv

cd /app/bbbeasy-frontend/
info "Bootstrap yarn 4"
YARN_IGNORE_PATH=1 yarn set version 4.16.0

info "Install frontend dependencies"
yarn install

info "Install pm2 logrotate module"
pm2 install pm2-logrotate

cd /app/bbbeasy-docs/
info "Install docs dependencies"
YARN_IGNORE_PATH=1 yarn set version 4.16.0
yarn install

info "Create bash-alias 'app' for vagrant user"
echo 'alias app="cd /app"' | tee /home/vagrant/.bash_aliases

info "Enabling colorized prompt for guest console"
sed -i "s/#force_color_prompt=yes/force_color_prompt=yes/" /home/vagrant/.bashrc
