#!/bin/sh
# dpw@seattle.local
# 2017.03.30
#

host=http://localhost:3002
apikey=01BCGE4TN75GJKR2ZS2PPGCZZH
id=10

echo "Should find shop with id ${id}"
curl -H "x-api-key: ${apikey}" -X GET "${host}/coffeeshop/${id}" && echo ""

id=999
echo "Should not find shop with id ${id}"
curl -H "x-api-key: ${apikey}" -X GET "${host}/coffeeshop/${id}" && echo ""
