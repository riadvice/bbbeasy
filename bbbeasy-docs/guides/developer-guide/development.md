# vagrant config
## vagrant 
Vagrant is cross-platform software for creating and configuring "repeatable, portable and lightweight" environments. Think of it as a virtual machine creation tool. The best part is that Vagrant takes care of a lot of things on its own: networking, nfs shared folder, provisioning (ie: shell, ansible, chef), deployments and so on.

`Vagrant lets you install a machine in the blink of an eye. To do this, we need 2 tools: `

  1-VirtualBox to manage VMs

  2-Vagrant

### Install project 

`To launch the backend in the development mode, follow these steps :`

1- Start a Command Prompt as an `Administrator`

2-To find the project path, run this command to access the project  :

```bash
cd /path/to/cloned/project/
```


 3-To execute the virtual machine run this command:

`You can now start the virtual machine:
Start all virtual machines in the Vagrantfile`

```bash
vagrant up
```
`To test whether it has been launched, you can connect via SSH :`

```bash
vagrant ssh
```
and wait until the end of the process.

 or

 ```bash
vagrant up && vagrant ssh
```
 4 - To copy the file so that it retains the same rights and metadata as the original file, run the following command :
 ```bash
cp /app/bbbeasy-backend/app/config/config-development.sample.ini /app/bbbeasy-backend/app/config/config-development.ini
```



`To launch the frontend in the development mode, follow these steps :`

1- To go to the frontend , run this command :
 ```bash
cd /app/bbbeasy-frontend
```
2- To copy the file ,run this command :

 ```bash
cp /app/tools/bbbeasy /app/bbbeasy-frontend/bbbeasy
```
3- To removes the carriage return character(\r)at the end of each line in the bbbeasy file, run this command:

```bash
sed -i -e 's/\r$//' bbbeasy
```
4-To replace bbbeasy with./bbbeasy in package.json file , run this command :
 ```bash
sed -i -e 's/"bbbeasy /".\/bbbeasy /g' package.json
```
5- To enable the installer application ,run this command :
 ```bash
yarn start-dev-installer
```
6-To enable the web application, run this command :
 ```bash
yarn start-dev
```

`Reload the installation process , run this command`

1-To launch the backend in the development mode, follow these steps :

 ```bash
cd /app/bbbeasy-backend/
```
2-This command is used to undo the last applied migration,run this command :
 ```bash
php vendor/bin/phinx rollback -e development
```
2.1 -Continue to use this command until it appears

 ```bash
No migrations to rollback
```
3-This command is used to run all pending migrations for your application,run this command :
 ```bash
php vendor/bin/phinx migrate -e development
```
4-To update Composer autoloader :
 ```bash
composer dump-autoload
```
5-To launch the frontend in the development mode, follow these steps :
 ```bash
cd /app/bbbeasy-frontend/
```
6-To enable the installer application ,run this command :

 ```bash
yarn run start-dev-installer
```
7-To enable the web application, run this command :
 ```bash
yarn run start-dev
```

### Usage yarn 

you can start using Yarn. Here are some of the most common commands you’ll need.

1 -Adding a dependency

 ```bash
yarn add [package]
yarn add [package]@[version]
yarn add [package]@[tag]
```
2-Adding a dependency to different categories of dependencies
Add to `devDependencies`, `peerDependencies`, and `optionalDependencies` respectively:
 ```bash
yarn add [package] --dev
yarn add [package] --peer
yarn add [package] --optional
```
3-Removing a dependency
 ```bash
yarn remove [package]
```
4-Installing all the dependencies of project

 ```bash
yarn 
```
or 
 ```bash
yarn install
```
### The commands vagrant the used
1-This command shuts down the running machine Vagrant is managing
 ```bash
vagrant halt
```

2-Restarting a machine (equivalent to a vagrant halt then a vagrant up)
 ```bash
vagrant reload 
```

3-Start all VMs in the Vagrantfile

 ```bash
vagrant up
```

### Structure
