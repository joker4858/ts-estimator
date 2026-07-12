// acoustics-studio/frontend/app.js
// Joker Acoustics Studio — Client-Side TS Estimator

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
    EBP: null, boxClass: "--"
};

// Inisialisasi Aplikasi
document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
});

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

        // 2. Relasi Vas, Cms, Sd: Vas = 1.38826 * Cms * Sd^2 / 1000 (Cms dalam SI m/N)
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

// ─── PROSES CALCULATE / SOLVE UTAMA ─────────────────────────────────────────
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

    // Ambil input TS yang ditulis user
    const p = {
        Fs: parseFloat(document.getElementById("ts-fs").value) || null,
        Re: parseFloat(document.getElementById("ts-re").value) || null,
        Sd: parseFloat(document.getElementById("ts-sd").value) || null,
        Qms: parseFloat(document.getElementById("ts-qms").value) || null,
        Qes: parseFloat(document.getElementById("ts-qes").value) || null,
        Qts: parseFloat(document.getElementById("ts-qts").value) || null,
        Vas: parseFloat(document.getElementById("ts-vas").value) || null,
        Mms: parseFloat(document.getElementById("ts-mms").value) || null,
        BL: parseFloat(document.getElementById("ts-bl").value) || null,
        Cms: parseFloat(document.getElementById("ts-cms").value) * 0.001 || null, // UI mm/N -> SI m/N
        Le: parseFloat(document.getElementById("ts-le").value) || null,
        Xmax: parseFloat(document.getElementById("ts-xmax").value) || null,
    };

    // Track field mana saja yang auto
    const isAuto = {};
    tsFields.forEach(field => {
        const el = document.getElementById(`ts-${field}`);
        isAuto[field] = !el.value || el.classList.contains("auto-value");
    });

    for (let k in p) {
        if (p[k] !== null && p[k] <= 0) p[k] = null;
    }

    // ─── VALIDASI & PRE-KONDISI HARMONISASI FISIK ───────────────────────────
    // 1. Harmonisasi Qts, Qes, Qms agar tidak bertabrakan secara matematis
    if (p.Qms !== null && p.Qes !== null) {
        p.Qts = parseFloat(((p.Qms * p.Qes) / (p.Qms + p.Qes)).toFixed(4));
    } else if (p.Qes !== null && p.Qts !== null) {
        if (p.Qts >= p.Qes) {
            p.Qts = parseFloat((p.Qes * 0.85).toFixed(3)); // Paksa Qts < Qes
        }
    } else if (p.Qms !== null && p.Qts !== null) {
        if (p.Qts >= p.Qms) {
            p.Qts = parseFloat((p.Qms * 0.85).toFixed(3)); // Paksa Qts < Qms
        }
    }

    // 2. Harmonisasi Re vs Impedansi nominal
    if (impedance !== null && p.Re !== null && p.Re >= impedance) {
        p.Re = parseFloat((impedance * 0.72).toFixed(2));
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
    if (res.Mms === null && res.Cms === null) {
        res.Mms = parseFloat((res.Sd * 0.18).toFixed(1));
    }
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

    // ─── DEFENSIVE SANITY CHECK (Mencegah nilai negatif, NaN, Infinity) ─────
    const finalKeys = ["Fs", "Re", "Sd", "Qms", "Qes", "Qts", "Vas", "Mms", "BL", "Cms", "Le", "Xmax"];
    finalKeys.forEach(k => {
        const defaultValue = averages[k] || (k === "Cms" ? 0.00015 : 1.0);
        if (res[k] === null || isNaN(res[k]) || !isFinite(res[k]) || res[k] <= 0) {
            res[k] = defaultValue;
        }
    });

    res.EBP = parseFloat((res.Fs / res.Qes).toFixed(2));
    res.boxClass = (res.EBP < 50) ? "Sealed Box" : (res.EBP <= 100) ? "Vented (Ported)" : "Horn / Reflex";

    // Simpan ke global state
    Object.assign(state, {
        nominalDia,
        impedance,
        powerRMS,
        ...res
    });
    
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
    state.boxClass = "--";
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
        state.boxClass = "--";
    });
    
    document.getElementById("btn-copy").addEventListener("click", () => {
        const text = generateMarkdown();
        navigator.clipboard.writeText(text).then(() => {
            showToast("Profil Driver berhasil disalin ke Clipboard!", "success");
        }).catch(err => {
            console.error("Gagal menyalin: ", err);
        });
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
    const text = `# Custom Speaker Driver (Estimated Profile)

**Diameter Nominal:** ${state.nominalDia ? state.nominalDia + '"' : "--"} | **Jenis Driver:** ${driverTypeLabel} | **Impedansi:** ${state.impedance ? state.impedance + ' Ohm' : "--"} | **Daya RMS:** ${state.powerRMS ? state.powerRMS + ' W' : "--"}
**EBP:** ${state.EBP || "--"} | **Klasifikasi Box:** ${state.boxClass || "--"}

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

// Trigger build: 2026-07-12 #7

