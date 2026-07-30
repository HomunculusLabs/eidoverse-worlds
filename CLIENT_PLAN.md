# The human client — critique and plan

Status: proposal (2026-07-26). Read from source (`client/main.js` @ 1314 lines,
`client/index.html`, `server/server.ts`, `mcpl/net-server.ts`) against the
promises in `DESIGN.md`. Not playtested this pass — anything marked ⚠ is a
code-read claim that should be confirmed in a browser before it's fixed.

Companion to `SCALING_AND_SNAPSHOT_PLAN.md`, which owns the wire/server side.
This document owns everything a human sees and touches.

---

## 1. The headline: agents have a richer verb surface than humans

`DESIGN.md` says *"One verb surface, three modalities: mouse, speech, code."*
Today that isn't true. Counting what each modality can actually emit:

| verb | agent (MCPL) | human (browser) |
|---|---|---|
| `say` | ✅ `say` | ✅ Enter |
| `spawn` | ✅ by path **or keyword query** | ✅ 8 hardcoded buttons + drag-drop |
| `place` | ✅ | ❌ **no UI at all** |
| `remove` | ✅ | ❌ **no UI at all** |
| `terrain` / `grass` | ✅ via `world_verb` | ❌ |
| `sky` | ✅ via `world_verb` | ✅ (the tuner — the one good build surface) |
| perception | ✅ `look`: every entity with distance + bearing | ❌ no entity list, no selection, no ids |
| catalog | ✅ `list_library` keyword search | ❌ no browse, no search |

A human can add to the world and can never move, correct, or unmake anything
in it. Every misplacement is permanent. There is no undo — despite `DESIGN.md`
naming undo as free ("inverse entries. History is first-class"). This is the
single largest gap and most of §4 is about closing it.

The asymmetry is also backwards from the design's stated intent: humans were
supposed to be the ones who *"commission, compose, perform, and judge"* while
agents are the artificers. Right now agents compose and humans can only litter.

---

## 2. Bugs and papercuts — cheap, do first

Ordered by (annoyance × how trivial the fix is).

**2.1 ⚠ Dragging any UI control orbits the camera.** `mousedown` is bound to
`window` with only a `!ghost` guard (`main.js:425`). Grabbing a sky-tuner
slider, or click-holding a palette button, sets `dragging = true`; the
subsequent `mousemove` spins the camera. Fix: gate on
`e.target === canvas`, like the click-to-place handler already does
(`main.js:1043`).

**2.2 ⚠ Scrolling the palette zooms the camera.** Same shape — `wheel` on
`window`, no target check (`main.js:434`). The build section is a
`max-height:44vh; overflow-y:auto` list, so scrolling it dollies you.
Same fix.

**2.3 Chat is unreadable and uncopyable.** `#chatlog` is `pointer-events:none`
(`index.html:17`) — you cannot scroll it, select it, or copy a URL out of it.
It hard-caps at 60 lines with no history. Meanwhile the speech cap was raised
280 → 4000 chars, and `wrap()` truncates bubbles to 6 lines with an ellipsis
(`main.js:372`). So an agent's long answer is: truncated in the bubble,
possibly scrolled out of a log you can't scroll. For a show where agents are
the interesting speakers, this is the worst papercut in the client.

**2.4 A bad join token retries forever, silently.** `onclose` special-cases
4002 (takeover) but not 4003 (bad token, `server.ts:347`) — you land in
`'disconnected — retrying…'` and hammer the door. Handle 4003 with a real
message and a key-entry field.

**2.5 Errors never clear.** `report()` writes to `#err` and nothing ever
empties it (`main.js:21`). A single transient asset 404 leaves red text over
the world for the rest of the session. Make it a timed toast stack.

**2.6 Nameplates render through everything.** `depthTest:false` +
`renderOrder:99` (`main.js:347`) means every label on the stage floats over
the geometry at any distance. With 24 performers that's a wall of text. Fade
by distance, cap at ~30m, and let close geometry occlude.

**2.7 No first-run anything.** Name is `?name=` or `guest-a1b2`; avatar is
`?avatar=`; key is `?key=`. Nothing is settable in-client. A person handed a
bare URL is a randomly-named default-bodied guest with no idea what the keys
are (controls live in a HUD line that only repaints once per second).

