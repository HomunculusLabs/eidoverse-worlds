# elizaOS PR #21393 — Second-reviewer verdict (delta since 99a2c70abc, head 7b514bf9c9)

**Verdict: APPROVE_WITH_NOTES.** The two maintainer commits (e5d84a0ee1, 7b514bf9c9) deliver every
contract claimed, all prior-round findings plus reviewer C's blocking finding are fixed *in the diff
text itself*, and I found no new blocking defect. The notes below are robustness/API items, none of
which regress correctness relative to develop.

Line references are derived from the hunk headers of the provided diffs (`~` = approximate new-file line).

## Prior-round findings — fixed status per diff text

| Finding | Status | Evidence in delta |
|---|---|---|
| F1 umbrella discriminator aliases bypass budget+dedupe | **FIXED** | `isMemoryRecallSearchCall` routes MEMORY through `readSubaction(params, {allowed:["search"]})` (planner-loop.ts ~3987-3999); `RECALL_IDENTITY_IGNORED_KEYS` spreads `DEFAULT_SUBACTION_KEYS` (~4028-4034); in-diff test pins `operation/verb/subAction/__subaction/action/op`. |
| F2 dedupe seeded on success-with-empty | **FIXED** | Seeding gated on `success === true && successfulRecallResultHasContent(result)` (~4098-4108); test pins `count: 0, items: []` → rephrase allowed. |
| F3 finishReason/usage absent from useModel return type | **FIXED** | `EvaluatorModelResult` type added (planner-types.ts ~35-38); `EvaluatorRuntime.useModel` returns it. |
| F4 malformed autonomy knobs silently keep defaults | **FIXED** | `resolveConfiguredIntervalMs` / `resolveAutonomyModelSize` warn paths (service.ts ~104-157); test pins both warnings. |
| C (blocking) query-only dedupe key collapsed scoped/widened searches | **FIXED** | `recallSearchDedupeKey` folds non-query scope params via `stableJsonStringify`, MEMORY→MEMORY_SEARCH family collapse, discriminator aliases excluded (~4045-4059); tests pin roomId-rescope allowed, widened limit allowed, umbrella/virtual dedupe with reordered nested filters. |
| C-minor truncated first call usage never reported | **FIXED** | `reportEvaluatorUsage` per call (~884-899); the old post-`endedAt` tail report is deleted (diff removes it) → final raw never double-reported. Test asserts 2 onUsage calls. |
| C-minor throwing retry discarded usable truncated result | **FIXED** | Inner try/catch; `isModelProviderError` gate → fall back to first raw + `reportError`; non-provider (TypeError in test) propagates. |

## New findings

1. **[P2] Prose fallback can seed dedupe on a genuine miss — handler-shape contingent.** *Non-blocking.*
   `successfulRecallResultHasContent` (planner-loop.ts ~4142-4160): the final fallback treats ANY
   nonempty `userFacingText/summary/text` as content. A handler returning `success: true` with a
   "No matches found" string and **no** numeric/array `data` seeds the dedupe set and blocks a
   legitimate rephrase. The numeric gate is authoritative only when `data` exists. The prompt asserts
   the keys match `searchMemoryAction` (packages/agent/src/actions/memories.ts), but that file is
   **not in the provided delta**, so the match is unverifiable inline — accepted on the external
   probe's word only. Recommend a contract test importing the real handler's success payload (or its
   result type) so drift is caught. Failure mode is softened by the "say plainly what you did not
   find" instruction, hence non-blocking.

2. **[P2] `total` as a hit-gate can misclassify a paginated miss as a hit.** *Non-blocking.*
   Same function, numeric loop `["count","matchCount","total"]`: a handler using `total` as
   corpus/pagination metadata (`{total: 245, results: []}` — matched in corpus, empty page returned)
   returns true → seeds dedupe → rephrase blocked. Related: stringly-typed counts (`count: "0"`)
   fail `typeof === "number"`, skip the authoritative gate, and fall through to the prose fallback.
   Both are handler-shape dependent; the budget cap (2) bounds the damage.

