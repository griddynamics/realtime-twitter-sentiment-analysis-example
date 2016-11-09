## Twitter Consumer
Searches twitter specified movie name and writes related tweets to Kafka.

### Packaging and deployment
Once you execute `mvn clean package` or `mvn clean verify`, you can find
a tar.gz archive in `target/` directory. The archive contains everything
what is needed to run the tool.

### Execution and configuration
`application.conf` configuration file is located inside tar.gz archive.
It expects a number of environment variables, such as Twitter access tokens and keys.

Execution example:
```bash
export TWITTER_CONSUMER_KEY="..."
export TWITTER_CONSUMER_SECRET="..."
export TWITTER_ACCESS_TOKEN="..."
export TWITTER_ACCESS_TOKEN_SECRET="..."

bash ./twitter-consumer-runner.sh \
  --movie="Star Wars" \              # movie name
  --search-since="2016-12-31"        # date since which to fetch historical tweets (default is today)
```

Take a look at [application.conf file content](src/main/resources/application.conf)
for complete options list.

### Integration testing
```bash
mvn clean verify
```
Tests use embedded Kafka.