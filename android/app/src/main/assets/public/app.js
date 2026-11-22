// acoustics-studio/frontend/app.js
// Joker Acoustics Studio — Client-Side TS Estimator
//
// v1.8.1 (Julio, atas perintah Naga — keputusan 7 arah 2026-11-22):
//  - Perbaikan solver v1 (laporan-uji-solver.md): Mms diturunkan dari Fs+Cms,
//    cek residu akhir, penyesuaian input dicatat.
//  - Solver dipisah jadi computeEstimates() murni (tanpa DOM) agar bisa
//    diuji otomatis di Node — lihat test/solver.test.js.
//  - EBP ditampilkan di layar (seksi Hasil Estimasi, index.html).
//  - Klasifikasi box DIHAPUS dari semua output (di luar scope komponen
//    driver, keputusan Naga 2026-11-22 19:04 WIB).
//  - Tombol Salin/Unduh nonaktif sampai solve pertama berhasil.
//  - Salin punya fallback bila navigator.clipboard tidak tersedia.
// File ini drop-in replacement untuk app.js di repo (v1.8.1).

// ─── DATABASE RATA-RATA UNIVERSAL ──────────────────────────────────────────
const UNIVERSAL_AVERAGES = {
    subwoofer: {
        21: { Sd: 1530.0, Fs: 25.0, Vas: 300.0, Qts: 0.45, Qes: 0.50, Qms: 5.5, Re: 3.6, Le: 3.2, Xmax: 15.0 },
        18: { Sd: 1210.0, Fs: 28.0, Vas: 200.0, Qts: 0.48, Qes: 0.54, Qms: 5.0, Re: 3.6, Le: 2.8, Xmax: 12.0 },
        15: { Sd: 830.0,  Fs: 32.0, Vas: 100.0, Qts: 0.50, Qes: 0.56, Qms: 4.8, Re: 3.6, Le: 2.5, Xmax: 10.0 },
        12: { Sd: 530.0,  Fs: 35.0, Vas: 50.0,  Qts: 0.52, Qes: 0.59, Qms: 4.5, Re: 3.6, Le: 2.2, Xmax: 8.5 },
        10: { Sd: 350.0,  Fs: 38.0, Vas: 22.0,  Qts: 0.55, Qes: 0.63, Qms: 4.2, Re: 3.6, Le: 1.8, Xmax: 7.5 },
        8:  { Sd: 220.0,  Fs: 45.0, Vas: 10.0,  Qts: 0.58, Qes: 0.67, Qms: 4.0, Re: 3.6, Le: 1.5, Xmax: 6.0 },
        6:  { Sd: 130.0,  Fs: 55.0, Vas: 4.0,   Qts: 0.60, Qes: 0.70, Qms: 3.8, Re: 3.6, Le: 1.2, Xmax: 5.0 }
    },
    woofer: {
        21: { Sd: 1530.0, Fs: 32.0, Vas: 450.0, Qts: 0.32, Qes: 0.35, Qms: 6.0, Re: 5.6, Le: 2.2, Xmax: 8.0 },
        18: { Sd: 1210.0, Fs: 38.0, Vas: 290.0, Qts: 0.35, Qes: 0.38, Qms: 5.5, Re: 5.6, Le: 1.8, Xmax: 7.0 },
        15: { Sd: 830.0,  Fs: 45.0, Vas: 160.0, Qts: 0.38, Qes: 0.41, Qms: 5.0, Re: 5.6, Le: 1.5, Xmax: 6.0 },
        12: { Sd: 530.0,  Fs: 55.0, Vas: 80.0,  Qts: 0.42, Qes: 0.46, Qms: 4.5, Re: 5.6, Le: 1.2, Xmax: 4.5 },
        10: { Sd: 350.0,  Fs: 65.0, Vas: 40.0,  Qts: 0.45, Qes: 0.50, Qms: 4.2, Re: 5.6, Le: 1.0, Xmax: 4.0 },
        8:  { Sd: 220.0,  Fs: 75.0, Vas: 20.0,  Qts: 0.48, Qes: 0.54, Qms: 4.0, Re: 5.6, Le: 0.8, Xmax: 3.5 },
        6:  { Sd: 130.0,  Fs: 90.0, Vas: 10.0,  Qts: 0.52, Qes: 0.59, Qms: 3.8, Re: 5.6, Le: 0.6, Xmax: 2.5 }
    },
    fullrange: {
        21: { Sd: 1530.0, Fs: 40.0, Vas: 500.0, Qts: 0.45, Qes: 0.50, Qms: 5.0, Re: 5.6, Le: 1.5, Xmax: 4.0 },
        18: { Sd: 1210.0, Fs: 45.0, Vas: 320.0, Qts: 0.48, Qes: 0.54, Qms: 4.5, Re: 5.6, Le: 1.2, Xmax: 3.5 },
        15: { Sd: 830.0,  Fs: 52.0, Vas: 180.0, Qts: 0.52, Qes: 0.59, Qms: 4.2, Re: 5.6, Le: 1.0, Xmax: 3.0 },
        12: { Sd: 530.0,  Fs: 65.0, Vas: 90.0,  Qts: 0.55, Qes: 0.63, Qms: 3.8, Re: 5.6, Le: 0.8, Xmax: 2.0 },
        10: { Sd: 350.0,  Fs: 78.0, Vas: 45.0,  Qts: 0.58, Qes: 0.67, Qms: 3.5, Re: 5.6, Le: 0.6, Xmax: 1.5 },
        8:  { Sd: 220.0,  Fs: 95.0, Vas: 22.0,  Qts: 0.62, Qes: 0.72, Qms: 3.2, Re: 5.6, Le: 0.4, Xmax: 1.2 },
        6:  { Sd: 130.0,  Fs: 110.0,Vas: 11.0,  Qts: 0.68, Qes: 0.80, Qms: 3.0, Re: 5.6, Le: 0.3, Xmax: 1.0 }
    }
};

