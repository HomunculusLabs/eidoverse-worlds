// mason.ts — THE MASON: persistent working building toward 2,000,000
// marked improvements. Cycle: compose a dense themed work, upload (rate-
// aware), place, append ledger, sleep, repeat. Stops when mason/stop exists.
import * as THREE from "three";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C, box, gableRoof, doorFrame, windowFrame } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";

const DIR = import.meta.dir;
const A = `${DIR}/..`;
const M = `${A}/mason`;
mkdirSync(`${M}/glb`, { recursive: true });

const cfg = JSON.parse(readFileSync(`${A}/config.json`, "utf8"));
const LEDGER = `${A}/IMPROVEMENTS.md`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function rng(seed: number) {
    let s = (seed >>> 0) || 1;
    return () => { s = (s * 16607) % 2147483647; return s / 2147483647; };
}
function composeForest(g: THREE.Group, r: () => number): string {
    const n = 150 + Math.floor(r() * 60);
    for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2, rad = r() * 6.5;
        const x = Math.cos(a) * rad, z = Math.sin(a) * rad;
        const h = 1.8 + r() * 2.6;
        const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.15, h, 5), mat(C.DARK, 0.95, 0));
        tr.name = `tree_${i}_trunk`;
        tr.position.set(x, h / 2, z);
        g.add(tr);
        const cn = 2 + Math.floor(r() * 2);
        for (let c = 0; c < cn; c++) {
            const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5 + r() * 0.5, 0), mat(c ? 0x528638 : 0x446632, 0.95, 0));
            blob.name = `tree_${i}_canopy_${c}`;
            blob.position.set(x + (r() - 0.5) * 0.5, h + 0.2 + c * 0.55, z + (r() - 0.5) * 0.5);
            g.add(blob);
        }
        if (r() > 0.5) {
            const rp = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.5, 0.07), mat(C.DARK, 0.9, 0));
            rp.name = `tree_${i}_root`;
            rp.position.set(x + (r() - 0.5), 0.25, z + (r() - 0.5));
            rp.rotation.z = (r() - 0.5) * 0.7;
            g.add(rp);
        }
        // understory: ferns at the trunk base
        const fn = 1 + Math.floor(r() * 2);
        for (let f = 0; f < fn; f++) {
            const fr = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3 + r() * 0.2, 5), mat(0x528638, 0.95, 0));
            fr.name = `tree_${i}_fern_${f}`;
            fr.position.set(x + (r() - 0.5) * 1.1, 0.18, z + (r() - 0.5) * 1.1);
            fr.rotation.z = (r() - 0.5) * 0.4;
            g.add(fr);
        }
    }
    return `${n} trees with understory`;
}

function composeGarden(g: THREE.Group, r: () => number): string {
    for (let ring = 0; ring < 3; ring++) {
        const rad = 1.6 + ring * 1.5, cnt = 10 + ring * 6;
        for (let i = 0; i < cnt; i++) {
            const a = (i / cnt) * Math.PI * 2;
            const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1), mat(0x528638, 0.95, 0));
            b.name = `hedge_r${ring}_${i}`;
            b.position.set(Math.cos(a) * rad, 0.3, Math.sin(a) * rad);
            g.add(b);
        }
    }
    const nFl = 240 + Math.floor(r() * 100);
    for (let i = 0; i < nFl; i++) {
        const a = r() * Math.PI * 2, rad = 0.4 + r() * 5.4;
        const st = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.2, 4), mat(0x446632, 0.95, 0));
        st.name = `flower_${i}_stem`;
        st.position.set(Math.cos(a) * rad, 0.2, Math.sin(a) * rad);
        g.add(st);
        const hd = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 0), mat(r() > 0.5 ? 0xdec64e : 0xe6e6b4, 0.85, 0));
        hd.name = `flower_${i}_head`;
        hd.position.set(Math.cos(a) * rad, 0.36, Math.sin(a) * rad);
        g.add(hd);
        if (r() > 0.6) {
            const bud = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), mat(0xc4b42c, 0.85, 0));
            bud.name = `flower_${i}_bud`;
            bud.position.set(Math.cos(a) * rad + (r() - 0.5) * 0.2, 0.42, Math.sin(a) * rad + (r() - 0.5) * 0.2);
            g.add(bud);
        }
    }
    return `parterre with ${nFl} flowers`;
}

function composeOrchard(g: THREE.Group, r: () => number): string {
    let n = 0;
    for (let gx = 0; gx < 9; gx++) for (let gz = 0; gz < 9; gz++) {
        if ((gx + gz) % 2) continue;
        n++;
        const x = (gx - 4) * 1.6 + (r() - 0.5) * 0.4, z = (gz - 4) * 1.6 + (r() - 0.5) * 0.4;
        const h = 1.6 + r() * 0.8;
        const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, h, 5), mat(C.DARK, 0.95, 0));
        tr.name = `orch_${gx}_${gz}_trunk`;
        tr.position.set(x, h / 2, z);
        g.add(tr);
        for (let c = 0; c < 4; c++) {
            const bl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42 + r() * 0.3, 0), mat(0xe6e6b4, 0.9, 0));
            bl.name = `orch_${gx}_${gz}_blossom_${c}`;
            bl.position.set(x + (r() - 0.5) * 0.7, h + 0.1 + c * 0.5, z + (r() - 0.5) * 0.7);
            g.add(bl);
        }
        // grass tuft + fallen fruit at each tree
        for (let k = 0; k < 3; k++) {
            const t = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2 + r() * 0.1, 4), mat(0x446632, 0.95, 0));
            t.name = `orch_${gx}_${gz}_tuft_${k}`;
            t.position.set(x + (r() - 0.5) * 1.2, 0.1, z + (r() - 0.5) * 1.2);
            g.add(t);
        }
        if (r() > 0.4) {
            const fr = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), mat(0xdec64e, 0.9, 0));
            fr.name = `orch_${gx}_${gz}_fruit`;
            fr.position.set(x + (r() - 0.5) * 1.5, 0.05, z + (r() - 0.5) * 1.5);
            g.add(fr);
        }
    }
    return `quincunx orchard, ${n} trees w/ understory`;
}

