#!/bin/bash
#
# Copyright © 2016 Grid Dynamics (info@griddynamics.com)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

set -e

if [ -z "${SPARK_HOME}" ]; then
    if which spark-submit > /dev/null; then
        SPARK_SUBMIT=spark-submit
    else
        echo "Couldn't locate spark-submit command. Exiting..." 1>&2
        exit 1
    fi
else
    SPARK_SUBMIT=${SPARK_HOME}/bin/spark-submit
fi

MY_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MY_JAR="streaming-1.0-SNAPSHOT.jar"

for i in ${MY_DIR}/lib/*.jar; do
    JARS_TO_UPLOAD_TO_EXECUTOR=$(echo $i,${JARS_TO_UPLOAD_TO_EXECUTOR});
    # a feature of spark is that jars added with '--jars' are not added to driver's classpath by default
    # and we have to additionally add it to 'spark.driver.extraClassPath'.
    JARS_FOR_CLIENT_DRIVER_CLASSPATH=$(echo $i:${JARS_FOR_CLIENT_DRIVER_CLASSPATH})
done
# Need to add ourselves: http://stackoverflow.com/questions/25688349/spark-submit-classnotfound-exception
# Needed only for Spark in standalone mode - probably a bug
JARS_FOR_CLIENT_DRIVER_CLASSPATH=${MY_DIR}/${MY_JAR}:${JARS_FOR_CLIENT_DRIVER_CLASSPATH}

if [ "${SPARK_MASTER-undefined}" = "undefined" ]; then
    echo "SPARK_MASTER environment variable is not set. Running locally!"
    export SPARK_MASTER="local[2]"
fi

# We have to enable 'spark.executor.userClassPathFirst' to fix Guava dependency issue
${SPARK_SUBMIT} --master "$SPARK_MASTER" \
                --jars "${JARS_TO_UPLOAD_TO_EXECUTOR}" \
                --deploy-mode client \
                --driver-memory 500m \
                --executor-memory 500m \
                --executor-cores 2 \
                --conf "spark.driver.extraClassPath=${JARS_FOR_CLIENT_DRIVER_CLASSPATH}" \
                --driver-java-options "-Dlog4j.configuration=file://${MY_DIR}/log4j.properties" \
                --conf "spark.executor.userClassPathFirst=true" \
                "${MY_DIR}/${MY_JAR}" \
                --config "${MY_DIR}/application.conf" \
                "$@"