// List field TS yang digunakan di UI
const tsFields = ["fs", "re", "sd", "qms", "qes", "qts", "vas", "mms", "bl", "cms", "le", "xmax"];
const fieldMap = {
    "fs": "Fs", "re": "Re", "sd": "Sd", "qms": "Qms", "qes": "Qes", "qts": "Qts",
    "vas": "Vas", "mms": "Mms", "bl": "BL", "cms": "Cms", "le": "Le", "xmax": "Xmax"
};

// Global state
const state = {
    nominalDia: null,
    impedance: null,
    powerRMS: null,
    Fs: null, Re: null, Sd: null, Qms: null, Qes: null, Qts: null,
    Vas: null, Mms: null, BL: null, Cms: null, Le: null, Xmax: null,
    EBP: null,
    solved: false,
    notes: []
};

// Inisialisasi Aplikasi (dilewati saat berkas dimuat di Node untuk pengujian)
if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
        setupEventListeners();
    });
}

// ─── LOGICAL T/S SOLVER (MURNI JAVASCRIPT) ──────────────────────────────────
function solveTSEquations(p) {
    let changed = true;
    let iterations = 0;

    while (changed && iterations < 20) {
        changed = false;
        iterations++;

        // 1. Relasi Qts, Qes, Qms: Qts = (Qms * Qes) / (Qms + Qes)
        if (p.Qts !== null && p.Qms !== null && p.Qes === null) {
            if (p.Qms > p.Qts && p.Qts > 0) {
                p.Qes = parseFloat(((p.Qms * p.Qts) / (p.Qms - p.Qts)).toFixed(4));
                changed = true;
            }
        }
        if (p.Qts !== null && p.Qes !== null && p.Qms === null) {
            if (p.Qes > p.Qts && p.Qts > 0) {
                p.Qms = parseFloat(((p.Qes * p.Qts) / (p.Qes - p.Qts)).toFixed(2));
                changed = true;
            }
        }
        if (p.Qes !== null && p.Qms !== null && p.Qts === null) {
            const denom = p.Qms + p.Qes;
            if (denom > 0) {
                p.Qts = parseFloat(((p.Qms * p.Qes) / denom).toFixed(4));
                changed = true;
            }
        }

        // 2. Relasi Vas, Cms, Sd: Vas(L) = 1.38826 * Cms(SI m/N) * Sd(cm^2)^2
        if (p.Vas !== null && p.Sd !== null && p.Cms === null) {
            if (p.Sd > 0) {
                p.Cms = parseFloat((p.Vas / (1.38826 * Math.pow(p.Sd, 2))).toFixed(7));
                changed = true;
            }
        }
        if (p.Cms !== null && p.Sd !== null && p.Vas === null) {
            p.Vas = parseFloat((1.38826 * p.Cms * Math.pow(p.Sd, 2)).toFixed(2));
            changed = true;
        }
        if (p.Vas !== null && p.Cms !== null && p.Sd === null) {
            if (p.Cms > 0) {
                p.Sd = parseFloat(Math.sqrt(p.Vas / (1.38826 * p.Cms)).toFixed(1));
                changed = true;
            }
        }

        // 3. Relasi Fs, Mms, Cms: Fs = 1 / (2*pi*sqrt(Mms_kg * Cms))
        if (p.Fs !== null && p.Mms !== null && p.Cms === null) {
            if (p.Fs > 0 && p.Mms > 0) {
                p.Cms = parseFloat((1.0 / (Math.pow(2.0 * Math.PI * p.Fs, 2) * p.Mms * 0.001)).toFixed(7));
                changed = true;
            }
        }
        if (p.Fs !== null && p.Cms !== null && p.Mms === null) {
            if (p.Fs > 0 && p.Cms > 0) {
                p.Mms = parseFloat((1.0 / (Math.pow(2.0 * Math.PI * p.Fs, 2) * p.Cms * 0.001)).toFixed(2));
                changed = true;
            }
        }
        if (p.Mms !== null && p.Cms !== null && p.Fs === null) {
            if (p.Mms > 0 && p.Cms > 0) {
                p.Fs = parseFloat((1.0 / (2.0 * Math.PI * Math.sqrt(p.Mms * 0.001 * p.Cms))).toFixed(1));
                changed = true;
            }
        }

        // 4. Relasi Qes, Fs, Mms, Re, BL: Qes = (2 * pi * Fs * Mms_kg * Re) / BL^2
        if (p.Fs !== null && p.Mms !== null && p.Re !== null && p.Qes !== null && p.BL === null) {
            if (p.Qes > 0) {
                p.BL = parseFloat(Math.sqrt((2.0 * Math.PI * p.Fs * p.Mms * 0.001 * p.Re) / p.Qes).toFixed(2));
                changed = true;
            }
        }
        if (p.Fs !== null && p.Mms !== null && p.Re !== null && p.BL !== null && p.Qes === null) {
            if (p.BL > 0) {
                p.Qes = parseFloat(((2.0 * Math.PI * p.Fs * p.Mms * 0.001 * p.Re) / Math.pow(p.BL, 2)).toFixed(4));
                changed = true;
            }
        }
        if (p.Qes !== null && p.BL !== null && p.Re !== null && p.Fs !== null && p.Mms === null) {
            if (p.Fs * p.Re > 0) {
                p.Mms = parseFloat(((p.Qes * Math.pow(p.BL, 2)) / (2.0 * Math.PI * p.Fs * 0.001 * p.Re)).toFixed(2));
                changed = true;
            }
        }
        if (p.Qes !== null && p.BL !== null && p.Mms !== null && p.Fs !== null && p.Re === null) {
            if (p.Fs * p.Mms > 0) {
                p.Re = parseFloat(((p.Qes * Math.pow(p.BL, 2)) / (2.0 * Math.PI * p.Fs * p.Mms * 0.001)).toFixed(2));
                changed = true;
            }
        }
        if (p.Qes !== null && p.BL !== null && p.Mms !== null && p.Re !== null && p.Fs === null) {
            if (p.Mms * p.Re > 0) {
                p.Fs = parseFloat(((p.Qes * Math.pow(p.BL, 2)) / (2.0 * Math.PI * p.Mms * 0.001 * p.Re)).toFixed(1));
                changed = true;
            }
        }
    }
    return p;
}

