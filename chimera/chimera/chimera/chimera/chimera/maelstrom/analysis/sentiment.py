from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Using a singleton pattern for the analyzer. No need to re-initialize this beast every time.
# It's like having a dedicated oracle for emotions; you don't fire her after every question.
analyzer = SentimentIntensityAnalyzer()

def analyze_sentiment(text: str) -> dict:
    """
    Analyzes the sentiment of a given text.
    Returns a dictionary with positive, negative, neutral, and a 'compound' score.
    The compound score is the one we mostly care about. It's the "vibe check" of the text.
    Ranges from -1 (dump it all) to +1 (to the moon).
    """
    if not isinstance(text, str):
        return {'pos': 0.0, 'neg': 0.0, 'neu': 1.0, 'compound': 0.0}

    # The magic happens here.
    return analyzer.polarity_scores(text)

if __name__ == '__main__':
    # A quick test to make sure the oracle is speaking.
    test_text_1 = "This is a great and wonderful new technology! I am so bullish!"
    test_text_2 = "I am terrified of this, it is a disaster waiting to happen. Sell everything."
    test_text_3 = "The event is scheduled for Tuesday."

    print(f"'{test_text_1}' -> {analyze_sentiment(test_text_1)}")
    print(f"'{test_text_2}' -> {analyze_sentiment(test_text_2)}")
    print(f"'{test_text_3}' -> {analyze_sentiment(test_text_3)}")
