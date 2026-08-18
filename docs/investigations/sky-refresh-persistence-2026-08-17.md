# Investigation: Sky Persistence on Refresh

## Summary
A fresh, server-accepted `sky` entry is persistent across ordinary refresh, snapshot-only rejoin, and sequencer restart. The strongest generic explanation is a browser-local preview or optimistic commit that never became authoritative; additional proven conditional defects are the broken spectator-based `tools/sky.ts` authoring tool and legacy snapshot sky bypassing current clock normalization.

## Symptoms
- Sky changes are visible before refresh but apparently revert or disappear after refresh.
- The failing sky field(s), authoring surface, and exact world are not yet specified; investigate the full persistence and hydration path.

## Background / Prior Research
- Git archaeology identifies a possible migration/refresh regression: commit `430328d` (2026-08-08) expected synthetic late-join sky folding to normalize old state, while `0360164` and `4b9e669` (2026-08-09) replaced replay with direct snapshot hydration/realization (`client/lib/state.js`, `client/lib/realize/environment.js`).
- Server snapshot boot also trusts stored folded state wholesale and folds only the tail (`server/world.ts`), so obsolete snapshot sky shapes may survive indefinitely without a later sky/weather entry.
- This theory does **not** yet explain fresh sky authored under current code: the history review found that current folded sky should be sent and applied on refresh. Rendering/performance changes in `client/lib/sky.js` did not obviously discard authored state.
- Test gap: fold tests simulate late join by synthetic re-folding, while current browser hydration is direct; reconnect parity does not assert hydrated/realized sky.

## Investigator Findings

### Executive conclusion

There is **no repository evidence that a fresh, accepted `sky` entry is lost on refresh**. A scratch sequencer test demonstrated the authoritative echo, disconnect/rejoin snapshot, forced snapshot-only join, and process-restart join all carrying the same sky bag. Three separate mechanisms can nevertheless look like non-persistence:

1. **Proven browser authoring defect:** the tuner previews locally, labels a click `✓ logged` immediately, does not wait for an authoritative log echo, and does not restore fold truth after refusal. A refused or not-yet-sent preview therefore remains visible until refresh reveals the unchanged authoritative sky.
2. **Proven tool defect:** `tools/sky.ts` joins as a spectator, so the server always refuses its `sky` verb, but the tool ignores replies and prints success.
3. **Proven legacy migration gap:** server boot and browser hydration trust an old stored snapshot sky wholesale. They bypass the synthetic re-fold that the clock migration test assumes. This can preserve pre-#65 clock shapes across refresh, but it does not explain disappearance of a fresh sky entry that the current server accepted.

A cold/degraded renderer can temporarily omit or visually fail to express some correct folded fields, especially weather/clouds on the SkyMesh fallback. It does not mutate or overwrite folded state. Which mechanism caused the reported incident still requires the affected world, authoring surface, fields, and runtime evidence (`world_history`, `world_debug`, `state.st.sky`, `skyArgs()`, `skyImpl()`).

### 1. Preview, commit, refusal, and disconnected queue

#### Proven wire/UI semantics

- All tuner interactions are previews. The panel explicitly calls `previewSky(gather())` and marks the button dirty without sending a verb (`client/lib/build.js:1009-1021`; slider path `client/lib/build.js:1195-1200`). `previewSky` replaces only renderer-local `clock.args` and renders it (`client/lib/sky.js:161-173`); it does not touch `client/lib/state.js`.
- Clicking the button calls `sendVerb('sky', gather())`, immediately clears `dirty`, immediately changes the text to `✓ logged`, and resets that text after 1.2 seconds (`client/lib/build.js:1241-1247`). There is no promise, request id, log-sequence match, or callback. **`✓ logged` means “the click handler ran,” not “the sequencer accepted and persisted a matching entry.”**
- `sendVerb` either writes the websocket immediately or pushes `{verb,args}` into an in-memory module array and prints “queued” (`client/lib/net.js:33-36`, `client/lib/net.js:51-58`). The queue is flushed only after a later snapshot joins successfully (`client/lib/net.js:674-677`). It is not in `localStorage` or any durable store, so a full page refresh before reconnection destroys it.
- Acceptance is authoritative only when `runVerb` passes spectator/rate/allow-list/rights/lock/shape gates, calls `w.append`, and broadcasts `{type:'log', entry}` to everyone including the author (`server/verbs.ts:340-408`). `sky` is owner-rank (`server/rights.ts:79`). The client synchronously folds an incoming `log` before realization (`client/lib/net.js:557-568`). That echo naturally replaces a successful preview with fold truth, but the build panel does not identify or wait for it.
- On refusal the server sends only `{type:'error', error}` (`server/verbs.ts:343-405`). The client toasts it and emits a generic `verb-refused` bus event (`client/lib/net.js:621-629`). Only the light editor consumes that event and rolls optimistic edits back (`client/lib/lights.js:144-154`); the sky tuner has no listener. Therefore a refused sky preview remains on screen until another accepted sky/weather realization or a reload.

