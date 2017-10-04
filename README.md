3C Setup Procedure
==================

install node.js & npm
https://nodejs.org

fix npm permissions (use Option 2)
https://docs.npmjs.com/getting-started/fixing-npm-permissions

install Angular CLI globally
https://cli.angular.io/
> npm install -g @angular/cli

install mongoDB
https://www.mongodb.com/download-center#community

run mongoDB
> mongod --dbpath <path/to/put/your/databases/in>

restore uncompressed 3C content to local DB
> mongorestore -d 3C ./<unzipped_db_folder>



(optional)
------------------------

You should really use '--auth' with mongod for security, even on your local machine.
But this requires setting up user accounts in the DB..
https://docs.mongodb.com/manual/tutorial/enable-authentication/

Using two terminal windows:

> mongo
> use admin
> db.createUser(
  {
    user: "yourAdminName",
    pwd: "yourAdminpassword",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
)
> exit

> (kill the mongobd instance ctrl-c)
> mongod --auth --dbpath <path/to/put/your/databases/in>

> mongo -u yourAdminName -p yourAdminpassword --authenticationDatabase admin
> use 3C
> db.createUser(
  {
    user: "yourUsername",
    pwd: "yourPassword",
    roles: [ { role: "readWrite", db: "3C" } ]
  }
)
> exit
> mongod --auth --dbpath <path/to/put/your/databases/in>




Continue..
------------------------

to see your content this tool is nice:
https://blog.robomongo.org/


fork 3C to your own github account and clone that repo to your local machine

install necessary support packages for this project (manage these in package.json)
> npm install




Inside the 3C project
---------------------

create a file at the top level called '.env' and add this content:


MONGODB_URI=mongodb://localhost/3C
DB_USER=yourUsername
DB_PASSWORD=yourPassword
NODE_ENV=development
PORT=8000
FB_APP_ID=<app_id>
FB_APP_SECRET=<secret>
FB_PAGE_ID=<page_ID>
INSTAGRAM_ACCESS_TOKEN=<token>



You can run the server in WebStorm, but I prefer to use a terminal when not debugging
> node app.js

Run the front end code using Angular CLI  https://cli.angular.io/
> ng serve