**2.8 Small ones.** No `Escape` to close chat when it's empty-but-focused;
`Enter` opens chat even while a ghost is held; palette filter doesn't persist;
no timestamps in chat; no distinction between an agent speaker and a human
speaker; system lines (`*`) look like chat.

---

## 3. Structure — the thing that gates everything else

`main.js` is one 1314-line module holding renderer setup, the eidoverse module
host, loaders, avatars, the controller, colliders, log application, sky/lighting,
the palette, upload, networking, and the frame loop. It's *good* code — the
comments carry real rationale, which is rare — but every item in §4–§7 makes it
longer, and the coupling is already showing (globals on `globalThis`, `ghost`
reached from three handlers, `applyEntry` doing UI work).

Proposed split, no build step required (ES modules load natively, the importmap
already works):

```
client/
  main.js        boot + frame loop only (~120 lines)
  net.js         connect/reconnect state machine, verb queue, snapshot hydration
  world.js       applyEntry, entity registry, colliders, terrain/grass/sky verbs
  sky.js         renderSkyNow + the world clock
  avatar.js      Avatar class, loaders, clip cache, LOD
  controller.js  input → myState, camera, collision
  build.js       ghost, selection, transform gizmo, palette, upload
  ui/            hud.js, chat.js, toasts.js, panels.js
```

Do this **before** the build-mode work, not after. It's a mechanical move —
maybe half a day — and it's the difference between §4 being pleasant and §4
being a merge of six features into one file.

Also worth adding at the same time: a `--dev` reload, a `window.EW` that exposes
the modules (it already exposes state — `main.js:1273`), and about ten smoke
assertions runnable headless (join → replay → spawn → place → remove → leave)
so the netcode's race handling doesn't regress silently.

---

## 4. Build mode — the big one

The goal: a human can select anything in the world, move it, rotate it, scale
it, delete it, and undo. This is `place`/`remove` (already server-allowed,
already replayed by `applyEntry`) plus a selection UI.

**4.1 Selection.** Raycast against `entities` on click when no ghost is held.
Selected object gets an outline (three's `OutlinePass` isn't in the WebGPU path
— cheapest is a scaled back-face shell or a bounding-box helper). Show a small
inspector: name, id, owner, distance, `lib` path.

**4.2 Transform.** Drag to move on the ground plane; `Q`/`E` rotate (already
the ghost's binding, keep it); scroll-with-modifier or a handle to scale;
`Delete` removes. Commit on release as **one** `place` entry — `DESIGN.md` is
explicit that drag is transient presence traffic and release commits one clean
log entry. That needs a transient channel for the in-progress drag so others
see the object moving; a `pose`-shaped `drag` message that the server relays
and never persists fits the existing two-plane split exactly.

**4.3 Placement helpers — the promise that isn't kept.** Today the ghost
raycasts an infinite ground plane at y=0 and clamps to 18m (`main.js:1053`).
You literally cannot put a mug on a table. The colliders map already knows
every object's OBB and its walkable top (`resolveColliders` computes exactly
this for feet). Raycast entities first, ground plane second, and snap the
ghost's base to the hit surface. That's `placeOn` for nearly free. `placeTouching`
(kiss flush against a neighbouring face) is a second, cheap step from the same
data.

**4.4 Undo.** Keep a local stack of inverse entries: `spawn`→`remove`,
`place(new)`→`place(old)`, `remove`→`spawn`. `Ctrl+Z` emits the inverse verb.
Per-actor, local-only, best-effort — no server work needed for v1.

**4.5 Catalog.** `searchLibrary()` in `mcpl/server.ts:121` is nine lines of
filename token matching over `MODELS_DIR`. Lift it into the sequencer as
`GET /library/models?q=` and the human palette gets the same catalog agents
already have. Then: a search field, results as a grid, and a **thumbnail
cache** — render each model once headless (or on first client encounter) into
`assets/opt/thumbs/<hash>.webp`. Picking from a list of
`stylized_yucca_joshua_tree_desert_cactus_plant.glb` is not picking.

