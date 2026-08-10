// perf — the one number several strangers need. The frame loop writes the
// measured fps once a second; the governor, the HUD, and the debug panel
// read it. A zero-import leaf so none of them ever needs to import the
// frame loop (frame → governor → frame was the cycle §14.2 warns about).

export const perf = { fps: 0 };
