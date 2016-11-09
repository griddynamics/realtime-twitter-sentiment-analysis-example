//------------------------------------------------------------------------------------------
//         The table stores accumulated counters for every hour
// For verbosity non-clustering column names are quite long, what is not good for production
//-------------------------------------------------------------------------------------------

CREATE TABLE twitter_sentiment.hourly_counters (
    movie text,
    period_start_ts timestamp,
    negative_count counter,
    negative_count_0_500_followers counter,
    negative_count_501_5000_followers counter,
    negative_count_5001_inf_followers counter,
    non_negative_count counter,
    non_negative_count_0_500_followers counter,
    non_negative_count_501_5000_followers counter,
    non_negative_count_5001_inf_followers counter,
    PRIMARY KEY (movie, period_start_ts)
);