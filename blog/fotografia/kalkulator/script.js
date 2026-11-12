// --- 1. ZARZĄDZANIE KŁÓDKAMI ---
let locks = { focal: true, pinhole: false };

function toggleLock(field) {
    if (field === 'focal') {
        locks.focal = !locks.focal;
        if (locks.focal) locks.pinhole = false;
    } else if (field === 'pinhole') {
        locks.pinhole = !locks.pinhole;
        if (locks.pinhole) locks.focal = false;
    }
    updateLockUI();
}

function updateLockUI() {
    document.getElementById('lock-focal').innerText = locks.focal ? "🔒" : "🔓";
    document.getElementById('lock-focal').className = "lock-btn " + (locks.focal ? "locked" : "");
    document.getElementById('lock-pinhole').innerText = locks.pinhole ? "🔒" : "🔓";
    document.getElementById('lock-pinhole').className = "lock-btn " + (locks.pinhole ? "locked" : "");
}

// --- 2. OBLICZENIA OPTYKI I GEOMETRII ---
function przeliczGeometrie(zrodlo) {
    let focalInput = document.getElementById('focal');
    let pinholeInput = document.getElementById('pinhole');
    let fstopInput = document.getElementById('fstop-input');

    let f = parseFloat(focalInput.value);
    let d = parseFloat(pinholeInput.value);
    let F = parseFloat(fstopInput.value);

    if (zrodlo === 'focal' || zrodlo === 'pinhole') {
        if (!isNaN(f) && !isNaN(d) && d > 0) {
            fstopInput.value = Math.round(f / d);
        } else {
            fstopInput.value = "";
        }
    } else if (zrodlo === 'fstop') {
        if (!isNaN(F) && F > 0) {
            if (locks.focal && !isNaN(f)) {
                pinholeInput.value = (f / F).toFixed(3);
            } else if (locks.pinhole && !isNaN(d)) {
                focalInput.value = Math.round(d * F);
            }
        }
    }

    // Aktualizacja optymalnej dziurki
    let nowaOgniskowa = parseFloat(focalInput.value);
    if (!isNaN(nowaOgniskowa) && nowaOgniskowa > 0) {
        let opt = 0.036 * Math.sqrt(nowaOgniskowa);
        document.getElementById('wynik-optymalna').innerText = "Optymalna dziurka: " + opt.toFixed(3) + " mm";
    } else {
        document.getElementById('wynik-optymalna').innerText = "Optymalna dziurka: -";
    }

    obliczWszystko();
}

// --- 3. DWUKIERUNKOWE PRZELICZANIE ŚWIATŁA (EV <-> Lux) ---
function przeliczSwiatlo(zrodlo) {
    let poleEV = document.getElementById('ev');
    let poleLux = document.getElementById('lux-input');

    if (zrodlo === 'ev') {
        let ev = parseFloat(poleEV.value);
        if (!isNaN(ev)) {
            poleLux.value = Math.round(2.5 * Math.pow(2, ev));
        } else {
            poleLux.value = "";
        }
    } else if (zrodlo === 'lux') {
        let lux = parseFloat(poleLux.value);
        if (!isNaN(lux) && lux > 0) {
            poleEV.value = (Math.log(lux / 2.5) / Math.log(2)).toFixed(1);
        } else {
            poleEV.value = "";
        }
    }
    obliczWszystko();
}

// --- 4. GŁÓWNA FUNKCJA WYLICZAJĄCA CZAS I WIZUALIZACJĘ ---
function obliczWszystko() {
    let focal = parseFloat(document.getElementById('focal').value);
    let aktywnaPrzyslona = parseFloat(document.getElementById('fstop-input').value);
    let lux = parseFloat(document.getElementById('lux-input').value);
    let filmWidth = parseFloat(document.getElementById('filmWidth').value) || 20;

    let isValid = (val) => !isNaN(val) && val > 0;

    // Obliczenie czasu
    if (isValid(aktywnaPrzyslona) && isValid(lux)) {
        let iso = 3; 
        let c = 250; 
        let p_factor = 1.30;
        
        let time_linear = (Math.pow(aktywnaPrzyslona, 2) * c) / (lux * iso);
        let time_final = time_linear > 1.0 ? Math.pow(time_linear, p_factor) : time_linear;

        if (time_final >= 60) {
            let minuty = Math.floor(time_final / 60);
            let sekundy = Math.floor(time_final % 60);
            document.getElementById('wynik-czas').innerText = minuty + " min " + sekundy + " s";
        } else {
            document.getElementById('wynik-czas').innerText = time_final.toFixed(2) + " s";
        }
    } else {
        document.getElementById('wynik-czas').innerText = "-";
    }

    // Rysowanie aparatu
    rysujCanvas(focal, filmWidth);
}

