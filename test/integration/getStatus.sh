#!/bin/sh
# dpw@seattle.local
# 2017.04.02
#

host=http://localhost:3002
apikey=01BCGE4TN75GJKR2ZS2PPGCZZH

echo "Should return application status"
curl -H "x-api-key: ${apikey}" -X GET "${host}/coffeeshop/status" && echo ""