3. **[P3] finishReason regex misses `max_output_tokens`-class reasons.** *Non-blocking.*
   `evaluatorHitCompletionLimit` (evaluator.ts ~128-143): the `max…tokens?` alternative bridges only
   `[-_\s]completion` — `"max_completion_tokens"` matches (tested), `"max_output_tokens"` does not
   (traced: `output` fails the completion group and `[-_\s]?tokens?` can't bridge). The
   usage-at-cap check is the backstop; if a provider both uses that reason string and under-reports
   usage, behavior degrades to the pre-PR parse-recovery path — never a loop. Suggest
   `max(?:imum)?[-_\s]?(?:completion|output|total)?[-_\s]?tokens?`.

4. **[P3] Planned-vs-executed param drift weakens near-dup suppression.** *Non-blocking, safe direction.*
   The dedupe key is built from `toolCall.params` on both sides (partitionMemorySearchBudget
   ~4083-4140). If execution-time validation injects default scope params (e.g. `limit`) into the
   step's toolCall but the raw planned call omits them, the JSONs differ and a reformulation escapes
   the dedupe. Over-allow only — the round budget still caps execution at 2. Unverifiable from the
   delta (validation layer not shown).

5. **[P3] `ChainingLoopConfig.maxMemorySearchRounds` is a required new field.** *Non-blocking.*
   limits.ts ~32-47: external consumers constructing config literals against
   `ChainingLoopConfig` break at typecheck. In-repo claimed clean. An optional field with a default
   read would be gentler.

6. **[P3] String evaluator results are never truncation-retried.** *Non-blocking, documented.*
   `evaluatorHitCompletionLimit` returns false for strings (no metadata). Pre-existing channel;
   comment documents it.

7. **[P3 nit] Dead-round bound costs up to `maxRepeatedToolCalls + 1` extra planner rounds.**
   planner-loop.ts ~1213-1243: with the default 2, a model emitting only fresh-phrase searches burns
   3 dead planner prompts before `finishWithForcedSynthesis`. Deliberate ("same bound as the
   repeated-call breaker") and bounded; noting for cost awareness only.

8. **[P3 nit] Autonomy interval warn is not once-guarded and hardcodes the default.**
   service.ts ~104-124: `resolveConfiguredIntervalMs` warns on every call (single call-site today,
   so once per start — fine as-is); message string hardcodes "30000ms default".

## Probe-area conclusions

1. **recallSearchDedupeKey** — sound. Scope folding does not break same-scope reformulation
   suppression (identical scope params → identical JSON → collapsed); widened/re-scoped searches
   intentionally pass. No param-shape found that collapses two *different* searches beyond intended
   equivalences (query-key aliases `query/q/text/search` are excluded from scope by design; case and
   key-order are normalized via uppercase family + stable stringify; `undefined`/`NaN` values
   serialize stably per probe P4 and collapse only with semantically-absent equivalents). Over-allow
   (different-but-equivalent scope spellings, `100` vs `"100"`, array order) is the safe direction
   everywhere I probed. Residual dependence: `stableJsonStringify` and `DEFAULT_SUBACTION_KEYS`
   implementations are outside the delta; both are pinned by in-diff tests.
2. **successfulRecallResultHasContent** — direction-correct for the shapes it can see (numeric gate
   authoritative; `count:0`+prose does not seed — matches code order and probe P2). Residual risks
   are findings 1-2 (prose-only misses, `total` semantics) and depend on handler shapes not in the delta.
3. **Evaluator retry accounting** — clean. Exactly one `reportEvaluatorUsage` per model call; the old
   tail double-report is deleted; no path reports twice or loses usage (late-throwing parse/repair
   now happens *after* usage was reported — an improvement). Provider-gated fallback preserves the
   first raw for the protocol-failure path; TypeError/budget-class errors propagate (pinned by
   tests). One retry max, verified against `retryMaxTokens` for the second truncation check.
4. **Budget accounting** — correct. Executed rounds count failures and archived steps; near-dup skip
   short-circuits before `plannedRounds++` (consumes nothing); in-batch allowed calls seed the key
   set so batch dups are caught; non-recall calls pass through at any budget; `deadRounds` resets
   whenever anything is allowed. Integration tests (5-mock and dup+follow-up scenarios) are
   internally consistent with the implementation, including the forced-synthesis call count.
5. **Autonomy knobs** — correct parsing/clamping/warn-once semantics; override applied in `start()`
   before actor registration per the diff's placement; test pins both warn messages and the
   once-guard on model size.

## Challenge to the external verification data

Every claim cross-checkable against the diff text holds: numeric-gate precedence, dedupe-before-budget
ordering, in-batch seeding, per-call usage, alias exclusion, stable serialization, undefined/NaN
stability. Two claims remain accepted on trust because their subjects are not in the delta: (a) the
80/80 + full-suite/typecheck/biome-green results, and (b) that `searchMemoryAction`'s real success
shape is covered by the chosen keys (see finding 1 — this is the one I'd most like pinned by a test).
The probes' cap-3 vs default cap-2 is a harness parameter choice, not a discrepancy.
