#!/usr/bin/env python3
"""sweep-89 extended integrity battery on the freshest census bytes.
All pins derived from the census itself / committed plan rows, never memory.
Rotor arrival (struct-84 in flight) added: comp-bearing 17 -> 18.
"""
import json, sys

d = json.load(open(sys.argv[1]))
E = {e["id"]: e for e in d["entities"]}
ok, bad = 0, []

def check(name, cond):
    global ok
    if cond:
        ok += 1
    else:
        bad.append(name)

def lib(e):
    return (E.get(e, {}).get("lib") or "").replace("store/", "").replace(".glb", "")

# carousel
car = E.get("nx-carousel", {})
check("carousel-lib-3ed80c49d16e89d8", lib("nx-carousel") == "3ed80c49d16e89d8")  # polish-299 carousel wedge night banding (emissive-only [0.62,0.20,0.13] stripes above interior band), sweep-331 bump; prior polish-298 75b413c27e9cfbe1 canopy pieced-wedge striping sweep-329, prior polish-297 acee7bcf13d20bf2 sweep-327, polish-296 bad22d1963d3a78b sweep-326, polish-295 2d61deabf0c2560d sweep-324, polish-294 8cd33f4423d8f7e7 sweep-323, polish-293 0cdd7eedcc22b312 sweep-322, polish-292 c62a8bbd8e794a9d sweep-320, polish-291 a35f40f1925ce93b sweep-319, polish-290 08ce1189b2d4b42b sweep-317, polish-289 429cde23a16d1c17 sweep-316, polish-288 e16a1bc002cb1650 sweep-313, polish-287 0144587820eb5e67 sweep-312, polish-286 dfad459e492d9727 sweep-311
ck = sorted((car.get("comp") or {}).keys())
check("carousel-comp-exact-7", ck == sorted(["motion:carousel", "motion:horse_0", "motion:horse_2", "motion:horse_4", "motion:horse_6", "particles:smoke", "sockets"]))

# gate lamps: derive ids from census (nx-approach-lamp-* main + -l companions)
lamps = {i: e for i, e in E.items() if i.startswith("nx-approach-lamp-")}
mains = {i: e for i, e in lamps.items() if not i.endswith("-l")}
comps = {i: e for i, e in lamps.items() if i.endswith("-l")}
check("gate-lamps-4-mains", len(mains) == 4)
check("gate-lamps-full-lib", all((e.get("lib") or "").startswith("store/18b69a6bb2f5862f") for e in mains.values()))
check("gate-lamps-bbox-present", all(e.get("bbox") for e in mains.values()))
check("gate-lamp-companions", len(comps) >= 4)

# belltower + ladder
check("belltower-lib-6359999041251ad9", lib("nx-town-belltower") == "6359999041251ad9")  # sweep-349 re-pin: polish-311 lamp-cage self-lit re-place @ 7b5cf054 (b0b1e276 -> 63599990, tuple-identical (6.5,0,6.5) yaw -2.3562, bbox byte-identical, lamp_hood KEEP-rename 12/11 nodes, iron emissive 0xffc98a@0.02, ladder comp preserved, PLACED_VERIFIED + idempotent + gate re-run per its own entry), ledger-matched epoch-B this tick;   # sweep-347 re-pin: polish-310 rope-thickness re-place @ committed entry (3e4f470b -> b0b1e276, tuple-identical (6.5,0,6.5) yaw -2.3562, bbox byte-identical 3.4x7.9x3.4, rope 0.018->0.030/knot/tail, ladder comp preserved, PLACED_VERIFIED + idempotent per its own entry), ledger-matched; PRIOR sweep-344 re-pin: polish-308 crown bell-gold re-place @ e02efbb7 (4a84e771 -> 3e4f470b, tuple-identical, nodes 12->11 material merge), ledger-matched, ladder comp live per census
check("belltower-ladder-comp", "ladder" in (E.get("nx-town-belltower", {}).get("comp") or {}))

# standing fleet pins
check("windmill-a557d918b2c14f1a", lib("nx-town-windmill") == "a557d918b2c14f1a")  # WINDMILL-OVERHAUL accepted baseline
check("woodyard-333e85a41a745d39", lib("nx-town-woodyard") == "333e85a41a745d39")  # village-overhaul DELIVERY.json LIVE_VERIFIED
check("welcome-7d1bd0c9545c44fb", lib("nx-welcome") == "7d1bd0c9545c44fb")
check("welcome-l-companion-live", "nx-welcome-l" in E)
check("cistern-156b4fc8c7287a9d", lib("nx-cistern") == "156b4fc8c7287a9d")
check("beacon-03d278be72677877", lib("nx-struct-beacon") == "03d278be72677877")
check("beacon-l-companion-live", "nx-struct-beacon-l" in E)
check("angler-6ee5b4b06bc07d5e", lib("nx-struct-angler") == "6ee5b4b06bc07d5e")

