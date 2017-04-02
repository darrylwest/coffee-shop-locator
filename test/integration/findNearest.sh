#!/bin/sh
# dpw@seattle.local
# 2017.04.02
#

host=http://localhost:3002
apikey=01BCGE4TN75GJKR2ZS2PPGCZZH

address='535+Mission+St.,San+Francisco,CA'
echo "$address"

echo "Should find shop nearest to $address"
curl -H "x-api-key: ${apikey}" -X GET "${host}/locate/nearest?address=$address" && echo ""