// ─── ESTIMASI MURNI (tanpa DOM — bisa diuji di Node) ────────────────────────
// input: {nominalDia, driverType, impedance, powerRMS,
//         Fs, Re, Sd, Qms, Qes, Qts, Vas, Mms, BL, Cms, Le, Xmax}
//   - Cms dalam SI (m/N); pemanggil dari UI mengonversi mm/N -> SI.
//   - Nilai null = tidak diketahui (akan diisi solver / rata-rata).
// output: {...parameter akhir, EBP, notes, size}
function computeEstimates(input) {
    const p = {
        Fs: input.Fs ?? null,
        Re: input.Re ?? null,
        Sd: input.Sd ?? null,
        Qms: input.Qms ?? null,
        Qes: input.Qes ?? null,
        Qts: input.Qts ?? null,
        Vas: input.Vas ?? null,
        Mms: input.Mms ?? null,
        BL: input.BL ?? null,
        Cms: input.Cms ?? null,
        Le: input.Le ?? null,
        Xmax: input.Xmax ?? null,
    };
    const nominalDia = input.nominalDia ?? null;
    const driverType = input.driverType || "woofer";
    const impedance = input.impedance ?? null;

    for (let k in p) {
        if (p[k] !== null && p[k] <= 0) p[k] = null;
    }

    // ─── VALIDASI & PRE-KONDISI HARMONISASI FISIK ───────────────────────────
    // Penyesuaian terhadap input pengguna DICATAT di solverNotes (ditampilkan
    // di UI dan ikut dalam export), tidak lagi dilakukan diam-diam.
    const solverNotes = [];
    // 1. Harmonisasi Qts, Qes, Qms agar tidak bertabrakan secara matematis
    if (p.Qms !== null && p.Qes !== null) {
        const qtsCalc = parseFloat(((p.Qms * p.Qes) / (p.Qms + p.Qes)).toFixed(4));
        if (p.Qts !== null && Math.abs(p.Qts - qtsCalc) > 0.005) {
            solverNotes.push(`Qts disesuaikan ${p.Qts} → ${qtsCalc} agar konsisten dengan Qms/Qes.`);
        }
        p.Qts = qtsCalc;
    } else if (p.Qes !== null && p.Qts !== null) {
        if (p.Qts >= p.Qes) {
            const qtsAdj = parseFloat((p.Qes * 0.85).toFixed(3));
            solverNotes.push(`Qts ${p.Qts} tidak mungkin (≥ Qes) — disesuaikan menjadi ${qtsAdj}.`);
            p.Qts = qtsAdj; // Paksa Qts < Qes
        }
    } else if (p.Qms !== null && p.Qts !== null) {
        if (p.Qts >= p.Qms) {
            const qtsAdj = parseFloat((p.Qms * 0.85).toFixed(3));
            solverNotes.push(`Qts ${p.Qts} tidak mungkin (≥ Qms) — disesuaikan menjadi ${qtsAdj}.`);
            p.Qts = qtsAdj; // Paksa Qts < Qms
        }
    }

    // 2. Harmonisasi Re vs Impedansi nominal
    if (impedance !== null && p.Re !== null && p.Re >= impedance) {
        const reAdj = parseFloat((impedance * 0.72).toFixed(2));
        solverNotes.push(`Re ${p.Re} Ω tidak mungkin (≥ impedansi nominal) — disesuaikan menjadi ${reAdj} Ω.`);
        p.Re = reAdj;
    }

    // ─── INTERNAL HEURISTIC SIZE CLASSIFIER ─────────────────────────────────
    let size = 15; // default fallback
    if (nominalDia !== null) {
        size = nominalDia;
    } else if (p.Sd !== null) {
        if (p.Sd > 1200) size = 18;
        else if (p.Sd > 700) size = 15;
        else if (p.Sd > 450) size = 12;
        else if (p.Sd > 300) size = 10;
        else if (p.Sd > 180) size = 8;
        else size = 6;
    } else if (p.Vas !== null) {
        if (p.Vas > 200) size = 18;
        else if (p.Vas > 100) size = 15;
        else if (p.Vas > 50) size = 12;
        else if (p.Vas > 25) size = 10;
        else if (p.Vas > 12) size = 8;
        else size = 6;
    }

    // Ambil database rata-rata berdasarkan jenis driver dan estimasi ukuran
    const categoryAverages = UNIVERSAL_AVERAGES[driverType] || UNIVERSAL_AVERAGES.woofer;
    const averages = categoryAverages[size] || categoryAverages[15];
    if (!categoryAverages[size]) {
        solverNotes.push(`Diameter ${size}" tidak ada di tabel rata-rata — memakai baris 15" sebagai pendekatan.`);
    }

    // Step 1: Jalankan solver pertama kali
    let res = solveTSEquations({ ...p });

    // Step 2: Terapkan database Averages/Estimasi untuk parameter yang masih kosong
    if (res.Fs === null) res.Fs = averages.Fs;
    if (res.Qms === null) res.Qms = averages.Qms;
    if (res.Qes === null) res.Qes = averages.Qes;

    // Estimasi Re
    if (res.Re === null) {
        res.Re = impedance ? parseFloat((impedance * 0.72).toFixed(2)) : averages.Re;
    }

    // Estimasi Sd (Menggunakan factor 0.85 untuk merepresentasikan area efektif cone sesungguhnya)
    if (res.Sd === null) {
        if (nominalDia) {
            const d_mm = nominalDia * 25.4;
            const d_eff = d_mm * 0.85;
            res.Sd = parseFloat((Math.PI * Math.pow(d_eff / 2, 2) / 100).toFixed(1));
        } else {
            res.Sd = averages.Sd;
        }
    }

    if (res.Vas === null && res.Cms === null) res.Vas = averages.Vas;
    // Mms TIDAK lagi diisi dari heuristik Sd*0.18 (terbukti meleset +74% pada
    // woofer nyata dan membuat himpunan akhir inkonsisten). Mms diturunkan
    // dari Fs+Cms pada langkah "Asuransi akhir" di bawah — selalu bisa, karena
    // Fs (pengguna/tabel) dan Cms (pengguna/Vas+Sd) selalu tersedia.
    if (res.Le === null) res.Le = averages.Le;
    if (res.Xmax === null) res.Xmax = averages.Xmax;

    // Solver final
    res = solveTSEquations(res);

    // Asuransi akhir untuk sinkronisasi relasi Vas/Cms/Mms/BL
    if (res.Cms === null) {
        if (res.Vas !== null && res.Sd !== null && res.Sd > 0) {
            res.Cms = parseFloat((res.Vas / (1.38826 * Math.pow(res.Sd, 2))).toFixed(7));
        } else {
            res.Cms = 0.00015; // 0.15 mm/N in SI units (m/N)
        }
    }
    if (res.Vas === null) {
        res.Vas = parseFloat((1.38826 * res.Cms * Math.pow(res.Sd, 2)).toFixed(2));
    }
    if (res.Mms === null) {
        res.Mms = parseFloat((1.0 / (Math.pow(2.0 * Math.PI * res.Fs, 2) * res.Cms * 0.001)).toFixed(2));
    }
    if (res.Qes === null) {
        res.Qes = averages.Qes;
    }
    if (res.Qts === null) {
        res.Qts = parseFloat(((res.Qms * res.Qes) / (res.Qms + res.Qes)).toFixed(4));
    }
    if (res.BL === null) {
        res.BL = parseFloat(Math.sqrt((2.0 * Math.PI * res.Fs * res.Mms * 0.001 * res.Re) / res.Qes).toFixed(2));
    }

    // ─── CEK RESIDU AKHIR (himpunan estimasi harus konsisten secara internal) ─
    // Hitung ulang Fs dan Vas dari parameter akhir; bila selisih > 5% berarti
    // ada input yang saling bertentangan — beri peringatan, jangan diam.
    if (res.Mms > 0 && res.Cms > 0 && res.Sd > 0) {
        const fsImplied = 1.0 / (2.0 * Math.PI * Math.sqrt(res.Mms * 0.001 * res.Cms));
        const vasImplied = 1.38826 * res.Cms * Math.pow(res.Sd, 2);
        const qtsImplied = (res.Qms * res.Qes) / (res.Qms + res.Qes);
        if (res.Fs > 0 && Math.abs(fsImplied - res.Fs) / res.Fs > 0.05) {
            solverNotes.push(`Peringatan: Fs ${res.Fs} Hz tidak konsisten dengan Mms+Cms (tersirat ${fsImplied.toFixed(1)} Hz) — periksa kembali data input.`);
        }
        if (res.Vas > 0 && Math.abs(vasImplied - res.Vas) / res.Vas > 0.05) {
            solverNotes.push(`Peringatan: Vas ${res.Vas} L tidak konsisten dengan Cms+Sd (tersirat ${vasImplied.toFixed(1)} L) — periksa kembali data input.`);
        }
        if (res.Qts > 0 && Math.abs(qtsImplied - res.Qts) / res.Qts > 0.05) {
            solverNotes.push(`Peringatan: Qts ${res.Qts} tidak konsisten dengan Qms/Qes (tersirat ${qtsImplied.toFixed(4)}).`);
        }
    }

    // ─── DEFENSIVE SANITY CHECK (Mencegah nilai negatif, NaN, Infinity) ─────
    const finalKeys = ["Fs", "Re", "Sd", "Qms", "Qes", "Qts", "Vas", "Mms", "BL", "Cms", "Le", "Xmax"];
    finalKeys.forEach(k => {
        const defaultValue = averages[k] || (k === "Cms" ? 0.00015 : 1.0);
        if (res[k] === null || isNaN(res[k]) || !isFinite(res[k]) || res[k] <= 0) {
            res[k] = defaultValue;
        }
    });

    // EBP = Fs / Qes — angka turunan TS, ditampilkan di layar dan export.
    // (Klasifikasi box sengaja TIDAK dihitung: di luar scope komponen driver.)
    res.EBP = parseFloat((res.Fs / res.Qes).toFixed(2));

    return { ...res, EBP: res.EBP, notes: solverNotes, size };
}

