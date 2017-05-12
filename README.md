# Installation Guidelines

> Clone the repository on your machine, and via a Terminal, cd to the newly created directory
> Make sure you have a mongo database running locally on the default port

## Install

The following commands will install NPM (latest version), as well as install all the NodeJS dependencies for the project.

```sh
# install a clean version of npm
$ sudo npm cache clean -f
$ sudo npm install -g n

# update npm to the latest stable release
$ sudo n stable

# install dependencies listed in package.json
$ sudo npm install
Note: These files will be downloaded in a new folder called "node_modules" (this folder should NOT be added to the GIT repository)

# install Bower for Front-end package management
$ sudo npm install -g bower

# install dependencies listed in bower.json
$ bower install
Note: These files will be downloaded in a new folder called "public/bower_components" (this folder should NOT be added to the GIT repository)
```

## Running in development mode

> In a Terminal, cd to the root of the application

> If you are running it on your on machine, don't forget to update the socket connection path to locahost in /public/js/factories.js

```sh
# start web server
$ node app.js
```