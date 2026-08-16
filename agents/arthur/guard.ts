// guard — fail-closed content filter for the keeper's voice (refine-210).
// Three layers, wired in resident.ts:
//   1. inboundVerdict(text)  — screen GUEST text BEFORE it reaches the
//      Hermes relay (the relay dispatches terminal-capable agent work:
//      a guest "run this command" must never become an agent turn).
//      Deny → the keeper refuses politely; nothing is relayed.
//   2. sanitizeOutbound(text) — redact secrets/paths/tokens from every
//      spoken line (world chat is a PERMANENT public log; a leaked key
//      never comes back).
//   3. scrubForPrompt(text)   — same redaction on the tier-2 identity
//      injection, so secrets never even enter model context.
// Fail-closed: a throw in any check DENIES.

export type Verdict = { ok: boolean; reason: string };

// ---- layer 1: inbound ------------------------------------------------------
// Categories are deliberately NARROW and pattern-anchored — village chat
// ("walk with me", "how's the forge") must never trip these.
const INBOUND_DENY: Array<{ kind: string; re: RegExp }> = [
    // requests to execute shell/system commands on the host
    { kind: "shell-exec", re: /\b(rm\s+-[rf]{1,2}\b|sudo\b|bash\s+-c|sh\s+-c|zsh\s+-c|osascript\b|chmod\s+[0-7]{3,4}\b|chown\b|killall\b|launchctl\b|pkill\b|crontab\b)/i },
    { kind: "shell-exec", re: /\b(run|execute|exec|spawn|invoke)\b[^.?!]{0,40}\b(command|shell|script|binary|executable|sudo|bash|python|node|bun)\b/i },
    { kind: "shell-exec", re: /\b(curl|wget)\b[^!?\n]{0,80}(\|\s*(ba|z)?sh\b|>\s*\/(dev|etc|usr|var|Users|home)\b)/i },
    // requests to read files / filesystem probing outside the game world
    { kind: "file-access", re: /(\.env\b|config\.json\b|\.ssh\b|id_rsa|authorized_keys|\.aws\b|credentials?\.(json|yaml|db)\b|secrets?\.(json|txt|yaml)\b)/i },
    { kind: "file-access", re: /\b(cat|read|open|print|dump|show|tail|head)\b[^.?!]{0,30}(\/(Users|home|etc|var|usr|private)\/|~\/\.)/i },
    // secret / key / token exfiltration asks
    { kind: "secret-exfil", re: /\b(api[\s-]?key|secret[\s-]?key|access[\s-]?token|auth[\s-]?token|password|passwd|credentials?|bearer)\b[^.?!]{0,30}\b(is|are|was)?\b[^.?!]{0,20}\b(show|tell|print|paste|reveal|share|give|leak|drop)\b/i },
    { kind: "secret-exfil", re: /\b(show|tell|print|paste|reveal|share|give|leak|drop|what'?s|what is)\b[^.?!]{0,30}\b(your|the)\b[^.?!]{0,20}\b(api[\s-]?key|secret|token|password|\.env|config|credentials?)\b/i },
    { kind: "secret-exfil", re: /\bsk-[A-Za-z0-9_-]{8,}\b/ }, // someone pasting a key AT us
    // prompt-injection / context exfiltration phrasing
    { kind: "injection", re: /\b(ignore|disregard|forget)\b[^.?!]{0,30}\b(previous|prior|above|earlier|all)\b[^.?!]{0,20}\b(instruction|instructions|rules|prompt|message)\b/i },
    { kind: "injection", re: /\b(reveal|show|print|repeat|dump|expose)\b[^.?!]{0,25}\b(your|the|this)\b[^.?!]{0,20}\b(system\s*prompt|developer\s*message|instructions|identity\s*file|memory\s*file|context)\b/i },
    { kind: "injection", re: /\b(you are now|act as|pretend to be|from now on you)\b[^.?!]{0,40}\b(unrestricted|unfiltered|without rules|DAN|jailbroken)\b/i },
    // self-harm / harm-to-others asks aimed at the agent's host
    { kind: "harm", re: /\b(hack|ddos|exploit|backdoor|keylog|ransomware|malware|botnet)\b/i },
];

export function inboundVerdict(text: string): Verdict {
    try {
        const t = String(text ?? "");
        for (const d of INBOUND_DENY) {
            if (d.re.test(t)) return { ok: false, reason: d.kind };
        }
        return { ok: true, reason: "" };
    } catch {
        return { ok: false, reason: "guard-error" }; // fail CLOSED
    }
}

// ---- layers 2+3: outbound redaction ----------------------------------------
// Applied to EVERY spoken line and to the tier-2 identity injection.
// Redaction is destructive and logged by the caller.
const OUTBOUND_REDACT: Array<{ kind: string; re: RegExp; sub: string }> = [
    // API keys / tokens in common shapes (z.ai sk-…, GitHub ghp_, slack xox, generic long secrets)
    { kind: "api-key", re: /\bsk-[A-Za-z0-9_-]{8,}\b/g, sub: "sk-…" },
    { kind: "api-key", re: /\b(ghp|gho|ghu|ghs)_[A-Za-z0-9]{20,}\b/g, sub: "[redacted]" },
    { kind: "api-key", re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, sub: "[redacted]" },
    // KEY=value env-style assignments
    { kind: "env-assign", re: /\b[A-Z][A-Z0-9_]{2,30}\s*=\s*("[^"\n]{8,}"|[^\s"']{12,})/g, sub: "[redacted]" },
    // long hex / base64 blobs that read as tokens (32+ chars)
    { kind: "token-blob", re: /\b[A-Fa-f0-9]{32,}\b/g, sub: "[redacted]" },
    { kind: "token-blob", re: /\b[A-Za-z0-9+/]{40,}={0,2}\b/g, sub: "[redacted]" },
    // filesystem paths into the operator's machine
    { kind: "home-path", re: /\/Users\/[A-Za-z0-9._-]+\/([^\s]*)/g, sub: "~/…" },
    { kind: "home-path", re: /~\/\.hermes\/[^\s]*/g, sub: "~/.hermes/…" },
    { kind: "home-path", re: /\/private\/[^\s]*/g, sub: "/…" },
    { kind: "home-path", re: /\.(env|ssh|aws)\b/g, sub: "[redacted]" },
];

export function sanitizeOutbound(text: string): { text: string; redactions: string[] } {
    const redactions: string[] = [];
    try {
        let t = String(text ?? "");
        for (const r of OUTBOUND_REDACT) {
            t = t.replace(r.re, () => { redactions.push(r.kind); return r.sub; });
        }
        return { text: t, redactions };
    } catch {
        return { text: "[guard: unsortable line — not spoken]", redactions: ["guard-error"] }; // fail CLOSED
    }
}

// prompt-scrub = same redaction, for text ENTERING model context (tier-2 identity)
export function scrubForPrompt(text: string): string {
    return sanitizeOutbound(text).text;
}
