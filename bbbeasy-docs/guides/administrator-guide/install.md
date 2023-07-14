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

# Install steps

`Tip` : If this is your first time using BBBeasy , it's primordially that you create an administrator account first in order to be able to use the application .

The BBBeasy project work great in the browser .

## Administrator account
The administrator account consists of three steps :

__The first step__

* Create an administrator Account

__The second step__

* Fill the organization and branding fields

__The third step__

* Configure the BigBlueButton settings

## Step 1 :  Administrator Account
To create an administrator account , Please follow these steps

>1. Enter the Username(The username is used only once )
>2. Enter your Email(Your email must be personal and unique)
>3. Create Password (Type a GDPR compatible password during installation)
>4. Click on the Next button

![Admin](/admin/admin.png)

## Step 2: Organization and branding

**Organization and branding are the best things for creating , design, and general look-and-feel of a company's branding**

`To identify the Organisation  , fill in these fields `

1. Organisation name
2. Organisation website
3. Platform name
4. Terms of use URL
5. Privacy Policy URL

**Branding is very distinctive in that it defines  logo,Brand color,Default font size,Border radius and Wireframe style  to create organization and branding these fields must be filled out**
1. Upload  the logo in the field designated for the logo
2. Brand color
3. Default font size (increase or decrease the default font size)
4. Border radius
5. Wireframe style
6. Click on the Next button
   ![Organisation & Branding](/branding/organisation_branding_step2.png)


## Step3 BigBlueButton settings :

BigBlueButton settings is the console to enable or disable the settings .
Some of the key features of BBBeasy include :
* Audio,
* Branding
* Breakout Rooms
* General
* Guest policy
* Language
* Layout
* Learning Dashboard
* Lock Settings
* Recording
* Screenshare
* Security (Password for moderator & Password for attendee)
* Presentations with interactive and multi-share whiteboard capabilities – such as a pointer, zooming and drawing,
  public and private chat,
* Breakout rooms,
* User Experience
* Webcams
* ZcaleRight

  **An overview of some BigBlueButton settings**  :

1. Duration: set the duration of the meeting
2. Maximum participants: Maximum numbers of users that can join the room
3. Anyone can start the meeting: Anyone can start the room even he's not the room's owner
4. Join all as moderators: All the users join the meeting as Moderators
5. Allow only logged users: Only the logged in  users will be able to join the room
>You can easily join a BigBlueButton meeting  by opening the room link and click on the join button via a browser on your laptop or mobile phone.
## Finish
After enable/ disable the BigBlueButton settings  , Click on the ` Finish` button .

The application  will  be installed and you will be able to use the application

![Bigbluebutton room setting](/bbbsettings/bigbluebutton_setting.png)
![Install](/bbbsettings/finish.png)
### Server install

Installing BBBEasy happens through a single command line.

```bash
wget -qO- https://raw.githubusercontent.com/riadvice/bbbeasy/develop/install.sh | bash -s -- OPTIONS
```

### Web browser install

The available options are:
- `-h hostname`: By default if not provided it will get the value from `hostname` command line.
- `-t docker|git`: By default the `docker` install will have precedence. If `git` is chosen it will install all the dependencies required to run the platfrom.
- `-d directory` : The directory to use for installing BBBEasy. By default, it is `BBBeasy` under the current work directory.

## Switching the web-application after the installation process