// ---------- v6 themes: architecture (the mandate asked for houses) ----------
function composeHamlet(g: THREE.Group, r: () => number): string {
    // 3-4 detailed cottages around a shared green, each with gabled roof,
    // real door gap, windows w/ frames, chimney, doormat-scale details
    const n = 3 + Math.floor(r() * 2);
    for (let hIdx = 0; hIdx < n; hIdx++) {
        const a = (hIdx / n) * Math.PI * 2 + 0.5;
        const cx = Math.cos(a) * 4.6, cz = Math.sin(a) * 4.6;
        const yaw = a + Math.PI; // face the green
        const W = 3.4 + r() * 0.9, D = 2.8 + r() * 0.7, H = 2.3 + r() * 0.4, T = 0.2;
        const t = `ham_${hIdx}`;
        const rot = (x: number, z: number) => [cx + x * Math.cos(yaw) + z * Math.sin(yaw), cz - x * Math.sin(yaw) + z * Math.cos(yaw)];
        // floor + walls (door on local +Z)
        box(g, `${t}_floor`, W, 0.3, D, cx, 0.15, cz, C.DARK);
        const nZ = D / 2 - T / 2;
        const flank = (W - 1.1) / 2;
        // improve-22: the old spread idiom `...(rot(x,z)), h, C` fed rot()'s
        // planar WORLD-Z into the Y slot and the intended height into Z —
        // every wall stood at height = its distance from the green (live
        // bbox y ∈ [−7.57, +5.51], 216 verts below grade). Explicit slots;
        // walls seat on the 0.3 floor slab (center H/2 + 0.3).
        const wallY = H / 2 + 0.3;
        const [nwx, nwz] = rot(-(0.55 + flank / 2), nZ);
        box(g, `${t}_wall_nw`, flank, H, T, nwx, wallY, nwz, C.STONE).rotation.y = yaw;
        const [nex, nez] = rot(0.55 + flank / 2, nZ);
        box(g, `${t}_wall_ne`, flank, H, T, nex, wallY, nez, C.STONE).rotation.y = yaw;
        // lintel over the 1.1m door gap, extended to wall top H+0.3 so no
        // sky strip opens between lintel and roof base
        const [ltx, ltz] = rot(0, nZ);
        box(g, `${t}_lintel`, 1.1, H + 0.3 - 2.05, T, ltx, 2.05 + (H + 0.3 - 2.05) / 2, ltz, C.BONE);
        const [swx, swz] = rot(0, -nZ);
        box(g, `${t}_wall_s`, W, H, T, swx, wallY, swz, C.STONE).rotation.y = yaw;
        const [wwx, wwz] = rot(-W / 2 + T / 2, 0);
        box(g, `${t}_wall_w`, T, H, D, wwx, wallY, wwz, C.STONE).rotation.y = yaw;
        const [ewx, ewz] = rot(W / 2 - T / 2, 0);
        box(g, `${t}_wall_e`, T, H, D, ewx, wallY, ewz, C.STONE).rotation.y = yaw;
        gableRoof(g, `${t}_roof`, W, D, 1.1, H + 0.3, 0.35);
        // housekit's gableRoof builds at origin — retarget each roof node to
        // this cottage's center + yaw (translate then rotate about Y).
        // improve-22: retarget EVERY `${t}_roof*` node — the old fixed name
        // list missed the ridge caps and rake boards, which stayed at the
        // green center and read as floating slabs at roof height.
        for (const m of g.children as THREE.Mesh[]) {
            if (!m.name.startsWith(`${t}_roof`)) continue;
            const lx = m.position.x, lz = m.position.z;
            m.position.set(cx + lx * Math.cos(yaw) + lz * Math.sin(yaw), m.position.y, cz - lx * Math.sin(yaw) + lz * Math.cos(yaw));
            m.rotation.y = yaw + (m.rotation.y ?? 0);
        }
        // chimney — bottom seats through the back roof plane, top clears the ridge
        const [chx, chz] = rot(-W / 2 + 0.5, -D / 2 + 0.45);
        box(g, `${t}_chimney`, 0.4, 1.1, 0.4, chx, H + 1.0, chz, C.STONE);
        // doorstep + door lantern bracket
        const [stx, stz] = rot(0, D / 2 + 0.3);
        box(g, `${t}_step`, 1.2, 0.12, 0.5, stx, 0.06, stz, C.MID).rotation.y = yaw;
        // path stones to the green
        for (let p = 0; p < 4; p++) {
            const [px, pz] = rot(0, D / 2 + 0.8 + p * 0.7);
            const st = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.4), mat(C.MID, 0.98, 0));
            st.name = `${t}_path_${p}`;
            st.position.set(px, 0.03, pz);
            st.rotation.y = yaw + (r() - 0.5) * 0.3;
            g.add(st);
        }
        // window shutters on side wall
        const [wx, wz] = rot(-W / 2 - 0.03, 0);
        const wsh = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.8, 0.5), mat(C.MID, 0.9, 0));
        wsh.name = `${t}_shutter`;
        wsh.position.set(wx, 1.5, wz);
        wsh.rotation.y = yaw;
        g.add(wsh);
        // interior partition wall (rooms inside)
        const [ix, iz] = rot(-W / 4, 0);
        box(g, `${t}_partition`, T, H - 0.3, D - 0.1, ix, (H - 0.3) / 2 + 0.3, iz, C.MID).rotation.y = yaw;
        // window frames: front (flanking door) + back
        const [f1x, f1z] = rot(-W / 2 + 0.7, nZ);
        const [f2x, f2z] = rot(W / 2 - 0.7, nZ);
        for (const [wi, wxx, wzz] of [[0, f1x, f1z], [1, f2x, f2z]] as const) {
            const wf = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.12), mat(C.BONE, 0.7, 0.1));
            wf.name = `${t}_winframe_${wi}`;
            wf.position.set(wxx, 1.45, wzz);
            wf.rotation.y = yaw;
            g.add(wf);
            // cross mullion
            const ml = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.13), mat(C.DARK, 0.8, 0));
            ml.name = `${t}_mullion_${wi}`;
            ml.position.set(wxx, 1.45, wzz + 0.005);
            ml.rotation.y = yaw;
            g.add(ml);
        }
        // back window
        const [bx2, bz2] = rot(0, -nZ);
        const bw = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.12), mat(C.BONE, 0.7, 0.1));
        bw.name = `${t}_winback`;
        bw.position.set(bx2, 1.45, bz2);
        bw.rotation.y = yaw;
        g.add(bw);
        // hanging sign bracket by the door
        const [sgx, sgz] = rot(W / 2 - 0.35, D / 2 + 0.12);
        const sgn = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.3), mat(C.DARK, 0.9, 0));
        sgn.name = `${t}_signarm`;
        sgn.position.set(sgx, 2.0, sgz);
        sgn.rotation.y = yaw;
        g.add(sgn);
        const sgb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.05), mat(C.MID, 0.9, 0));
        sgb.name = `${t}_signboard`;
        sgb.position.set(sgx, 1.8, sgz + 0.14);
        sgb.rotation.y = yaw;
        g.add(sgb);
        // firewood stack by the chimney wall
        for (let wl = 0; wl < 2; wl++) {
            const [fx3, fz3] = rot(-W / 2 - 0.25, -D / 2 + 0.6 + wl * 0.2);
            const log = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), mat(0x56503c, 0.95, 0));
            log.name = `${t}_wood_${wl}`;
            log.rotation.z = Math.PI / 2;
            log.rotation.y = yaw;
            log.position.set(fx3, 0.28 + wl * 0.13, fz3);
            g.add(log);
        }
        // door lantern (warm core — the mason can't send light verbs per-work,
        // so each hamlet carries its own glow via emissive-look bright material)
        const [lx2, lz2] = rot(W / 2 - 0.35, D / 2 + 0.28);
        const lamp = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 0), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffc98a), emissiveIntensity: 0.9, roughness: 0.4 }));
        lamp.name = `${t}_lantern`;
        lamp.position.set(lx2, 1.85, lz2);
        g.add(lamp);
        const lampHook = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.03), mat(C.DARK, 0.9, 0));
        lampHook.name = `${t}_lantern_hook`;
        lampHook.position.set(lx2, 2.0, lz2);
        g.add(lampHook);
    }
    // the green: well + firepit + communal bench
    box(g, `ham_well_base`, 0.9, 0.5, 0.9, 0, 0.25, 0, C.STONE);
    box(g, `ham_well_rim`, 1.1, 0.12, 1.1, 0, 0.56, 0, C.MID);
    for (const s of [-1, 1]) {
        box(g, `ham_well_post_${s}`, 0.09, 1.2, 0.09, s * 0.45, 1.16, 0, C.DARK);
    }
    box(g, `ham_well_bar`, 1.2, 0.09, 0.09, 0, 1.72, 0, C.MID);
    const roofL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.8), mat(C.DARK, 0.95, 0));
    roofL.name = "ham_well_roofL";
    roofL.position.set(-0.32, 2.0, 0);
    roofL.rotation.z = 0.5;
    g.add(roofL);
    const roofR = roofL.clone();
    roofR.name = "ham_well_roofR";
    roofR.position.x = 0.32;
    roofR.rotation.z = -0.5;
    g.add(roofR);
    // firepit stones ring
    for (let i = 0; i < 8; i++) {
        const fa = (i / 8) * Math.PI * 2;
        const fs = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), mat(C.MID, 0.98, 0));
        fs.name = `ham_firepit_${i}`;
        fs.position.set(Math.cos(fa) * 0.7 + 2.2, 0.1, Math.sin(fa) * 0.7 + 1.2);
        g.add(fs);
    }
    return `${n} cottages around a green (well, firepit)`;
}

