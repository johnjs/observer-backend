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

const fileLogConf = new(WinstonDailyRotateFile)({
  filename: '../../logs/observer.log',
  datePattern: '.dd-MM-yyyy',
});

const winstonTransportsConf = [];
if (process.env.NODE_ENV !== 'TEST') { winstonTransportsConf.push(consoleLogConf); }

winston.addColors(colors);

class Logger {

  constructor() {
    this.wlogger = new(winston.Logger)({
      level: 'error',
      transports: winstonTransportsConf,
    });
    this.wlogger.setLevels(levels);
  }

  logError(message) {
    this.wlogger.error('[%s] %s', moment().format(), message);
  }
}

export default new Logger();
