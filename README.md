# Coffee Shop Locator

```
 _____        __  __            _____ _                   _                     _
/  __ \      / _|/ _|          /  ___| |                 | |                   | |            
| /  \/ ___ | |_| |_ ___  ___  \ `--.| |__   ___  _ __   | |     ___   ___ __ _| |_ ___  _ __ 
| |    / _ \|  _|  _/ _ \/ _ \  `--. \ '_ \ / _ \| '_ \  | |    / _ \ / __/ _` | __/ _ \| '__|
| \__/\ (_) | | | ||  __/  __/ /\__/ / | | | (_) | |_) | | |___| (_) | (_| (_| | || (_) | |   
 \____/\___/|_| |_| \___|\___| \____/|_| |_|\___/| .__/  \_____/\___/ \___\__,_|\__\___/|_|   
                                                 | |                                          
                                                 |_|                                          
```

## Overview

The coffee shop locator challenge project is implemented with nodejs version 6.9.1 using the following dependencies:

* express 4.15.2 as the REST server
* geolib 2.0.22 for location search
* simple-node-logger 0.93.17 for application logging

Test dependencies include mocha, chai

## Installation


```
git clone https://github.com/darrylwest/coffee-shop-locator.git
npm install
make test
make start
```

## API Use

The coffee-shop-locator API requires an api key and session key.  These values are hard-coded for this exercise...

### End Points

## Tests

### Unit

### Integration

## Implementation

### Project layout

* src folder for production source files
* test folder for unit and integration tests, test fixtures, etc
* app.js for main runner
* package.json for npm packaging
* Makefile to orchestrate tests and start the app
* watcher script that runs during development to run the full set of unit tests on file save
* docker container with start-up script
* tools folder with ad-hoc / sandbox tests
* a travis yaml file for CI testing

### Test Driven Design

Achieving 100% test coverage for nodejs projects (actually any javascript) is vital.  I love coding in es6 but it's still easy to let silly mistakes get through unless all of the code is exercised.  And using TDD for development insures that every line of code is tested.

JSHint is used to augment unit tests and insure that the code is formatted in a consistent manner.  There is an associated .jshintrc with specific formatting rules.

There are also a set of integration tests, really more like exercises against the running API.  I find this useful for front end to use as a template for their work.  A viable option is to use something like Postman with a set of scripts.
  
### Application Logging


### CSV Parser

I did some research into an off-the-shelf CSV parser for node but ended up just writing one.  Here is what I looked at.

#### Node.js CSV-Parser

* difficult to use
* documentation and examples were not helpful
* sandbox tests took too long to implement

#### CSV-to-JSON

* converted correctly
* event based as opposed to callback
* had es6 examples

#### Conclusion 

For this project it is probably easier to create one from scratch and just read lines and separate fields with simple comma split.

## Extensions & Enhancements

### Database Integration

### Docker Containerization

### Mobile Integration

### Swagger Definitions


## License

Apache 2.0

###### darryl.west | Version 2017-04-01
