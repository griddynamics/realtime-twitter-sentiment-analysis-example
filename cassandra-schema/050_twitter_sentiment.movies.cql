//----------------------------------------------------------------
//      The table stores list of movies we collect stats for
//----------------------------------------------------------------

CREATE TABLE twitter_sentiment.movies (
    title text,             // movie title
    release date,           // date released
    rating float,           // IMDB rating out of 10
    PRIMARY KEY (title)
);
