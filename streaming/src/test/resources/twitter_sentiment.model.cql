//----------------------------------------------------------------
//      The table stores classification model
//----------------------------------------------------------------

CREATE TABLE twitter_sentiment.model (
  id text,
  threshold double,
  intercept double,
  words map<text, double>,
PRIMARY KEY (id)
);
