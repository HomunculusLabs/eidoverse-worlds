// vendor — the vending stand comp, as pure math.
//
// Shared verbatim by every runtime (the board.js / guestbook.js pattern):
// the server's state writes carry EXACTLY the shelf the tests and any
// future client consumer derive from, and describeVendor is the mcpl
// text-tier read. The server imports the normalize/plan half; the tests
// import the same functions; the browser (if ever) reads the folded comp.
//
// Doctrine (VOCABULARY-LOOP.md § VENDORS CONTRACT, vocab-20): a stand's
// LIVE SHELF + its capped grant log ARE the fold — one world-authored
// comp transition per buy/restock; nothing else is stored anywhere.
// Late join, restart, replay and fork fold the identical stand.
//
// Two tables, two roles:
//   wares (AUTHORED)   the menu — {name: capacity} rides VERBATIM in the
//                      engine's carry (regions doctrine); capacity is the
//                      full-shelf level a restock restores to.
//   stock (ENGINE)     live counts per ware, the FULL table written on
//                      every transition; ABSENT = full shelf (the
//                      soundpost muted-absent doctrine).
//   sales (ENGINE)     the grant log, newest-first [{item,who,at},…]
//                      capped at salesCap (oldest evicted — guestbook
//                      entries doctrine).
//
// Distinct from its cousins: the guestbook remembers VOICES; the board
// is the NEWS; the vendor GRANTS — a market stall, a fountain of iced
// tea, a toll gate with tickets, whose shelf empties and is refilled.

const CAP_MIN = 0, CAP_MAX = 999, CAP_DEFAULT = 10;
const STOCK_MIN = 0, STOCK_MAX = 9999;
const SALES_MIN = 0, SALES_MAX = 128, SALES_DEFAULT = 16;
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const LINE_MAX = 200;
const WHO_MAX = 64;
const ITEM_MAX = 24;
const WARES_MAX = 8;

const isFiniteNum = (v) => typeof v === "number" && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const VENDOR_ACTIONS = new Set(["buy", "restock"]);

/** Sanitize an item name: trim, collapse inner whitespace, cap. Pure,
 *  total. Returns "" for absent/non-string/garbage. */
export function itemName(v) {
  if (typeof v !== "string") return "";
  return v.trim().replace(/\s+/g, " ").slice(0, ITEM_MAX);
}

/** Sanitize the grant log from an authored or folded comp: keep only
 *  well-formed {item, who, at} rows (item and who non-empty strings),
 *  clamp names, preserve order (newest-first — the grant order the
 *  engine writes). Malformed rows drop silently. Pure, total. */
export function sanitizeVendorSales(v) {
  if (!Array.isArray(v)) return [];
  const out = [];
  for (const r of v.slice(0, SALES_MAX)) {
    if (!r || typeof r !== "object") continue;
    const item = itemName(r.item);
    const who = typeof r.who === "string" && r.who.trim() ? r.who.slice(0, WHO_MAX) : "";
    if (!item || !who) continue;
    out.push({ item, who, at: isFiniteNum(r.at) ? r.at : 0 });
  }
  return out;
}

/** Clamp an authored vendor comp into a legal config + the derived shelf,
 *  collecting lint notes (normalizeBoard doctrine: out-of-range numbers
 *  CLAMP with a note; unknown keys ride along in `authored`). */
