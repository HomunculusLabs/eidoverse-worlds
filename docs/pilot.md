# Manual pilot v1 — opt-in authored airspace

Manual Moon Moth flight is a **client lease sender**, not a new intent verb or a server physics engine. The existing entity lease receiver renders its transforms, including for spectators and clients with their physics mod disabled. Pilot code is only needed by the driver.

## Authoring contract

Use ordinary `comp` to opt a vehicle in. Every field below is required; strings are not coerced to numbers, and NaN/Infinity/null are not numbers. Example matches the local Moon Moth fixture (model-local **+Z is forward**):

```json
{
  "v": 1,
  "slot": "seat",
  "home": [0, 0, 0],
  "homeYaw": 1.5707963267948966,
  "radius": 30,
  "cruiseY": 22,
  "ceilingY": 35,
  "maxSpeed": 4,
  "maxClimb": 3,
  "maxTurn": 1.2
}
```

Attach this as `comp {id, type:"pilot", data:…}`. Declare the designated seat separately with `comp.sockets`, e.g. `{"seat":{"pos":[0,2.47,0.18],"pose":"sitchair","yaw":0}}`. The vehicle's resting root transform must already be inside its envelope. `home` is the **root's** dock pose, not the socket position or rider feet.

| Field | Bounds / units |
|---|---|
| `v` | Exactly `1` |
| `slot` | 1–64 ASCII word/hyphen characters; existing socket with finite three-number `pos` |
| `home` | Three finite coordinates, each ±10,000 m; Y additionally −1,000…1,000 m |
| `homeYaw` | −π…π radians |
| `radius` | 1…100 m, horizontal distance from home |
| `cruiseY` | −1,000…1,000 m, strictly above home Y |
| `ceilingY` | cruiseY…1,000 m |
| `maxSpeed` | 0.1…20 m/s, horizontal travel |
| `maxClimb` | 0.1…10 m/s, vertical travel |
| `maxTurn` | 0.1…3 radians/s, shortest yaw arc |

Flight is within a vertical cylinder of `radius`, between `cruiseY` and `ceilingY`. Below cruise, only a **0.25 m horizontal-radius dock shaft** is permitted, down to home Y. The server validates crossing segments as well as endpoints: diagonal entry into the shaft below cruise is not a shortcut. The sender takes off vertically, and X returns horizontally to the shaft before descending.

This is **authored clear-airspace flight**, not terrain/obstacle collision avoidance. Authors must verify the entire cylinder, dock shaft, full moth/rider clearance, and safe ground dismount area; the envelope constrains the root, not a swept mesh. Do not place this corridor through hills, roofs, people or other vehicles. The built-in dismount uses the existing ground-seat convention (ground Y=0), so author this local pilot dock on that ground plane.

## Controls

1. Mount the declared seat normally: nearby **X**, or `/sit <entity>.seat`. Wait for the authoritative mount echo.
2. Outside build/edit mode, **F** requests exclusive pilot control. In build/edit mode F only lowers the current selection; leave editing before piloting. Only an explicit server `mode:"pilot"` grant starts simulation. From the dock or a frozen shaft pose it takes off to cruise altitude; from clear air it resumes at hover.
3. **W** thrusts forward (+Z at yaw zero); **S** brakes, without reverse thrust. **A/D** turn left/right. **Space/C** climb/descend within cruise…ceiling.
4. Releasing keys decelerates translation, climb and turn to a stationary hover. Manual targets use 90% of the authored maxima for transport/timer headroom.
5. **X** returns to the dock, aligns home yaw and lands. The client releases with the exact final pose and waits for the committed landing before issuing the ordinary dismount. X can also claim a frozen craft to return it; it never jumps the rider off an active flight.

WASD no longer dismounts a **valid designated pilot seat**, even before F. Other seats keep the existing WASD/X dismount behavior. Seat hints advertise pilot controls. The rider uses the existing live socket transform; the camera translates with the rider and rotates by carrier yaw changes, retaining the user's relative mouse-look angle.

Blur, chat/editable focus, and disconnect clear held keys. While typing, editing/building, an overlay is open, the document is hidden, or the page lacks focus, all flight phases pause at the current pose (including takeoff/return); an active connected sender still sends stationary heartbeats. No stale key resumes movement when chat closes. Disconnection stops the sender; reconnect does **not** auto-claim or auto-fly.

## Authority and wire

Only the **current connected, non-spectator socket identity** whose authoritative `state.mounts[identity]` names this vehicle and exact slot may claim and stream. A payload rider/id assertion, proximity, passenger slot, or renderer/spectator role grants no authority. Ambiguous multiple occupants of the designated slot fail closed. A mount offset override or nonzero/invalid mount yaw is not the declared pilot seat.

A pilot vehicle cannot be attached to another entity, have whole-body `comp.motion` (or legacy root motion), be locked, or have an attached behavior binding. Remove automatic-flight bindings even if they are presently at rest: their timers could author later root movement. Pilot sockets may not name a moving part. Independent decorative wing `motion:<part>` components remain allowed.