#### Incident shape this proves

A user can preview a sky, click while unauthorized or disconnected, see both the preview and `✓ logged`, then refresh and see the prior authoritative sky. This is an exact, repository-proven route to the reported appearance of non-persistence. The repository alone cannot prove that the incident actually took this route; `world_history` must show whether the expected `sky` entry exists and `world_debug` must show a denial/refusal.

A disconnected click can still succeed if the page stays alive until reconnection: the queue flushes on join (`client/lib/net.js:674-677`), the server appends and echoes it, and the live fold realizes it. The loss window is specifically refresh/tab destruction before that flush, or a later refusal.

### 2. Fresh accepted sky: append, snapshot, refresh/rejoin, restart

#### Repository path

- `WorldLog.append` assigns the next sequence, queues the JSONL bytes, and folds the entry into live state synchronously (`server/world.ts:252-288`); `flushLog` writes the queued batch without dropping it on failure (`server/world.ts:291-308`). Threshold snapshots serialize `this.state` atomically with their byte boundary (`server/world.ts:151-174`).
- A join gets the live folded `state`, in-memory tail, and snapshot boundary from `joinPayload` (`server/world.ts:232-235`) and the websocket sends those as `state`, `entries`, and `throughSeq` (`server/server.ts:628-646`).
- The browser adopts `msg.state` via `shadowHydrate` (`client/lib/net.js:690-703`). Hydration defensively merges missing top-level maps but otherwise clones the snapshot wholesale (`client/lib/state.js:59-75`). The environment realizer was registered before `connect()` (`client/main.js:100-108`) and immediately passes `state.st.sky` to `applySkyFolded` on hydration (`client/lib/realize/environment.js:20-25`, `client/lib/realize/environment.js:45-52`).

#### Tested behavior (temporary scratch worlds only; no source edits)

A temporary websocket harness used `WORLDS_DIR=/tmp/...`, `FOLD_EVERY=3`, and a unique sky bag `{hours:17.25, rate:0, clouds:'cirrus', weather:'fair', exposure:0.91, azimuth:217}`:

- The author received a matching authoritative `log` echo at seq 2.
- After disconnect/rejoin, the join snapshot contained every authored field plus `{ts, seq:2, by:'author'}` and had `entries: []`, proving the forced snapshot-only path rather than tail reconstruction.
- After stopping and restarting the sequencer against the same temporary directory, another join returned the identical snapshot sky with `entries: []` and `throughSeq:2`.
- Results: `REJOIN_PERSISTENCE PASS` and `RESTART_PERSISTENCE PASS`.

This eliminates current append/fold/snapshot/join persistence as a general defect for a fresh **accepted** sky entry. It does not test a production disk, browser GPU realization, or whether the incident's click was accepted.

### 3. Legacy snapshot/direct-hydration migration bypass

#### Proven bypass

- At server boot, a credible `snapshot.json` assigns `this.state = snap.state` wholesale. Only log bytes after the snapshot offset pass through `foldEntry` (`server/world.ts:119-146`). There is no snapshot schema migration or sky normalization before `joinPayload` returns that object (`server/world.ts:232-235`).
- The current browser likewise clones the snapshot directly (`client/lib/state.js:59-75`); it does not call `stateToEntries` or `foldSkyEntry` during hydration. Thus a browser refresh can receive and realize the same stale snapshot shape directly (`client/lib/net.js:690-703`; `client/lib/realize/environment.js:20-25`).
- Current folding routes `sky`/`weather` through `foldSkyEntry` (`shared/fold.js:247-253`). `normalizeClock` removes top-level `hours`/`rate` under `clock:'real'`, shape-sanitizes and parks them under `dormantRated`, and drops `dormantRated` outside real mode (`shared/forecast.js:211-257`). A later `sky` or `weather` entry therefore heals the relevant clock invariant (`shared/forecast.js:277-325`); unrelated tail entries do not.

