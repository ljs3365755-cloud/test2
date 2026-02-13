const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');
const SLIME_COLOR = "#CDB4DB";

// --- 캔버스 초기화 (해상도 보정) ---
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

// 상태 변수
let state = 1, fullness = 50, cleanliness = 50, effect = null;
let level = 1, exp = 0; 
let isDragging = false, lastActionTime = Date.now();
let feedCount = 0, playCount = 0, patCount = 0;
let isFullState = false, isTiredState = false, isPatLimitState = false;
let lastCookieTime = 0;

// --- [수정 1] 슬라임 외형 원복 및 조는 모션 구현 ---
function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = renderSize / 2, cy = renderSize / 2 + 30;
    const now = Date.now();
    const idleTime = now - lastActionTime;
    
    // 기본 눈 깜빡임 (상태 1일 때만)
    let currentDisplayState = (state === 1 && now % 5500 > 5000) ? 2 : state;

    // [수정 4] 30초 무반응 시 조는 모션 (Zzz...)
    if (idleTime > 30000 && !isDragging && state === 1) {
        currentDisplayState = 2; // 눈 감기
        ctx.fillStyle = "#555"; ctx.font = "bold 18px Arial";
        ctx.fillText("Zzz...", cx + 60, cy - 80 + Math.sin(now/400)*8);
    }

    // 거부 상태일 때 강제로 눈 감기
    if (isFullState || isTiredState || isPatLimitState) currentDisplayState = 2;

    ctx.fillStyle = SLIME_COLOR;
    let offsetX = (isFullState || isTiredState) ? Math.sin(now / 100) * 5 : 0;

    // [수정 1] 슬라임 외형 기존 좌표로 원복
    if (currentDisplayState === 3) { // 3. 늘어남
        ctx.fillRect(cx-10+offsetX, cy-110, 20, 10); ctx.fillRect(cx-20+offsetX, cy-100, 40, 10);
        ctx.fillRect(cx-30+offsetX, cy-90, 60, 100); ctx.fillRect(cx-20+offsetX, cy+10, 40, 10);
    } else if (currentDisplayState === 4) { // 4. 클릭됨
        ctx.fillRect(cx-45+offsetX, cy-50, 90, 40); ctx.fillRect(cx-55+offsetX, cy-40, 110, 20);
    } else { // 1, 2, 5. 기본/감음/기쁨
        ctx.fillRect(cx-30+offsetX, cy-70, 60, 10); ctx.fillRect(cx-40+offsetX, cy-60, 80, 10);
        ctx.fillRect(cx-50+offsetX, cy-50, 100, 40); ctx.fillRect(cx-40+offsetX, cy-10, 80, 10);
    }

    // 눈 그리기 (기존 디자인 원복)
    let eyeY = (currentDisplayState === 3) ? cy - 75 : cy - 35;
    ctx.strokeStyle = "black"; ctx.lineWidth = 4; ctx.lineCap = "round";
    
    if (currentDisplayState === 3 || currentDisplayState === 1) { // 세로 눈 또는 기본 눈
        ctx.fillStyle = "black";
        if(currentDisplayState === 3) {
            ctx.fillRect(cx-20+offsetX, eyeY, 8, 30); ctx.fillRect(cx+12+offsetX, eyeY, 8, 30);
        } else {
            ctx.fillRect(cx-20+offsetX, eyeY-4, 8, 8); ctx.fillRect(cx+12+offsetX, eyeY-4, 8, 8);
        }
    } else if (currentDisplayState === 2) { // 감은 눈 (-)
        ctx.beginPath(); ctx.moveTo(cx-22+offsetX, eyeY); ctx.lineTo(cx-10+offsetX, eyeY);
        ctx.moveTo(cx+10+offsetX, eyeY); ctx.lineTo(cx+22+offsetX, eyeY); ctx.stroke();
    } else if (currentDisplayState === 4) { // 클릭 눈 (> <)
        ctx.beginPath();
        ctx.moveTo(cx-25+offsetX, eyeY-5); ctx.lineTo(cx-15+offsetX, eyeY); ctx.lineTo(cx-25+offsetX, eyeY+5);
        ctx.moveTo(cx+25+offsetX, eyeY-5); ctx.lineTo(cx+15+offsetX, eyeY); ctx.lineTo(cx+25+offsetX, eyeY+5);
        ctx.stroke();
    } else if (currentDisplayState === 5) { // 기쁜 눈 (^^)
        ctx.beginPath();
        ctx.moveTo(cx-25+offsetX, eyeY+3); ctx.lineTo(cx-18+offsetX, eyeY-4); ctx.lineTo(cx-11+offsetX, eyeY+3);
        ctx.moveTo(cx+11+offsetX, eyeY+3); ctx.lineTo(cx+18+offsetX, eyeY-4); ctx.lineTo(cx+25+offsetX, eyeY+3);
        ctx.stroke();
    }

    // 이펙트 그리기
    if (effect) drawEffect(effect, cx, cy, now);
}

