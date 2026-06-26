#!/usr/bin/env bash

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

#== Provision script ==

info "Provision-script user: $(whoami)"
sudo usermod -aG docker $USER

info "Setup Zsh and Oh My Zsh"
setup_zsh_ohmyzsh

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