#### Exact stale invariants

A pre-#65 snapshot can retain active-looking top-level `hours`/`rate` beside `clock:'real'`, lack the parked `{hours,rate,ts}` bag, or retain an unsanitized/dormant bag shape. Direct server/client hydration preserves those values. For a valid real timezone, `hoursAt` still uses wall time, so the stale top-level fields may be mainly UI/machine-state drift. For an invalid timezone, the missing parked clock changes the fallback behavior and can visibly affect the sun (`shared/forecast.js:48-66`). This is a real migration defect, but its visible consequence depends on the stored bag and requested timezone.

#### Tested behavior

- A headless hydration probe passed a legacy sky `{clock:'real', tz:'America/Los_Angeles', hours:8, rate:24, ts:1000, seq:7, by:'legacy'}` directly to `client/lib/state.js`. `state.st.sky` retained top-level `hours` and `rate`. Re-expressing the same state through `stateToEntries` + `foldEntry` removed them and created `dormantRated:{hours:8,rate:24,ts:1000}`. Result: `MIGRATION_BYPASS PASS`.
- A temporary on-disk `snapshot.json` with the same legacy bag and no tail was booted by the actual server. A websocket join received the stale bag unchanged with `entries:[]`. Result: `SERVER_BYPASS PASS`.

This proves the prior research's migration concern. It **does not** explain a fresh accepted current sky disappearing: current `append` folds the new entry immediately, a `sky` entry replaces the standing bag, and the scratch reconnect/restart test persisted it.

### 4. Correct fold, cold/degraded renderer

#### Ordering and final convergence

- `applySky` synchronously copies the folded bag into renderer-local `clock` before awaiting render (`client/lib/sky.js:161-167`). It never writes to `state.st`.
- Rendering is serialized by `renderChain`; each queued task starts by reading the then-current `clock.args` (`client/lib/sky.js:197-219`). An older build already awaiting assets retains its captured `a` and can briefly finish/apply that look before the next queued render applies the newer bag (`client/lib/sky.js:402-418`, `client/lib/sky.js:437-513`). The final queued render converges to the newest clock; no delayed renderer path can overwrite folded state.
- The hydration realizer registers the first-sky gate synchronously and waits for sky warm/bake or a 25-second cap (`client/lib/world.js:185-239`). A cold render can therefore be absent behind the splash or continue warming after the cap, but it cannot replace the authoritative bag.

#### Visual omission/degradation

- Missing library-list support or repeated build/GPU failures degrades to SkyMesh rather than changing authored arguments (`client/lib/sky.js:220-267`, `client/lib/sky.js:283-305`). Per-frame faults deliberately leave the existing sky alone instead of rebuilding (`client/lib/sky.js:814-860`).
- SkyMesh applies time, azimuth, sun/hemi/fill, fog, and exposure (`client/lib/sky.js:723-809`). It does not render authored cloud/weather/forecast/color semantics. A correctly folded rainy or cloudy sky can therefore look like a basic clear atmosphere on a degraded client. `skyArgs()` still exposes the correct bag and `skyImpl()` reports `skymesh` (`client/lib/sky.js:54-61`). This is a plausible cold-refresh visual incident, not persistence loss.
- Baked `off`/`low`/`medium` tiers can show the previous bake while a forced bake/crossfade completes; a verb sets `pendingForce`, a mid-flight bake reruns, and a fade is shortened (`client/lib/sky_baked.js:332-376`). The normally unreachable clear-to-cloud graph refresh also returns to the pending cadence (`client/lib/sky_baked.js:378-427`). These paths update pixels/scene objects only and do not mutate `clock` or folded state.

No renderer-specific final-state overwrite was found. To prove this path in the incident, capture `state.st.sky`, `skyArgs()`, `skyImpl()`, `sky-degraded`/console output, and a screenshot immediately after refresh and after the warm interval.

### 5. Existing tools/tests and their assumptions