function drawEffect(type, cx, cy, now) {
    const bounce = Math.sin(now / 200) * 10;
    ctx.font = "30px Arial";
    // [수정 3] 삼각김밥 선택 시 하트 노출 원복
    if (type === 'feed') ctx.fillText("❤️", cx - 15, cy - 100 + bounce);
    if (type === 'water') ctx.fillText("💧", cx - 15, cy - 100 + bounce);
    if (type === 'cookie') ctx.fillText("⭐", cx - 15, cy - 100 + bounce);
    if (type === 'bubbles') ctx.fillText("🫧", cx - 80 + Math.sin(now/200)*15, cy - 40);
    if (type === 'ball') {
        const ballY = Math.abs(Math.sin(now / 250)) * 50;
        ctx.fillText("⚽", cx - 15, cy - 110 - ballY);
    }
    if (type === 'pat') {
        const handX = Math.sin(now / 150) * 25;
        ctx.fillText("✋", cx - 15 + handX, cy - 100);
    }
}

// --- [수정 2] 물, 쿠키 반응 및 경험치 로직 원복 ---
function trigger(type, fChange, cChange, expGain = 0) {
    const now = Date.now();
    const sEat = document.getElementById('soundEat'), sNo = document.getElementById('soundReject'), sShw = document.getElementById('soundShower');

    // 거부 조건 체크
    if ((type === 'feed' && isFullState) || (type === 'ball' && isTiredState) || (type === 'pat' && isPatLimitState)) {
        if(sNo) { sNo.currentTime = 0; sNo.play(); }
        return;
    }
    // 쿠키 쿨타임 체크 (1시간)
    if (type === 'cookie' && (now - lastCookieTime < 3600000)) {
        if(sNo) { sNo.currentTime = 0; sNo.play(); }
        const left = Math.ceil((3600000 - (now - lastCookieTime)) / 60000);
        alert(`쿠키는 ${left}분 뒤에!`); return;
    }

    // 사운드 재생
    if (type === 'bubbles') { if(sShw) { sShw.currentTime=0; sShw.play(); } } 
    else { if(sEat) { sEat.currentTime=0; sEat.play(); } }

    // 연속 사용 제한 카운트
    if (type === 'feed') { feedCount++; if(feedCount>=5) { isFullState=true; setTimeout(()=>isFullState=false, 10000); } }
    if (type === 'ball') { playCount++; if(playCount>=5) { isTiredState=true; setTimeout(()=>playCount=0, 10000); } }
    if (type === 'pat') { patCount++; if(patCount>=5) { isPatLimitState=true; setTimeout(()=>patCount=0, 10000); } }
    if (type === 'cookie') lastCookieTime = now;

    // 레벨업 시스템
    if (expGain > 0) {
        exp += expGain;
        const plusTxt = document.getElementById('expPlus');
        plusTxt.classList.add('show'); setTimeout(()=>plusTxt.classList.remove('show'), 800);
        if (exp >= 100) { level++; exp = 0; alert("Level Up!"); }
        document.getElementById('lvlNum').innerText = level;
        document.getElementById('expNum').innerText = exp;
    }

    state = 5; effect = type;
    fullness = Math.min(100, fullness + fChange);
    cleanliness = Math.min(100, cleanliness + cChange);
    lastActionTime = now; 
    updateBars();
    setTimeout(() => { state = 1; effect = null; }, 2000);
}

function updateBars() {
    document.getElementById('fullBar').style.height = fullness + "%";
    document.getElementById('cleanBar').style.height = cleanliness + "%";
}

// --- 이벤트 연결 ---
function handleStart(e) {
    if (e.cancelable) e.preventDefault();
    isDragging = true; state = 4; lastActionTime = Date.now();
    const snd = document.getElementById('soundSelect');
    if(snd) { snd.currentTime = 0; snd.play(); }
}
function handleMove(e) {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const mouseY = (clientY - rect.top) * (renderSize / rect.height);
    state = (mouseY < 80) ? 3 : 4;
}
function handleEnd() { isDragging = false; state = 1; }

canvas.onmousedown = handleStart;
window.onmousemove = handleMove;
window.onmouseup = handleEnd;
canvas.addEventListener('touchstart', handleStart, { passive: false });
window.addEventListener('touchmove', handleMove, { passive: false });
window.addEventListener('touchend', handleEnd);

document.getElementById('feedBtn').onclick = () => trigger('feed', 10, 0);
document.getElementById('waterBtn').onclick = () => trigger('water', 5, 0);
document.getElementById('cookieBtn').onclick = () => trigger('cookie', 20, 0);
document.getElementById('showerBtn').onclick = () => trigger('bubbles', 0, 20);
document.getElementById('ballBtn').onclick = () => trigger('ball', -5, -5, 1);
document.getElementById('patBtn').onclick = () => trigger('pat', 0, 0, 1);

function animate() { drawSlime(); requestAnimationFrame(animate); }
animate(); updateBars();