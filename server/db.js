/**
* Module creates and exports a MongoDB connection.
**/

import mongoose from 'mongoose';
import logger from './utils/logger';
import config from './config/config';
import scrapingJobSchema from './lib/scraping_job_schema';

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
  const uri = `mongodb://${config.MONGODB_USER}:${config.MONGODB_PASSWORD}@${config.MONGODB_HOST}:${config.MONGODB_PORT}/${config.MONGODB_DATABASE}`;
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

  process.on('SIGINT', () => {
    connection.close(() => {
      logger.logInfo('Mongoose connection disconnected due to app termination');
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

export { connect, getModelClass, removeModelClasses };
