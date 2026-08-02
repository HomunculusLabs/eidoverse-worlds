/**
 * RFC-001 / SPEC §16 conformance checks for what this door declares and emits.
 * No servers, no sockets — the declaration is data, so it can just be read.
 *
 * Run: cd mcpl && bun run tags-test.ts
 */

import { CHAT, EIDO, tags, senderTag, FEATURE_SETS, MCPL_ADVERTISEMENT } from "./tags.ts";

/** SPEC §6.2 / Appendix B.2 — the complete `uses` enum, transcribed. A feature
 *  set whose `uses` is absent, empty, or carries anything not on this list is
 *  INVALID, and the host disables it with reason `invalid_uses` (§6.6). */
const VALID_USES = new Set([
  "pushEvents", "tools", "modelInfo",
  "inferenceRequest", "inferenceRequest.streaming", "inferenceLifecycle",
  "contextHooks.beforeInference.observe",
  "contextHooks.beforeInference.inject.system",
  "contextHooks.beforeInference.inject.beforeUser",
  "contextHooks.beforeInference.inject.afterUser",
  "channels.register", "channels.lifecycle", "channels.publish",
  "channels.incoming", "channels.streaming", "channels.acknowledge",
  "channels.typing",
]);

let failures = 0;
const check = (label: string, ok: boolean, detail?: string) => {
  console.log(ok ? `  \x1b[32m✓\x1b[0m ${label}` : `  \x1b[31m✗ ${label}${detail ? ` — ${detail}` : ""}\x1b[0m`);
  if (!ok) failures++;
};

console.log("\nfeature sets (§6.1, §6.2, §6.4)");
{
  const names = Object.keys(FEATURE_SETS);
  check("at least one feature set is declared", names.length > 0);
  for (const [name, fs] of Object.entries(FEATURE_SETS)) {
    check(`${name}: description is present and non-empty (§6.2 required)`,
      typeof fs.description === "string" && fs.description.trim().length > 0);
    check(`${name}: uses is non-empty (§6.4.1 — absent or empty ⇒ invalid_uses)`,
      Array.isArray(fs.uses) && fs.uses.length > 0);
    const bad = (fs.uses as string[]).filter((u) => !VALID_USES.has(u));
    check(`${name}: every uses value is in the §6.2 vocabulary`, bad.length === 0, bad.join(", "));
    check(`${name}: uses has no duplicates`, new Set(fs.uses).size === fs.uses.length);
  }
}

console.log("\nadvertisement (§5.1)");
{
  const adv = MCPL_ADVERTISEMENT as unknown as Record<string, any>;
  check("channels is advertised as leaves, not a bare boolean",
    adv.channels !== null && typeof adv.channels === "object");
  // Nothing may be claimed that no code path implements. `channels.acknowledge`
  // and `channels.typing` have no handler and no sender in this door.
  check("channels.acknowledge is not claimed", adv.channels.acknowledge !== true);
  check("channels.typing is not claimed", adv.channels.typing !== true);
  check("pushEvents is not claimed (this door never sends push/event)", adv.pushEvents !== true);
  const declared = new Set(Object.values(FEATURE_SETS).flatMap((f) => f.uses as string[]));
  for (const leaf of ["register", "lifecycle", "publish", "incoming", "streaming"]) {
    check(`channels.${leaf}: advertised ⇔ named in some feature set's uses`,
      (adv.channels[leaf] === true) === declared.has(`channels.${leaf}`));
  }
}

console.log("\ntag vocabulary (§16.1)");
{
  const declaredTags = [
    ...(Object.values(FEATURE_SETS).flatMap((f) => f.tagOntology?.coreTags ?? [])),
    ...(Object.values(FEATURE_SETS).flatMap((f) => Object.keys(f.tagOntology?.tags ?? {}))),
    ...Object.values(CHAT), ...Object.values(EIDO),
  ];
  const bare = declaredTags.filter((t) => !t.includes(":"));
  check("no un-namespaced tag anywhere (a bare \"mention\" is not a tag)", bare.length === 0, bare.join(", "));
  const wrongNs = declaredTags.filter((t) => !/^(chat|mcpl|eidoverse):/.test(t));
  check("every namespace is `chat:` (reserved), `mcpl:` (reserved) or `eidoverse:` (ours)",
    wrongNs.length === 0, wrongNs.join(", "));
  const ownDescribed = Object.keys(FEATURE_SETS["eidoverse.world"]!.tagOntology?.tags ?? {});
  check("every eidoverse:* tag we can emit is described in the ontology",
    Object.values(EIDO).every((t) => ownDescribed.includes(t)),
    Object.values(EIDO).filter((t) => !ownDescribed.includes(t)).join(", "));
}

console.log("\nontology is advisory, never authority (§16.3, §16.5, §16.6)");
{
  const ont = FEATURE_SETS["eidoverse.world"]!.tagOntology!;
  // §16.3: a producer-declared `implies` edge into a reserved chat:* tag is how
  // a server would promote its own traffic into the band a consumer reserved
  // for being spoken to. We declare none at all and emit the core tags directly.
  const anyImplies = Object.values(ont.tags ?? {}).some((d) => "implies" in (d as object));
  check("no producer-declared `implies` edges", !anyImplies);
  check("the ontology is open-world (hosts must tolerate undescribed tags)", ont.open === true);
  check("suggestedTreatment exists as a hint and is a plain rule list",
    Array.isArray(ont.suggestedTreatment));
}

console.log("\ncore closure hygiene (§16.3 mutual exclusion)");
{
  check("chat:ambient is dropped beside chat:mention",
    !tags(CHAT.ambient, CHAT.mention).includes(CHAT.ambient), tags(CHAT.ambient, CHAT.mention).join(","));
  check("chat:ambient is dropped beside chat:dm",
    !tags(CHAT.ambient, CHAT.dm).includes(CHAT.ambient));
  check("chat:ambient is dropped beside chat:addressed",
    !tags(CHAT.ambient, CHAT.addressed).includes(CHAT.ambient));
  check("chat:ambient survives on its own",
    tags(CHAT.ambient, EIDO.activityDigest).includes(CHAT.ambient));
  check("tags are a deduplicated set", tags(CHAT.ambient, CHAT.ambient).length === 1);
  check("undefined parts (e.g. an unknown sender) drop out",
    tags(CHAT.ambient, undefined, senderTag(undefined)).length === 1);
}

console.log("\nsender facet is never invented (§16.6)");
{
  check("unknown speaker ⇒ no sender tag", senderTag(undefined) === undefined);
  check("agent ⇒ chat:from-agent", senderTag(true) === CHAT.fromAgent);
  check("human ⇒ chat:from-human", senderTag(false) === CHAT.fromHuman);
}

console.log(failures ? `\n\x1b[31m${failures} failure(s)\x1b[0m` : "\n\x1b[32mall checks passed\x1b[0m");
process.exit(failures ? 1 : 0);