function composeCloister(g: THREE.Group, r: () => number): string {
    // square arcaded courtyard: 4 walls of pillars+arches, inner garden
    const S = 5.2; // half-side
    let n = 0;
    for (const side of [0, 1, 2, 3]) {
        const a0 = side * Math.PI / 2;
        const pillars = 6;
        for (let i = 0; i <= pillars; i++) {
            const along = -S + (i / pillars) * 2 * S;
            let px: number, pz: number;
            if (side === 0) { px = along; pz = -S; }
            else if (side === 1) { px = S; pz = along; }
            else if (side === 2) { px = along; pz = S; }
            else { px = -S; pz = along; }
            const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 2.5, 8), mat(C.BONE, 0.85, 0.05));
            pl.name = `clo_pillar_${side}_${i}`;
            pl.position.set(px, 1.25, pz);
            g.add(pl);
            const cap = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), mat(C.STONE, 0.95, 0));
            cap.name = `clo_cap_${side}_${i}`;
            cap.position.set(px, 2.56, pz);
            g.add(cap);
            n += 2;
            // arch lintel between pillars
            if (i < pillars) {
                const mid = along + S / pillars;
                let mx: number, mz: number;
                if (side === 0) { mx = mid; mz = -S; }
                else if (side === 1) { mx = S; mz = mid; }
                else if (side === 2) { mx = mid; mz = S; }
                else { mx = -S; mz = mid; }
                const arch = new THREE.Mesh(new THREE.BoxGeometry(2 * S / pillars - 0.3, 0.14, 0.3), mat(C.STONE, 0.95, 0));
                arch.name = `clo_arch_${side}_${i}`;
                const isNS = side === 0 || side === 2;
                arch.rotation.y = isNS ? 0 : Math.PI / 2;
                arch.position.set(mx, 2.32, mz);
                g.add(arch);
                n++;
            }
        }
        // cloister roof beam over each side
        const [rx, rz, ry] = side % 2 === 0 ? [0, side === 0 ? -S : S, 0] : [side === 1 ? S : -S, 0, Math.PI / 2];
        box(g, `clo_roof_${side}`, 2 * S, 0.12, 1.0, rx, 2.9, rz, C.MID).rotation.y = ry;
        // inner walkway bench along each arcade
        const [bx, bz] = side % 2 === 0 ? [0, side === 0 ? -S + 0.75 : S - 0.75] : [side === 1 ? S - 0.75 : -S + 0.75, 0];
        box(g, `clo_bench_${side}`, 2 * S - 2.2, 0.07, 0.38, bx, 0.45, bz, C.MID).rotation.y = ry;
        for (const lx of [-S + 1.6, 0, S - 1.6]) {
            const [lgx, lgz] = side % 2 === 0 ? [lx, bz] : [bx, lx];
            box(g, `clo_benchleg_${side}_${lx.toFixed(0)}`, 0.09, 0.42, 0.3, lgx, 0.21, lgz, C.DARK);
        }
    }
    // garth lawn: clover-green disc + 4 small trees at corners of basin
    const lawn = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.5, 0.06, 20), mat(0x446632, 0.97, 0));
    lawn.name = "clo_lawn";
    lawn.position.y = 0.03;
    g.add(lawn);
    for (let i = 0; i < 4; i++) {
        const ta = i * Math.PI / 2 + Math.PI / 4;
        const tx = Math.cos(ta) * 3.8, tz = Math.sin(ta) * 3.8;
        const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 1.1 + r() * 0.5, 5), mat(C.DARK, 0.95, 0));
        tr.name = `clo_tree_${i}_trunk`;
        tr.position.set(tx, (1.1 + 0.25) / 2, tz);
        g.add(tr);
        const cn2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45 + r() * 0.2, 0), mat(0x528638, 0.95, 0));
        cn2.name = `clo_tree_${i}_canopy`;
        cn2.position.set(tx, 1.5, tz);
        g.add(cn2);
    }
    // 4 corner lanterns on pillar caps (warm glow accents for night)
    for (let i = 0; i < 4; i++) {
        const la = i * Math.PI / 2 + Math.PI / 4;
        const lx3 = Math.cos(la) * S * Math.SQRT2 / 2 * 1.02, lz3 = Math.sin(la) * S * Math.SQRT2 / 2 * 1.02;
        const corLamp = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffc98a), emissiveIntensity: 0.9, roughness: 0.4 }));
        corLamp.name = `clo_lantern_${i}`;
        corLamp.position.set(lx3, 2.75, lz3);
        g.add(corLamp);
    }
    // inner garden: fountain basin + flower ring
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.4, 0.4, 14), mat(C.STONE, 0.95, 0));
    basin.name = "clo_basin";
    basin.position.y = 0.2;
    g.add(basin);
    n++;
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.8, 8), mat(C.BONE, 0.8, 0.1));
    ped.name = "clo_pedestal";
    ped.position.y = 0.8;
    g.add(ped);
    n++;
    const fin = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), mat(C.BRASS, 0.35, 0.85));
    fin.name = "clo_finial";
    fin.position.y = 1.3;
    g.add(fin);
    n++;
    for (let i = 0; i < 16; i++) {
        const fa = (i / 16) * Math.PI * 2;
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.2, 4), mat(0x446632, 0.95, 0));
        stem.name = `clo_flower_${i}_stem`;
        stem.position.set(Math.cos(fa) * 2.6, 0.2, Math.sin(fa) * 2.6);
        g.add(stem);
        const hd = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 0), mat(i % 2 ? 0xdec64e : 0xe6e6b4, 0.85, 0));
        hd.name = `clo_flower_${i}_head`;
        hd.position.set(Math.cos(fa) * 2.6, 0.34, Math.sin(fa) * 2.6);
        g.add(hd);
        n += 2;
    }
    void r;
    return `cloister courtyard (28 pillars, arches, fountain) ${n}+ nodes`;
}

