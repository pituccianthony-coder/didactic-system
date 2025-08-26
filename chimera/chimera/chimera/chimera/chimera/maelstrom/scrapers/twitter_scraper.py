import tweepy
import json
from pathlib import Path
from datetime import datetime
import sys

# Adjust path to import from the root directory
sys.path.append(str(Path(__file__).resolve().parents[1]))
from config_loader import load_config

def scrape_twitter():
    """
    Scrapes Twitter for recent tweets from the specified handles.
    This is like eavesdropping at the digital water cooler of the global elite.
    Mostly noise, but sometimes... signal.
    """
    print("🤖 Starting Twitter scraper...")
    config = load_config()

    twitter_config = config.get('api_keys', {}).get('twitter')
    if not all([twitter_config, twitter_config.get('bearer_token')]):
        print("⚠️ Twitter bearer token not found in config.yaml. Skipping Twitter scrape.")
        return

    try:
        # Using v2 of the API
        client = tweepy.Client(bearer_token=twitter_config['bearer_token'])
    except Exception as e:
        print(f"❌ Failed to connect to Twitter API: {e}")
        return

    handles = config.get('sources', {}).get('twitter_handles', [])
    narratives = config.get('narratives', [])

    all_tweets = []
    for handle in handles:
        try:
            print(f"  -> Scraping @{handle}...")
            # Get user object to find their ID
            user = client.get_user(username=handle)
            if not user.data:
                print(f"  -> Could not find user @{handle}. Skipping.")
                continue

            user_id = user.data.id
            # Fetch recent tweets
            response = client.get_users_tweets(id=user_id, max_results=20, tweet_fields=["created_at", "public_metrics"])

            if not response.data:
                continue

            for tweet in response.data:
                if any(narrative.lower() in tweet.text.lower() for narrative in narratives):
                    tweet_data = {
                        'source': 'twitter',
                        'author': handle,
                        'id': tweet.id,
                        'text': tweet.text,
                        'retweets': tweet.public_metrics['retweet_count'],
                        'likes': tweet.public_metrics['like_count'],
                        'created_at': tweet.created_at.isoformat(),
                    }
                    all_tweets.append(tweet_data)
        except Exception as e:
            print(f"  -> Could not scrape @{handle}. Reason: {e}")

    if not all_tweets:
        print("✅ Twitter scraper finished. No new relevant tweets found.")
        return

    # Save to a timestamped file
    output_dir = Path('data')
    output_dir.mkdir(exist_ok=True)
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    output_file = output_dir / f"twitter_data_{timestamp}.json"

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_tweets, f, indent=2, ensure_ascii=False)

    print(f"✅ Twitter scraper finished. Saved {len(all_tweets)} tweets to {output_file}")

if __name__ == '__main__':
    scrape_twitter()
