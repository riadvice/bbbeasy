---
sidebar_position: 2
title: 'Install'
sidebar_label: 'Install Hivelvet'
---

# Install

:::info

We highly recommend installing `Hivelvet` on a clean and separate system with no prior software installation.

:::

## Good practices

## Install

It is important to understand that Hivelvet installation have 2 stesp:

1. Install in the server: install of the packages by the system administrator.
2. Install from the web browser: configuration settings meant for creating the administrator account, branding and configuration of the presets.

### Server install

Installing Hivelvet happens through a single command line.

```bash
wget -qO- https://ubuntu.bigbluebutton.org/bbb-install-2.5.sh | bash -s -- OPTIONS
```

### Web browser install

The available options are:
- `-h hostname`: By default if not provided it will get the value from `hostname` command line.
- `-t docker|git`: By default the `docker` install will have precedence. If `git` is chosen it will install all the dependencies required to run the platfrom.
- `-d directory` : The directory to use for installing Hivelvet. By default, it is `hivevlet` under teh current work directory.

## Switching the web-application after the installation process
