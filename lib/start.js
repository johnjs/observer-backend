/**
 * The entry point of the application. Starts scheduling of scraping jobs.
 **/
import * as db from './storage/clients/db';
import scheduler from './jobs/scheduler';
import diehard from 'diehard';
import scrapingJobSchema from './jobs/scraping_job_schema';

diehard.listen();

db.connect();
db.registerModel('scraping_job', 'scraping_jobs', scrapingJobSchema);

scheduler.scheduleJobs();
