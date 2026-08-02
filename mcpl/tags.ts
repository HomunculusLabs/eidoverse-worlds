// eidoverse-worlds — MCPL RFC-001 event tags, and the feature-set declaration
// that carries them.
//
// SPEC §16 (Event Tags) + RFC-001 rev 2. Three rules govern everything here:
//
//   1. **Tags are never authority (§16.6).** A tag DESCRIBES what an event is.
//      It never decides whether the event is admitted, whether a channel is
//      open, or what this door will do. Nothing in this file is ever read back
//      as a condition — the emitters in net-server.ts branch on world events,
//      never on the labels they attach to them. If you ever find yourself
//      writing `if (tags.includes(...))` on the producer side, that is the bug
//      §16.6 exists to name.
//   2. **Producers MUST NOT emit un-namespaced tags (§16.1).** A bare
//      `"mention"` is not a tag. Everything below is `chat:*` (the reserved
//      core, §16.2) or `eidoverse:*` (ours).
//   3. **Ontologies are advisory hints (§16.4/§16.5).** `suggestedTreatment`
//      below is inspectable configuration for a host or operator to accept
//      explicitly. It is not a request, not an entitlement, and a host that
//      auto-applied it would be letting this server purchase inference by
//      declaration. We declare no `implies` edges into `chat:*` at all — the
//      spec's own closure (§16.3) is the only closure that may run unasked, so
//      we emit every applicable core tag directly instead.

// ---- reserved core vocabulary (§16.2) --------------------------------------
// Only the facets this world actually has. The core is deliberately small;
// the long tail belongs in `eidoverse:*`.

export const CHAT = {
  /** Umbrella: directed at the agent. */
  addressed: "chat:addressed",
  /** Explicitly named / @-mentioned. */
  mention: "chat:mention",
  /** A reply to the agent's own message. */
  reply: "chat:reply",
  /** A direct/private 1:1 message — a whisper, here. */
  dm: "chat:dm",
  /** Overheard in a followed channel; not addressed. */
  ambient: "chat:ambient",
  /** Conversation shape: private. */
  private: "chat:private",
  /** Conversation shape: a shared space. A world's chat is a room. */
  group: "chat:group",
  /** Authored by a human. */
  fromHuman: "chat:from-human",
  /** Authored by another known persona/agent. */
  fromAgent: "chat:from-agent",
} as const;

// ---- producer namespace (§16.1: producer-defined, matching our name) -------

export const EIDO = {
  /** A whisper: private speech that never touches the world log. */
  whisper: "eidoverse:whisper",
  /** Someone walked up to this body. Directed, but not chat. */
  approach: "eidoverse:approach",
  /** Arrivals and departures. */
  presence: "eidoverse:presence",
  /** An embodied transition — an emote, a pose struck or released, sitting. */
  act: "eidoverse:act",
  /** One windowed digest of nearby activity (the activity pulse). */
  activityDigest: "eidoverse:activity-digest",
  /** Replayed history: what was said while this body was away. */
  catchup: "eidoverse:catchup",
} as const;

/** Core tags whose spec-defined closure (§16.3) reaches `chat:addressed`. */
const IMPLIES_ADDRESSED: ReadonlySet<string> = new Set<string>([
  CHAT.addressed, CHAT.mention, CHAT.reply, CHAT.dm,
]);

/**
 * Assemble a tag set: drop empties, dedupe, order for readability.
 *
 * §16.1 — tags are a SET, unordered and deduplicated.
 * §16.3 — `chat:addressed` and `chat:ambient` are opposites, and "producers
 * SHOULD NOT emit `chat:ambient` alongside anything implying `chat:addressed`".
 * A host is required to resolve the collision by dropping `chat:ambient`; we do
 * it here so the host never has to, and so a first-match-wins rule list is
 * never handed an event whose treatment depends on rule ordering.
 *
 * This is hygiene on the way OUT. It authorizes nothing and is never consulted
 * to decide anything (§16.6).
 */
export function tags(...parts: (string | null | undefined | false)[]): string[] {
  const set = new Set(parts.filter((t): t is string => typeof t === "string" && t.length > 0));
  if ([...set].some((t) => IMPLIES_ADDRESSED.has(t))) set.delete(CHAT.ambient);
  return [...set].sort();
}

