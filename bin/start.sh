#!/bin/bash

while true; do
	NODE_ENV=production node $(dirname $0)/www
	sleep 2
done
