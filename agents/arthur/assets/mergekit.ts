// mergekit.ts — era-3 FPS keystone: mergeByMaterial.
// Walks a built THREE.Group, merges every static mesh into ONE mesh per
// material bucket (color:roughness:metalness), and keeps only named
// anchors (motion targets, fire/flame/lamp glows) as siblings.
// Result: a GLB with one named node per material + a handful of anchors
// instead of hundreds of nodes = one draw call per material at render.
//
// KEEP list MUST match every comp target name exactly (findPart is exact):
// bell, sails, carousel, exact horse_N roots, shrine_orb, lab_goal_3,
// clo_finial, fire*, flame*, lamp*, glow*, ember*. Descendant horse parts
// and static carousel flags deliberately merge; no live comp targets them.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const KEEP = /^(fire|flame|lamp|glow|ember|bell$|sails$|carousel$|horse_\d+$|orb$|finial$|goal_|well_|sign$|ws_float|hen_|clo_finial$|lab_goal_|knot$|lissa$|goat_|duck_|rabbit_|fox|bcat|barnowl|robin|goose_|sheep_|pig_|dove_|shorse_|cow_|donk_|turkey_|peacock|peahen|frog|roost$|roost_|dl_cloth|mk_awn|dh_strip|gf_crow|pz_kettle|pwheel|hc_wheel|fx_bundle|wy_axe|bee_|swallow_|heron|dog$|dog_|wrabbit_|deer_|hog$|hog_|sqrl|hmou|dmou|sparrow|kfish|yham|towl$|towl_|pheas|magpi|woodp|stork|swan$|swan_|kestr$|kestr_|guine$|guine_|pige$|pige_)/;

// tex-0: bucket keys must separate differently-TEXTURED materials (same
// white base color + rough/metal would otherwise merge thatch into plaster).
// Plain materials append "" → key identical to pre-texture era.
const texKey = (mat: THREE.MeshStandardMaterial): string => {
    const dt = mat.map as THREE.DataTexture | null;
    if (!dt || !(dt as any).isDataTexture) return "";
    const px = (dt.image as any).data as Uint8Array;
    let h1 = 0x811c9dc5;
    for (let i = 0; i < px.length; i++) h1 = Math.imul(h1 ^ px[i], 0x01000193) >>> 0;
    return `:T${h1.toString(16)}`;
};

export function mergeByMaterial(g: THREE.Group, label = "m"): THREE.Group {
    g.updateMatrixWorld(true);
    const buckets = new Map<string, { geoms: THREE.BufferGeometry[]; material: THREE.Material }>();
    const keep: THREE.Object3D[] = [];

    const prep = (m: THREE.Mesh, geom: THREE.BufferGeometry) => {
        for (const attr of Object.keys(geom.attributes)) {
            if (!["position", "normal", "uv"].includes(attr)) geom.deleteAttribute(attr);
        }
        if (!geom.attributes.normal) geom.computeVertexNormals();
        if (!geom.attributes.uv) {
            const uv = new Float32Array(geom.attributes.position.count * 2);
            geom.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
        }
        if (!geom.index) geom.setIndex([...Array(geom.attributes.position.count).keys()]);
        void m;
    };
    const bucket = (m: THREE.Mesh, key: string, geom: THREE.BufferGeometry) => {
        let b = buckets.get(key);
        if (!b) { b = { geoms: [], material: m.material as THREE.Material }; buckets.set(key, b); }
        b.geoms.push(geom);
    };

    // KEEP-group folding: a kept GROUP (horse_N, carousel, sails...) moves as
    // a unit, so its STATIC mesh descendants merge per-material INTO the group
    // (replacing the children) while nested keep-anchors (fire, lamp) survive.
    // Group-local frame: bake only the local chain below the group, NOT world.
    const foldKeepGroup = (grp: THREE.Object3D) => {
        grp.updateMatrixWorld(true);
        const worldInv = new THREE.Matrix4().copy(grp.matrixWorld).invert();
        const gBuckets = new Map<string, { geoms: THREE.BufferGeometry[]; material: THREE.Material }>();
        const gKeep: THREE.Object3D[] = [];
        const walk = (node: THREE.Object3D) => {
            for (const c of [...node.children]) {
                const m = c as THREE.Mesh;
                if (KEEP.test(c.name ?? "")) {
                    // nested keep-GROUP (horse_N inside carousel): fold ITSELF
                    // in place (own buckets) and survive as a node; keep-anchor
                    // meshes (fire/lamp) survive untouched
                    if ((c as any).isGroup) { foldKeepGroup(c); gKeep.push(c); continue; }
                    gKeep.push(c);
                    continue;
                }
                if ((c as any).isGroup) { walk(c); continue; }
                if (!(c as any).isMesh) continue;
                const mat = m.material as THREE.MeshStandardMaterial;
                const key = `${mat.color.getHexString()}:${mat.roughness}:${mat.metalness}${texKey(mat)}`;
                // geometry from group-local (strip the group's own world transform)
                const geom = m.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(worldInv, m.matrixWorld));
                prep(m, geom);
                let b = gBuckets.get(key);
                if (!b) { b = { geoms: [], material: mat }; gBuckets.set(key, b); }
                b.geoms.push(geom);
            }
        };
        walk(grp);
        for (const k of [...grp.children]) grp.remove(k);
        let i = 0;
        for (const { geoms, material } of gBuckets.values()) {
            const merged = mergeGeometries(geoms, false);
            if (!merged) continue;
            const mesh = new THREE.Mesh(merged, material);
            mesh.name = `${grp.name}_${i++}`;
            grp.add(mesh);
        }
        for (const k of gKeep) grp.add(k);
    };

    for (const child of [...g.children]) {
        const m = child as THREE.Mesh;
        if ((child as any).isGroup && KEEP.test(child.name ?? "")) {
            foldKeepGroup(child);
            keep.push(child);
            continue;
        }
        if (!(m as any).isMesh || KEEP.test(m.name ?? "")) { keep.push(child); continue; }
        const mat = m.material as THREE.MeshStandardMaterial;
        const key = `${mat.color.getHexString()}:${mat.roughness}:${mat.metalness}${texKey(mat)}`;
        const geom = m.geometry.clone().applyMatrix4(m.matrixWorld);
        prep(m, geom);
        bucket(m, key, geom);
    }
    g.clear();
    let i = 0;
    for (const { geoms, material } of buckets.values()) {
        const merged = mergeGeometries(geoms, false);
        if (!merged) continue;
        const mesh = new THREE.Mesh(merged, material);
        mesh.name = `${label}_${i++}`;
        g.add(mesh);
    }
    for (const k of keep) g.add(k);
    return g;
}
