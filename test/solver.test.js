// test/solver.test.js — Tes solver ts-estimator (v1.8.1)
// Dijalankan dari root repo:  npm test   (atau: node test/solver.test.js)
// Tanpa dependensi, hanya node:assert. Menguji computeEstimates() dan
// solveTSEquations() dari app.js (fungsi murni, tanpa DOM).
const assert = require("node:assert");
const { solveTSEquations, computeEstimates } = require("../app.js");

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        passed++;
        console.log("PASS " + name);
    } catch (e) {
        failed++;
        console.error("FAIL " + name + ": " + e.message);
    }
}

function approx(actual, expected, tol) {
    assert.ok(
        Math.abs(actual - expected) <= tol,
        `diharapkan ${expected} ± ${tol}, dapat ${actual}`
    );
}

// Himpunan parameter lengkap (null = tidak diketahui). WAJIB lengkap —
// solver membedakan null (kosong) dari nilai; kunci yang hilang (undefined)
// akan dianggap terisi.
function blank() {
    return {
        Fs: null, Re: null, Sd: null, Qms: null, Qes: null, Qts: null,
        Vas: null, Mms: null, BL: null, Cms: null, Le: null, Xmax: null,
    };
}

// Identitas TS standar (dipakai untuk cek residu — independen dari solver).
function fsImplied(mmsG, cmsSI) {
    return 1.0 / (2.0 * Math.PI * Math.sqrt(mmsG * 0.001 * cmsSI));
}
function vasImplied(cmsSI, sd) {
    return 1.38826 * cmsSI * Math.pow(sd, 2);
}
function residualFs(r) {
    return Math.abs(fsImplied(r.Mms, r.Cms) - r.Fs) / r.Fs;
}
function residualVas(r) {
    return Math.abs(vasImplied(r.Cms, r.Sd) - r.Vas) / r.Vas;
}

// ─── solveTSEquations: tiap grup relasi ────────────────────────────────────
test("relasi Q: Qms+Qes -> Qts", () => {
    const p = blank();
    p.Qms = 5.0; p.Qes = 0.41;
    const r = solveTSEquations(p);
    approx(r.Qts, 0.3789, 0.0001);
});

test("relasi Vas-Cms-Sd: Vas+Sd -> Cms", () => {
    const p = blank();
    p.Vas = 160; p.Sd = 830;
    const r = solveTSEquations(p);
    approx(r.Cms, 0.0001673, 0.000001);
});

test("relasi Fs-Mms-Cms: Fs+Mms -> Cms", () => {
    const p = blank();
    p.Fs = 45; p.Mms = 74.8;
    const r = solveTSEquations(p);
    approx(r.Cms, 0.0001672, 0.000002);
});

test("relasi Qes-BL: Fs+Mms+Re+Qes -> BL", () => {
    const p = blank();
    p.Fs = 46; p.Mms = 56.3; p.Re = 5.2; p.Qes = 0.51;
    const r = solveTSEquations(p);
    approx(r.BL, 12.88, 0.02);
});

// ─── computeEstimates: kasus kosong (hanya diameter + jenis) ───────────────
test("kasus kosong woofer 15in: himpunan konsisten, tanpa catatan", () => {
    const r = computeEstimates({ nominalDia: 15, driverType: "woofer" });
    assert.strictEqual(r.Fs, 45);
    assert.strictEqual(r.Vas, 160);
    assert.ok(residualFs(r) < 0.005, `residu Fs ${residualFs(r)}`);
    assert.ok(residualVas(r) < 0.005, `residu Vas ${residualVas(r)}`);
    assert.strictEqual(r.notes.length, 0);
    approx(r.EBP, 109.8, 0.05);
    assert.ok(!("boxClass" in r), "boxClass harus sudah dihapus");
});

