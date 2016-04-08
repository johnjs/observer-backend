#!/usr/bin/env node

var Q = require('q');
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var program = require('commander');
var colors = require('colors');

var DEFAULT_DB_PORT = 27017;
var DEFAULT_DB_HOST = 'localhost';
var DEFAULT_DB_USER = {
  name: 'observer_backend',
  pwd: 'p@ss',
  roles: ['readWrite']
};

program
.command('setup [env]')
.description('sets up the datebase for a given environment')
.option('-u, --dbuser <username>', 'name of database user')
.option('-p, --password <password>', 'database user`s password')
.action(function sdf (env, options) {
  env = env || 'dev';

  var user = {
    name: options.username || DEFAULT_DB_USER.name,
    pwd: options.password || DEFAULT_DB_USER.pwd,
    roles: DEFAULT_DB_USER.roles
  }

  setUpDatabase(getDbName(env), user);
});

program
.command('drop [env]')
.description('drops the database for a given environment')
.action(function(env, options) {
  env = env || 'dev';
  dropDb(getDbName(env));
});

program.parse(process.argv);

function getDbName(env) {
  return 'observer_backend_' + env;
}

function connectToDb(name) {
  var db = new Db(name, new Server('localhost', 27017));
  return Q.denodeify(db.open.bind(db))()
}

function closeDbConnection(db) {
  db.close();
}

function createCollection(db) {
  return Q.denodeify(db.createCollection.bind(db))('scraping_jobs')
    .then(function() { return db });
}

function createUser(user, db) {
  return Q.denodeify(db.addUser.bind(db))(user.name, user.pwd, {
    roles: user.roles
  })
  .then(function() { return db; });
}

function removeUser(db) {
  return Q.denodeify(db.removeUser.bind(db))(DEFAULT_DB_USER.name)
    .then(function() { return db; });
}

function setUpDatabase(dbName, user) {
  logInfo('Starting to set up <' + dbName + '> database...');
  connectToDb(dbName)
    .then(createCollection)
    .then(createUser.bind(null, user))
    .then(function(db) {
      logSuccess('Database: <' + dbName + '> has been set up');
      return db;
    })
    .then(closeDbConnection)
    .catch(function(err) {
      logError('Database has not been set up due to error: ' + err);
      process.exit(1);
    })
    .done(function() {
      process.exit(0);
    });
}

function dropDb(dbName) {
  connectToDb(dbName)
    .then(removeUser)
    .then(function(db) {
      return Q.denodeify(db.dropDatabase.bind(db))()
    }).catch(function(err) {
      logError('Error when dropping <' + dbName + '> database: ' + err);
      process.exit(1);
    }).done(function() {
      logSuccess('Database: <' + dbName + '> has been dropped');
      process.exit(0);
    });
}


/**
* Loggers
*/
function logInfo(msg) {
  console.log(msg.blue);
}
function logError(msg) {
  console.log(msg.red);
}
function logSuccess(msg) {
  console.log(msg.green);
}
