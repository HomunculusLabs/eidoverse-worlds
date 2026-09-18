#!/usr/bin/env python3
# fauna26-pixel-probe3.py — verify the bird is present in the oblique
# gameplayL/R views (fauna-4 law c: probe cameras must verify
# subject-in-frame before judging). Counts bird-class pixels in the
# central band: saddle red-brown, hackle gold, sickle green.
import sys
from PIL import Image

for name in ["gameplayL", "gameplayR", "gameplay"]:
    img = Image.open(f"/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/reviews/fauna26-rooster/new-{name}.png").convert("RGB")
    w, h = img.size
    px = img.load()
    saddle = gold = green = red = 0
    rows = []
    for y in range(200, 620):
        for x in range(200, w - 200):
            r, g, b = px[x, y]
            if abs(r-133) < 45 and abs(g-59) < 40 and abs(b-40) < 35 and r > g > b:
                saddle += 1; rows.append(y)
            elif r > 150 and 120 < g < 185 and b < 110 and r > g > b:
                gold += 1; rows.append(y)
            elif 30 < r < 100 and 60 < g < 125 and 45 < b < 100 and g > r and g > b:
                green += 1; rows.append(y)
            elif r > 140 and g < 90 and b < 90:
                red += 1; rows.append(y)
    band = f"rows {min(rows)}-{max(rows)}" if rows else "NONE"
    print(f"{name}: saddle={saddle} gold={gold} green={green} red={red} | {band}")
