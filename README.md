# Twitter Stream Classifier
A Big Data pipeline (set of applications) that pulls tweets related to some movies,
drops the tweets to Kafka, classifies them as positive/negative and, finally, exports counters and
the tweets to Cassandra. Simple Web UI application to view the results is also included.

The purpose of this repository is to give a baseline to the community in development of
In-Stream Big Data Pipelines. It can be taken as-is a prototype and filled in with
custom logic. If you faced issues or feel that something can be improved - contributions are welcomed.

## Modules

### test-utils
Embedded Redis, Spark, Cassandra and some other testing stuff which is reused
in tests across other modules.

### twitter-consumer
A tool which searches tweets related to specified movie and keeps tracking them in real time.
The tweets are pushed to Kafka.
For more details, see [module documentation](twitter-consumer/readme.md)

### dictionary-populator
A tool and DAO to work with classification model dictionary and coefficients in Cassandra.
The tool is used to import the model from TSV files.
Find more details in [module documentation](dictionary-populator/readme.md)

### streaming
Spark Streaming application which classifies tweets from Kafka and sends results to Cassandra.
Find more details, including Cassandra schemas in [module documentation](streaming/readme.md)

## Commands
### How to Build the Project
The project does not have explicit build environment limitations. But it is confirmed to work with:
1. Linux, Windows + Cygwin, MacOS
2. Maven 3+
3. Java 1.7+

```bash
# the build process is very simple
mvn clean install
# or without tests
mvn clean install -DskipTests -DskipITs
```
Note, that _clean_ is mandatory if tests are run due to peculiarities of Cassandra Maven Plugin and random ports reservation.

### Work with license headers
There is an automatic check that files have proper license headers.
You can either add the header manually, or use following command:
```
mvn license:format
```

## License
Apache License Version 2.0. See [LICENSE.txt](LICENSE.txt)
