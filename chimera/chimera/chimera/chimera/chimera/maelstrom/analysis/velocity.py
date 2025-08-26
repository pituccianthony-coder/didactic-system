import json
import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta
import numpy as np
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))
from config_loader import load_config
from analysis.sentiment import analyze_sentiment

def analyze_narrative_velocity():
    """
    The core of the Maelstrom. This doesn't just count mentions; it measures the rate of change.
    It's the difference between seeing a wave and knowing if it's building into a tsunami.
    """
    print("🧠 Starting Narrative Velocity Engine...")
    config = load_config()
    data_dir = Path('data')
    narratives = config.get('narratives', [])
    time_windows_h = config.get('analysis', {}).get('time_windows_h', [1, 6, 24])

    if not data_dir.exists() or not any(data_dir.iterdir()):
        print("⚠️ No data found in /data directory. Run scrapers first.")
        return {}

    # --- 1. Load and unify all data ---
    all_entries = []
    for file_path in data_dir.glob('*.json'):
        with open(file_path, 'r', encoding='utf-8') as f:
            all_entries.extend(json.load(f))

    if not all_entries:
        print("✅ Velocity engine finished. No entries to analyze.")
        return {}

    # Convert to DataFrame for vectorized operations. Because loops are for chumps.
    df = pd.DataFrame(all_entries)
    # Unify timestamp fields
    df['timestamp'] = pd.to_datetime(df.get('created_utc'), unit='s', errors='coerce').fillna(pd.to_datetime(df.get('created_at')))
    df.dropna(subset=['timestamp', 'text'], inplace=True)

    print(f"  -> Loaded {len(df)} entries for analysis.")

    # --- 2. Analyze each narrative ---
    results = {}
    now = datetime.utcnow()

    for narrative in narratives:
        print(f"  -> Analyzing narrative: '{narrative}'...")
        # Find all mentions of the narrative (case-insensitive)
        narrative_df = df[df['text'].str.contains(narrative, case=False)].copy()

        if narrative_df.empty:
            continue

        # --- 3. Calculate sentiment ---
        narrative_df['sentiment'] = narrative_df['text'].apply(lambda x: analyze_sentiment(x)['compound'])
        avg_sentiment = narrative_df['sentiment'].mean()

        # --- 4. Calculate velocity and acceleration ---
        time_series = {}
        counts = {}
        for h in time_windows_h:
            cutoff = now - timedelta(hours=h)
            counts[h] = narrative_df[narrative_df['timestamp'] > cutoff].shape[0]

        # Velocity = mentions in last hour. The simplest proxy.
        velocity = counts.get(1, 0)

        # Acceleration = rate of change between last 6h and last 24h, normalized.
        # A bit of a hack, but a robust one. A real physicist would cry, but we're here to make money.
        # We use a small epsilon to avoid division by zero. It's the "don't break reality" constant.
        epsilon = 1e-6
        rate_6h = counts.get(6, 0) / (6 + epsilon)
        rate_24h = counts.get(24, 0) / (24 + epsilon)
        acceleration = (rate_6h - rate_24h) / (rate_24h + epsilon)

        results[narrative] = {
            'mentions_1h': counts.get(1, 0),
            'mentions_6h': counts.get(6, 0),
            'mentions_24h': counts.get(24, 0),
            'avg_sentiment': round(avg_sentiment, 3),
            'velocity_mph': velocity, # Mentions Per Hour
            'acceleration_g': round(acceleration, 3)
        }

    print("✅ Narrative Velocity Engine finished.")
    return results

if __name__ == '__main__':
    # For testing, let's create some dummy data
    print("Running a test of the velocity engine...")
    data_dir = Path('data')
    data_dir.mkdir(exist_ok=True)

    dummy_posts = []
    now_ts = datetime.utcnow()
    for i in range(100):
        # Create a flurry of recent posts about 'decentralized AI'
        text = "I am so bullish on decentralized AI, it's the future" if i > 80 else "Old news about BTC"
        ts = now_ts - timedelta(minutes=i)
        dummy_posts.append({
            'source': 'test', 'id': f'test_{i}', 'text': text, 'created_at': ts.isoformat()
        })

    with open(data_dir / 'test_data.json', 'w') as f:
        json.dump(dummy_posts, f)

    # Create dummy config
    with open('config.yaml', 'w') as f:
        f.write("narratives:\n  - decentralized AI\n  - BTC")

    analysis_results = analyze_narrative_velocity()
    print("\n--- ANALYSIS RESULTS ---")
    print(json.dumps(analysis_results, indent=2))

    # Clean up dummy files
    import os
    os.remove(data_dir / 'test_data.json')
    os.remove('config.yaml')