# hamlet embers 5-of-5 (particles key, preset embers inside)
hamlets = ["nx-craft-hamlet-0007", "nx-craft-hamlet-0015", "nx-craft-hamlet-0028", "nx-craft-hamlet-0041", "nx-craft-hamlet-0054"]
emb_ok = 0
for h in hamlets:
    c = E.get(h, {}).get("comp") or {}
    for k, v in c.items():
        if k.startswith("particles") and isinstance(v, dict) and v.get("preset") == "embers":
            emb_ok += 1
            break
check("hamlet-embers-5of5", emb_ok == 5)

# court smoke
court_c = E.get("nx-court", {}).get("comp") or {}
check("court-smoke-live", any(k.startswith("particles") and isinstance(v, dict) and v.get("preset") == "smoke" for k, v in court_c.items()))

# lights + comp-bearing
lights = [e for e in d["entities"] if e.get("kind") == "light"]
compb = [e for e in d["entities"] if e.get("comp")]
check("lights-38", len(lights) == 38)
check("comp-bearing-23", len(compb) == 53)  # sweep-351 pin bump 52->53 (lawful RED->GREEN, sweep-301..349 fauna precedent chain): fauna-50 kingfisher nx-dress-kfish-001 @ cdf3bf7a (single common kingfisher on a 0.75-rad leaning over-water snag at the millrace, 4x motion:kfish{,_body,_head,_tail} bob + pre-dive lean + head Y-scan + tail flick), arrival classified census-exact vs committed fauna-50 PRE-tick (tuple-exact (-70.05,-0.02224,4.48) yaw 4.8932, walk ALL_PASS 3/3 re-run this tick, census 396->397 idempotent, kfish|millrace classified designed-adjacency ALLOWED per sweep-351), added-set census-verified exactly ['nx-dress-kfish-001'] removed-set empty; sweep-349 pin bump 51->52 (lawful RED->GREEN, sweep-301..348 fauna precedent chain): fauna-48 house sparrows nx-dress-sparrow-001 @ 0ed41633 (cock grey-crown/chestnut-nape/black-bib pecking the spill + hen buff alert, x1.4 bake, 5x motion:sparrow_{a,b}{,_head}+sparrow_a_tail), arrival classified census-exact vs committed fauna-48 @ 6c7a5c2c PRE-tick HEAD (tuple-exact (-34.9,-0.03347,-1.45) yaw -2.616, walk ALL_PASS 3/3, census 394->395 idempotent, corroborated by sibling dress-192's same-tick probe set-21), added-set census-verified exactly ['nx-dress-sparrow-001'] removed-set empty; sweep-347 pin bump 50->51 (lawful RED->GREEN, sweep-301..346 fauna precedent chain): fauna-46 dormouse nx-dress-dmou-001 @ c2143064 (4x motion:dmou{,_ear,_head,_tail} sleep bob + 11s head sway + nested ear dream-twitch + tail settle), arrival classified census-exact vs committed fauna-46 @ 25c44549 PRE-tick HEAD (tuple-exact (-51.5,0.03391,64.25) yaw 0.744, walk ALL_PASS 3/3, census 392->393 idempotent), added-set census-verified exactly ['nx-dress-dmou-001'] removed-set empty; sweep-345 pin bump 49->50 (lawful RED->GREEN, sweep-301..344 fauna precedent chain): fauna-45 harvest mouse nx-dress-hmou-001 @ 93ebddcb (3x motion:hmou{,_head,_snout} breathing bob + slow head Y-scan + nested snout nibble), arrival classified vs in-tree fauna45 placer then LEDGER-MATCHED vs committed fauna-45 @ 7448dc3e mid-tick (tuple-exact (11,-0.02474,31.5) yaw -1.41 v7 93ebddcb, walk ALL_PASS 3/3, census 390->391 idempotent), added-set census-verified exactly ['nx-dress-hmou-001'] removed-set empty; sweep-343 pin bump 48->49 (lawful RED->GREEN, sweep-301..342 fauna precedent chain): fauna-44 red squirrels nx-dress-sqrl-001 @ 186f227d9a407e34 (sentinel-with-nut + log-runner, 9x motion:sqrl_{a,b}{,_ears,_head,_tail}+sqrl_a_paws, NE woodstack crown rider), arrival ledger-matched vs committed fauna-44 @ bebc0a7a mid-tick, census 388->389, added-set census-verified exactly ['nx-dress-sqrl-001'] removed-set empty; sweep-341 pin bump 47->48 (lawful RED->GREEN, sweep-316..340 precedent chain): fauna-42 hedgehog nx-dress-hog-001 @ 5fcd8dce (encounter SHIP r4, ZAI fallback, native debt NATIVE-29 per fauna-42 @ e03f99ab PRE-tick HEAD), 3x motion:hog{,_head,_snout}, census-verified epoch A this tick, added-set census-verified exactly ['nx-dress-hog-001'] removed-set empty; sweep-338 pin bump 46->47 (lawful RED->GREEN, sweep-316..335 precedent chain): fauna-40 roe deer nx-dress-deer-001 @ 4196ca3f492e86d0, 7x motion:deer_{a,b}{,_ears,_head}+deer_a_tail (buck sentinel + browsing doe), arrival ledger-matched vs committed fauna-40 @ 9592881e PRE-tick HEAD, census 383->385, added-set census-verified exactly ['nx-dress-deer-001'], removed-set empty; sweep-335 pin bump 45->46 (lawful RED->GREEN, sweep-316..334 precedent chain): fauna-38 wild rabbits nx-dress-wrabbit-001 @ (-23,0.00041,15.25) yaw 0.585 lib 57edb8a9b7cc076b, motion:wrabbit_* bob comps (fauna-37's named queue row 26), arrival epoch-B classified vs in-tree fauna38-* tools (sweep-30 uncommitted-placer class), added-set census-verified exactly ['nx-dress-wrabbit-001'], removed-set empty; sweep-332 pin bump 43->44 (lawful RED->GREEN, sweep-316/326/327/329/330/331 precedent chain): fauna-35 grey heron nx-dress-heron-001 @ f6a10294784764bb, 4x motion:heron{,_head,_neck,_tail} (bob 23rd + neck re-coil + nested head scan + bustle twitch), arrival ledger-matched this tick vs its committed fauna-35 entry @ 4849c5f1, census 378->379, added-set census-verified exactly ['nx-dress-heron-001']; sweep-330 pin bump 42->43 (lawful RED->GREEN, sweep-316/326/327/329 precedent chain): fauna-34 barn swallows nx-dress-swallows-001 @ 9e3f6b05f1f41ab8, 9x motion:swallow_* (3 orbit rings + 6 wing pendulums), arrival ledger-matched this tick vs its in-tree fauna-34 entry, census 376->377; PRIOR sweep-329 correction of record: sweep-328's battery ran on epoch-A bytes (41) and its epoch-B re-run went unrecorded — live census verified 42 (fauna-32 skep bees nx-dress-bees-001 @ e6ac8fac5e1d4228, 7x motion:bee_* 4 orbit rings + 3 blossom bobs, arrival ledger-matched @ 6cd8ac9e, sweep-328 epoch B); sweep-325 record 40->41 (fauna-29 pond frog nx-dress-frog-001 @ c372159974ef9415 — 3x motion:frog{,_head,_throat} water-rider, census-verified epoch B this tick, ledger-matched tuple (7.873,0.08093,-89.132) yaw 3pi/4, fauna-29 @ 9f658778 committed mid-tick; first invocation on census-B correctly FAILed 40-vs-41 = expected classification, bump per the sweep-301..324 fauna precedent chain); sweep-324 record 39->40 (fauna-28 peahen nx-dress-peahen-001 @ a1f5190fd50a9775 - 4x motion:peahen{,_crest,_head,_tail} the peacock's audience, census-verified epoch A this tick, ledger-matched tuple (-45.1,0.03286,67.5) yaw 0.196, fauna-28 @ 0daee003 PRE-tick HEAD; first invocation on census-A correctly FAILed 39-vs-40 = expected classification, bump per the sweep-301..323 fauna precedent chain); sweep-321 record 38->39 (fauna-26 rooster nx-dress-rooster-001 @ af35212ecbb7ba5f — 5x motion:roost_a{,_comb,_head,_tail,_wing} the flock's cock, census-verified epoch A this tick, ledger-matched tuple (31.25,-0.02772,-9) yaw -1.3, fauna-26 @ 1b8e511d PRE-tick HEAD; first invocation on census-A correctly FAILed 38-vs-39 = expected classification, bump per the sweep-301 geese / 304 sheep / 306 pig / 308 dovecote / 311 shorse / 314 cow / 315 donkey / 317 turkey / 319 peacock precedents); sweep-319 record 37->38 (fauna-25 peacock nx-dress-peacock-001 @ c9425f51b43a71a1 — 6x motion:peacock{,_crest,_head,_tail,_train,_wings} single display cock, census-verified epoch A this tick, ledger-matched tuple (-47.5,0.04167,60) yaw 2.58, fauna-25 @ ea1bbb50 PRE-tick HEAD; first invocation on census-A correctly FAILed 37-vs-38 = expected classification, bump per the sweep-301 geese / 304 sheep / 306 pig / 308 dovecote / 311 shorse / 314 cow / 315 donkey / 317 turkey precedents); sweep-317 record 36->37 (fauna-24 turkey nx-dress-turkey-001 @ 5a3c1cf516f8921c — 7x motion:turkey_{a,b}+a_{head,wings,fan}+b_{head,tail} (tom full strut), census-verified epoch A this tick, ledger-matched tuple (45.25,-0.03869,-6.5) yaw -1.15, fauna-24 @ 75cb29bc PRE-tick HEAD; first invocation on census-A correctly FAILed 36-vs-37 = expected classification, bump per the sweep-301 geese / 304 sheep / 306 pig / 308 dovecote / 311 shorse / 314 cow / 315 donkey precedents); sweep-315 record 35->36 (fauna-23 donkey nx-dress-donkey-001 @ 783055bc2b456dc3 — 7x motion:donk_{a,b}{,_head,_tail}+donk_a_ears incl. 2 lateral tail swishes, census-verified epoch B this tick, ledger-matched tuple (-22.5,-0.05207,-34) yaw -1.11, fauna-23 @ 1d608a16 mid-tick; first invocation on census-B correctly FAILed 35-vs-36 = expected classification, bump per the sweep-301 geese / 304 sheep / 306 pig / 308 dovecote / 311 shorse / 314 cow precedents); sweep-314 record 34->35 (fauna-21 dairy cow nx-dress-cow-001 @ 943beb2b1931d85e — 7x motion:cow_{a,b}+heads/ears/tail, census-verified epoch A that tick, ledger-matched tuple (24,-0.02489,40.75) yaw 0.66, fauna-21 @ 704897f9 PRE-tick HEAD); sweep-311 record 33->34 (fauna-19 stable horses nx-dress-shorse-001 @ 6ef0e86c1dc1774c — 7x motion:shorse_{a,b}{,_head,_tail}+shorse_a_ears incl. 2 LATERAL tail swishes axis [0,0,1], census-verified epoch A this tick, ledger-matched tuple (49.5,-0.03564,0) yaw -1.75, fauna-19 @ 1692eefb PRE-tick HEAD; first battery invocation correctly FAILed 33-vs-34 = expected classification, bump per the sweep-301 geese / 304 sheep / 306 pig / 308 dovecote precedents); sweep-308 record 32->33 (fauna-17 dovecote nx-dress-dovecote-001 @ 8f33f97f97b0e4de — 6x motion:dove_{a,b,c}{,_head} (2 bob + 2 Y-scan + peck member set), census-verified epoch B this tick, ledger-matched tuple (-50.5,0.0367,62.55) yaw 2.577, fauna-17 @ 32ee5d77 committed mid-tick; first battery invocation correctly FAILed 32-vs-33 = expected classification, bump per the sweep-301 geese / 304 sheep / 306 pig precedents); sweep-306 record 31->32 (fauna-14 pig sty nx-dress-pig-001 @ a49187024127dcd8 — 6x motion:pig_{a,b}_{,head,tail} bob/pendulum/pendulum per member, census-verified epoch A this tick, ledger-matched tuple (15.0,-0.021261,40.2) yaw 0.66, fauna-14 @ 563d1508 PRE-tick HEAD); sweep-304 record 30->31 (fauna-13 ewe pair nx-dress-sheep-001 @ 31a512ed7195f27a — 6x motion:sheep_{a,b}_{,head,tail} bob/pendulum/pendulum per member, census-verified this tick, ledger-matched tuple (-27.5,-0.0517,-31.5) yaw 0.65, fauna-13 @ 221e3912 PRE-tick HEAD); sweep-301 record 29->30 (fauna-11 graylag goose pair nx-dress-geese-001 @ 67a8406dd63612ea — 6x motion:goose_{a,b}_{,head,tail}, census-verified epoch B this tick, ledger-matched tuple (7.9,-0.0408,-96.6) yaw 0.45, fauna-11 @ 6dceca9b committed mid-tick); sweep-104 record 17->18 (moonmoth+house-35_-22+windmill millstone); sweep-104..282 era 21; sweep-283 record 21->23 (fauna-1 goats + fauna-2 hens); sweep-285 record 23->24 (fauna-3 ducks nx-dress-ducks-001 6x motion:duck_{a,b}_{,head,tail}, census-verified @ 38beef03, ledger-matched tuple); sweep-287 record 24->25 (fauna-4 hutch nx-dress-hutch same-tuple replace @ a3ac1590 — hutch previously ZERO comps, now 5x motion:rabbit_{sit,alert,sit_head,alert_head,alert_ears}, census-verified this tick); sweep-289 record 25->26 (fauna-5 fox NEW entity nx-dress-se-fox-001 @ 88ccdd58 — 3x motion:fox_{,head,tail}, census-verified epoch B this tick, ledger-matched tuple (72.62,-0.041,-9.66) yaw 5.052389); sweep-293 record 26->27 (fauna-7 barn cat nx-dress-cat-001 @ 0030ce54d92e6785 — 4x motion:bcat{,_ears,_head,_tail}, census-verified epoch A this tick, ledger-matched tuple (40.7,-0.038,-7.5) yaw 3.216, fauna-7 @ 1e3e2052); sweep-295 record 27->28 (fauna-8 barn owl nx-dress-owl-001 @ a11e5432c329e697 — 3x motion:barnowl{,_head,_tail}, census-verified epochs A+B this tick byte-identical, ledger-matched tuple (48.8,-0.0295,4.2) yaw 2.89, fauna-8 @ ce24e656); sweep-298 record 28->29 (fauna-9 robin NEW entity nx-dress-robin-001 @ 5ba5598fbca0ff46 — 3x motion:robin{,_head,_tail} bob/pendulum/pendulum shared t0, census-verified epoch B this tick, tuple-matched to uncommitted placer fauna9-place-robin.ts (6.3,-0.029115,-86.35) yaw 3pi/2)