The real WS lease handler validates authority on claims **and all subsequent lease messages**, including release finals. It retains a snapshot of the pilot config/socket signature in the lease. Config/socket drift or seat loss settles the old lease at its last accepted transform and refuses its final mutation. A **new authored root edit wins instead**: successful `place` (even same-pose), `spawn`, `light`, `remove`, whole-body `motion`/`comp.motion`, or vehicle `mount`/`dismount` immediately revokes the pilot **without an older lease settlement overwriting that newer intent**. Attaching a behavior also revokes control, but the binding itself supplies no replacement transform: the last accepted pose is settled in a `place`, broadcast after the binding in log sequence order. This invalidation is in `World.append`, so WS and behavior-authored edits follow the same rule; a failed append does not invalidate a grant. Ordinary grants already outstanding when a vehicle opts in cannot bypass these rules. An opted-in but malformed config also refuses ordinary leases; removing the component deliberately restores ordinary lease policy.

```js
// claim (the designated occupant's connection)
{type:"lease", op:"claim", id:"moth", mode:"pilot"}
// required reply before client simulation
{type:"lease", op:"granted", id:"moth", mode:"pilot", from:{p:[x,y,z], yaw:0}}
// sender ~15 Hz; no quaternion, scale, velocity, code, or per-frame intent
{type:"lease", op:"state", id:"moth", mode:"pilot", p:[x,y,z], yaw:0}
// release with a fully validated final pose, or without a final to freeze last accepted
{type:"lease", op:"release", id:"moth", mode:"pilot", p:[x,y,z], yaw:0}
```

`mode` is mandatory on the claim/grant handshake; enforcement thereafter uses the **retained lease mode**, not a state packet's claimed mode. `p` must be exactly three finite numbers, yaw must be finite and within −π…π, and quaternion data is rejected in pilot mode. A partial/malformed final is refused rather than falling through to ordinary lease coercions. Invalid pilot samples receive `denied` with `mode:"pilot"` and the accepted `from`; they do not refresh the lease or mutate/broadcast the transform. The built-in sender stops on that mode-tagged refusal and releases **without** a final, allowing the authoritative settle to restore its view. Untagged ordinary claim denials cannot terminate an active pilot grant. The physics sender skips punt volunteering on pilot entities, including opt-in during its volunteer delay.

Joiners receive each held lease's current state immediately after the logged-world snapshot, without waiting for another sample. This does not change the logged rest pose or grant authority. The shared receiver buffers the latest sample through model reservation/placeholder hydration, clears it on release/replacement/reconnect, and applies pilot yaw as an upright transform (clearing any inherited quaternion pitch/roll). Ordinary quaternion and untagged yaw streams retain their existing semantics, including with the physics sender disabled.

Travel, climb and turn consume independent elapsed-time token budgets. Buckets start **empty**, refill at the authored rates, and hold at most 0.25 seconds of travel. Idle time cannot bank a teleport; packet spam, duplicate claims and release/reclaim cycles cannot mint free allowance. Repeated same-holder claims are idempotent. No proximity takeover exists for pilot mode. The ordinary per-client lease cap and socket message-rate limits still apply.

## Failure, persistence, recovery

- All streaming lives on the ephemeral **presence plane**. No per-frame `place`, component rewrite, new intent verb or server simulation occurs.
- Release, disconnect and the existing stale sweep commit one ordinary `place`, actor `world`, with `{by: holder, via:"lease"}`. The stale threshold remains 10 seconds without accepted state, checked by the existing 5-second sweep.
- Failure freezes the **last accepted pose**, including a mid-air pose. There is no invented server return-to-dock or landing. “Settled” means persisted and unleased, not necessarily grounded.
- Re-mount the designated seat if necessary and press F to recover, or X to request a client-driven return/landing. Clear config/motion/attachment conflicts first. Resume from the authoritative `granted.from`, never the stale spawn pose.
- An old server that returns an untagged grant cannot enable flight. The sender releases that grant, reports unavailability and remains inert. A grant times out after three seconds. Do not deploy client-only pilot controls against an unsupported server.

## Local verification

```sh
bun test tools/pilot.test.ts tools/pilot-client.test.ts tools/pilot-ws.test.ts
```

The numeric suite exercises bounded deterministic flight and every return segment against the same authority validator. Client tests execute the actual sender, physics receiver, mounted-body, build-key and camera/input code with injected engine/DOM boundaries. The WS suite copies source into an isolated scratch root, boots the real sequencer on loopback with a restricted environment and outbound fetch disabled, verifies its scratch log, and exercises claim/state/release enforcement, malicious finals, budgets, drift, disconnect, the real stale sweep, recovery, join-time lease poses and inert behavior settlement/log ordering. It also runs the unchanged `tools/leasetest.ts` and `tools/comptest.ts` matrices against that scratch server. No checkout sessions, credentials, assets or live world data are loaded; the child and scratch tree are removed after the suite.

Parent-owned Moon Moth fixture/browser evidence is separate from these engine tests. This implementation and these tests require no deployment, upload, live-world mutation, asset change or new dependencies. There is no build step.
