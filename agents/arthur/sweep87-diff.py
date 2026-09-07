#!/usr/bin/env python3
"""sweep-87 canonical census diff vs committed baseline (epoch A or labeled epoch).
Canonical 6-field diff: id, pos, yaw, scale, lib, kind (+bbox as 7th, tracked since sweep-79).
Baseline: reviews/sweep-census-baseline.json (committed sweep-86 snapshot, 287 ents).
Prints arrivals, departures, and drift field-sets with full precision.
"""
import json, sys

def norm(e):
    return {
        "id": e.get("id"),
        "kind": e.get("kind"),
        "pos": [round(v, 6) for v in (e.get("pos") or [])],
        "yaw": round(e.get("yaw") or 0, 6),
        "scale": e.get("scale"),
        "lib": (e.get("lib") or "").replace("store/", "").replace(".glb", ""),
    }

def bbox_norm(e):
    bb = e.get("bbox")
    if not bb:
        return None
    return [
        [round(v, 4) for v in bb.get("min", [])],
        [round(v, 4) for v in bb.get("max", [])],
    ]

live_path, label = sys.argv[1], sys.argv[2]
live = json.load(open(live_path))
ents = live.get("entities", live if isinstance(live, list) else [])
L = {e["id"]: e for e in ents if isinstance(e, dict) and "id" in e}
B = {e["id"]: e for e in json.load(open("reviews/sweep-census-baseline.json"))["entities"]}

new_ids = sorted(set(L) - set(B))
gone_ids = sorted(set(B) - set(L))
print(f"[{label}] live={len(L)} baseline={len(B)} new={len(new_ids)} departed={len(gone_ids)}")
for i in new_ids:
    e = L[i]
    n = norm(e)
    print(f"  NEW {i}: pos={n['pos']} yaw={n['yaw']} scale={n['scale']} lib={n['lib']} kind={n['kind']} bbox={bbox_norm(e)}")
for i in gone_ids:
    print(f"  GONE {i}")
drift = {}
for i in sorted(set(L) & set(B)):
    ln, bn = norm(L[i]), norm(B[i])
    fields = [f for f in ln if ln[f] != bn[f]]
    lb, bb_ = bbox_norm(L[i]), bbox_norm(B[i])
    if lb != bb_:
        fields.append("bbox")
    if fields:
        drift[i] = (fields, ln, bn)
print(f"  drift-entities={len(drift)}")
for i, (fields, ln, bn) in drift.items():
    print(f"  DRIFT {i}: fields={fields}")
    lb, bb_ = bbox_norm(L[i]), bbox_norm(B[i])
    for f in fields:
        if f == "bbox":
            print(f"    bbox: {bb_} -> {lb}")
        else:
            print(f"    {f}: {bn[f]!r} -> {ln[f]!r}")
