import { CronJob } from 'cron';
import * as db from '../storage/clients/db';
import config from '../config/config';
import { isExecutedAsScript } from '../utils/module_utils';
import logger from '../utils/logger';
import ScraperRunner from './scraper_runner.js';


/**
* Creates a cron job running scrapers in the interval defined in the project config module.
* Also initialises the database connection.
**/
export default function scheduleJobs() {
  const job = new CronJob({
    cronTime: `*/${config.get('SCHEDULER_POLLING_INTERVAL')} * * * * *`,
    onTick: () => {
      logger.logInfo('Crone job triggered...');
      ScraperRunner.run();
    },
    start: false,
    timeZone: 'Europe/Berlin',
  });

  db.connect();
  job.start();
}

if (isExecutedAsScript(module)) {
  scheduleJobs();
}