- `bun tools/forecast-test.ts`: **77 passed, 0 failed**. It thoroughly proves fold/forecast/clock math, including “legacy bag heals on late-join replay” (`tools/forecast-test.ts:423-434`). That case explicitly calls the synthetic replay path; it does not exercise current direct browser hydration.
- `bun tools/state-test.ts`: **31 passed, 0 failed**. Its comparison field list excludes `sky` (`tools/state-test.ts:20-24`), so its snapshot hydration cases do not detect this migration bypass.
- `bun tools/foldfix-test.ts`: **24 passed, 0 failed**. It proves fixture fold conformance, not browser sky realization.
- `tools/paritybench.ts` authors sky/weather and reconnects (`tools/paritybench.ts:508-529`), but `EW.foldParity()` intentionally compares entity/component/mount realization only (`client/lib/parity.js:1-31`, `client/lib/parity.js:85-97`). It does not assert hydrated or rendered sky.
- `tools/forecast-probe.mjs` ran successfully against a scratch sequencer, but it is not an exact current-browser test. It listens for message type `entry` (`tools/forecast-probe.mjs:21-29`) while the server/client wire uses `log`, and it starts from `late.snapshot.sky` then re-folds `late.entries` (`tools/forecast-probe.mjs:56-61`) even though today's server state already contains the tail's effects. Its passing result demonstrates accepted server fold/provenance in a late snapshot, not direct client hydration or render persistence.
- `tools/sky.ts` is conclusively broken for authoring: it joins with `spectate:true`, sends `sky`, never handles a server response, then prints success (`tools/sky.ts:9-17`). The server refuses all spectator authoring before rights checks (`server/verbs.ts:343-352`). A scratch run printed `sky {hours: 3.25, clouds: stratus} → tool-probe`, but a subsequent join returned `state.sky === null` and history contained only `genesis`/`grant` (`TOOL_PERSISTED_SKY NO`). If the incident used this tool, this is the root cause.

### Conclusions and eliminated hypotheses

**Proven repository defects**

- False-positive browser acknowledgment plus absent sky refusal rollback.
- Volatile disconnected verb queue, lost on page destruction before flush.
- `tools/sky.ts` always attempts authoring from a spectator connection and falsely reports success.
- Legacy server snapshot and client direct-hydration paths bypass #65 sky clock normalization.

**Eliminated as general causes for a fresh accepted sky**

- Failure to fold an accepted current `sky` entry into server state.
- Failure to include current folded sky in a refresh/rejoin snapshot.
- Failure to persist a forced snapshot sky across sequencer restart.
- A delayed renderer permanently overwriting folded sky with defaults or an older render.
- Forecast/fold clock math itself (77 focused tests passed).

**Still incident hypotheses, requiring world/runtime evidence**

- The user only previewed, or clicked while disconnected and refreshed before queue flush.
- The server refused the click (most notably because `sky` requires owner rights), leaving the preview visible.
- The sky was authored via broken `tools/sky.ts`.
- The production world carries a pre-normalization snapshot whose exact stale shape matters.
- Folded state is correct but that browser degraded to SkyMesh, hit a GPU fault, or was observed before the cold bake/warm completed.

The fastest incident discriminator is: (1) `world_history {verbs:['sky','weather']}` for the expected entry/actor/time, (2) `world_debug {kinds:['denied','rejected','rate-limit']}`, then (3) after refresh compare `state.st.sky`, `skyArgs()`, and `skyImpl()` in the browser. If history lacks the entry, investigate preview/refusal/queue/tool semantics; if history and `state.st.sky` contain it but visuals do not, investigate renderer degradation/warm state; if the snapshot itself has the old real-clock shape, the migration bypass is active.

## Investigation Log

### Initial Assessment - Persistence and Hydration Paths
**Hypothesis:** The failure may lie in log persistence/folding, server late-join snapshot delivery, client snapshot application/realization, or a refresh-time race/default overwrite.
**Findings:** The accepted current-code path is coherent and passed scratch reconnect/restart probes. The browser authoring UI can display local preview and `✓ logged` without authoritative acceptance; refusals are not rolled back. Legacy snapshots bypass clock normalization, while renderer degradation can visually omit weather/cloud semantics without altering folded state.
**Evidence:** `client/lib/build.js:1009-1021,1195-1200,1241-1247`; `client/lib/net.js:33-58,557-568,621-629,674-703`; `server/verbs.ts:340-408`; `server/world.ts:119-174,232-308`; `client/lib/state.js:59-75`; `client/lib/realize/environment.js:20-25`; `shared/forecast.js:211-325`; detailed probes and test results in Investigator Findings.
**Conclusion:** General server persistence loss is eliminated for a fresh accepted sky. Incident identification requires the affected authoring surface and runtime receipts.