// ─── PROSES CALCULATE / SOLVE UTAMA (pembungkus DOM di atas computeEstimates) ─
function triggerSolve(updateUIFields = true) {
    const nominalDiaEl = document.getElementById("ts-nominal-dia");
    const driverTypeEl = document.getElementById("ts-driver-type");

    let isValid = true;

    if (!nominalDiaEl.value) {
        nominalDiaEl.classList.add("input-error");
        isValid = false;
    } else {
        nominalDiaEl.classList.remove("input-error");
    }

    if (!driverTypeEl.value) {
        driverTypeEl.classList.add("input-error");
        isValid = false;
    } else {
        driverTypeEl.classList.remove("input-error");
    }

    if (!isValid) {
        showToast("Nominal Diameter dan Jenis Driver wajib diisi!", "error");
        return;
    }

    // Ambil input parameter umum
    const nominalDia = parseFloat(nominalDiaEl.value) || null;
    const driverType = driverTypeEl.value || "woofer";
    const impedance = parseFloat(document.getElementById("ts-impedance").value) || null;
    const powerRMS = parseFloat(document.getElementById("ts-power-rms").value) || null;

    // Ambil input TS yang ditulis user (Cms UI mm/N -> SI m/N)
    const input = {
        nominalDia,
        driverType,
        impedance,
        powerRMS,
        Fs: parseFloat(document.getElementById("ts-fs").value) || null,
        Re: parseFloat(document.getElementById("ts-re").value) || null,
        Sd: parseFloat(document.getElementById("ts-sd").value) || null,
        Qms: parseFloat(document.getElementById("ts-qms").value) || null,
        Qes: parseFloat(document.getElementById("ts-qes").value) || null,
        Qts: parseFloat(document.getElementById("ts-qts").value) || null,
        Vas: parseFloat(document.getElementById("ts-vas").value) || null,
        Mms: parseFloat(document.getElementById("ts-mms").value) || null,
        BL: parseFloat(document.getElementById("ts-bl").value) || null,
        Cms: parseFloat(document.getElementById("ts-cms").value) * 0.001 || null,
        Le: parseFloat(document.getElementById("ts-le").value) || null,
        Xmax: parseFloat(document.getElementById("ts-xmax").value) || null,
    };

    // Track field mana saja yang auto
    const isAuto = {};
    tsFields.forEach(field => {
        const el = document.getElementById(`ts-${field}`);
        isAuto[field] = !el.value || el.classList.contains("auto-value");
    });

    // Hitung (logika murni — sama persis dengan yang diuji test/solver.test.js)
    const res = computeEstimates(input);

    // Simpan ke global state
    Object.assign(state, {
        nominalDia,
        impedance,
        powerRMS,
        ...res
    });
    state.notes = res.notes;
    state.solved = true;

    if (updateUIFields) {
        tsFields.forEach(field => {
            const el = document.getElementById(`ts-${field}`);
            let stateVal = state[fieldMap[field]];

            if (stateVal !== null && stateVal !== undefined) {
                // Konversi Cms kembali ke mm/N untuk display UI
                if (field === "cms") {
                    stateVal = parseFloat((stateVal * 1000).toFixed(3));
                }
                el.value = stateVal;
                if (isAuto[field]) {
                    el.classList.add("auto-value");
                } else {
                    el.classList.remove("auto-value");
                }
            }
        });
    }

    updateEbpDisplay();
    setExportEnabled(true);
    renderSolverNotes();
}

