import json
from pathlib import Path

src = Path("data/communitydragon/latest/queues.json")

with open(src, encoding="utf-8") as f:
    data = json.load(f)

interesting = []

def walk(obj):
    if isinstance(obj, dict):
        # queue gibi görünen kayıt
        keys = {k.lower() for k in obj.keys()}
        if (
            "id" in keys
            or "queueid" in keys
            or "gamemode" in keys
            or "gamemode" in keys
            or "internalname" in keys
        ):
            interesting.append(obj)

        for v in obj.values():
            walk(v)

    elif isinstance(obj, list):
        for x in obj:
            walk(x)

walk(data)

seen = set()

for obj in interesting:

    s = json.dumps(obj, sort_keys=True)

    if s in seen:
        continue

    seen.add(s)

    print("=" * 80)

    for k, v in obj.items():

        if isinstance(v, (dict, list)):
            continue

        print(f"{k}: {v}")