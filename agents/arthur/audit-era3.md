# Era-3 Audit

PASS village entities (models + attached lights) <= 40 | 17 (field lights excluded: 23)
PASS field bounded (<=60 works) | 55
PASS distinct VILLAGE model libs <= 30 (field works are generative) | 17
PASS every village model entity in placement-plan | clean
PASS every light attached to a plan entity, house, or mason work | clean
PASS zero mason works inside r=44 disc | 0 intruders
PASS arthur-house at plan pos (21,15.3) | (21,15.3)
PASS av-longhouse at plan pos (8,24.7) | (8,24.7)
PASS av-tower-house at plan pos (-8,24.7) | (-8,24.7)
PASS av-garden-cottage at plan pos (-21,15.3) | (-21,15.3)
PASS av-row-cottage at plan pos (-21,-15.3) | (-21,-15.3)
PASS av-bunkhouse at plan pos (-8,-24.7) | (-8,-24.7)
PASS av-hall at plan pos (8,-24.7) | (8,-24.7)
PASS av-court at plan pos (21,-15.3) | (21,-15.3)
PASS av-roads3 at plan pos (0,0) | (0,0)
PASS av-belltower at plan pos (5.7,5.7) | (5.7,5.7)
PASS av-monument at plan pos (-6.4,-6.4) | (-6.4,-6.4)
PASS av-treeline at plan pos (0,0) | (0,0)
PASS av-carousel at plan pos (-18.8,25.9) | (-18.8,25.9)
PASS av-inn at plan pos (34,0) | (34,0)
PASS av-windmill at plan pos (-38,0) | (-38,0)
PASS all village libs fetchable | 0 bad
PASS core draw nodes <= 400 | 161
PASS mason works <= 14 nodes (sampled max) | 12
INFO core nodes: 161 | sampled work node max: 12 | models: 17, lights: 36, field: 55 | libs: 17
PASS audit-balance marker present
PASS running total == 2336002 (parts-truth baseline) + post-mandate deltas | 2342091 vs 2342091 (delta 6089)
PASS mason state <= running (mason share frozen at close) | 2336002
PASS Amendment 9 ratified
PASS dev.arthur.eidoverse-mason running
PASS dev.arthur.eidoverse-resident running
PASS stop file consistent (none OR mandate met) | mandate met — stopped honorably
ALL PASS