Same treatment for the avatar roster (`main.js:894`) — a name list where each
choice costs a multi-megabyte download is a blind pick. Thumbnail them.

**4.6 Ownership feedback.** No capability model yet, but even a soft one —
"you placed this", "sydney placed this" — makes a shared build legible and is
already in the log (`entry.actor`).

---

## 5. Presence and embodiment

The pose packet is `{p, yaw, speed, clip}` (`main.js:1233`). `DESIGN.md` asks
for *"locomotion vector, active clip + phase, gesture, viseme envelope"* and
gaze. The gap is why bodies read as puppets:

**5.1 Dead eyes.** VRM ships `lookAt` and the client never sets a target.
One line at avatar construction plus a per-frame target = everyone glances at
the nearest speaker (or the camera when idle). Highest presence-per-line-of-code
change available in this codebase.

**5.2 No blink, no expression.** `vrm.expressionManager` is untouched. A
randomized blink is ~10 lines. Then map a small emotion set onto a new pose
field so agents can emit `expression: 'happy'` alongside `say` — agents
currently have no face at all.

**5.3 No head pitch.** You can orbit the camera up and down; your avatar's
head does not move. Add `pitch` to the pose packet and drive the neck bone.

**5.4 No visemes.** Mouths don't move when anyone speaks. Even a crude
amplitude-free fake — open/close on a syllable-rate envelope for the duration
of a `say` — is dramatically better than a frozen mouth, and it's the hook
where the Discord voice path (`tools/voicebot`) plugs in later.

**5.5 No emotes.** No wave, no point, no nod, no clap. For a *performance*
platform this is a conspicuous hole. The clip machinery exists (`CLIP_SLOTS`,
`clipFor`) — add a one-shot layer on top of the locomotion layer, a radial
menu or number keys, and a `gesture` pose field.

**5.6 Sitting isn't sitting.** `X`/`Z` set a posture flag and play a
sit-on-ground clip wherever you stand (`main.js:407`). `DESIGN.md` Layer 0
promises `seatOn` raycasting real seat pans — "a scanned stool is sittable the
moment it arrives". The colliders already give you top surfaces; snapping to
the nearest one within ~1m when you press `X` would deliver most of that
promise.

**5.7 Interpolation is naive.** `applyRemotePose` lerps toward the latest
target with an exponential factor (`main.js:557`). No buffer, no timestamp, no
extrapolation — so under jitter bodies stutter and under loss they freeze then
teleport. Frames already carry `t` (`server.ts:455`); a 100ms interpolation
buffer keyed on it is the standard fix and matters at show scale.

**5.8 No presence affordances.** No typing indicator, no "who's here" panel
(the HUD shows a count), no way to find or teleport to a person, no proximity
audio, no footsteps, no ambience. The world is silent — for something whose
pitch is machinima, sound is a whole missing plane.

---

## 6. Environment and camera

**6.1 No shadows.** `sun` casts none. Everything floats; jump height is
unreadable; objects have no contact with the ground. A single cascaded shadow
map on the sun, plus a cheap blob shadow under each avatar, is the biggest
visual-quality-per-effort win in the client.

**6.2 No environment map.** `scene.environment` is never set, so every PBR
material is lit only by a hemisphere and a directional. The SkyMesh dome is
right there — PMREM it once per significant sun change and every metal and
glossy surface in the world comes alive. Cheap, and it makes Skye's assets look
the way they were authored to look.

**6.3 Camera has no collision.** Orbit into a wall or a hillside and you see
through the world. Raycast from the head to the desired eye and clamp — 15
lines, and it's the difference between "prototype" and "product" for most
people's first ten seconds.

**6.4 No first-person, no shoulder offset.** Zoom bottoms out at 1.6m
(`main.js:435`) with the body centered, so your own avatar occludes exactly
what you're aiming at when placing objects. Add a shoulder offset and let zoom
pass through into first-person.

**6.5 Photo / film mode.** The pitch is *"the video toolkit becomes the camera
crew"*, and there is no screenshot key, no UI-hide, no FOV control, no free
camera, no DOF. `F2` screenshot + `F1` hide-UI + a detachable free camera is a
day of work and it is what people will actually share out of a show. The
retina/`?spectate&follow=` path already proves the camera can be detached —
this is the human-facing version of it.