### Verification - Fresh Accepted Sky
**Hypothesis:** Accepted sky is lost during snapshot hydration or server restart.
**Findings:** A temporary sequencer with forced snapshotting preserved a unique sky bag through authoritative echo, reconnect with empty tail, and process restart.
**Evidence:** `REJOIN_PERSISTENCE PASS`, `RESTART_PERSISTENCE PASS`; repository path at `server/world.ts:151-174,232-308`, `client/lib/net.js:690-703`.
**Conclusion:** Eliminated as a general current-code cause.

### Verification - Legacy Snapshot Migration
**Hypothesis:** Direct snapshot trust bypasses normalization expected by synthetic late-join tests.
**Findings:** Both headless client hydration and actual server boot preserved a legacy real-clock bag unchanged; synthetic re-fold removed stale top-level fields and created `dormantRated`.
**Evidence:** `server/world.ts:119-146`; `client/lib/state.js:59-75`; `shared/fold.js:247-253`; `shared/forecast.js:211-325`; `MIGRATION_BYPASS PASS`, `SERVER_BYPASS PASS`.
**Conclusion:** Confirmed architectural migration defect, but only a conditional incident cause.

## Root Cause
The specific production incident cannot be named conclusively without its history/snapshot/browser evidence. For the generic symptom, the highest-probability repository-proven path is **non-authoritative preview masquerading as persistence**:

1. Sky controls call `previewSky(gather())`, changing renderer-local state only (`client/lib/build.js:1009-1021`; `client/lib/sky.js:161-173`).
2. Commit immediately displays `✓ logged` after `sendVerb`, without waiting for a matching server `log` echo (`client/lib/build.js:1241-1247`).
3. The verb may be queued only in volatile memory (`client/lib/net.js:33-58`), refused because `sky` is owner-only (`server/rights.ts:79`; `server/verbs.ts:340-408`), rate-limited/dropped, or never committed.
4. Sky has no refusal rollback, so the preview remains visible (`client/lib/net.js:621-629`; contrast `client/lib/lights.js:144-154`). Refresh then correctly restores the unchanged authoritative sky.

Conditional root causes:
- If authored with `tools/sky.ts`, the tool joins as spectator, ignores replies, and falsely prints success (`tools/sky.ts:9-17`).
- If the issue concerns pre-#65 clock fields around restart/deploy, old snapshot state bypasses normalization on server boot and client hydration.
- If `state.st.sky` and `skyArgs()` are correct but rain/clouds/colors vanish, the client likely degraded to SkyMesh or was still warming; this is visual realization, not persistence.

## Recommendations
1. **Correlate sky commits with authoritative receipts** in `client/lib/build.js`, `client/lib/net.js`, `server/server.ts`, and `server/verbs.ts`: add request IDs; show `sending`/`queued`; show `accepted` only after the matching receipt; roll back a matched refusal to `state.st.sky`. Do not call a memory-acceptance receipt “durably persisted.”
2. **Repair `tools/sky.ts`**: join embodied with explicit credentials, wait for snapshot, verify owner rights, require a matching accepted sequence, and exit nonzero on refusal/timeout.
3. **Add versioned snapshot migration** at the canonical server boundary (`server/world.ts` plus a pure shared migration in `shared/fold.js`/`shared/forecast.js`); advertise the state schema version and use client migration only for compatibility with older servers.
4. **Add regression coverage** in `tools/state-test.ts`, `tools/paritybench.ts`, and a dedicated persistence test for direct legacy hydration, refusal rollback, accepted sky across snapshot/restart/browser reload, and `skyArgs()` parity. Update `tools/forecast-probe.mjs` to consume `log` and stop re-folding state that already includes tail effects.
5. **Expose degraded rendering clearly** in `client/lib/sky.js`/`build.js` when SkyMesh cannot express detailed weather/cloud/color semantics.

## Preventive Measures
- Treat a matching sequencer receipt—not optimistic UI—as proof of acceptance.
- Version and migrate persisted folded-state schemas whenever fold invariants change.
- Test the actual direct snapshot hydration path, not only synthetic state-to-entry replay.
- Include environment state and renderer input in reconnect parity checks.
- For incidents, first inspect `world_history` and `world_debug`, then compare refresh snapshot `state.sky`, browser `state.st.sky`, `skyArgs()`, and `skyImpl()`.
