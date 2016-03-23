import {CronJob} from "cron";
import * as FacebookRunner from "./lib/facebook/facebook_scraper_runner.js"
import config from "./config/config";

export default function scheduleJobs() {

  let job = new CronJob({
    cronTime: `*/${config.SCRAPING_INTERVAL} * * * * *`,
    onTick: () => {
      FacebookRunner.run();
    },
    start: false,
    timeZone: 'Europe/Berlin'
  });

  job.start();
}

if (require.main === module) {
  scheduleJobs();
}