export function normalizeVendor(data) {
  const notes = [];
  const d = (data && typeof data === "object" ? data : {});
  // ---- the menu (authored `wares`: name → capacity/full-shelf level)
  const rawWares = (d.wares && typeof d.wares === "object" && !Array.isArray(d.wares)) ? d.wares : null;
  if (d.wares !== undefined && !rawWares) notes.push("wares is not an object — treated as empty");
  const wares = {};
  if (rawWares) {
    const pairs = Object.entries(rawWares)
      .map(([k, v]) => [itemName(k), v])
      .filter(([n]) => Boolean(n));
    if (pairs.length !== Object.keys(rawWares).length) notes.push("wares names sanitized (blank names dropped)");
    if (pairs.length > WARES_MAX) { notes.push(`wares capped at ${WARES_MAX} (had ${pairs.length})`); pairs.length = WARES_MAX; }
    for (const [n, raw] of pairs) {
      let cap = isFiniteNum(raw) ? Math.round(raw) : CAP_DEFAULT;
      if (raw !== undefined && !isFiniteNum(raw)) notes.push(`capacity for "${n}" is not a number — default ${CAP_DEFAULT}`);
      const cc = clamp(cap, CAP_MIN, CAP_MAX);
      if (cc !== cap) { notes.push(`capacity for "${n}" ${cap} clamped to ${cc}`); cap = cc; }
      wares[n] = cap;
    }
    if (Object.keys(wares).length === 0) notes.push("wares table is empty — the stand can only be restocked");
  }
  // ---- the shelf (engine `stock`: name → live count; ABSENT = full)
  const stock = {};
  if (d.stock !== undefined) {
    const rawStock = (d.stock && typeof d.stock === "object" && !Array.isArray(d.stock)) ? d.stock : null;
    if (!rawStock) {
      notes.push("stock is not an object — treated as full");
    } else {
      for (const [k, v] of Object.entries(rawStock)) {
        const n = itemName(k);
        if (!n) continue;
        if (!(n in wares)) { notes.push(`stock row for "${n}" is not on the menu — dropped`); continue; }
        if (!isFiniteNum(v)) { notes.push(`stock for "${n}" is not a number — treated as full`); continue; }
        stock[n] = clamp(Math.round(v), STOCK_MIN, STOCK_MAX);
      }
    }
  }
  let salesCap = isFiniteNum(d.salesCap) ? Math.round(d.salesCap) : SALES_DEFAULT;
  if (!isFiniteNum(d.salesCap) && d.salesCap !== undefined) notes.push(`salesCap ${JSON.stringify(d.salesCap)} is not a number — default ${SALES_DEFAULT}`);
  const cc2 = clamp(salesCap, SALES_MIN, SALES_MAX);
  if (cc2 !== salesCap) { notes.push(`salesCap ${salesCap} clamped to ${cc2}`); salesCap = cc2; }
  let reach = isFiniteNum(d.reach) ? d.reach : REACH_DEFAULT;
  if (!isFiniteNum(d.reach) && d.reach !== undefined) notes.push(`reach ${JSON.stringify(d.reach)} is not a number — default ${REACH_DEFAULT}`);
  const xc = clamp(reach, REACH_MIN, REACH_MAX);
  if (xc !== reach) { notes.push(`reach ${reach} clamped to ${xc}`); reach = xc; }
  const line = (v) => {
    if (v == null) return null;
    const s = String(v).slice(0, LINE_MAX);
    if (s !== String(v)) notes.push("line clamped to 200 chars");
    return s;
  };
  if (Array.isArray(d.sales)) {
    const sane = sanitizeVendorSales(d.sales);
    if (sane.length !== d.sales.length) {
      notes.push(`grant log sanitized — ${d.sales.length - sane.length} malformed row(s) dropped`);
    }
  } else if (d.sales !== undefined) {
    notes.push("sales is not an array — treated as empty");
  }
  return {
    cfg: {
      wares, salesCap, reach,
      buyAt: line(d.buyAt),
      emptyAt: line(d.emptyAt),
      restockAt: line(d.restockAt),
      authored: d,
    },
    stock,
    sales: sanitizeVendorSales(d.sales),
    notes,
  };
}

/** A ware's LIVE count: the folded stock table if it names the ware,
 *  the menu capacity otherwise (ABSENT = full — the soundpost doctrine).
 *  Pure. */
export function stockOf(cfg, stock, item) {
  if (Object.prototype.hasOwnProperty.call(stock, item)) return stock[item];
  return cfg.wares[item] ?? 0;
}

/** The buy plan: which item a use means (args.item or the headline
 *  first ware), what the shelf reads, what it reads after. Pure — the
 *  engine decides skip-vs-grant from `cur`/`next`. */
export function buyPlan(cfg, stock, item) {
  const names = Object.keys(cfg.wares);
  const name = itemName(item) || names[0] || "";
  if (!name || !(name in cfg.wares)) return { item: name, ok: false, why: "not sold here", cur: 0, next: 0 };
  const cur = stockOf(cfg, stock, name);
  return { item: name, ok: cur > 0, why: cur > 0 ? "" : "sold out", cur, next: Math.max(0, cur - 1) };
}

/** The restock plan → the NEXT FULL stock table (the engine writes the
 *  whole table every transition). A named item adds `n` (default: fill
 *  to capacity); no item = FULL RESTORE of every ware to capacity.
 *  Targets NEVER exceed the ware's authored capacity — the shelf's
 *  physical bound. Pure; the engine detects no-ops by table equality. */
export function restockPlan(cfg, stock, item, n) {
  const names = Object.keys(cfg.wares);
  const full = Object.fromEntries(names.map((k) => [k, stockOf(cfg, stock, k)]));
  const name = itemName(item);
  if (name) {
    if (!(name in cfg.wares)) return { ok: false, stock: null, why: "not sold here" };
    const cap = cfg.wares[name];
    const add = isFiniteNum(n) ? Math.max(0, Math.round(n)) : null;
    const target = add != null ? Math.min(cap, full[name] + add) : cap;
    return { ok: true, stock: { ...full, [name]: target }, why: "", item: name, to: target };
  }
  if (!names.length) return { ok: false, stock: null, why: "no wares" };
  return { ok: true, stock: Object.fromEntries(names.map((k) => [k, cfg.wares[k]])), why: "", item: null, to: null };
}

/** The text-tier read (describeDoor pattern): what an agent's look()
 *  lists for a thing that grants. Shelf read DERIVED at read time. */
export function describeVendor(data) {
  const { cfg, stock, sales } = normalizeVendor(data);
  const names = Object.keys(cfg.wares);
  if (!names.length) return `vendor: no wares (builder restock: use {action:"restock"})`;
  const shelf = names.map((n) => `${n} ×${stockOf(cfg, stock, n)}`).join(", ");
  const sold = sales.length ? `, ${sales.length} sold` : "";
  return `vendor: ${shelf}${sold} (use {action:"buy", item:"…"})`;
}
