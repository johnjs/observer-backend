import winston from 'winston';
import WinstonDailyRotateFile from 'winston-daily-rotate-file';
import moment from 'moment';

const colors = {
  info: 'green',
  warn: 'yellow',
  error: 'red',
};

const levels = {
  info: 0,
  warn: 1,
  error: 2,
};

const consoleLogConf = new(winston.transports.Console)({
  colorize: true,
});

const fileLogConf = new(WinstonDailyRotateFile)({ // eslint-disable-line no-unused-vars
  filename: '../../logs/observer.log',
  datePattern: '.dd-MM-yyyy',
});

const winstonTransportsConf = [];
if (process.env.NODE_ENV !== 'test') { winstonTransportsConf.push(consoleLogConf); }

winston.addColors(colors);

class Logger {

  constructor() {
    this.wlogger = new(winston.Logger)({
      level: 'error',
      transports: winstonTransportsConf,
    });
    this.wlogger.setLevels(levels);
  }

  logError(err) {
    this.wlogger.error('[%s] %s %s', moment().format(), err.message, err.stack);
  }

  logInfo(message) {
    this.wlogger.info('[%s] %s', moment().format(), message);
  }
}

export default new Logger();
