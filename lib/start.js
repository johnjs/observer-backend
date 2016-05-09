/**
 * The entry point of the application. Starts scheduling of scraping jobs.
 **/
import * as db from './storage/clients/db';
import scheduler from './jobs/scheduler';
import diehard from 'diehard';

diehard.listen();

db.connect();
scheduler.scheduleJobs();
