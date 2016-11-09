## Tweets Classifier Spark Streaming Application
The application reads tweets from Kafka, classifies them as positive or negative and drops results to Cassandra.

Some tables in Cassandra use counter columns. Values of these columns are sensitive to
duplicated messages. Micro-batch processing of Spark Streaming gives "at least once"
semantics. That's why tweets are additionally de-duplicated in Redis.

The app makes a lookup to Redis and checks if we saw this tweet id before.
If yes - the tweet if ignored. If not - it's id is written and the tweet goes ahead.
Current implementation is not a 100% guarantee.
In some cases tweet ids can be stored in Redis but not processed (and written to Cassandra).
Tweet ids are stored in Redis in day/hour buckets.
This gives an opportunity to drop the ids for particular days or hours and reprocess
the stream. This is very useful in case of software bugs. Of course, counters in
Cassandra for affected hours should also be dropped.

### Packaging and deployment
Once you execute ```mvn clean package``` or ```mvn clean verify```, you can find
a tar.gz archive in target directory. The archive contains everything needed to
submit the Spark Streaming job. Just upload and extract the archive on a gateway server
of Spark cluster.

### Execution and configuration
Make sure that you have classification model populated in Cassandra and all necessary tables are created in Cassandra.
[application.conf](src/main/configs/application.conf) configuration file is located inside targz archive.
It expects a number of optional environment variables, particularly Kafka, Redis and Cassandra hosts.
The job can be run with _streaming-runner.sh_ shell script. The simplest command looks like:
```bash
export REDIS_HOST=<some_host>
export KAFKA_BROKER_LIST=<comma_separated_list_of_brokers_host:port>
export CASSANDRA_HOST=<comma_separated_list_of_some_cassandra_hosts>
bash ./streaming-runner.sh
```
Take a look on configuration file content for other options.

### Cassandra Keyspace and Tables
Keyspace: [streaming/src/test/resources/twitter_sentiment.cql](streaming/src/test/resources/twitter_sentiment.cql)<br>
Model table and examples: [streaming/src/test/resources/twitter_sentiment.cql](streaming/src/test/resources/twitter_sentiment.model.cql)<br>
Tweets table and examples: [streaming/src/test/resources/twitter_sentiment.tweets.cql](src/test/resources/twitter_sentiment.tweets.cql)<br>
Timeline table and examples: [streaming/src/test/resources/twitter_sentiment.timeline.cql](src/test/resources/twitter_sentiment.timeline.cql)
Minute Counters table and examples: [streaming/src/test/resources/twitter_sentiment.timeline.cql](src/test/resources/twitter_sentiment.minute_counters.cql)
Hourly Counters table and examples: [streaming/src/test/resources/twitter_sentiment.timeline.cql](src/test/resources/twitter_sentiment.hourly_counters.cql)

### Integration testing
```bash
mvn clean verify
```
Integration tests start embedded Redis, Spark, Cassandra, ZooKeeper and Kafka.
Redis, Spark, ZooKeeper and Kafka are started from Scala code before each test suite.
Cassandra is started by _cassandra-maven-plugin_ before testing phasein Maven.
Random ports are reserved with _build-helper-maven-plugin_ to avoid collisions during concurrent builds on a build server.

### How to start Cassandra locally
You might want to start Cassandra locally to debug related integration tests in IDE.
```bash
mvn clean cassandra:run -Dcassandra.nativeTransportPort=19042
```
Note: _"clean"_ command is important, because it purges previously used Cassandra port, which might be different in previous run due to _build-helper-maven-plugin_.
It is also possible to connect to started Cassandra with _cqlsh_:
```bash
export CQLSH_HOST=localhost
export CQLSH_PORT=19042
cqlsh
```
But for that you must have locally installed Cassandra (have _cqlsh_ in PATH).