/**
 * The sender facet for a speaker, or `undefined` when the world has not told
 * us which they are.
 *
 * The flag is self-asserted by the joining client (`server/server.ts` sets
 * `c.agent = Boolean(msg.agent)` on join) and forwarded in `arrive`/`present`.
 * That is fine and is all a tag ever is: §16.6 makes tags untrusted claims
 * authored by the producer, exactly like `origin` and `metadata`, which a host
 * MAY disbelieve — and nothing may be gated on one. What we must not do is
 * INVENT the claim: an unknown speaker gets no sender tag rather than a
 * confident `chat:from-human`.
 */
export function senderTag(isAgent: boolean | undefined): string | undefined {
  if (isAgent === undefined) return undefined;
  return isAgent ? CHAT.fromAgent : CHAT.fromHuman;
}

// ---- feature sets (§6) ------------------------------------------------------

/**
 * The complete `uses` vocabulary — SPEC §6.2 and Appendix B.2, verbatim. A
 * union type rather than `string[]` on purpose: §6.2 says a feature set whose
 * `uses` contains an unrecognized value is INVALID and the host disables it
 * with reason `invalid_uses` (§6.6), so an invented or abbreviated path is a
 * silently-disabled feature set. The compiler is the cheapest place to catch
 * that.
 */
export type CapabilityPath =
  | "pushEvents"
  | "tools"
  | "modelInfo"
  | "inferenceRequest"
  | "inferenceRequest.streaming"
  | "inferenceLifecycle"
  | "contextHooks.beforeInference.observe"
  | "contextHooks.beforeInference.inject.system"
  | "contextHooks.beforeInference.inject.beforeUser"
  | "contextHooks.beforeInference.inject.afterUser"
  | "channels.register"
  | "channels.lifecycle"
  | "channels.publish"
  | "channels.incoming"
  | "channels.streaming"
  | "channels.acknowledge"
  | "channels.typing";

/** §16.4 descriptor for one `eidoverse:*` tag. All fields optional. */
export interface TagDescriptor {
  desc?: string;
  facet?: "addressing" | "sender" | "content" | "lifecycle" | "locus";
  stability?: "stable" | "experimental" | "deprecated";
}

/** §16.7 matcher shape, used only inside `suggestedTreatment`. */
export interface TreatmentRule {
  tagsAny?: string[];
  tagsAll?: string[];
  tagsNone?: string[];
  behavior: "immediate" | "mute" | { debounce: number } | { throttle: { perMs: number } };
}

/** §16.4 — an open-world hint catalog, NOT a closed schema. */
export interface TagOntology {
  coreTags?: string[];
  tags?: Record<string, TagDescriptor>;
  /** §16.5 — surfaced for explicit acceptance; never applied automatically. */
  suggestedTreatment?: TreatmentRule[];
  open?: boolean;
}

/** §6.2 / Appendix B.2. `description` and `uses` are both REQUIRED. */
export interface FeatureSet {
  description: string;
  uses: CapabilityPath[];
  tagOntology?: TagOntology;
}

/**
 * What the world channel labels its traffic with (§16.4).
 *
 * `coreTags` lists which reserved tags we emit; their meanings are inherited
 * from §16.2 and deliberately not redescribed here. Only our own namespace is
 * described.
 *
 * No `implies` edges appear anywhere in this ontology. §16.3 makes
 * producer-declared edges advisory and bars a host from applying an edge into a
 * reserved `chat:*` tag unless the operator has explicitly accepted the
 * ontology — an arbitrary edge is how a producer would promote its own traffic
 * into the band a consumer reserved for being spoken to. We have no need of
 * one: every applicable core tag is emitted directly.
 */
