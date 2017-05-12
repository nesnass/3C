# Installation Guidelines

## Install

```

# update npm to the latest stable release
$ sudo n stable

# install dependencies listed in package.json
$ npm install
Note: These files will be downloaded in a new folder called "node_modules" (this folder should NOT be added to the GIT repository)

```

## Running in development mode

> In a Terminal, cd to the root of the application

> If you are running it on your on machine, don't forget to update the socket connection path to locahost in /public/js/factories.js

```sh
# start web server
$ node app.js
```