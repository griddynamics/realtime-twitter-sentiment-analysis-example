//----------------------------------------------------------------
// The table stores classification model.
//----------------------------------------------------------------
CREATE TABLE twitter_sentiment.model (
  id text,
  threshold double,
  intercept double,
  words map<text, double>,
PRIMARY KEY (id)
);

//----------------------------------------------------------------
//                      USAGE EXAMPLES:
//----------------------------------------------------------------

// Write model
-- INSERT INTO twitter_sentiment.model (id, threshold, intercept, words)
--    VALUES ('Id', 1.2, 3.4, { 'word1': 0.1, 'word2': 0.2 });

// Read model
-- SELECT threshold, intercept, words FROM twitter_sentiment.model WHERE id='Id';