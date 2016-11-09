#!/bin/bash

echo "About to apply all .cql files from current directory"

echo "Waiting for Cassandra to start"
while ! timeout 1 bash -c "echo > /dev/tcp/localhost/9042"; do sleep 10; done

echo "Applying schema files"

for filename in `ls -v *.cql | sort`; do 
    cqlsh -f $filename
done

echo "Schema files applied"