// ─── TAMPILAN HASIL EBP ─────────────────────────────────────────────────────
function updateEbpDisplay() {
    const box = document.getElementById("ebp-result");
    const val = document.getElementById("ebp-value");
    if (!box || !val) return;
    if (state.solved && state.EBP) {
        val.textContent = state.EBP;
        box.style.display = "flex";
    } else {
        val.textContent = "--";
        box.style.display = "none";
    }
}

// ─── TOMBOL EXPORT AKTIF HANYA SETELAH SOLVE ───────────────────────────────
function setExportEnabled(enabled) {
    ["btn-copy", "btn-download"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = !enabled;
    });
}

// ─── EVENT BINDINGS ────────────────────────────────────────────────────────
function clearAutoCalculatedFields() {
    tsFields.forEach(field => {
        const el = document.getElementById(`ts-${field}`);
        if (el && el.classList.contains("auto-value")) {
            el.value = "";
            el.classList.remove("auto-value");
            state[fieldMap[field]] = null;
        }
    });
    state.EBP = null;
    state.solved = false;
    // Hasil solve sudah kedaluwarsa begitu input berubah.
    state.notes = [];
    updateEbpDisplay();
    setExportEnabled(false);
    renderSolverNotes();
}

// ─── TAMPILAN CATATAN & PERINGATAN SOLVER ─────────────────────────────────
// Kotak dibuat dinamis (tanpa mengubah index.html); tampil hanya bila ada isi.
function renderSolverNotes() {
    let box = document.getElementById("solver-notes");
    if (!box) {
        const container = document.querySelector("#solver-card .scrollable-content");
        if (!container) return;
        box = document.createElement("div");
        box.id = "solver-notes";
        box.style.cssText = "margin:10px 0;padding:10px 12px;border-left:3px solid var(--accent-orange, #f90);background:rgba(255,255,255,0.04);border-radius:8px;font-size:13px;line-height:1.5;";
        container.appendChild(box);
    }
    const notes = state.notes || [];
    if (!notes.length) {
        box.style.display = "none";
        box.innerHTML = "";
        return;
    }
    box.style.display = "block";
    box.innerHTML = "<strong>Catatan solver</strong><ul style=\"margin:6px 0 0;padding-left:18px;\">" +
        notes.map(n => `<li>${n}</li>`).join("") + "</ul>";
}