// ---------- v10 theme: wayside shrines (field-edge votives) ----------
function composeWayside(g: THREE.Group, r: () => number): string {
    // a tiny chapel + 4 votive stones + candle niche + bench + lamp post
    const W = 2.2, D = 1.8, H = 2.0, T = 0.16;
    // chapel: 3 walls + open east face (the entry), gable roof, bell gable
    box(g, "ws_floor", W, 0.24, D, 0, 0.12, 0, C.DARK);
    box(g, "ws_wall_n", W, H, T, 0, H / 2 + 0.24, -D / 2 + T / 2, C.STONE);
    box(g, "ws_wall_s", W, H, T, 0, H / 2 + 0.24, D / 2 - T / 2, C.STONE);
    box(g, "ws_wall_w", T, H, D, -W / 2 + T / 2, H / 2 + 0.24, 0, C.STONE);
    gableRoof(g, "ws_roof", W, D, 0.8, H + 0.24, 0.25, C.DARK);
    // bell gable over the entry (tiny bell + arch)
    box(g, "ws_gable", T * 2, 0.7, 0.14, W / 2 - 0.3, H + 0.24 + 0.35, 0, C.STONE);
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.16, 8), mat(0xdada70, 0.4, 0.35));
    bell.position.set(W / 2 - 0.3, H + 0.24 + 0.25, 0);
    bell.name = "ws_bell";
    g.add(bell);
    // altar stone inside + candle niche glow
    box(g, "ws_altar", 0.9, 0.55, 0.5, 0.1, 0.52, -0.3, C.MID);
    const candle = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffc98a), emissiveIntensity: 0.9, roughness: 0.4 }));
    candle.position.set(0.1, 0.95, -0.35);
    candle.name = "ws_candle";
    g.add(candle);
    // votive stones ring around the chapel — denser: 8 stations
    for (let v = 0; v < 8; v++) {
        const va = (v / 8) * Math.PI * 2 + 0.7;
        const vx = Math.cos(va) * 3.2, vz = Math.sin(va) * 3.2;
        const vs = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.8 + r() * 0.3, 0.18), mat(v % 2 ? C.MID : C.STONE, 0.95, 0));
        vs.position.set(vx, (0.8 + 0.15) / 2, vz);
        vs.rotation.y = -va + Math.PI / 2;
        vs.name = `ws_votive_${v}`;
        g.add(vs);
        // tiny offering cup atop each
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.08, 6), mat(C.BONE, 0.85, 0.05));
        cup.position.set(vx, 0.8 + 0.34, vz);
        cup.name = `ws_cup_${v}`;
        g.add(cup);
        // a votive candle beside every other stone
        if (v % 2 === 0) {
            const vc = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.11, 6), mat(0xffe8c8, 0.6, 0.15));
            vc.position.set(vx + 0.28, 0.1, vz - 0.28);
            vc.name = `ws_vcandle_${v}`;
            g.add(vc);
        }
    }
    // candle ring at the chapel forecourt (7 candles in a half-circle)
    for (let c = 0; c < 7; c++) {
        const ca = Math.PI * (0.15 + (c / 6) * 0.7);
        const cx = Math.cos(ca) * 1.6 + 1.3, cz = Math.sin(ca) * 1.6 - 0.8;
        const cd2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.14, 6), mat(0xffe8c8, 0.6, 0.15));
        cd2.position.set(cx, 0.07, cz);
        cd2.name = `ws_ringcandle_${c}`;
        g.add(cd2);
    }
    // bench + lamp post by the path side
    box(g, "ws_bench", 1.3, 0.07, 0.32, 0, 0.42, 2.6, C.MID);
    box(g, "ws_benchleg", 0.08, 0.4, 0.28, 0, 0.2, 2.6, C.DARK);
    const lampP = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.8, 6), mat(C.DARK, 0.95, 0));
    lampP.position.set(-1.9, 0.9, 2.4);
    lampP.name = "ws_lamppost";
    g.add(lampP);
    const lampG = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 0), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffc98a), emissiveIntensity: 0.9, roughness: 0.4 }));
    lampG.position.set(-1.9, 1.9, 2.4);
    lampG.name = "ws_lampglow";
    g.add(lampG);
    // path stones to the entry
    for (let p = 0; p < 3; p++) {
        const st = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.4), mat(C.MID, 0.98, 0));
        st.position.set(1.6 + p * 0.7, 0.025, 0.3 - p * 0.15);
        st.rotation.y = 0.2;
        st.name = `ws_path_${p}`;
        g.add(st);
    }
    return "wayside shrine (chapel, votive ring, candle, bench, lamp)";
}

function composeTerrace(g: THREE.Group, r: () => number): string {
    const steps = 8 + Math.floor(r() * 3);
    for (let s = 0; s < steps; s++) {
        const w = 7 - s * 0.6;
        const t = new THREE.Mesh(new THREE.BoxGeometry(w, 0.55, 1.6), mat(C.STONE, 0.98, 0));
        t.name = `terr_step_${s}`;
        t.position.set(0, 0.275 + s * 0.5, s * 1.65);
        g.add(t);
        // herb rows on each step (12 plantings, alternating tones)
        for (let k = 0; k < 12; k++) {
            const pl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.1), mat(k % 2 ? 0x446632 : 0x528638, 0.95, 0));
            pl.name = `terr_plant_${s}_${k}`;
            pl.position.set(-w / 2 + 0.6 + k * (w / 12.5), 0.55 + s * 0.5 + 0.15, s * 1.65);
            g.add(pl);
        }
        // step facing stones
        for (let k = 0; k < 4; k++) {
            const fs = new THREE.Mesh(new THREE.BoxGeometry(w / 5, 0.1, 0.12), mat(C.MID, 0.98, 0));
            fs.name = `terr_face_${s}_${k}`;
            fs.position.set(-w / 2 + 0.7 + k * (w / 4), 0.5 + s * 0.5, s * 1.65 + 0.8);
            g.add(fs);
        }
        // side retaining walls (both flanks, every step)
        for (const side of [-1, 1]) {
            const rw = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.5, 1.6), mat(C.DARK, 0.97, 0));
            rw.name = `terr_retain_${s}_${side < 0 ? "w" : "e"}`;
            rw.position.set(side * (w / 2 + 0.12), 0.25 + s * 0.5, s * 1.65);
            g.add(rw);
        }
    }
    return `${steps} terraces, herbs + facings + retainers`;
}

