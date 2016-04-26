observer-backend
===============

[![Build Status](https://travis-ci.org/johnjs/observer-backend.svg?branch=master)](https://travis-ci.org/johnjs/observer-backend)
[![Coverage Status](https://coveralls.io/repos/github/johnjs/observer-backend/badge.svg?branch=master)](https://coveralls.io/github/johnjs/observer-backend?branch=master)

### What is the observer project?
![](http://stream1.gifsoup.com/view7/3852456/lemur-eyes-o.gif)

The main goal of the observer project is to aggregate data (posts and mentions) gathered from social media accounts specified by the user, so that he doesn't need to check several platforms to keep up with the latest news and messages. The expected behavior of the final project's version is to display data gathered for the user on a single time line where messages coming from different sources are mixed and ordered chronologically. It's a completely non-profit project and should be treated as a playground where fancy technologies, libraries and solutions can be used.

### What does this repo do?
The `observer-backend` repository is the first part of the project and is responsible for fetching data from  social media services.

### How does it work?
Visit our [wiki page](https://github.com/johnjs/observer-backend/wiki/Architecture) to get slightly bigger picture of project's architecture.

### Where can I check the progress of implementation?
Go to [Trello](https://trello.com/b/w70yoQWp/observer-backend).

Running the project
===============
In order to run the project following services must be installed:
* [MongoDB v3.2.5](https://www.mongodb.org/)
* [RabbitMQ v3.2.4](https://www.rabbitmq.com/)

Once they are available on your environment run following commands:

```sh
npm install #installs projects dependencies
node scripts/db.sh setup dev --dbuser <user> --password <pwd> #creates DB users and collections
nf start #uses foreman to start the app and run required services
```

Before you run the last command please install [node-foreman](https://github.com/strongloop/node-foreman) module globally.

Configuration
===============
Default configuration parameters are stored in the [global.json](https://github.com/johnjs/observer-backend/blob/master/lib/config/global.json) file. Please note that they can be overriden by environmental variables. The list of the environmental variables used by the app should be included in a git-ignored `.env` file. The file will be automatically loaded by [node-foreman](https://github.com/strongloop/node-foreman#usage) once you run the app with `nf start` command.

Continuous integration
===============
Travis CI builds the project by running tests, linter and test coverage utilities whose results are passed to [Coveralls](https://coveralls.io).


Running the tests
===============

* `make test` - runs all the tests,
* `make test-single test=<phrase>` - runs all the test cases containing a given phrase (handy when running individual test),
* `make test-single-debug test=<phrase>` - works as the previous command, but runs the tests in the debug mode.

Used tools:
* test runner: [mocha.js](https://mochajs.org/),
* assertions: [chai.js](chaijs.com),
* stubbing: [sinon.js](chaijs.com), [proxyquire](https://github.com/thlorenz/proxyquire),
* test coverage: [instanbul](https://github.com/gotwarlost/istanbul).

License
===============
MIT

Contributors
===============
Dominik Michalski <d.m.michalski@gmail.com>

Joanna Kaczmar <asia.kaczmar@gmail.com>
