MOCHA=./node_modules/.bin/mocha --reporter spec 'test/**/*.test.js'

test:
	@NODE_ENV=test $(MOCHA)

test-single:
	@NODE_ENV=test $(MOCHA) --grep $(test)

test-single-debug:
	@NODE_ENV=test $(MOCHA) debug --grep $(test)

.PHONY: test
