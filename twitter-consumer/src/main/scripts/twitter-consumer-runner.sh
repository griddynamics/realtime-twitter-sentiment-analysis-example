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

set -u
set -e

MY_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MY_JAR="twitter-consumer-1.0-SNAPSHOT.jar"
JARS=""

for i in ${MY_DIR}/lib/*.jar; do
    JARS=$(echo "${i}":${JARS})
done
JARS="$JARS:${MY_DIR}/${MY_JAR}"

$JAVA_HOME/bin/java -cp "${JARS}" \
     -Dlog4j.configuration="file://${MY_DIR}/log4j.properties" \
     com.griddynamics.blueprint.streaming.twitter.Main \
     --config "${MY_DIR}/application.conf" \
     "$@"