**6.6 Environment breadth.** No water, no weather, no time-of-day presets
(the tuner exposes eight raw sliders — add "dawn / noon / golden / night /
storm" buttons that write the same verb). Fog density is constant regardless
of hour. Terrain and grass are agent-only verbs; a human should be able to
paint them.

---

## 7. Performance and correctness at scale

Mostly fine at prototype scale, will bite at show scale:

- **Colliders are O(n) per frame**, every entity, every frame
  (`resolveColliders`, `main.js:586`), allocating two `Vector3`s and an array
  of four exit candidates per entity per frame. At 20 objects it's free; at 500
  it's the frame budget. Spatial hash + a reusable scratch vector.
- **Allocation churn in the hot loop**: `new THREE.Vector3` in `updateMe`,
  `applyRemotePose`, `updateGhost`, `resolveColliders`. Hoist them.
- **Every `say` builds a canvas + texture** and disposes it 9s later. Pool.
- **Entities are never LOD'd or culled** — avatars have distance LOD
  (`main.js:554`, good) but placed objects don't.
- **Full log replay on every join**, including for verbs long since undone.
  Owned by `SCALING_AND_SNAPSHOT_PLAN.md`; noting it because the client-side
  half (apply a semantic snapshot instead of folding entries) lands here.
- **Adaptive pixel ratio is good** (`main.js:1301`) — extend the same idea to
  shedding shadow resolution and avatar LOD distance before pixels.

---

## 8. Accessibility and input breadth

- Everything is 11–13px monospace in low-contrast green-on-dark. No scaling, no
  high-contrast mode, no colorblind-safe alternative.
- No touch support whatsoever — no mobile, no tablet. A spectator on a phone
  currently gets nothing.
- No gamepad.
- Keys are hardcoded and unrebindable; arrow keys don't work.
- No reduced-motion respect (camera lerps, bubble animations).
- Chat can't be resized or detached; `captions.html` proves the team can do a
  clean overlay — the in-world chat deserves the same care.

---

## 9. Suggested sequence

Each phase is independently shippable and leaves the client better than it
found it.

**Phase 0 — one afternoon.** §2 papercuts: canvas-gated mouse/wheel, chat
pointer-events + scrollback, 4003 handling, toast stack, nameplate fading.

**Phase 1 — modularize.** §3. Mechanical, do it while the file is still
1314 lines and not 2500.

**Phase 2 — the front door.** Name/avatar/key entry panel, avatar thumbnails,
a `?`/`H` help overlay with the real keymap, join progress. Everything a
person handed a bare URL needs.

**Phase 3 — build mode.** §4 in order: selection → transform + drag relay →
surface snapping → undo → `/library/models?q=` search + thumbnails. This is
the phase that makes the human a first-class resident.

**Phase 4 — embodiment.** §5.1–5.6: lookAt, blink, head pitch, fake visemes,
emotes, `seatOn`. Cheap individually, transformative together.

**Phase 5 — looks.** §6.1–6.4: shadows, env map, camera collision, shoulder
offset. Then photo mode (§6.5), which is the shareable artifact of every show.

**Phase 6 — scale.** §7, alongside the snapshot work.

If only one phase ships: **Phase 3**. It's the one that changes what the client
*is* — from a viewer with a spawn button into a place people can actually build.

---

## 10. Open questions for you

1. Is the show deadline still driving priorities? If so Phase 0 + 2 + 6 are the
   show path and Phase 3 + 4 are the platform path — they compete.
2. Should build mode be a mode (`B` toggles, cursor unlocks, gizmos appear) or
   always-live (select anything, any time)? Mode is clearer for humans;
   always-live is closer to the "one verb surface" ideal.
3. How much does Skye's toolkit already give us for §5 (emotes, visemes) and
   §6 (water, weather)? Some of this may be a hosting problem rather than an
   implementation problem — the `loadEidoModule` path already proves toolkit
   files eval-load unmodified.
4. Is a build step finally worth it? Everything above stays possible without
   one, but thumbnails, tests, and a growing module graph start to argue for it.