// --- 5. RYSOWANIE GEOMETRII (CANVAS) ---
function rysujCanvas(focal, filmWidth) {
    let canvas = document.getElementById('symulacja');
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let pinhole = parseFloat(document.getElementById('pinhole').value) || 0;

    if (!focal || focal <= 0 || !filmWidth || filmWidth <= 0) return;

    let cx = canvas.width / 2;
    let cy = canvas.height / 2;
    
    // NOWA LOGIKA SKALOWANIA
    let bazowaSkala = 4; // Sztywna skala: 1 mm w rzeczywistości = 5 pikseli na ekranie
    let maxRozmiar = 300; // Maksymalna ilość pikseli, żeby rysunek nie uciekł za krawędź
    
    let scale = bazowaSkala;
    
    // Zmniejszamy skalę ("oddalamy kamerę") TYLKO wtedy, gdy aparat nie mieści się na płótnie
    if (focal * scale > maxRozmiar) {
        scale = maxRozmiar / focal;
    }
    if (filmWidth * scale > maxRozmiar) {
        scale = Math.min(scale, maxRozmiar / filmWidth);
    }
    
    let drawFocal = focal * scale;
    let drawFilm = filmWidth * scale;

    let filmY = cy + (drawFocal / 2);
    let frontY = cy - (drawFocal / 2);

    // Płaszczyzna filmu (Tył aparatu)
    ctx.strokeStyle = "#4CAF50"; ctx.lineWidth = 4;
    ctx.beginPath(); 
    ctx.moveTo(cx - (drawFilm / 2), filmY); 
    ctx.lineTo(cx + (drawFilm / 2), filmY); 
    ctx.stroke();

    // Front aparatu z przerwą na dziurkę
    ctx.strokeStyle = "#888"; ctx.lineWidth = 2;
    ctx.beginPath(); 
    ctx.moveTo(cx - 180, frontY); ctx.lineTo(cx - 5, frontY); 
    ctx.moveTo(cx + 5, frontY); ctx.lineTo(cx + 180, frontY); 
    ctx.stroke();

    // Stożek światła (Trójkąt)
    ctx.fillStyle = "rgba(76, 175, 80, 0.15)";
    ctx.beginPath(); 
    ctx.moveTo(cx, frontY); 
    ctx.lineTo(cx - (drawFilm / 2), filmY); 
    ctx.lineTo(cx + (drawFilm / 2), filmY); 
    ctx.closePath(); 
    ctx.fill();

    // ==========================================
    // --- LINIE WYMIAROWE ---
    ctx.fillStyle = "#4fc3f7";   
    ctx.strokeStyle = "#4fc3f7";
    ctx.lineWidth = 1;
    ctx.font = "12px sans-serif";

    // 1. OGNISKOWA 
    let dimX = cx - (drawFilm / 2) - 20; 
    if (dimX < 20) dimX = 20; 

    ctx.beginPath(); ctx.moveTo(dimX, frontY); ctx.lineTo(dimX, filmY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(dimX - 4, frontY + 6); ctx.lineTo(dimX, frontY); ctx.lineTo(dimX + 4, frontY + 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(dimX - 4, filmY - 6); ctx.lineTo(dimX, filmY); ctx.lineTo(dimX + 4, filmY - 6); ctx.stroke();
    
    ctx.save();
    ctx.translate(dimX - 8, cy);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("f = " + focal + " mm", 0, 0);
    ctx.restore();

    // 2. ŚREDNICA OTWORU 
    ctx.textAlign = "center";
    ctx.beginPath(); ctx.moveTo(cx + 25, frontY - 25); ctx.lineTo(cx + 3, frontY - 3); ctx.stroke();
    ctx.fillText("d = " + pinhole + " mm", cx + 35, frontY - 30);

    // 3. SZEROKOŚĆ FILMU 
    let bottomY = filmY + 20;
    ctx.beginPath(); ctx.moveTo(cx - (drawFilm / 2), bottomY); ctx.lineTo(cx + (drawFilm / 2), bottomY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - (drawFilm / 2) + 6, bottomY - 4); ctx.lineTo(cx - (drawFilm / 2), bottomY); ctx.lineTo(cx - (drawFilm / 2) + 6, bottomY + 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + (drawFilm / 2) - 6, bottomY - 4); ctx.lineTo(cx + (drawFilm / 2), bottomY); ctx.lineTo(cx + (drawFilm / 2) - 6, bottomY + 4); ctx.stroke();
    
    ctx.fillText("Film: " + filmWidth + " mm", cx, bottomY + 14);

    // --- KĄT WIDZENIA ---
    let fovDeg = 2 * Math.atan((filmWidth / 2) / focal) * (180 / Math.PI);
    ctx.fillStyle = "#aaa"; ctx.font = "13px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("Kąt widzenia: " + Math.round(fovDeg) + "°", cx, cy + 5);
}

// Inicjalizacja przy pierwszym załadowaniu strony
window.onload = () => {
    updateLockUI();
    przeliczGeometrie('focal');
};