test("kasus kosong subwoofer 15in: himpunan konsisten", () => {
    const r = computeEstimates({ nominalDia: 15, driverType: "subwoofer" });
    assert.strictEqual(r.Fs, 32);
    assert.strictEqual(r.Vas, 100);
    assert.ok(residualFs(r) < 0.005, `residu Fs ${residualFs(r)}`);
    assert.ok(residualVas(r) < 0.005, `residu Vas ${residualVas(r)}`);
    assert.strictEqual(r.notes.length, 0);
});

test("kasus kosong subwoofer 18in: himpunan konsisten", () => {
    const r = computeEstimates({ nominalDia: 18, driverType: "subwoofer" });
    assert.strictEqual(r.Fs, 28);
    assert.strictEqual(r.Vas, 200);
    assert.ok(residualFs(r) < 0.005, `residu Fs ${residualFs(r)}`);
    assert.ok(residualVas(r) < 0.005, `residu Vas ${residualVas(r)}`);
    assert.strictEqual(r.notes.length, 0);
});

// ─── computeEstimates: data parsial pengguna ───────────────────────────────
test("data parsial Fs+Sd+Vas: Mms diturunkan, konsisten", () => {
    const r = computeEstimates({
        nominalDia: 15, driverType: "woofer",
        Fs: 40, Sd: 830, Vas: 160,
    });
    approx(r.Mms, 94.6, 0.5);
    assert.ok(residualFs(r) < 0.005, `residu Fs ${residualFs(r)}`);
    assert.ok(residualVas(r) < 0.005, `residu Vas ${residualVas(r)}`);
    assert.strictEqual(r.notes.length, 0);
});

// ─── computeEstimates: kontrol datasheet Desibel 30601 ─────────────────────
test("kontrol datasheet 30601: lulus, hanya catatan Qts", () => {
    const r = computeEstimates({
        nominalDia: 12, driverType: "woofer",
        Fs: 46, Vas: 87.3, Qts: 0.49, Qes: 0.51, Qms: 9.09,
        Re: 5.2, Sd: 543.3, Mms: 56.3, BL: 12.9,
    });
    assert.strictEqual(r.BL, 12.9);
    assert.ok(residualFs(r) < 0.01, `residu Fs ${residualFs(r)}`);
    assert.ok(residualVas(r) < 0.01, `residu Vas ${residualVas(r)}`);
    assert.strictEqual(r.notes.length, 1);
    assert.ok(r.notes[0].includes("Qts"), "catatan harus soal Qts");
});

// ─── computeEstimates: konflik input harus memicu peringatan ───────────────
test("konflik Fs+Mms+Vas: peringatan Fs berbunyi", () => {
    const r = computeEstimates({
        nominalDia: 15, driverType: "woofer",
        Fs: 40, Mms: 150, Vas: 160, Sd: 830,
    });
    assert.ok(residualFs(r) > 0.05, "residu Fs harus > 5% pada kasus ini");
    assert.ok(
        r.notes.some((n) => n.includes("Peringatan: Fs")),
        "harus ada peringatan Fs, dapat: " + JSON.stringify(r.notes)
    );
});

// ─── computeEstimates: fallback & penyesuaian dicatat ──────────────────────
test("diameter 16in: catatan fallback baris 15in", () => {
    const r = computeEstimates({ nominalDia: 16, driverType: "woofer" });
    assert.ok(residualFs(r) < 0.005, `residu Fs ${residualFs(r)}`);
    assert.ok(
        r.notes.some((n) => n.includes('15"')),
        "harus ada catatan fallback, dapat: " + JSON.stringify(r.notes)
    );
});

test("Qts >= Qes+Qms: penyesuaian Qts dicatat", () => {
    const r = computeEstimates({
        nominalDia: 15, driverType: "woofer",
        Qts: 0.6, Qes: 0.5, Qms: 5.0,
    });
    approx(r.Qts, 0.4545, 0.0001);
    assert.ok(
        r.notes.some((n) => n.includes("Qts")),
        "harus ada catatan Qts, dapat: " + JSON.stringify(r.notes)
    );
});

// ─── Ringkasan ─────────────────────────────────────────────────────────────
console.log(`\n${passed} lulus, ${failed} gagal.`);
process.exitCode = failed ? 1 : 0;
