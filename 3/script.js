const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');

// --- 변수 및 상태 관리 ---
let slimeName = "", level = 1, exp = 0, fullness = 50, cleanliness = 50;
let state = 1, effect = null, isDragging = false, renderSize = 250;
let lastActionTime = Date.now();
let lastBallTime = 0, playCount = 0, isTiredState = false;
let lastCookieTime = 0; // [추가] 마지막 쿠키 준 시간 저장

let slimeColor = "#CDB4DB"; 
const palette = ["#CDB4DB", "#FFCCF9", "#A2D2FF", "#BEE1E6", "#E2ECE9", "#DFE7FD", "#FFD700", "#FF6B6B", "#C1F0C1"];

// --- 데이터 저장 및 불러오기 ---
function saveData() {
    const data = { 
        slimeName, level, exp, fullness, cleanliness, slimeColor,
        lastSaveTime: Date.now(),
        lastCookieTime // [추가] 쿠키 시간 저장
    };
    localStorage.setItem('slimeData', JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem('slimeData');
    if (saved) {
        const data = JSON.parse(saved);
        slimeName = data.slimeName;
        level = data.level; exp = data.exp;
        fullness = data.fullness; cleanliness = data.cleanliness;
        slimeColor = data.slimeColor || "#CDB4DB";
        lastCookieTime = data.lastCookieTime || 0; // [추가] 쿠키 시간 로드

        if (data.lastSaveTime) {
            const now = Date.now();
            const diffMs = now - data.lastSaveTime;
            const decreaseAmount = Math.floor(diffMs / (10 * 60 * 1000));
            if (decreaseAmount > 0) {
                fullness = Math.max(0, fullness - decreaseAmount);
                cleanliness = Math.max(0, cleanliness - decreaseAmount);
            }
        }
        document.getElementById('nameModal').style.display = 'none';
        document.getElementById('slimeNameDisplay').innerText = slimeName + " 슬라임";
        updateBars();
    }
}

// --- 실시간 감소 타이머 (10분마다 1%) ---
setInterval(() => {
    if (!slimeName) return;
    fullness = Math.max(0, fullness - 1);
    cleanliness = Math.max(0, cleanliness - 1);
    updateBars();
    saveData();
}, 10 * 60 * 1000);

// --- 핵심 로직: 상호작용 (trigger) ---
function trigger(type, fChange, cChange, expGain = 0) {
    if (!slimeName) return;
    const now = Date.now();

    const sEat = document.getElementById('soundEat');
    const sShw = document.getElementById('soundShower');
    const sWhistle = document.getElementById('soundWhistle');
    const sPat = document.getElementById('soundPat');

    // [수정] 쿠키 시간 제한 확인 (1시간 = 3600000ms)
    if (type === 'cookie') {
        const cookieCooldown = 60 * 60 * 1000; // 1시간
        if (now - lastCookieTime < cookieCooldown) {
            const remaining = Math.ceil((cookieCooldown - (now - lastCookieTime)) / (60 * 1000));
            alert(`슬라임이 배가 불러요! ${remaining}분 뒤에 쿠키를 줄 수 있습니다.`);
            return;
        }
        lastCookieTime = now; // 쿠키 준 시간 업데이트
    }

    // 축구공 제한 로직
    if (type === 'ball' && isTiredState) {
        const left = Math.ceil((60000 - (now - lastBallTime)) / 1000);
        if (left > 0) { alert(`지쳤어요! ${left}초 뒤에 가능.`); return; }
        else { isTiredState = false; playCount = 0; }
    }

    // 사운드 재생
    if (type === 'feed' || type === 'water' || type === 'cookie') {
        if(sEat) { sEat.currentTime = 0; sEat.play(); }
    } else if (type === 'bubbles') {
        if(sShw) { sShw.currentTime = 0; sShw.play(); }
    } else if (type === 'ball') {
        if(sWhistle) { 
            sWhistle.currentTime = 0; sWhistle.play(); 
            setTimeout(() => { sWhistle.pause(); sWhistle.currentTime = 0; }, 3000);
        }
        playCount++; 
        if (playCount >= 5) { isTiredState = true; lastBallTime = now; }
    } else if (type === 'pat') {
        if(sPat) { sPat.currentTime = 0; sPat.play(); }
    }

    fullness = Math.max(0, Math.min(100, fullness + fChange));
    cleanliness = Math.max(0, Math.min(100, cleanliness + cChange));

    if (expGain > 0) {
        exp += expGain;
        const plus = document.getElementById('expPlus');
        plus.classList.remove('show');
        void plus.offsetWidth;
        plus.classList.add('show');
        if (exp >= 100) {
            level++; exp = 0;
            slimeColor = palette[Math.floor(Math.random() * palette.length)];
            alert(`Level Up! ${level}레벨이 되었습니다!`);
        }
    }

    state = 5; effect = type; lastActionTime = now;
    updateBars(); saveData();
    setTimeout(() => { state = 1; effect = null; }, 2000);
}

// --- 나머지 그리기 및 이벤트 코드는 이전과 동일하게 유지 ---
function updateBars() {
    document.getElementById('fullBar').style.width = fullness + "%";
    document.getElementById('cleanBar').style.width = cleanliness + "%";
    document.getElementById('expBar').style.width = exp + "%";
    document.getElementById('lvlNum').innerText = level;
}

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = renderSize / 2, cy = renderSize / 2 + 30;
    const now = Date.now();
    const idleTime = now - lastActionTime;
    let currentDisplayState = (state === 1 && now % 5000 > 4700) ? 2 : state;
    if (idleTime > 30000 && !isDragging && state === 1) currentDisplayState = 2;

    ctx.fillStyle = slimeColor;
    let eyeY = 0;

    if (currentDisplayState === 3) { 
        eyeY = -25;
        ctx.fillRect(cx-25, cy-90, 50, 10); ctx.fillRect(cx-35, cy-80, 70, 70); ctx.fillRect(cx-25, cy-10, 50, 10);
    } else if (currentDisplayState === 4) { 
        eyeY = 10;
        ctx.fillRect(cx-40, cy-50, 80, 10); ctx.fillRect(cx-60, cy-40, 120, 30); ctx.fillRect(cx-40, cy-10, 80, 10);
    } else { 
        ctx.fillRect(cx-30, cy-70, 60, 10); ctx.fillRect(cx-40, cy-60, 80, 10);
        ctx.fillRect(cx-50, cy-50, 100, 40); ctx.fillRect(cx-40, cy-10, 80, 10);
    }

    ctx.fillStyle = "black";
    if (currentDisplayState === 3) { 
        ctx.fillRect(cx-18, cy-45 + eyeY, 4, 12); ctx.fillRect(cx+14, cy-45 + eyeY, 4, 12);
    } else if (currentDisplayState === 4) { 
        ctx.fillRect(cx-22, cy-35 + eyeY, 12, 4); ctx.fillRect(cx+10, cy-35 + eyeY, 12, 4);
    } else if (currentDisplayState === 2) { 
        ctx.fillRect(cx-22, cy-35 + eyeY, 12, 3); ctx.fillRect(cx+10, cy-35 + eyeY, 12, 3);
        if (idleTime > 30000) { 
            ctx.fillStyle = "#555"; ctx.font = "bold 18px Arial"; 
            ctx.fillText("Zzz...", cx+60, cy-80 + Math.sin(now/400)*8); 
        }
    } else if (currentDisplayState === 5) { 
        ctx.font = "bold 20px Arial"; ctx.fillText("^", cx-22, cy-30+eyeY); ctx.fillText("^", cx+10, cy-30+eyeY);
    } else { 
        ctx.fillRect(cx-20, cy-39, 8, 8); ctx.fillRect(cx+12, cy-39, 8, 8);
    }

if (effect) {
        ctx.font = "35px Arial";
        const bounce = Math.sin(now / 200) * 10;
        if (effect === 'feed') ctx.fillText("❤️", cx - 18, cy - 90 + bounce);
        if (effect === 'water') ctx.fillText("💧", cx - 18, cy - 90 + bounce);
        if (effect === 'cookie') ctx.fillText("🍪", cx - 18, cy - 90 + bounce);
        if (effect === 'ball') {
        const ballJump = Math.abs(Math.sin(now/250)) * 40; // 통통 튀는 높이
        ctx.fillText("⚽", cx-15, cy-80 - ballJump);}
        if (effect === 'pat') ctx.fillText("✋", cx - 18 + Math.sin(now/150)*25, cy - 90);
        if (effect === 'bubbles') { ctx.fillText("🫧", cx - 75 + Math.sin(now/200)*10, cy - 60); ctx.fillText("🫧", cx + 45 - Math.sin(now/200)*10, cy - 90); }
    }
}

