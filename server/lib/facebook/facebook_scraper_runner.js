/**
* The module runs workers scraping Facebook data.
*/


import child_process from "child_process";
import config from "../../config/config";

function run() {
    let child = child_process.fork(__dirname + '/facebook_scraper', [config.FACEBOOK_ACCOUNT, config.FACEBOOK_TOKEN], {
      silent: true
    });
}

export { run };
