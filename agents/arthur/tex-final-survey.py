#!/usr/bin/env python3
# tex-final-survey.py — the TEXTURE LOOP's final survey: prove every
# remaining flat primitive across ALL mkv3-*.ts makers is flat BY LAW,
# not by omission. Classifies each mat(0x/C.* call by node-name context
# against the banked laws. Output: table + unclassified bucket (must be
# empty for the survey to close).
import re, glob, os

A = "/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/assets"
# law buckets: (law name, name-pattern)
LAWS = [
    ("FEED (hay/grain)",            r"hay|pile|haypile|grain|heap|flour|manger_hay"),
    ("WATER (liquid)",              r"water|twater|wsurf|liq|drip|dye_|pond|basin_contents"),
    ("LEATHER (tack)",              r"harness|bridle|leather"),
    ("GOODS/CLOTH",                 r"loaf|jug|tankard|mug|bottle|sack|pillow|blanket|cushion|quilt|cloth|shell|stone_|quartz|flower|fl_|spool|glyph_spool|comb|beak|tail_|conch|bread|cheese|pot_|pan_|basket_goods|sheaf|band|lash|wisp"),
    ("ROPE (rope is rope)",         r"rope|knot|cleat|rope_tail|hayband"),
    ("CHAR/EARTH/EPHEMERA",         r"turf|vent|wisp|char|lump|cool|smoke|shimmer"),
    ("PAINTED SIGN FACE",           r"sg_board|sg_face|glyph|sign_board|sign_emblem|board_face|map_|frame|chip|pin_|nameplate"),
    ("BRASS/ART MEDIA",             r"bell|crown|clap|finial|collar|hub|shoe|brass|candle|lamp_core|lamp\b|flame|glow|fire|embers|coals|emissive|keyhook|keytag|keybox|tankard_candle|tcandle|scflame|tflame|uflame"),
    ("RAW LOG (chopblock)",         r"block|half|round|roundEnd|crack|split|endgrain"),
    ("STRANGER'S STONE",            r"stranger|ws_float_stone|offering|step_stone"),
    ("MONUMENT BRASS BOWL",         r"bowl_stub|brass_bowl|offering_bowl"),
    ("FLOOR (house law: DARK)",     r"floor|rfloor|udeck"),
    ("LIFE-STAYS-FLAT",             r"hen|goat|rabbit|rabbit_|duck|bird|fish|frog|cow|sheep|life"),
    ("BONE (pages/parchment)",      r"sheet|page|quill|pages|bone_|pil\b|plaque"),
]
flat_re = re.compile(r'(?:mat\(\s*(0x[0-9a-fA-F]+|C\.\w+)|box\(\s*g(?:2)?,\s*"`?([A-Za-z0-9_.$`\{\} -]+?)"?,[^\n]*?,\s*(C\.\w+|0x[0-9a-fA-F]+)\s*\))')
name_ctx_re = re.compile(r'(?:name\s*=\s*"([^"]+)"|`([^`]+)`|"([A-Za-z0-9_]+)")\s*;?\s*$')

def node_name(line, idx, lines):
    # nearest preceding .name = or box( name literal
    for j in range(idx, max(idx - 4, -1), -1):
        m = re.search(r'name\s*=\s*[`"]([^`"]+)[`"]', lines[j]) or re.search(r'(?:box|texBox)\(\s*g(?:2)?,\s*[`"]([^`"]+)[`"]', lines[j])
        if m: return m.group(1)
    m = re.search(r'const\s+(\w+)', line)
    return m.group(1) if m else "?"

rows, unclassified = [], []
for path in sorted(glob.glob(f"{A}/mkv3-*.ts")):
    src = open(path).read()
    lines = src.split("\n")
    maker = os.path.basename(path).replace("mkv3-", "").replace(".ts", "")
    for i, line in enumerate(lines):
        if "mat(" not in line and "C.MID" not in line and "C.DARK" not in line and "C.BONE" not in line and "C.BRASS" not in line and "C.STONE" not in line: continue
        if "texMat(" in line or "texBox" in line or "import" in line: continue
        if not re.search(r'\bmat\(0x|C\.(MID|DARK|BONE|BRASS|STONE)\b', line): continue
        nm = node_name(line, i, lines)
        nm2 = f"{maker}:{nm}"
        for law, pat in LAWS:
            if re.search(pat, nm, re.I):
                rows.append((nm2, law)); break
        else:
            unclassified.append(nm2)

by_law = {}
for nm2, law in rows: by_law.setdefault(law, []).append(nm2)
print(f"FLAT-PRIMITIVE SURVEY — {len(rows)} flats across {len(glob.glob(f'{A}/mkv3-*.ts'))} makers")
for law in sorted(by_law): print(f"  {law:28s} {len(by_law[law]):3d}  e.g. {', '.join(by_law[law][:3])}")
print(f"\nUNCLASSIFIED (must be empty to close): {len(unclassified)}")
for u in unclassified: print("  ??", u)
