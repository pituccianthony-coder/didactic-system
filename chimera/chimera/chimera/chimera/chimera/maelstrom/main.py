import json
from datetime import datetime

from config_loader import load_config
from scrapers.reddit_scraper import scrape_reddit
from scrapers.twitter_scraper import scrape_twitter
from analysis.velocity import analyze_narrative_velocity

def generate_signal(narrative, data):
    """
    Formats the raw analysis data into a beautiful, sarcastic, and actionable signal.
    This is where the magic sausage gets its casing.
    """
    confidence = (data['acceleration_g'] * 0.6) + (data['avg_sentiment'] * 0.4)
    confidence_score = min(99, int(abs(confidence) * 100))

    if confidence > 0:
        signal_type = "▲ BULLISH SIGNAL"
    else:
        signal_type = "▼ BEARISH SIGNAL"

    rationale = (
        f"A cabal of anons and venture capitalists have been whispering sweet nothings about '{narrative}' into the ether. "
        f"The narrative acceleration is {data['acceleration_g']}g, which is... a lot. "
        f"The general vibe (sentiment) is {data['avg_sentiment']}. "
        "This could be the next big thing, or a meticulously orchestrated pump before they dump on you. "
        "The math says something is happening. Your wallet, your choice. Don't call me if you get rekt."
    )

    signal = f"""
-------------------------------------------------------------------
--- MAELSTROM SIGNAL | {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')} ---
-------------------------------------------------------------------
NARRATIVE:      {narrative.upper()}
SIGNAL TYPE:    {signal_type}
CONFIDENCE:     {confidence_score}%

DATA POINTS:
  - Mentions (1h/6h/24h):   {data['mentions_1h']} / {data['mentions_6h']} / {data['mentions_24h']}
  - Avg. Sentiment:         {data['avg_sentiment']}
  - Velocity (Mentions/hr): {data['velocity_mph']}
  - Acceleration (g-force): {data['acceleration_g']}

RATIONALE (The part you actually read):
{rationale}
-------------------------------------------------------------------
"""
    print(signal)


def main():
    """
    The grand orchestrator. The puppet master. The guy who pushes the first domino.
    """
    print("--- PROJECT MAELSTROM INITIALIZING ---")

    # 1. Load config
    config = load_config()

    # 2. Scrape all sources
    # In a production system, these would run in parallel or on different schedules.
    # Here, we do it sequentially. We have time. We're gods, not day traders.
    scrape_reddit()
    scrape_twitter()

    # 3. Analyze the collected data
    analysis_results = analyze_narrative_velocity()

    if not analysis_results:
        print("--- MAELSTROM CYCLE COMPLETE: The digital sea is calm. No signals generated. ---")
        return

    print("\n--- ANALYSIS COMPLETE. SCANNING FOR SIGNALS... ---")

    # 4. Generate signals based on thresholds
    accel_threshold = config.get('analysis', {}).get('acceleration_threshold', 1.5)
    sent_threshold = config.get('analysis', {}).get('sentiment_threshold', 0.1)

    signals_generated = 0
    for narrative, data in analysis_results.items():
        if data['acceleration_g'] > accel_threshold and data['avg_sentiment'] > sent_threshold:
            generate_signal(narrative, data)
            signals_generated += 1

    if signals_generated == 0:
        print("--- MAELSTROM CYCLE COMPLETE: Interesting currents, but no tsunamis. No signals generated. ---")
    else:
        print(f"--- MAELSTROM CYCLE COMPLETE: Generated {signals_generated} signal(s). Go make (or lose) some money. ---")


if __name__ == '__main__':
    main()