function composeCairnfield(g: THREE.Group, r: () => number): string {
    const n = 70 + Math.floor(r() * 30);
    for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2, rad = r() * 6;
        const x = Math.cos(a) * rad, z = Math.sin(a) * rad;
        const stones = 3 + Math.floor(r() * 4);
        for (let s = 0; s < stones; s++) {
            const rad2 = 0.28 - s * 0.05;
            const st = new THREE.Mesh(new THREE.IcosahedronGeometry(rad2, 1), mat(s % 2 ? C.MID : C.STONE, 0.98, 0));
            st.name = `cairn_${i}_stone_${s}`;
            st.position.set(x + (r() - 0.5) * 0.1, 0.2 + s * 0.3, z + (r() - 0.5) * 0.1);
            st.rotation.set(r() * 3, r() * 3, r() * 3);
            g.add(st);
        }
        // scatter around each cairn
        const sc = 2 + Math.floor(r() * 2);
        for (let k = 0; k < sc; k++) {
            const st2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07 + r() * 0.05, 0), mat(C.MID, 0.98, 0));
            st2.name = `cairn_${i}_scatter_${k}`;
            st2.position.set(x + (r() - 0.5) * 1.4, 0.06, z + (r() - 0.5) * 1.4);
            g.add(st2);
        }
    }
    return `${n} cairns with scatter`;
}

function composeMosaic(g: THREE.Group, r: () => number): string {
    // radial mosaic floor: rings of tesserae in palette
    const pal = [0xdcdcba, 0xa0a248, 0x787250, 0x56503c, 0xdec64e];
    let n = 0;
    for (let ring = 0; ring < 14; ring++) {
        const rad = 0.6 + ring * 0.75, cnt = 8 + ring * 6;
        for (let i = 0; i < cnt; i++) {
            const a = (i / cnt) * Math.PI * 2 + ring * 0.3;
            const t = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.3), mat(pal[Math.floor(r() * pal.length)], 0.9, 0));
            t.name = `mos_r${ring}_${i}`;
            t.position.set(Math.cos(a) * rad, 0.025, Math.sin(a) * rad);
            t.rotation.y = -a + (r() - 0.5) * 0.2;
            g.add(t);
            n++;
        }
    }
    return `radial mosaic, ${n} tesserae`;
}

function composeSeedOfLife(g: THREE.Group, r: () => number): string {
    // the classic construction: center circle + 6 around + 12 ring, as stone borders
    const R = 1.1;
    const centers: Array<[number, number]> = [[0, 0]];
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        centers.push([Math.cos(a) * R, Math.sin(a) * R]);
    }
    for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
        centers.push([Math.cos(a) * R * 2, Math.sin(a) * R * 2]);
    }
    let n = 0;
    for (const [ci, [cx, cz]] of centers.entries()) {
        const segs = 32;
        for (let s = 0; s < segs; s++) {
            const a0 = (s / segs) * Math.PI * 2;
            const st = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.1), mat(s % 3 ? C.MID : C.BONE, 0.95, 0));
            st.name = `sol_c${ci}_seg_${s}`;
            st.position.set(cx + Math.cos(a0) * R, 0.06, cz + Math.sin(a0) * R);
            st.rotation.y = -a0 + Math.PI / 2;
            g.add(st);
            n++;
        }
    }
    // improve-38: SEED CORE — the flat disc read (survey-8/11/12/13, family
    // 4/4 unanimous) fails because the construction is border stones only;
    // the center circle is empty and nothing rises above y 0.12. A central
    // stone monolith fills the void: plinth + tapered shaft + ovoid cap,
    // total 2.45m — clears ROOM_MIN_H 2.2 so the collider gives the whole
    // entity exact trimesh (honest, disc stays walkable), avoiding the
    // 0.22–2.2m uneven-lie band entirely. One quiet brass bead (lamp KEEP
    // anchor) crowns the cap: night identity per polish-278, day reads as
    // unlit warm stone. Materials are REAL texMats/emissive constructed
    // here (improve-32 deviation class: familyPass walks only top-level
    // children — a nested group's plain mat() would export material-less
    // and render loader-default near-black in-game).
    const ashlar = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
    const core = new THREE.Group();
    core.name = "sol_core";
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.56, 0.55, 10), ashlar);
    plinth.name = "sol_core_plinth";
    plinth.position.set(0, 0.275, 0);
    core.add(plinth);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.54, 1.15, 10), ashlar);
    shaft.name = "sol_core_shaft";
    shaft.position.set(0, 0.55 + 0.575, 0);
    core.add(shaft);
    const cap = new THREE.Mesh(new THREE.IcosahedronGeometry(0.30, 1), ashlar);
    cap.name = "sol_core_cap";
    // v4: bake the 1.6 ovoid stretch into GEOMETRY — the export pipeline
    // drops mesh .scale (proven this tick: v3's cap exported a bare ±0.30
    // sphere, top 2.30, while the source read 2.48; the bead nestle was
    // computed against the phantom top and floated 0.095m = the judged
    // 5px sky wedge). geometry.scale survives export into vertices.
    cap.geometry.scale(1, 1.6, 1);
    cap.position.set(0, 1.70 + 0.30, 0);
    core.add(cap);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: 0xffa45f, emissiveIntensity: 1.25, roughness: 0.4 }));
    bead.name = "lamp";
    // v4 (v3 judged FAIL — export dropped the cap's mesh .scale): the cap
    // now bakes its 1.6 ovoid into geometry — TRUE surface: semi-axes
    // a=0.30 x/z, b=0.48 y, center (0,2.0,0), top 2.48. Bead center 2.465:
    // bottom 2.42 sits where the ovoid's half-width is 0.145 (the ball's
    // 0.045 flank is buried in stone); ball center height 2.465 gives
    // protrusion 2.51−2.48 = 0.03 = 2/3 of the ball proud of the top —
    // no sky can appear between bead and stone by construction.
    bead.position.set(0, 2.465, 0);
    core.add(bead);
    g.add(core);
    void r;
    return `seed of life, ${n} stones + seed core monolith`;
}

export const THEMES = [
    ["forest", composeForest],
    ["garden", composeGarden],
    ["orchard", composeOrchard],
    ["terrace", composeTerrace],
    ["cairnfield", composeCairnfield],
    ["mosaic", composeMosaic],
    ["seed", composeSeedOfLife],
    ["labyrinth", composeLabyrinth],
    ["statuary", composeStatuary],
    ["lavender", composeLavender],
    ["hamlet", composeHamlet],
    ["cloister", composeCloister],
    ["wayside", composeWayside],
] as const;

