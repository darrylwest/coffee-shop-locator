#!/bin/sh
# dpw@seattle.local
# 2017.04.02
#

host=http://localhost:3002
apikey=01BCGE4TN75GJKR2ZS2PPGCZZH

echo "Should insert a new shop..."
curl -H "x-api-key: ${apikey}" \
    -d '{"name":"My Little Coffee Space","address":"199 Freemont St, San Francisco, CA","lat": 37.7898733,"lng":-122.3947812}' \
    -H "Content-Type: application/json" \
    -X POST "${host}/coffeeshop" && echo ""

