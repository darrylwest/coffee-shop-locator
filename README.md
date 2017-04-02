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
* body-parser 1.17.1 to enable json parsing

Test dependencies include mocha, chai, jshint, mock-express.

## Installation

Follow these steps...

```
git clone https://github.com/darrylwest/coffee-shop-locator.git
cd coffee-shop-locator
npm install
make test
make start
make status
make integration
```

This will start that application service running in the background.  Log statements are written to the logs folder and you check the nohup.out file to see what the log filename is.

The integration tests fully exercise the API. 

## API Use

The coffee-shop-locator API requires an api key and session key.  These values are hard-coded for this exercise...

### End Points

There are only two coffeeshop end points, the first to fetch, insert, update and delete using http methods GET, POST, PUT and DELETE.  The second endpoint is used to search for the closest coffee shop given a street address.

Here is the specific routing:

* get /coffeeshop/:id - searches the database and returns the located record, or a 404 not found error
* post /coffeeshop/ - validate and insert a new coffee shop and returns the shop's id
* put /coffeeshop/:id - updates a shop with new values and returns the updated model if found, validated and updated, else returns a 404 error
* delete /coffeeshop/:id - finds and deletes a coffee shop and returns the id, else returns a 404
* get /locate/nearest?address=<address> - finds and returns the nearest coffee shop (address must be escaped)

## Tests

This application was developed in osx and tested inside AWS on EC2 running centos7 and node 6.10.

### Unit

There are unit tests for each public function in the application.  There are also "compiler" tests that compensate for javascript not compiling until run time.  The "compiler" tests guard against typos that would not be caught even at runtime until a method is actually invoked.

### Integration

There are good news and bad news test/exercises for each endpoint.

## Implementation

### Project layout

* src folder for production source files
* test folder for unit and integration tests, test fixtures, etc
* app.js for main runner
* package.json for npm packaging
* Makefile to orchestrate tests and start the app
* watcher script that runs during development to run the full set of unit tests on file save
* tools folder with ad-hoc / sandbox tests
* a travis yaml file for CI testing

### Test Driven Design

Achieving 100% test coverage for nodejs projects (actually any javascript) is vital.  I love coding in es6 but it's still easy to let silly mistakes get through unless all of the code is exercised.  And using TDD for development insures that every line of code is tested.

JSHint is used to augment unit tests and insure that the code is formatted in a consistent manner.  There is an associated .jshintrc with specific formatting rules.

There are also a set of integration tests, really more like exercises against the running API.  I find this useful for front end to use as a template for their work.  A viable option is to use something like Postman with a set of scripts.
  
### Application Logging

For this stage, the logging is rather verbose--for a reason.  It serves as a good trace of what is happening inside the server.  Each module has it's own logger namespace making it easy to locate the source of the log statement.

For production there would be multiple log targets including info and warn/error to separate out the vital statements from simple info trace.  But, the info is important to retain when something goes wrong.

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

Given more time, here are some enhancements that I would make:

* Database Integration to redis/mongo or MySQL
* Docker Containerization to enable scaling
* Mobile Integration to test mobile app
* Swagger Definitions to help fully define the API
* Functional Tests to automate end-to-end testing of the API

## License

Apache 2.0

###### darryl.west | Version 2017-04-02
