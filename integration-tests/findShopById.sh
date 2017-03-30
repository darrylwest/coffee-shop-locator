#!/bin/sh
# dpw@seattle.local
# 2017.03.30
#

host=http://localhost:3002
apikey=01BCGE4TN75GJKR2ZS2PPGCZZH
id=10

curl -H "x-api-key: ${apikey}" -X GET "${host}/coffeeshop/${id}"