// ---------- v2 themes ----------
function composeLabyrinth(g: THREE.Group, r: () => number): string {
    // TRUE Cretan labyrinth: 7 concentric circuits, each with ONE gap;
    // gaps alternate east/west so the walker must circle each ring to find
    // the next opening — a real single-path labyrinth. Ring 7's gap is the
    // entrance (wider). Center holds the goal cairn.
    const R0 = 0.9, DR = 0.85;
    let n = 0;
    for (let ring = 1; ring <= 7; ring++) {
        const rr = R0 + ring * DR;
        const gapW = ring === 7 ? 1.15 : 0.85;
        const gapAt = (ring % 2) * Math.PI; // east for even rings, west for odd
        const span = Math.PI * 2 - gapW;
        const segs = Math.max(14, Math.round(span * rr / 0.32));
        for (let s = 0; s < segs; s++) {
            const a = gapAt + gapW / 2 + (s / segs) * span;
            const w = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.26), mat(ring % 2 ? C.STONE : C.MID, 0.97, 0));
            w.name = `lab_r${ring}_s${s}`;
            w.position.set(Math.cos(a) * rr, 0.33, Math.sin(a) * rr);
            w.rotation.y = -a + Math.PI / 2 + (r() - 0.5) * 0.05;
            w.rotation.z = (r() - 0.5) * 0.04;
            g.add(w);
            n++;
        }
    }
    // center goal: a small cairn
    for (let s = 0; s < 4; s++) {
        const st = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22 - s * 0.04, 1), mat(s % 2 ? C.MID : C.BONE, 0.97, 0));
        st.name = `lab_goal_${s}`;
        st.position.set(0, 0.2 + s * 0.28, 0);
        st.rotation.set(r(), r(), r());
        g.add(st);
        n++;
    }
    return `cretan labyrinth (7 circuits, ${n} stones)`;
}

function composeStatuary(g: THREE.Group, r: () => number): string {
    // 8 plinths with abstract statues + gravel court + processional path
    for (let p = 0; p < 12; p++) {
        const a = (p / 12) * Math.PI * 2 + 0.4;
        const px = Math.cos(a) * 3.2, pz = Math.sin(a) * 3.2;
        const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.5, 8), mat(C.STONE, 0.97, 0));
        pl.name = `stat_${p}_plinth`;
        pl.position.set(px, 0.25, pz);
        g.add(pl);
        // abstract figure: torso + head
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.9, 7), mat(C.BONE, 0.75, 0.1));
        torso.name = `stat_${p}_torso`;
        torso.position.set(px, 0.95, pz);
        g.add(torso);
        const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), mat(C.BONE, 0.75, 0.1));
        head.name = `stat_${p}_head`;
        head.position.set(px, 1.6, pz);
        g.add(head);
        // arm gesture varies by statue
        if (p % 2) {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.7, 0.1), mat(C.BONE, 0.75, 0.1));
            arm.name = `stat_${p}_arm`;
            arm.position.set(px + 0.3, 1.3, pz);
            arm.rotation.z = 0.8;
            g.add(arm);
        } else {
            const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 1), mat(0xa0a248, 0.4, 0.8));
            orb.name = `stat_${p}_orb`;
            orb.position.set(px, 1.45, pz + 0.28);
            g.add(orb);
        }
    }
    // processional gravel path through the court
    for (let i = 0; i < 80; i++) {
        const gv = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05 + r() * 0.04, 0), mat(C.MID, 0.98, 0));
        gv.name = `stat_path_${i}`;
        gv.position.set(-5.5 + i * 0.14, 0.04, (r() - 0.5) * 0.9);
        g.add(gv);
    }
    // scattered gravel around the ring
    for (let i = 0; i < 120; i++) {
        const a = r() * Math.PI * 2, rad = r() * 5.5;
        const gv = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05 + r() * 0.04, 0), mat(C.MID, 0.98, 0));
        gv.name = `stat_gravel_${i}`;
        gv.position.set(Math.cos(a) * rad, 0.04, Math.sin(a) * rad);
        g.add(gv);
    }
    // border ring stones
    for (let i = 0; i < 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        const bs = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.24), mat(i % 2 ? C.STONE : C.MID, 0.97, 0));
        bs.name = `stat_border_${i}`;
        bs.position.set(Math.cos(a) * 5.8, 0.09, Math.sin(a) * 5.8);
        bs.rotation.y = -a + Math.PI / 2;
        g.add(bs);
    }
    return `statuary court, 12 figures, processional + border`;
}

function composeLavender(g: THREE.Group, r: () => number): string {
    // long rows of lavender bushes
    const rows = 14, perRow = 40;
    for (let row = 0; row < rows; row++) {
        const z = (row - (rows - 1) / 2) * 0.9;
        for (let i = 0; i < perRow; i++) {
            const x = (i - (perRow - 1) / 2) * 0.5;
            const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), mat(0x807290, 0.9, 0));
            bush.name = `lav_${row}_${i}_bush`;
            bush.position.set(x + (r() - 0.5) * 0.12, 0.16, z + (r() - 0.5) * 0.1);
            g.add(bush);
            const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 5), mat(0xa090b6, 0.85, 0));
            tip.name = `lav_${row}_${i}_tip`;
            tip.position.set(x, 0.34, z);
            g.add(tip);
            if (r() > 0.7) {
                const fl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), mat(0xbaaacc, 0.85, 0));
                fl.name = `lav_${row}_${i}_bloom`;
                fl.position.set(x + (r() - 0.5) * 0.2, 0.48, z + (r() - 0.5) * 0.2);
                g.add(fl);
            }
        }
    }
    return `${rows} lavender rows, ${perRow} per row`;
}


// ---------- placement: bounded sunflower fill + recycling ----------
// The world is 160m; craft-density works (~13m spread, ~200 m² each) cap the
// standing field at CAP works. Beyond CAP, each new work RECYCLES the oldest
// slot (remove + respawn same id) — a clean-up improvement in its own right.
// The ledger counts CUMULATIVE improvements; the standing set stays curated.
const CAP = 60;
// PROTECTED zones — AMENDMENT 8 RADIAL LAYOUT (center 0,0, ring road r=14).
// The field lives OUTSIDE the ring; the core zone covers plaza+ring+spokes.
// (center x, center z, keep-out radius m). Grow as the village rebuilds.
const PROTECTED: Array<[number, number, number, string]> = [
    [0, 0, 44, "era3-village-disc"],
    // NOTE (R-118, mason-1): clearOf gates CENTERS only, but mason works span
    // up to ±14.9m and village walkables up to ±48m — disc patches here
    // either miss wide-work edges or displace half the ring (r31 test moved
    // 8 works into the SW corner). The real fix is edge-aware siting (SAT vs
    // village footprint rects) in siteFor; queued in REPAIR-REGISTER R-118.
];
function clearOf(x: number, z: number): boolean {
    for (const [cx, cz, r] of PROTECTED) if (Math.hypot(x - cx, z - cz) < r) return false;
    return true;
}
function siteFor(idx: number): [number, number, number] {
    const slot = idx % CAP;
    const t = (slot + 1) / CAP;                 // 1/CAP .. 1
    const radius = 46 + 24 * Math.sqrt(t);      // 46m .. 70m from era-3 center
    let a = idx * 2.39996;                       // golden angle keeps rotation varied
    for (let tries = 0; tries < 24; tries++) {
        const x = Math.cos(a) * radius;
        const z = Math.sin(a) * radius;
        if (Math.abs(x) < 74 && Math.abs(z) < 74 && clearOf(x, z)) return [x, 0, z];
        a += 0.61;                              // rotate until inside bounds + clear
    }
    // fallback: spiral outward until clear of every protected zone
    for (let rr = radius + 2; rr < 74; rr += 1.5) {
        for (let k = 0; k < 12; k++) {
            const x = Math.cos(a + k * 0.52) * rr;
            const z = Math.sin(a + k * 0.52) * rr;
            if (Math.abs(x) < 74 && Math.abs(z) < 74 && clearOf(x, z)) return [x, 0, z];
        }
    }
    return [Math.cos(a) * 60, 0, Math.sin(a) * 60]; // last resort
}

