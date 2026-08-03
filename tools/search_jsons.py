from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "communitydragon" / "latest"

KEYWORDS = [
    "urf",
    "arurf",
    "arena",
    "cherry",
    "ultbook",
    "oneforall",
    "nexusblitz",
    "gamemode",
    "queue",
    "swiftplay"
]

for file in DATA.glob("*.json"):

    try:
        text = file.read_text(encoding="utf-8").lower()

    except:
        continue

    hits = []

    for word in KEYWORDS:
        if word in text:
            hits.append(word)

    if hits:
        print(f"\n{file.name}")
        print("   ", ", ".join(sorted(set(hits))))