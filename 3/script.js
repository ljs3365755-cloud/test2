const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');
const SLIME_COLOR = "#CDB4DB";

// --- [수정 1] 모바일 해상도 및 크기 보정 로직 ---
let renderSize = 250; 
function initCanvas() {
    const ratio = window.devicePixelRatio || 1;
    renderSize = window.innerWidth < 768 ? window.innerWidth * 0.8 : 250;
    canvas.style.width = renderSize + "px";
    canvas.style.height = renderSize + "px";
    canvas.width = renderSize * ratio;
    canvas.height = renderSize * ratio;
    ctx.scale(ratio, ratio);
}
window.addEventListener('resize', initCanvas);
initCanvas();

// 상태 변수들
let state = 1; 
let fullness = 50; 
let cleanliness = 50;
let effect = null;
let lastActionTime = Date.now();
let isDragging = false;
let feedCount = 0;
let lastCookieTime = 0;
let isFullState = false;

// 눈 깜빡임 로직
function getBlinkState() {
    if (state !== 1) return state;
    const now = Date.now();
    return (now % 5500 > 5000) ? 2 : 1;
}

// --- [수정 2] 드로잉 함수 (renderSize 기준 좌표) ---
function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = renderSize / 2; // 중앙 정렬
    const cy = renderSize / 2 + 30; 
    const now = Date.now();
    const idleTime = now - lastActionTime;
    let currentDisplayState = getBlinkState();

    if (idleTime > 30000 && !isDragging && state === 1) {
        currentDisplayState = 2;
        ctx.fillStyle = "#555"; ctx.font = "bold 18px Arial";
        ctx.fillText("Zzz...", cx + 60, cy - 80 + Math.sin(now/400)*8);
    }

    if (state !== 1) currentDisplayState = state;
    let offsetX = 0;
    if (isFullState) { currentDisplayState = 2; offsetX = Math.sin(now / 100) * 5; }

    ctx.fillStyle = SLIME_COLOR;

    // 몸체 그리기 (이미지 1~4번 픽셀)
    if (currentDisplayState === 3) { 
        ctx.fillRect(cx-10+offsetX, cy-110, 20, 10); ctx.fillRect(cx-20+offsetX, cy-100, 40, 10);
        ctx.fillRect(cx-30+offsetX, cy-90, 60, 100); ctx.fillRect(cx-20+offsetX, cy+10, 40, 10);
    } else if (currentDisplayState === 4) {
        ctx.fillRect(cx-45+offsetX, cy-50, 90, 40); ctx.fillRect(cx-55+offsetX, cy-40, 110, 20);
    } else {
        ctx.fillRect(cx-30+offsetX, cy-70, 60, 10); ctx.fillRect(cx-40+offsetX, cy-60, 80, 10);
        ctx.fillRect(cx-50+offsetX, cy-50, 100, 40); ctx.fillRect(cx-40+offsetX, cy-10, 80, 10);
    }

    // 눈 그리기 (늘어남 대응)
    let eyeY = (currentDisplayState === 3) ? cy - 75 : cy - 35;
    ctx.strokeStyle = "black"; ctx.lineWidth = 4; ctx.lineCap = "round";
    
    if (currentDisplayState === 3) {
        ctx.fillStyle = "black";
        ctx.fillRect(cx-20+offsetX, eyeY, 8, 30); ctx.fillRect(cx+12+offsetX, eyeY, 8, 30);
    } else if (currentDisplayState === 1) {
        ctx.fillStyle = "black";
        ctx.fillRect(cx-20+offsetX, eyeY-4, 8, 8); ctx.fillRect(cx+12+offsetX, eyeY-4, 8, 8);
    } else if (currentDisplayState === 2) {
        ctx.beginPath(); ctx.moveTo(cx-22+offsetX, eyeY); ctx.lineTo(cx-10+offsetX, eyeY);
        ctx.moveTo(cx+10+offsetX, eyeY); ctx.lineTo(cx+22+offsetX, eyeY); ctx.stroke();
    } else if (currentDisplayState === 4) {
        ctx.beginPath();
        ctx.moveTo(cx-25+offsetX, eyeY-5); ctx.lineTo(cx-15+offsetX, eyeY); ctx.lineTo(cx-25+offsetX, eyeY+5);
        ctx.moveTo(cx+25+offsetX, eyeY-5); ctx.lineTo(cx+15+offsetX, eyeY); ctx.lineTo(cx+25+offsetX, eyeY+5);
        ctx.stroke();
    } else if (currentDisplayState === 5) {
        ctx.beginPath();
        ctx.moveTo(cx-25+offsetX, eyeY+3); ctx.lineTo(cx-18+offsetX, eyeY-4); ctx.lineTo(cx-11+offsetX, eyeY+3);
        ctx.moveTo(cx+11+offsetX, eyeY+3); ctx.lineTo(cx+18+offsetX, eyeY-4); ctx.lineTo(cx+25+offsetX, eyeY+3);
        ctx.stroke();
    }

    if (effect) drawEffect(effect, cx, cy);
}

