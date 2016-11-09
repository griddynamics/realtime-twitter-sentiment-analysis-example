//----------------------------------------------------------------
//      The table stores raw tweets dump for further analysis
//----------------------------------------------------------------

// See twitter4j.Status Java class for more info
CREATE TYPE IF NOT EXISTS twitter_sentiment.tweet (
  id text,             // tweet (status) id
  user text,           // screen name of user who posted or reposted the tweet
  created timestamp,   // post date/time
  message text,        // tweet text
  followers int,       // count of followers that the user has
  place_name text,     // ???
  geo_location text,   // ???
  utc_offset int       // ???
);

CREATE TABLE twitter_sentiment.tweets (
  id text,             // tweet (status) id, the same as inside body
  movie text,          // movie name for which this tweet had been searched
  is_negative boolean, // classification result
  tweet frozen<tweet>, // tweet body (see corresponding UDT)
PRIMARY KEY (id)
);

//----------------------------------------------------------------
//                      USAGE EXAMPLES:
//----------------------------------------------------------------

// Insert a tweet
-- INSERT INTO twitter_sentiment.tweets (id, movie, is_negative, tweet)
--    VALUES ('id1', 'movie1', True, {id:'id1', user:'user1', created:1234567890000, message:'msg', followers:1, place_name:'place1', geo_location:'geo1', utc_offset:-4});

// Get tweet message by tweet id
-- SELECT tweet.message FROM twitter_sentiment.tweets WHERE id='id1';