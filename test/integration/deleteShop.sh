#!/bin/sh
# dpw@seattle.local
# 2017.04.02
#

host=http://localhost:3002
apikey=01BCGE4TN75GJKR2ZS2PPGCZZH
id=36

echo "Should return application status with pre-delete count..."
curl -H "x-api-key: ${apikey}" -X GET "${host}/coffeeshop/status" && echo ""

echo "Should find shop with id ${id}"
curl -H "x-api-key: ${apikey}" -X DELETE "${host}/coffeeshop/${id}" && echo ""

echo "Should return application status with delete count..."
curl -H "x-api-key: ${apikey}" -X GET "${host}/coffeeshop/status" && echo ""

id=999
echo "Should reject delete request with id ${id}"
curl -H "x-api-key: ${apikey}" -X DELETE "${host}/coffeeshop/${id}" && echo ""


