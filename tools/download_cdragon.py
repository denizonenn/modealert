from pathlib import Path
import requests

PROJECT_ROOT = Path(__file__).resolve().parent.parent

SAVE_DIR = PROJECT_ROOT / "data" / "communitydragon" / "latest"
SAVE_DIR.mkdir(parents=True, exist_ok=True)

BASE_URL = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1"

FILES = [
    "event-hub.json",
    "queues.json",
    "game-mode-mutators.json",
    "maps.json",
    "cherry-lobby.json",
    "strawberry-hub.json",
    "game-mode-selection.json",
    "lobby.json",
    "play.json",
]

print(f"Saving files to:\n{SAVE_DIR}\n")

for file in FILES:
    url = f"{BASE_URL}/{file}"

    try:
        response = requests.get(url, timeout=20)

        if response.status_code == 200:
            output = SAVE_DIR / file
            output.write_bytes(response.content)
            print(f"[OK] {file}")
        else:
            print(f"[{response.status_code}] {file}")

    except Exception as e:
        print(f"[ERROR] {file}: {e}")

print("\nDownload completed.")