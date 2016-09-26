/**
 * The entry point of the application. Starts scheduling of scraping jobs.
 **/
const db = require('./storage/clients/db');
const scheduler = require('./jobs/scheduler');
const diehard = require('diehard');

diehard.listen();

db.connect();
scheduler.scheduleJobs();
