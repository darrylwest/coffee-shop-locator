#!/bin/sh
# dpw@seattle.local
# 2017.04.02
#

host=http://localhost:3002
apikey=01BCGE4TN75GJKR2ZS2PPGCZZH
id=10

echo "Should update shop with id ${id}"
curl -H "x-api-key: ${apikey}" \
    -H "Content-Type: application/json" \
    -d '{"id":10,"dateCreated":"2017-04-02T20:29:04.872Z","lastUpdated":"2017-04-02T20:29:04.872Z","version":0,"name":"Big Blue Bottle Coffee","address":"2 Ferry Building Ste 7","lat":37.795904759999,"lng":-122.3939375988888,"status":"active"}' \
    -X PUT "${host}/coffeeshop/${id}" && echo ""

