const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');
const SLIME_COLOR = "#CDB4DB";

// --- 상태 및 데이터 초기화 ---
let renderSize = 250; 
let state = 1, fullness = 50, cleanliness = 50, effect = null;
let level = 1, exp = 0; 
let isDragging = false, lastActionTime = Date.now();
let feedCount = 0, playCount = 0, patCount = 0;
let isFullState = false, isTiredState = false, isPatLimitState = false;
let lastCookieTime = 0;

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

// --- 상호작용 실행 함수 (팝업 및 사운드 포함) ---
function trigger(type, fChange, cChange, expGain = 0) {
    const now = Date.now();
    const sNo = document.getElementById('soundReject');

    // [체크] 거부 조건 및 안내 팝업
    if (type === 'feed' && isFullState) {
        alert("슬라임이 아직 배불러요! 잠시 후에 주세요.");
        if(sNo) { sNo.currentTime = 0; sNo.play(); } return;
    }
    if (type === 'ball' && isTiredState) {
        alert("슬라임이 너무 지쳤어요! (5회 제한)");
        if(sNo) { sNo.currentTime = 0; sNo.play(); } return;
    }
    if (type === 'pat' && isPatLimitState) {
        alert("슬라임이 이제 그만 만지래요! (5회 제한)");
        if(sNo) { sNo.currentTime = 0; sNo.play(); } return;
    }
    if (type === 'cookie' && (now - lastCookieTime < 3600000)) {
        const left = Math.ceil((3600000 - (now - lastCookieTime)) / 60000);
        alert(`쿠키는 ${left}분 뒤에 줄 수 있어요!`);
        if(sNo) { sNo.currentTime = 0; sNo.play(); } return;
    }

    // [체크] 사운드 재생 (휘슬 3초 제한 포함)
    const sEat = document.getElementById('soundEat');
    const sShw = document.getElementById('soundShower');
    const sWhistle = document.getElementById('soundWhistle');
    const sPat = document.getElementById('soundPat');

    if (type === 'ball') {
        if (sWhistle) { sWhistle.currentTime = 0; sWhistle.play(); setTimeout(() => sWhistle.pause(), 3000); }
    } else if (type === 'pat') {
        if (sPat) { sPat.currentTime = 0; sPat.play(); }
    } else if (type === 'bubbles') {
        if (sShw) { sShw.currentTime = 0; sShw.play(); }
    } else {
        if (sEat) { sEat.currentTime = 0; sEat.play(); }
    }

    // 수치 및 카운트 업데이트
    fullness = Math.max(0, Math.min(100, fullness + fChange));
    cleanliness = Math.max(0, Math.min(100, cleanliness + cChange));

    if (type === 'feed') { feedCount++; if(feedCount>=5) { isFullState=true; setTimeout(()=>isFullState=false, 10000); } }
    if (type === 'ball') { playCount++; if(playCount>=5) { isTiredState=true; setTimeout(()=>playCount=0, 10000); } }
    if (type === 'pat') { patCount++; if(patCount>=5) { isPatLimitState=true; setTimeout(()=>patCount=0, 10000); } }
    if (type === 'cookie') lastCookieTime = now;

    // 경험치 및 레벨업
    if (expGain > 0) {
        exp += expGain;
        const plusTxt = document.getElementById('expPlus');
        if(plusTxt) { plusTxt.classList.add('show'); setTimeout(()=>plusTxt.classList.remove('show'), 800); }
        if (exp >= 100) { level++; exp = 0; alert("Level Up!"); }
        document.getElementById('lvlNum').innerText = level;
        document.getElementById('expNum').innerText = exp;
    }

    // [체크] 상호작용 종료 설정 (2초 후 원복)
    state = 5; effect = type; lastActionTime = now; updateBars();
    setTimeout(() => { state = 1; effect = null; }, 2000);
}

function updateBars() {
    const fBar = document.getElementById('fullBar');
    const cBar = document.getElementById('cleanBar');
    if(fBar) fBar.style.height = fullness + "%";
    if(cBar) cBar.style.height = cleanliness + "%";
}

// --- 렌더링 로직 (얼굴, 이펙트, 조는 모션) ---
function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = renderSize / 2, cy = renderSize / 2 + 30;
    const now = Date.now();
    const idleTime = now - lastActionTime;
    
    let currentDisplayState = (state === 1 && now % 5500 > 5000) ? 2 : state;

    // [체크] 30초 무반응 시 조는 모션
    if (idleTime > 30000 && !isDragging && state === 1) {
        currentDisplayState = 2;
        ctx.fillStyle = "#555"; ctx.font = "bold 18px Arial";
        ctx.fillText("Zzz...", cx + 60, cy - 80 + Math.sin(now/400)*8);
    }

    // 몸체 그리기
    ctx.fillStyle = SLIME_COLOR;
    ctx.fillRect(cx-30, cy-70, 60, 10); ctx.fillRect(cx-40, cy-60, 80, 10);
    ctx.fillRect(cx-50, cy-50, 100, 40); ctx.fillRect(cx-40, cy-10, 80, 10);

    // [체크] 얼굴 그리기 복구 (정상/드래그/감은눈/기쁜표정)
    ctx.fillStyle = "black";
    if (currentDisplayState === 1 || currentDisplayState === 3 || currentDisplayState === 4) {
        ctx.fillRect(cx-20, cy-39, 8, 8); ctx.fillRect(cx+12, cy-39, 8, 8);
    } else if (currentDisplayState === 2) { 
        ctx.fillRect(cx-22, cy-35, 12, 3); ctx.fillRect(cx+10, cy-35, 12, 3);
    } else if (currentDisplayState === 5) { 
        ctx.font = "bold 20px Arial"; ctx.fillText("^", cx-22, cy-30); ctx.fillText("^", cx+10, cy-30);
    }

    // [체크] 모든 이펙트 그리기 (물, 쿠키, 비눗방울 포함)
    if (effect) {
        ctx.font = "35px Arial";
        const bounce = Math.sin(now / 200) * 10;
        if (effect === 'feed') ctx.fillText("❤️", cx - 18, cy - 90 + bounce);
        if (effect === 'water') ctx.fillText("💧", cx - 18, cy - 90 + bounce);
        if (effect === 'cookie') ctx.fillText("🍪", cx - 18, cy - 90 + bounce);
        if (effect === 'ball') ctx.fillText("⚽", cx - 18, cy - 110 - Math.abs(Math.sin(now/250))*50);
        if (effect === 'pat') ctx.fillText("✋", cx - 18 + Math.sin(now/150)*25, cy - 90);
        if (effect === 'bubbles') {
            ctx.fillText("🫧", cx - 70 + Math.sin(now/200)*15, cy - 50);
            ctx.fillText("🫧", cx + 40 - Math.sin(now/200)*15, cy - 80);
        }
    }
}

// --- [체크] 터치 및 드래그 이벤트 복구 ---
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

// 버튼 연결
document.getElementById('feedBtn').onclick = () => trigger('feed', 10, 0);
document.getElementById('waterBtn').onclick = () => trigger('water', 5, 0);
document.getElementById('cookieBtn').onclick = () => trigger('cookie', 20, 0);
document.getElementById('showerBtn').onclick = () => trigger('bubbles', 0, 20);
document.getElementById('ballBtn').onclick = () => trigger('ball', 5, 5, 1);
document.getElementById('patBtn').onclick = () => trigger('pat', 0, 0, 1);

function animate() { drawSlime(); requestAnimationFrame(animate); }
animate(); updateBars();