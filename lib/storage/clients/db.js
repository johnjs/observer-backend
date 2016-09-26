/**
* Module creates and exports a MongoDB connection.
**/

const mongoose = require('mongoose');
const diehard = require('diehard');
const logger = require('../../utils/logger');
const config = require('../../config/config');
const scrapingJobSchema = require('../../jobs/scraping_job_schema');

let connection;
let modelClasses;

/**
* Uses the locally defined (private) connection variable to create
* mongoose models.
*/
function _initModels() {
  modelClasses = {
    scraping_job: connection.model('scraping_jobs', scrapingJobSchema),
  };
}

/**
* Creates a connection to MongoDB database and initialises data models used in
* the project. Also defines handlers for some connection events. The connection
* is closed once the process is killed.
*/
function connect() {
  const user = config.get('MONGODB_USER');
  const pwd = config.get('MONGODB_PASSWORD');
  const host = config.get('MONGODB_HOST');
  const port = config.get('MONGODB_PORT');
  const dbName = config.get('MONGODB_DATABASE');

  const uri = `mongodb://${user}:${pwd}@${host}:${port}/${dbName}`;
  connection = mongoose.createConnection(uri);

  connection.on('connected', () => {
    logger.logInfo(`Mongoose connection open to ${uri}`);
  });

  connection.on('error', (err) => {
    logger.logError(err);
  });

  connection.on('disconnected', () => {
    logger.logInfo('Mongoose connection disconnected');
  });

  diehard.register((done) => {
    connection.close(() => {
      logger.logInfo('Mongoose connection disconnected due to app termination');
      done();
    });
  });

  _initModels();

  return connection;
}

/**
* Returns a monogoose model class for a given name.
* @param {string} name - id of the data model whose class should be returned
* @throws Will throw an error if model classes have not been initialised yet.
**/
function getModelClass(name) {
  if (!modelClasses) {
    throw new Error('Models has not been initialised yet.');
  }
  return modelClasses[name];
}

/**
* Unsets model classes. Implemented for testing only.
*/
function removeModelClasses() {
  modelClasses = null;
}

module.exports = { connect, getModelClass, removeModelClasses };