function drawEffect(type, cx, cy) {
    const bounce = Math.sin(Date.now() / 200) * 5;
    ctx.font = "30px Arial";
    if (type === 'heart') ctx.fillText("❤️", cx - 15, cy - 100 + bounce);
    if (type === 'water') ctx.fillText("💧", cx - 15, cy - 100 + bounce);
    if (type === 'star') ctx.fillText("⭐", cx - 15, cy - 100 + bounce);
    if (type === 'bubbles') {
        ctx.fillText("🫧", cx - 80, cy - 20 + bounce); ctx.fillText("🫧", cx + 50, cy - 40 - bounce);
    }
}

// 상호작용 및 사운드 로직
function trigger(type, fChange, cChange) {
    const now = Date.now();
    const sEat = document.getElementById('soundEat');
    const sNo = document.getElementById('soundReject');

    if ((type === 'feed' && isFullState) || (type === 'cookie' && now - lastCookieTime < 3600000)) {
        if(sNo) { sNo.currentTime = 0; sNo.play(); }
        alert(type === 'feed' ? "배부르대요!" : "쿠키는 1시간에 한 번!"); return;
    }

    if(sEat) { sEat.currentTime = 0; sEat.play(); }
    if (type === 'feed') { feedCount++; if (feedCount >= 5) { isFullState = true; setTimeout(() => { isFullState = false; feedCount = 0; }, 10000); } }
    if (type === 'cookie') lastCookieTime = now;

    state = 5; effect = type === 'feed' ? 'heart' : type === 'water' ? 'water' : type === 'cookie' ? 'star' : 'bubbles';
    fullness = Math.min(100, fullness + fChange); cleanliness = Math.min(100, cleanliness + cChange);
    lastActionTime = now; updateBars();
    setTimeout(() => { state = 1; effect = null; }, 2000);
}

function updateBars() {
    document.getElementById('fullBar').style.height = fullness + "%";
    document.getElementById('cleanBar').style.height = cleanliness + "%";
}

// --- [수정 3] 마우스/터치 통합 이벤트 ---
function handleStart(e) {
    if (e.cancelable) e.preventDefault();
    isDragging = true; state = 4; lastActionTime = Date.now();
    const snd = document.getElementById('soundSelect');
    if(snd) { snd.currentTime = 0; snd.play(); }
}

function handleMove(e) {
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const mouseY = (clientY - rect.top) * (renderSize / rect.height);
    state = (mouseY < 80) ? 3 : 4; // 늘어남 감지
}

function handleEnd() { isDragging = false; state = 1; }

canvas.onmousedown = handleStart;
window.onmousemove = handleMove;
window.onmouseup = handleEnd;
canvas.addEventListener('touchstart', handleStart, { passive: false });
window.addEventListener('touchmove', handleMove, { passive: false });
window.addEventListener('touchend', handleEnd);

document.getElementById('feedBtn').onclick = () => trigger('feed', 1, 0);
document.getElementById('waterBtn').onclick = () => trigger('water', 1, 0);
document.getElementById('cookieBtn').onclick = () => trigger('cookie', 2, 0);
document.getElementById('showerBtn').onclick = () => trigger('bubbles', 0, 10);

function animate() { drawSlime(); requestAnimationFrame(animate); }
animate(); updateBars();