function setupEventListeners() {
    const allInputIds = [
        "ts-nominal-dia", "ts-driver-type", "ts-impedance", "ts-power-rms",
        "ts-fs", "ts-re", "ts-sd", "ts-qms", "ts-qes",
        "ts-qts", "ts-vas", "ts-mms", "ts-bl", "ts-cms",
        "ts-le", "ts-xmax"
    ];

    allInputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const eventName = el.tagName === "SELECT" ? "change" : "input";
            el.addEventListener(eventName, () => {
                if (el.classList.contains("auto-value")) {
                    el.classList.remove("auto-value");
                }
                if (el.classList.contains("input-error")) {
                    el.classList.remove("input-error");
                }
                clearAutoCalculatedFields();
            });
        }
    });

    // Tombol export nonaktif sampai solve pertama berhasil.
    setExportEnabled(false);

    document.getElementById("btn-solve").addEventListener("click", () => {
        triggerSolve(true);
    });

    document.getElementById("btn-reset").addEventListener("click", () => {
        const inputs = document.querySelectorAll("input[type='number']");
        inputs.forEach(inp => {
            inp.value = "";
            inp.classList.remove("auto-value");
            inp.classList.remove("input-error");
        });
        const driverTypeEl = document.getElementById("ts-driver-type");
        if (driverTypeEl) {
            driverTypeEl.value = "";
            driverTypeEl.classList.remove("input-error");
        }
        // Reset global state
        state.nominalDia = null;
        state.impedance = null;
        state.powerRMS = null;
        tsFields.forEach(field => {
            state[fieldMap[field]] = null;
        });
        state.EBP = null;
        state.solved = false;
        state.notes = [];
        updateEbpDisplay();
        setExportEnabled(false);
        renderSolverNotes();
    });

    document.getElementById("btn-copy").addEventListener("click", () => {
        const text = generateMarkdown();
        const done = () => showToast("Profil Driver berhasil disalin ke Clipboard!", "success");
        const fail = (err) => {
            console.error("Gagal menyalin: ", err);
            showToast("Gagal menyalin — coba Unduh Berkas Driver.", "error");
        };
        // navigator.clipboard tidak tersedia di file:// / non-HTTPS — pakai fallback.
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done, fail));
        } else {
            fallbackCopy(text, done, fail);
        }
    });

    document.getElementById("btn-download").addEventListener("click", () => {
        const text = generateMarkdown();
        const name = prompt("Nama File (misal: 15-Legacy-Subwoofer):", "Custom-Driver");
        if (!name) return;

        const sanitizedName = name.replace(/[^a-zA-Z0-9\-_]/g, "_");
        const fileName = `${sanitizedName}.txt`;

        // Cek lingkungan native Capacitor
        if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
            const { Filesystem, Share } = window.Capacitor.Plugins;
            if (Filesystem && Share) {
                Filesystem.writeFile({
                    path: fileName,
                    data: text,
                    directory: 'CACHE',
                    encoding: 'UTF8'
                }).then((writeResult) => {
                    return Share.share({
                        files: [writeResult.uri],
                        dialogTitle: `Bagikan / Simpan ${name}`
                    });
                }).catch(err => {
                    console.error("Gagal menyimpan atau membagikan via Capacitor:", err);
                    alert("Gagal membagikan/menyimpan berkas: " + err.message);
                });
                return;
            }
        }

        if (navigator.share) {
            try {
                const file = new File([text], fileName, { type: "text/plain" });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    navigator.share({
                        files: [file],
                        title: `Profil Driver ${name}`,
                        text: `Parameter TS untuk ${name}`
                    }).catch(err => {
                        console.error("User membatalkan share atau gagal:", err);
                        fallbackDownload(text, fileName);
                    });
                    return;
                }
            } catch (e) {
                console.error("Gagal menggunakan Share API, fallback ke download:", e);
            }
        }

        fallbackDownload(text, fileName);
    });
}

