//----------------------------------------------------------------
//         The table stores time series of tweet ids
//----------------------------------------------------------------
CREATE TABLE twitter_sentiment.timeline (
  movie text,
  date date,
  time time,
  id text,
  is_negative boolean,
PRIMARY KEY ((movie, date), time, id)
);

//----------------------------------------------------------------
//                      USAGE EXAMPLES:
//  Note, despite of ALLOW FILTERING statements, all select
//  queries are still relatively lightweight.
//  Dates and times are UTC.
//----------------------------------------------------------------

// Insert data
-- INSERT INTO twitter_sentiment.timeline (movie, date, time, id, is_negative) VALUES ('movie1', '2009-02-13', '19:15:00', 'id2', true);

// Select negative tweet ids for several hours inside a day
-- SELECT * FROM twitter_sentiment.timeline
--    WHERE movie='movie1' AND date='2009-02-13' AND time>'18:00:00' AND time<'20:00:00.000' AND is_negative=True
--    ALLOW FILTERING;

// Get negative tweets count for a day
-- SELECT count(*) FROM twitter_sentiment.timeline
--    WHERE movie='movie1' AND date='2009-02-13' AND is_negative=True
--    ALLOW FILTERING;

// Get negative tweets count for range of days (you have to specify all the days in the range)
-- SELECT count(*) FROM twitter_sentiment.timeline
--    WHERE movie='movie1' AND date IN ('2009-02-13','2009-02-14','2009-02-15') AND is_negative=True
--    ALLOW FILTERING;

// Get negative tweets starting at '2009-02-12 16:00:00' and ending with '2009-02-14 17:00:00'
// You have to submit multiple queries and then join the results
-- SELECT * FROM twitter_sentiment.timeline
--    WHERE movie='movie1' AND date='2009-02-12' AND time>'16:00:00' AND is_negative=True
--    ALLOW FILTERING;
-- SELECT * FROM twitter_sentiment.timeline
--    WHERE movie='movie1' AND date='2009-02-13' AND is_negative=True
--    ALLOW FILTERING;
-- SELECT * FROM twitter_sentiment.timeline
--    WHERE movie='movie1' AND date='2009-02-14' AND time<'17:00:00' AND is_negative=True
--    ALLOW FILTERING;

