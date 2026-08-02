# Upstream ask: no material-graph surgery after first compile

*For Skye, from the eidoverse-worlds client — 2026-08-02. Sibling of the
earlier bakeEnv asks (cloudsOnly output, hemisphere mapping). Everything here
was measured on live multiplayer clients; numbers below.*

## The problem

`weather_system` (wetness/puddles) and `sky_system` (cloud shadows) integrate
with a world by **sweeping the scene and rewriting existing materials** —
`colorNode`/`roughnessNode` etc. get wrapped after the fact. That is a lovely
zero-config contract for a film scene, where setup happens once before frame
0. In a live client it lands differently:

- Materials compile when their object loads. The sky arrives seconds later
  (it is 7.5MB of modules and deliberately doesn't gate arrival).
- The wrap **changes the shader graph's shape**, so every wrapped material's
  compiled pipeline is invalidated and rebuilt. Same again when weather state
  changes what the wrap emits.
- On a slow-loading browser everything is already in the scene when the sweep
  runs: we measured **44 materials wrapped** on one Safari join (8 on Chrome,
  which merely won the race), each recompiling a pipeline it had just built.
- WebKit's WGSL→Metal compile costs **~2–6 seconds per unique material
  graph** (Chrome ~0.5s). The double-compile is the difference between a
  playable join and twenty seconds of freezes there.

We work around it client-side today (object pipeline compiles are held until
the sky has built, then a whole-scene `compileAsync` runs behind a
deliberately held frame), but the workaround costs a visible held beat and
only exists because the graphs change shape late.

## The ask — either form works

1. **Expose the wrap as a factory**: `weather.wrapMaterial(mat)` /
   `sky.wrapShadowReceiver(mat)`, callable by the host at material-creation
   time, before first compile. The scene sweep stays as the zero-config
   default; hosts that manage loading order call the factory and each
   material compiles once, with its final graph.

2. **Better: build the branches in always, gated by uniforms.** If the
   wetness/cloud-shadow terms are always present in the graph and driven to
   zero by uniforms when inactive, the graph shape never changes — not at
   sky arrival, not at weather changes. Costs a few always-on shader
   instructions; buys the death of every wrap-driven recompile. This is the
   film-industry pattern (ubershader with runtime switches) and matches how
   your TOD palette already works — parameters ride uniforms, structure is
   fixed.

## What we already fixed on our side (relevant context)

`scene.environment` flipping null→texture at first `bakeEnv` had the same
shape-change effect on *every* PBR material's lighting branch. Our client now
boots with a persistent black 512×256 env target assigned from frame 0 and
blits every bake into it — content changes, the texture object never does,
nothing recompiles. If `enableReflections` ever wanted to support a
caller-supplied target ("bake into this, don't assign"), the blit hop could
go away too — but that one is cosmetic for us now.

## Why we care enough to write this up

The wrap effects are *good* — wet ground under a storm and cloud shadows
crossing a meadow are exactly the "world that talks back" material. We want
them on all the time, on every browser, without a compile storm taxing every
join. Wrap-once/uniform-gating makes them free after first load.
