import praw
import json
from pathlib import Path
from datetime import datetime
import sys

# Adjust path to import from the root directory
sys.path.append(str(Path(__file__).resolve().parents[1]))
from config_loader import load_config

def scrape_reddit():
    """
    Scrapes Reddit for new posts in the specified subreddits.
    It's like panning for gold in a river of memes and madness. Sometimes you find a nugget.
    """
    print("🤖 Starting Reddit scraper...")
    config = load_config()

    reddit_config = config.get('api_keys', {}).get('reddit')
    if not all([reddit_config, reddit_config.get('client_id'), reddit_config.get('client_secret')]):
        print("⚠️ Reddit API keys not found in config.yaml. Skipping Reddit scrape.")
        return

    try:
        reddit = praw.Reddit(
            client_id=reddit_config['client_id'],
            client_secret=reddit_config['client_secret'],
            user_agent=reddit_config.get('user_agent', 'MaelstromBot/0.1')
        )
    except Exception as e:
        print(f"❌ Failed to connect to Reddit API: {e}")
        return

    subreddits = config.get('sources', {}).get('subreddits', [])
    narratives = config.get('narratives', [])

    all_posts = []
    for sub_name in subreddits:
        try:
            print(f"  -> Scraping r/{sub_name}...")
            subreddit = reddit.subreddit(sub_name)
            # Fetching 'hot' is a good proxy for what's currently capturing attention
            for post in subreddit.hot(limit=50):
                # Check if any narrative keyword is in the title or body
                post_text = post.title + " " + post.selftext
                if any(narrative.lower() in post_text.lower() for narrative in narratives):
                    post_data = {
                        'source': 'reddit',
                        'subreddit': sub_name,
                        'id': post.id,
                        'title': post.title,
                        'text': post.selftext,
                        'score': post.score,
                        'url': post.url,
                        'created_utc': post.created_utc,
                    }
                    all_posts.append(post_data)
        except Exception as e:
            print(f"  -> Could not scrape r/{sub_name}. Reason: {e}")

    if not all_posts:
        print("✅ Reddit scraper finished. No new relevant posts found.")
        return

    # Save to a timestamped file
    output_dir = Path('data')
    output_dir.mkdir(exist_ok=True)
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    output_file = output_dir / f"reddit_data_{timestamp}.json"

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_posts, f, indent=2, ensure_ascii=False)

    print(f"✅ Reddit scraper finished. Saved {len(all_posts)} posts to {output_file}")

if __name__ == '__main__':
    scrape_reddit()
