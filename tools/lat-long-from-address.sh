#!/bin/sh
# dpw@seattle.local
# 2017.03.30
#

address='2634+woolsey+street,+berkeley+ca'

curl "https://maps.googleapis.com/maps/api/geocode/json?address=${address}"

