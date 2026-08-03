from pathlib import Path
import json

root = Path("data/communitydragon/latest")

keywords = [
    "urf",
    "arurf",
    "ultimate spellbook",
    "ultbook",
    "gamemode",
    "queueid",
    "gameMode",
    "gameModeId",
    "rotation",
    "enabled",
]

for file in root.glob("*.json"):
    try:
        text = file.read_text(encoding="utf-8", errors="ignore")

        low = text.lower()

        found = False
        for kw in keywords:
            if kw.lower() in low:
                print("=" * 80)
                print(file.name)

                idx = low.find(kw.lower())

                start = max(0, idx - 250)
                end = min(len(text), idx + 600)

                print(text[start:end])
                print()
                found = True

        if found:
            print()

    except Exception:
        pass