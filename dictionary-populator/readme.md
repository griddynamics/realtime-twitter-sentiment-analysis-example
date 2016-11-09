## Dictionary Populator
Exports weighted dictionary words and other model coefficients to Cassandra.
The model is used by tweets classifier in-stream application.
Word weights and model coefficients are stored in a single Cassandra row.
This might look weired, but allows to read the whole model at once with a single request.

### Packaging and deployment
Once you execute ```mvn clean package``` or ```mvn clean verify```, you can find
a tar.gz archive in target directory. The archive contains everything needed to
populate the dictionary, including default weights and coefficients.

### Execution and configuration
[application.conf](src/main/configs/application.conf) configuration file is located inside tar.gz archive.
It expects a number of optional environment variables, particularly Cassandra host.
The simplest execution command looks like:
```bash
export CASSANDRA_HOST=<some_host>
bash ./populator-runner.sh
```
Take a look on configuration file content for other options.

### Integration testing
```bash
mvn clean verify
```
Tests use embedded Cassandra which is launched with Maven plugin.