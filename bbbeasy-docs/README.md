# Website

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```
This command installs all dependencies for a project

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window [http://localhost:3000](http://localhost:3000). Most changes are reflected live without having to restart the server.

```
$ ./run-docs.sh
```
This command runs the website in development mode on the virtual machine.\
Opens [http://docs.bbbeasy.test:3000](http://docs.bbbeasy.test:3000) in the browser window to view the application on your local machine.

### Build

```
$ yarn build
```
or
```
$ ./build-docs.sh
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