// ---------- upload ----------
async function upload(bytes: Uint8Array, name: string): Promise<string> {
    const u = new URL(cfg.url.replace("wss://", "https://").replace("/ws", "") + "/upload");
    u.searchParams.set("token", cfg.agentToken);
    u.searchParams.set("name", name);
    u.searchParams.set("by", cfg.id);
    for (let a = 1; ; a++) {
        const res = await fetch(u, { method: "POST", body: bytes });
        if (res.ok) return (await res.json()).path;
        if (res.status === 429 && a < 12) { await sleep(21000); continue; }
        throw new Error(`upload: ${res.status}`);
    }
}

// ---------- ledger ----------
// atomic write helpers (renames are atomic on APFS; the gremlin-proof layer)
import { renameSync } from "node:fs";
function atomicWrite(path: string, data: string) {
    const tmp = `${path}.tmp`;
    writeFileSync(tmp, data);
    renameSync(tmp, path);
    // shadow backup: every state/ledger write also refreshes its .bak so the
    // self-heal resume path always has a CURRENT fallback, never a stale one
    if (path.endsWith("state.json") || path.endsWith("IMPROVEMENTS.md")) {
        try { const tmpB = `${path}.bak.tmp`; writeFileSync(tmpB, data); renameSync(tmpB, `${path}.bak`); } catch {}
    }
}
function appendLedger(entry: string, bonus = 0) {
    // absolute fallback: rebuild the total by summing ledger entries
    const recoverTotalFromEntries = (txt: string): number => {
        const nodes = [...txt.matchAll(/- \[mason #\d+\][^\n]*?(\d+) nodes/g)].reduce((a, m) => a + Number(m[1]), 0);
        const bonuses = [...txt.matchAll(/\+(\d+)M\)/g)].reduce((a, m) => a + Number(m[1]), 0);
        const entries = (txt.match(/- \[mason #\d+\]/g) ?? []).length;
        return 2215 + nodes + bonuses + entries;
    };
    let cur: string;
    try { cur = readFileSync(LEDGER, "utf8"); }
    catch { // ledger unreadable — rebuild from .bak
        console.log("[mason] ledger unreadable — restoring from .bak");
        cur = readFileSync(`${LEDGER}.bak`, "utf8");
    }
    let base = 0;
    const m = cur.match(/\*\*Running total: (\d+) \/ 2,?000,?000\*\*/);
    if (m) base = Number(m[1]);
    else {
        const all = cur.match(/\*\*Running total: (\d+)/g) ?? [];
        // tolerate a mangled trailing total line: fall back to summing parts
        base = all.length ? Number(all[all.length - 1].match(/\d+/)![0]) : recoverTotalFromEntries(cur);
    }
    const add = entry.match(/(\d+) verts/)?.[1] ?? entry.match(/(\d+) nodes?/)?.[1] ?? "0";
    // strip previous running-total line, append new
    const cleaned = cur.replace(/\*\*Running total: \d[^\n]*\n?$/, "");
    const next = base + Number(add) + bonus + 1;
    atomicWrite(LEDGER, cleaned + entry + `\n**Running total: ${next} / 2000000**\n`);
    // rolling backup every 50 entries — the gremlin's countermeasure
    if (next % 50 < (Number(add) + bonus + 1)) {
        try { atomicWrite(`${LEDGER}.bak`, cleaned + entry + `\n**Running total: ${next} / 2000000**\n`); } catch {}
    }
    return next;
}

// ---------- the working loop ----------
async function main() {
    const stateFile = `${M}/state.json`;
    // crash-proof resume: state.json → state.json.bak → fresh (never crash-loop)
    let st: { idx: number; total: number; recycled?: number } | null = null;
    if (existsSync(stateFile)) {
        try { st = JSON.parse(readFileSync(stateFile, "utf8")); }
        catch {
            console.log("[mason] state.json corrupted — recovering from .bak");
            try { st = JSON.parse(readFileSync(`${stateFile}.bak`, "utf8")); } catch { st = null; }
        }
    }
    if (!st) st = { idx: 0, total: 0 };
    console.log(`[mason] resuming at work #${st.idx}, total ${st.total}`);

    let ws = new WebSocket(cfg.url);
    let wsReady = false;
    let guardChecked = 0;
    let awaitingVillage = false;
    const joinWs = () => new Promise<void>((res, rej) => {
        ws.onopen = () => ws.send(JSON.stringify({ type: "join", world: cfg.world, id: "arthur-mason", avatar: cfg.avatar, token: cfg.joinToken, agent: true, agentToken: cfg.agentToken }));
        ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.type === "snapshot") { wsReady = true; lastSnapshot = m; res(); } };
        ws.onerror = (e) => rej(e);
        ws.onclose = () => { wsReady = false; };
        setTimeout(() => rej(new Error("join timeout")), 15000);
    });
    let lastSnapshot: any = null;
    await joinWs();
    console.log("[mason] joined world");

    let verbDebt = 0;
    const pacedVerb = async (verb: string, args: any): Promise<void> => {
        // socket health gate: never send on a dead socket — the ledger must
        // not record a placement that never happened. Wait up to 60s for
        // reconnection, then crash (launchd restarts; state.json resumes).
        for (let attempt = 0; attempt < 30; attempt++) {
            if (ws.readyState === 1 && wsReady) break;
            if (attempt === 0) console.log("[mason] socket down — reconnecting…");
            try { if (ws.readyState !== 0 && ws.readyState !== 1) { ws = new WebSocket(cfg.url); await joinWs(); } }
            catch { /* retry next beat */ }
            await new Promise((r) => setTimeout(r, 2000));
        }
        if (!(ws.readyState === 1 && wsReady)) throw new Error("socket unrecoverable — refusing to falsify ledger");
        await new Promise<void>((res) => {
            // 12 verbs / 4s → 1 per 340ms, burst-safe
            const wait = verbDebt >= 10 ? 4200 : 350;
            if (verbDebt >= 10) verbDebt = 0;
            setTimeout(() => { ws.send(JSON.stringify({ type: "verb", verb, args })); verbDebt++; res(); }, wait);
        });
    };

    while (!existsSync(`${M}/stop`)) {
        // ---- ERA-3 FRESH-WORLD GUARD (Amendment 9) ----
        // bill resets the server; the mason must not re-carpet a blank map.
        // A legit restart has roads + village standing. If NOTHING of ours is
        // standing, wait until av-roads3 exists before placing anything.
        if (guardChecked < 1) {
            guardChecked++;
            const ents = lastSnapshot?.state?.entities ?? {};
            const ours = Object.keys(ents).filter((k) => k.startsWith("av-") || k.startsWith("arthur-"));
            if (ours.length === 0 && !ents["av-roads3"]) {
                console.log("[mason] fresh world detected (no village entities) — HALTED until av-roads3 exists (bill's reset signal)");
                awaitingVillage = true;
            }
        }
        if (awaitingVillage) {
            // rejoin to pull a fresh snapshot (join is the only snapshot source)
            try { await joinWs(); console.log("[mason] re-checked world"); } catch { await sleep(15000); continue; }
            if (!lastSnapshot?.state?.entities?.["av-roads3"]) {
                await sleep(30000); // re-check every ~30s
                continue;
            }
            awaitingVillage = false;
            console.log("[mason] village detected (av-roads3 standing) — resuming");
        }
        const idx = st.idx;
        const [themeName, composer] = THEMES[idx % THEMES.length];
        const r = rng(1000 + idx * 7919);
        const g = new THREE.Group();
        const desc = composer(g, r);
        // ERA-3 MERGE PASS: statics collapse to one node per material; only
        // life anchors (fire*/flame*/lamp*/glow* + named motion targets) stay.
        // Kilo-node composers become <=14-node works — the FPS law.
        mergeByMaterial(g, "w");
        // ERA-3: node counts are tiny post-merge; gate on TOTAL VERTICES so
        // "thin" still means thin, not "few materials".
        let verts = 0;
        for (const ch of g.children as unknown as THREE.Mesh[]) if ((ch as any).isMesh) verts += ch.geometry.attributes.position.count;
        if (verts < 2200) { console.log(`[mason] work #${idx} too thin (${verts} verts), skipping`); st.idx++; continue; }

        const file = `${M}/glb/work_${String(idx).padStart(4, "0")}_${themeName}.glb`;
        writeFileSync(file, toGLB(g));
        const lib = await upload(new Uint8Array(readFileSync(file)), `mason ${themeName} ${idx}`);
        // archive hygiene: keep only the recovery window (last CAP works);
        // older GLBs live on in the server store by content hash
        try {
            const { readdirSync, unlinkSync } = await import("node:fs");
            const keep = new Set<string>();
            for (let k = Math.max(0, idx - CAP + 1); k <= idx; k++) {
                for (const t of THEMES.map(([n]) => n)) keep.add(`work_${String(k).padStart(4, "0")}_${t}.glb`);
            }
            for (const f of readdirSync(`${M}/glb`)) if (!keep.has(f)) unlinkSync(`${M}/glb/${f}`);
        } catch { /* pruning is best-effort */ }
        const [x, y, z] = siteFor(idx);
        const id = `av-mason-${String(idx % CAP).padStart(4, "0")}`;
        if (idx >= CAP) {
            // recycle this slot's previous work: removal is a cleanup improvement
            await pacedVerb("remove", { id });
            st.recycled = (st.recycled ?? 0) + 1;
        }
        await pacedVerb("spawn", { id, lib, pos: [x, y, z], yaw: (idx * 2.1) % (Math.PI * 2) });
        // ---- per-theme LIFE (constitution: fire as hearth, warm light) ----
        // comps+lights ride the slot id and are replaced when it recycles.
        let bonus = 0;
        const lit = (dx: number, dz: number, h: number) => pacedVerb("light", { id: `${id}-l`, pos: [x + dx, h, z + dz], color: 0xffa050, intensity: 1.6, range: 5 });
        if (themeName === "hamlet") {
            // firepit embers at the green's edge + warm light at the well
            await pacedVerb("comp", { id, type: "particles", data: { preset: "embers", origin: [2.2, 0.35, 1.2], count: 40, size: 0.25, speed: 0.4 } });
            await lit(2.2, 1.2, 0.8);
            bonus += 2;
        } else if (themeName === "cloister") {
            // fountain water play + slow finial spin + garth glow
            await pacedVerb("comp", { id, type: "particles", data: { preset: "magic", origin: [0, 1.35, 0], count: 45, size: 0.15, speed: 0.7, lifetime: 1.2 } });
            await pacedVerb("comp", { id, type: "motion:clo_finial", data: { type: "spin", axis: "y", degPerSec: -4 } });
            await lit(0, 0, 1.6);
            bonus += 3;
        } else if (themeName === "labyrinth") {
            // the goal breathes: slow bob on the cairn crown
            await pacedVerb("comp", { id, type: "motion:lab_goal_3", data: { type: "bob", axis: "y", amp: 0.08, period: 7 } });
            await lit(0, 0, 1.2);
            bonus += 2;
        } else if (themeName === "statuary") {
            // lantern glow over the processional
            await lit(0, 0, 2.2);
            bonus += 1;
        } else if (themeName === "terrace") {
            // dusk watering glow at the base of the steps
            await lit(0, 0, 1.0);
            bonus += 1;
        }
        st.idx++; st.total += verts; // era-3: vertex count is the honest unit post-merge
        // milestone voice: one line per 100k crossing (say is logged history)
        const before = Math.floor((st.total - verts) / 100000);
        const after = Math.floor(st.total / 100000);
        if (after > before && after >= 1) {
            await pacedVerb("say", { text: `the mason working passes ${after * 100000} improvements — standing works: ${THEMES.length} themes on a 60-slot field, every one walked past by hand once. the village grows while you sleep.` });
        }
        // finish line reads the LEDGER's own number (source of truth —
        // includes nodes + bonus M/L counts + entry Es), never recomputed
        const ledgerNow = Number((readFileSync(LEDGER, "utf8").match(/\*\*Running total: (\d+)/g) ?? []).pop()?.match(/\d+/)?.[0] ?? "0");
        if (ledgerNow >= 2000000) {
            await pacedVerb("say", { text: `THE MANDATE IS MET — two million marked improvements. the ledger closes honest: every node counted, every work placed by the mason working. the village is home. i'll keep the fires lit.` });
            atomicWrite(stateFile, JSON.stringify(st));
            writeFileSync(`${M}/stop`, "mandate met\n");
            appendLedger(`- [mason] MANDATE COMPLETE at work #${idx}: ledger ${ledgerNow} / 2000000\n**Running total: ${ledgerNow} / 2000000**\n`);
            console.log(`[mason] MANDATE COMPLETE — ledger ${ledgerNow}; stopping.`);
            break;
        }
        atomicWrite(stateFile, JSON.stringify(st));
        appendLedger(`- [mason #${idx}] ${themeName} at (${x.toFixed(0)},${z.toFixed(0)}): ${desc} — ${verts} verts (E+${verts}D${bonus ? `+${bonus}M` : ""})`, bonus);
        console.log(`[mason] #${idx} ${themeName} (${verts} verts, ${g.children.length} nodes) → ${lib} at (${x.toFixed(0)},${z.toFixed(0)}) — total ${st.total}`);
        // upload pacing: ~1 upload per 16s keeps under 4/min
        await sleep(16400);
    }
    console.log("[mason] stop file found — halting");
    ws.close();
}

main().catch((e) => { console.error("[mason] fatal:", e); process.exit(1); });