// Fallback salin untuk konteks tanpa Clipboard API (file://, HTTP biasa).
function fallbackCopy(text, done, fail) {
    try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (ok) done();
        else fail(new Error("execCommand mengembalikan false"));
    } catch (err) {
        fail(err);
    }
}

function fallbackDownload(text, fileName) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}

// Generator Markdown Driver
function generateMarkdown() {
    const driverTypeEl = document.getElementById("ts-driver-type");
    const driverTypeLabel = driverTypeEl ? driverTypeEl.options[driverTypeEl.selectedIndex].text : "Woofer / Mid-Bass";
    const cmsVal = state.Cms ? (state.Cms * 1000).toFixed(3) : "--";
    const notesVal = (state.notes && state.notes.length)
        ? `\n**Catatan solver:**\n${state.notes.map(n => `- ${n}`).join("\n")}\n`
        : "";
    const text = `# Custom Speaker Driver (Estimated Profile)

**Diameter Nominal:** ${state.nominalDia ? state.nominalDia + '"' : "--"} | **Jenis Driver:** ${driverTypeLabel} | **Impedansi:** ${state.impedance ? state.impedance + ' Ohm' : "--"} | **Daya RMS:** ${state.powerRMS ? state.powerRMS + ' W' : "--"}
**EBP:** ${state.EBP || "--"}

| Parameter | Nilai | Keterangan |
|---|---|---|
| Sd | ${state.Sd || "--"} cm² | (Estimated/Solved) |
| Fs | ${state.Fs || "--"} Hz | (Estimated/Solved) |
| Vas | ${state.Vas || "--"} L | (Estimated/Solved) |
| Qts | ${state.Qts || "--"} | (Estimated/Solved) |
| Qes | ${state.Qes || "--"} | (Estimated/Solved) |
| Qms | ${state.Qms || "--"} | (Estimated/Solved) |
| Re | ${state.Re || "--"} Ohm | (Estimated/Solved) |
| Le | ${state.Le || "--"} mH | (Estimated/Solved) |
| Xmax | ${state.Xmax || "--"} mm | (Estimated/Solved) |
| Mms | ${state.Mms || "--"} g | (Estimated/Solved) |
| BL | ${state.BL || "--"} T.m | (Estimated/Solved) |
| Cms | ${cmsVal} mm/N | (Estimated/Solved) |
${notesVal}
**Estimator:** Joker Acoustics Studio Offline TS Estimator
`;
    return text;
}

// ─── TOAST NOTIFICATION UTILITY ──────────────────────────────────────────────
function showToast(message, type = "error") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const icon = type === "success" ? "✅" : "⚠️";
    container.className = `toast-container toast-${type}`;
    container.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-msg">${message}</span>
    `;

    // Trigger slide-in
    setTimeout(() => {
        container.classList.add("show");
    }, 10);

    // Hide and slide-out after 3s
    setTimeout(() => {
        container.classList.remove("show");
    }, 3000);
}

// Ekspor untuk pengujian Node (tanpa DOM); diabaikan di browser.
if (typeof module !== "undefined" && module.exports) {
    module.exports = { solveTSEquations, computeEstimates, UNIVERSAL_AVERAGES };
}

// Trigger build: 2026-07-12 #7
