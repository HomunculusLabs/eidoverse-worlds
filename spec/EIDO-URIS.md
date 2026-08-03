# eido: URIs — content references that survive leaving the host, v1 draft

**License: CC0 1.0 (public domain)**, same terms as `PROTOCOL.md` beside it.
Status: DRAFT for review against the store's actual shapes. The words
MUST/SHOULD/MAY are used in the RFC-2119 sense.

## 0. The one idea

A path is a location; a hash is an identity. Today a log references
`store/<sha256-16>.glb` — an identity wearing a location's clothes, legible
only to the host that dressed it. An `eido:` URI is the identity itself,
resolvable at any host, verifiable by anyone, so **a world is one JSONL log
plus blobs that can live anywhere**. Hosts become interchangeable resolvers;
"where the bytes live" becomes a late, reversible decision.

## 1. Syntax

```
eido:<alg>/<digest-hex>
eido:sha256/9f2c4a1b0e8d7c6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f
```

- `<alg>`: lowercase digest algorithm. `sha256` is the only algorithm in v1
  and the only one an implementation MUST support; the segment exists so a
  future algorithm is an addition, not a migration.
- `<digest-hex>`: the **full** lowercase hex digest (64 chars for sha256).
- No authority component, no query, no fragment, no parameters in v1. The
  URI names bytes; everything else (media type, role, license) is carried by
  whatever references it — a `lib` field knows it wants a model, a
  `behavior` binding knows it wants a script.
- Truncated forms are display sugar and MUST NOT appear on the wire or in
  logs. (The store's 16-hex filenames are safe within one host's namespace;
  64 bits is not a global identity — the full digest is.)

## 2. Resolution

A client resolving `eido:sha256/<hex>` tries, in order, until bytes verify:

1. any local store or cache;
2. the origin host of the world that referenced it:
   `GET /eido/sha256/<hex>`;
3. each entry of the world's declared resolver list (§4), in order;
4. anything else it knows (mirrors, a friend, a future DHT — out of scope).

**Verification is client-side and mandatory**: the resolver MUST hash the
received bytes and compare to the URI before using or caching them. A
mismatch is treated as a miss (keep trying), never an error surfaced from
the blob. This is the load-bearing property: because every reference is
self-verifying, **resolvers are untrusted by design** — any mirror, CDN, or
stranger's box may serve blobs, and the worst a hostile one can do is waste
a request. Trust lives in the log; the store is just bytes.

## 3. The resolver endpoint

A host serving blobs exposes:

```
GET /eido/<alg>/<digest-hex>
  200  the bytes (Content-Type advisory; the reference knows what it wants)
  404  not here (a fact about this host, not about the bytes)
```

Responses are immutable by construction and SHOULD be served with
`Cache-Control: public, max-age=31536000, immutable` — the same
content-addressed-therefore-cache-forever rule the reference implementation
already applies to `store/` paths. No auth for blobs referenced by public
worlds; access-controlled blobs are a resolver capability for a later
version, not a change to the URI.

## 4. Declaring resolvers

A world MAY declare where its bytes are known to live, as an ordinary
world-scope entry:

```
{verb: "resolvers", args: {urls: ["https://eidoverse.animalabs.ai", …]}}
```

folding to a world-scope list (last write wins; absent = origin only).
Readers that predate the verb ignore it and lose nothing but reach — the
generous-reader rule doing its job. A forked or exported world carries its
resolver list with it, so the copy knows where the original's bytes lived
even before anyone mirrors them.

## 5. Migration — cheap on purpose

- Existing logs are untouched: `store/<hex16>.<ext>` references remain valid
  host-relative paths, resolvable exactly as today at their origin.
- Ingestion already computes the full sha256 before truncating to the
  filename — from the day this lands, new log entries SHOULD write the
  `eido:` form in `lib` / `src` / `path` fields, and hosts continue to serve
  the same blob at both the old path and §3's endpoint.
- A reader encountering either form treats `store/<hex>` as "origin-only
  reference" and `eido:` as "resolve anywhere." Rewriting old logs is
  neither required nor recommended (the log is the log).
- One string transform in the exporter makes an *exported* world fully
  portable: emit `eido:` alongside a blob bundle, and the export is
  self-verifying on arrival regardless of where it's later hosted.

## 6. What this buys, concretely

- **Worlds travel.** A log plus a directory of blobs is a complete world on
  any host — the fork-is-a-byte-copy story extended across machines.
- **Mirrors without trust.** Anyone may serve your blobs; nobody can corrupt
  them. Bandwidth becomes donatable.
- **Cross-host dedup.** Two hosts holding the same swing hold the same
  identity, and know it without talking.
- **Provenance stays pinned.** `behavior` bindings already pin exact script
  bytes; this is that same discipline for every reference in the log.

## 7. Non-goals in v1

Mutable names (that is a registry's job, and registries are logs); blob
deletion semantics (a host may stop serving anything — 404 is always legal;
redaction policy lives with the log, not the URI); multihash beyond the
`<alg>` segment; private-blob auth (later, as a resolver capability).

---

*Drafted by Hesperus (Exultation side) as the first contribution offered and
blessed on 2026-08-02, for review against the store's actual shapes. Where
this draft and reality disagree, reality was there first.*
