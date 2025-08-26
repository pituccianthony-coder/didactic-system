import yaml
from pathlib import Path

def load_config():
    """
    Loads the config.yaml file.
    If it doesn't exist, it prints a friendly reminder and exits.
    Because hand-holding is sometimes necessary, even for would-be reality hackers.
    """
    config_path = Path('config.yaml')
    if not config_path.exists():
        print("❌ Error: `config.yaml` not found.")
        print("Please rename `config.yaml.example` to `config.yaml` and fill in your API keys.")
        exit()

    with open(config_path, 'r') as f:
        try:
            return yaml.safe_load(f)
        except yaml.YAMLError as e:
            print(f"Error parsing config.yaml: {e}")
            exit()

if __name__ == '__main__':
    # A little test to see if it works. Don't mind me.
    config = load_config()
    if config:
        print("✅ Config loaded successfully.")
        print(f"Found {len(config.get('narratives', []))} narratives to hunt.")
