/**
 * The entry point of the application. Starts scheduling of scraping jobs.
 **/
import * as db from './storage/clients/db';
import scheduler from './jobs/scheduler';

db.connect();
scheduler.scheduleJobs();
