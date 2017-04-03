TESTFILES=test/*.js
FUNCTIONAL_FILES=test/functional/*.js
JSFILES=src/*.js app.js
JSHINT=node_modules/.bin/jshint
MOCHA=node_modules/.bin/mocha

all:
	@make test

npm:
	@npm install

jshint:
	@( $(JSHINT) --verbose --reporter node_modules/jshint-stylish/ $(TESTFILES) $(JSFILES) )

test:
	@( $(MOCHA) $(TESTFILES) )
	@( make jshint )

run:
	node app.js

start:
	@( export NODE_DEV=production && nohup node app.js & )

func:
	@( $(MOCHA) $(FUNCTIONAL_FILES) )

integration:
	@( ./test/integration/findShopById.sh )
	@( ./test/integration/insertShop.sh )
	@( ./test/integration/updateShop.sh )
	@( ./test/integration/deleteShop.sh )
	@( ./test/integration/findNearest.sh )

status:
	@( ./test/integration/getStatus.sh )

watch:
	@( ./watcher.js )

edit:
	vi -O2 src/*.js test/*.js

.PHONY:	npm
.PHONY:	watch
.PHONY:	test
.PHONY:	integration-tests