function initCanvas() {
    const ratio = window.devicePixelRatio || 1;
    renderSize = Math.min(window.innerWidth * 0.8, 250);
    canvas.style.width = renderSize + "px"; canvas.style.height = renderSize + "px";
    canvas.width = renderSize * ratio; canvas.height = renderSize * ratio;
    ctx.scale(ratio, ratio);
}

function handleStart(e) { 
    if(!slimeName) return; 
    isDragging = true; state = 4; lastActionTime = Date.now();
    const sSelect = document.getElementById('soundSelect');
    if(sSelect) { sSelect.currentTime = 0; sSelect.play(); }
}
function handleMove(e) {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const clientY = (e.touches ? e.touches[0].clientY : e.clientY);
    const mouseY = (clientY - rect.top) * (renderSize / rect.height);
    state = (mouseY < 80) ? 3 : 4;
}
function handleEnd() { isDragging = false; state = 1; saveData(); }

canvas.onmousedown = handleStart; window.onmousemove = handleMove; window.onmouseup = handleEnd;
canvas.addEventListener('touchstart', handleStart, {passive:false});
canvas.addEventListener('touchmove', handleMove, {passive:false});
window.addEventListener('touchend', handleEnd);

window.addEventListener('resize', initCanvas);
initCanvas(); 
loadData();

function animate() { drawSlime(); requestAnimationFrame(animate); }
animate();