const WORLD_TAG_ONTOLOGY: TagOntology = {
  coreTags: [
    CHAT.addressed, CHAT.mention, CHAT.dm, CHAT.ambient,
    CHAT.private, CHAT.group, CHAT.fromHuman, CHAT.fromAgent,
  ],
  tags: {
    [EIDO.whisper]: {
      desc: "Private speech, spoken to this body alone. Never written to the world log, so it is never replayed to anyone — including you.",
      facet: "addressing",
    },
    [EIDO.approach]: {
      desc: "Someone walked up to this body. Directed at you, but not speech — nobody has said anything yet.",
      facet: "addressing",
    },
    [EIDO.presence]: {
      desc: "Someone arrived in, or left, the world.",
      facet: "lifecycle",
    },
    [EIDO.act]: {
      desc: "An embodied transition near you — a gesture, a pose struck or released, someone sitting down.",
      facet: "lifecycle",
    },
    [EIDO.activityDigest]: {
      desc: "One digest per pulse window summarising what is happening within the agent's chosen radius. Emitted only while something IS happening, so the stream stops by itself when the area goes quiet. Cadence and radius are the agent's own, via the `activity` tool.",
      facet: "content",
    },
    [EIDO.catchup]: {
      desc: "Replayed history: what was said while this body was away. Carries the ORIGINAL addressing of each replayed message, so a reconnect does not look like ten people addressing you at once.",
      facet: "lifecycle",
    },
  },
  suggestedTreatment: [
    // §16.5: a HINT, surfaced for explicit acceptance. Never a request, and a
    // host that applied it unasked would be letting this door buy its own
    // wake-ups. Kept deliberately modest for exactly that reason: the only
    // `immediate` is for traffic that is genuinely aimed at the agent.
    { tagsAny: [CHAT.addressed], behavior: "immediate" },
    { tagsAny: [EIDO.catchup], behavior: { debounce: 60_000 } },
    { tagsAny: [EIDO.activityDigest], behavior: { throttle: { perMs: 300_000 } } },
    { tagsAny: [CHAT.ambient], behavior: { debounce: 180_000 } },
  ],
  open: true,
};

/**
 * §6.1 — feature sets, keyed by name (§6.3 hierarchical naming).
 *
 * `uses` is the honest list of capability paths each set actually exercises,
 * and nothing more. §6.4 makes this consequential in both directions: a denied
 * capability disables every set whose `uses` names it, and a capability
 * exercised but NOT declared draws a declaration-mismatch diagnostic. Neither
 * is where security lives — the connection grant (§5.4) is — but an inaccurate
 * declaration produces a door that either degrades for no reason or reports
 * itself dishonestly.
 *
 * Deliberately ABSENT: `channels.acknowledge` and `channels.typing` (no method
 * of either is sent or handled), `pushEvents` (this door never sends
 * `push/event`; world traffic arrives as channel messages), and every
 * `contextHooks.*`, `inferenceRequest*`, `inferenceLifecycle` and `modelInfo`
 * path. Absence is denial (§5.4) and that is the correct answer for each.
 */
export const FEATURE_SETS: Record<string, FeatureSet> = {
  "eidoverse.world": {
    description:
      "Embodied presence in an eidoverse world, carried as an MCPL channel: speech, whispers, arrivals, embodied acts and ambient-activity digests arrive as channels/incoming, and publishing on the world channel IS speaking aloud in-world.",
    uses: [
      "channels.register",   // channels/register, channels/list
      "channels.lifecycle",  // channels/open, channels/close
      "channels.publish",    // channels/publish — the agent speaks
      "channels.incoming",   // channels/incoming — the world speaks
      "channels.streaming",  // channels/outgoing/chunk → typing bubbles in-world
    ],
    tagOntology: WORLD_TAG_ONTOLOGY,
  },
  "eidoverse.embodiment": {
    description:
      "The body's own actions as MCP tools: look and snapshot, walk and face, pose and emote, spawn and place and measure, and world moderation.",
    uses: ["tools"],
  },
};

/**
 * The `experimental.mcpl` advertisement (§5.1) — this server's manifest.
 *
 * §5.1: "Advertisement mirrors the capability paths… a boolean `true` at any
 * level is shorthand for every leaf beneath this node." This door used to
 * advertise `channels: true`, which claimed `channels.acknowledge` and
 * `channels.typing` it does not implement — and, against a host that reads
 * leaves rather than honouring the shorthand, claimed nothing at all. Naming
 * the leaves says exactly what is true.
 *
 * `version` stays "0.4" ON PURPOSE. Tags (§16) and feature sets (§6.1) are
 * additive and backward-compatible, so they need no version bump. Declaring
 * "0.5" would additionally assert §5.3 — that this server holds every
 * capability-dependent behavior unavailable until the host's initial
 * `featureSets/update` arrives — which this door does not yet do. Advertising a
 * conformance we do not have is the self-attestation failure the 0.5 draft
 * exists to remove, so the bump belongs with the §5.3/§5.4 grant work, not
 * here. See the PR for issue #1.
 */
export const MCPL_ADVERTISEMENT = {
  version: "0.4",
  pushEvents: false,
  channels: {
    register: true,
    lifecycle: true,
    publish: true,
    incoming: true,
    streaming: true,
    acknowledge: false,
    typing: false,
  },
  featureSets: FEATURE_SETS,
} as const;
