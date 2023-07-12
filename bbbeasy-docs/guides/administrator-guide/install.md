---
sidebar_position: 2
title: 'Install'
sidebar_label: 'Install BBBEasy'
---

# Install

:::info

We highly recommend installing `BBBEasy` on a clean and separate system with no prior software installation.

:::

## Good practices

We highly suggest forcing your hostname with the following command.

```bash
hostnamectl set-hostname thecompany.kom
```

We also recommend setting the `root` user email

```bash
usermod -s /bin/bash -c "Your Name <youremail@thecompany.kom>" root
```

## Install

It is important to understand that BBBEasy installation have 2 steps:

1. Install in the server: install of the packages by the system administrator.
2. Install from the web browser: configuration settings meant for creating the administrator account, branding and configuration of the presets.

**Please check the link below to understand the installation steps**

**[Install](./Install step.md)**

### Server install

Installing BBBEasy happens through a single command line.

```bash
wget -qO- https://raw.githubusercontent.com/riadvice/bbbeasy/develop/install.sh | bash -s -- OPTIONS
```

### Web browser install

The available options are:
- `-h hostname`: By default if not provided it will get the value from `hostname` command line.
- `-t docker|git`: By default the `docker` install will have precedence. If `git` is chosen it will install all the dependencies required to run the platfrom.
- `-d directory` : The directory to use for installing BBBEasy. By default, it is `hivevlet` under teh current work directory.

## Switching the web-application after the installation process
