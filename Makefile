TESTFILES=test/*.js
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

integration-tests:
	@( ./integration-tests/findItemById.sh )
	@( ./integration-tests/queryByUserId.sh )
	@( ./integration-tests/queryAll.sh )
	@( ./integration-tests/queryByGeo.sh )

watch:
	@( ./watcher.js )

edit:
	vi -O2 src/*.js test/*.js

.PHONY:	npm
.PHONY:	watch
.PHONY:	test
.PHONY:	integration-tests

