#!/bin/sh
# dpw@seattle.local
# 2017.03.30
#

# address='2634+woolsey+street,+berkeley+ca'
# address='535+Mission+St,+San+Francisco,+CA+94105'
# js escaped address...
address='535%20Mission%20St%2C%20San%20Francisco%2C%20CA%2094105'

curl "https://maps.googleapis.com/maps/api/geocode/json?address=${address}"

