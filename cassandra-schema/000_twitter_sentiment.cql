//----------------------------------------------------------------
//               The keyspace for all the tables
//----------------------------------------------------------------

// Replication factor 1 is only for simplicity on 1-node Cassandra installations, not for production
CREATE KEYSPACE twitter_sentiment WITH
    replication = {
        'class': 'SimpleStrategy',
        'replication_factor': 1
    };