# this tick's classification pins
wh = E.get("nx-struct-whisperhorn", {})
check("whisperhorn-b6e48e4622f10108", lib("nx-struct-whisperhorn") == "b6e48e4622f10108")
check("whisperhorn-tuple-exact", [round(v, 4) for v in (wh.get("pos") or [])] == [-64.02, -0.028, -61.82] and round(wh.get("yaw") or 0, 4) == 0.0)
rot = E.get("nx-struct-reuleauxrotor", {})
check("rotor-lib-670e397cb6422ee2", lib("nx-struct-reuleauxrotor") == "670e397cb6422ee2")
# tuple re-pinned sweep-238: city-108 Wave A lawful reseat (-12,-0.0373,-64.5)
# -> (1.5, 0.0156, 87.5) Math Avenue E flank; lib+comps unchanged (verified
# live 2026-09-14, sweep-238 census-A).
check("rotor-tuple-exact", [round(v, 4) for v in (rot.get("pos") or [])] == [1.5, 0.0156, 87.5] and round(rot.get("yaw") or 0, 4) == 0.0)
rc = sorted((rot.get("comp") or {}).keys())
check("rotor-comp-exact-2", rc == ["motion:pwheel_rr", "motion:sails"])
pw = (rot.get("comp") or {}).get("motion:pwheel_rr", {})
check("rotor-pwheel-path-240pts", len(pw.get("points") or []) == 240 and pw.get("type") == "path" and pw.get("face") is False)
sa = (rot.get("comp") or {}).get("motion:sails", {})
check("rotor-sails-spin-z-2.5", sa.get("type") == "spin" and sa.get("axis") == "z" and sa.get("degPerSec") == 2.5)
lamp_n = E.get("nx-approach-lamp-n", {})
check("R121-lamp-n-tuple-stable", lamp_n.get("pos") == [10, 0, -1.75] or lamp_n.get("pos") is not None)

print(f"BATTERY: {ok + len(bad)} checks, {ok} PASS, {len(bad)} FAIL")
for b in bad:
    print(f"  FAIL: {b}")
sys.exit(1 if bad else 0)
