const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');
const SLIME_COLOR = "#CDB4DB";

// --- 캔버스 및 변수 초기화 ---
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

// --- [해결 1] 상호작용 자동 종료 로직이 포함된 trigger 함수 ---
function trigger(type, fChange, cChange, expGain = 0) {
    const now = Date.now();
    const sEat = document.getElementById('soundEat');
    const sNo = document.getElementById('soundReject');
    const sShw = document.getElementById('soundShower');
    const sWhistle = document.getElementById('soundWhistle'); 
    const sPat = document.getElementById('soundPat');

    // 거부 조건 체크
    if ((type === 'feed' && isFullState) || (type === 'ball' && isTiredState) || (type === 'pat' && isPatLimitState)) {
        if(sNo) { sNo.currentTime = 0; sNo.play(); }
        return;
    }

    // 쿠키 쿨타임 체크
    if (type === 'cookie' && (now - lastCookieTime < 3600000)) {
        if(sNo) { sNo.currentTime = 0; sNo.play(); }
        return;
    }

    // 사운드 재생
    if (type === 'ball') {
        if (sWhistle) {
            sWhistle.currentTime = 0; sWhistle.play();
            setTimeout(() => { sWhistle.pause(); }, 3000); 
        }
    } else if (type === 'pat') {
        if (sPat) { sPat.currentTime = 0; sPat.play(); }
    } else if (type === 'bubbles') {
        if (sShw) { sShw.currentTime = 0; sShw.play(); }
    } else {
        if (sEat) { sEat.currentTime = 0; sEat.play(); }
    }

    // 경험치 업데이트
    if (expGain > 0) {
        exp += expGain;
        const plusTxt = document.getElementById('expPlus');
        if(plusTxt) { plusTxt.classList.add('show'); setTimeout(()=>plusTxt.classList.remove('show'), 800); }
        if (exp >= 100) { level++; exp = 0; alert("Level Up!"); }
        document.getElementById('lvlNum').innerText = level;
        document.getElementById('expNum').innerText = exp;
    }

    // 상태 변경 및 [해결 1] 자동 종료 설정
    state = 5; 
    effect = type;
    fullness = Math.min(100, fullness + fChange);
    cleanliness = Math.min(100, cleanliness + cChange);
    lastActionTime = now; 
    updateBars();

    // 2초 뒤에 무조건 기본 상태로 복구
    setTimeout(() => { 
        state = 1; 
        effect = null; // 공, 손바닥 등이 여기서 사라집니다.
    }, 2000); 
}

// --- 게이지 바 업데이트 ---
function updateBars() {
    const fBar = document.getElementById('fullBar');
    const cBar = document.getElementById('cleanBar');
    if(fBar) fBar.style.height = fullness + "%";
    if(cBar) cBar.style.height = cleanliness + "%";
}

// --- 드로잉 로직 (기존 외형 유지) ---
function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = renderSize / 2, cy = renderSize / 2 + 30;
    const now = Date.now();
    const idleTime = now - lastActionTime;
    
    let currentDisplayState = (state === 1 && now % 5500 > 5000) ? 2 : state;
    if (idleTime > 30000 && state === 1) { // 30초 무반응 조는 모션
        currentDisplayState = 2;
        ctx.fillStyle = "#555"; ctx.font = "bold 18px Arial";
        ctx.fillText("Zzz...", cx + 60, cy - 80 + Math.sin(now/400)*8);
    }

    ctx.fillStyle = SLIME_COLOR;
    // 몸체 그리기 (기존 픽셀 스타일)
    ctx.fillRect(cx-30, cy-70, 60, 10); ctx.fillRect(cx-40, cy-60, 80, 10);
    ctx.fillRect(cx-50, cy-50, 100, 40); ctx.fillRect(cx-40, cy-10, 80, 10);

    // 눈 및 이펙트(축구공, 손바닥) 그리기
    if (effect) {
        ctx.font = "30px Arial";
        if (effect === 'ball') ctx.fillText("⚽", cx - 15, cy - 110 - Math.abs(Math.sin(now/250))*50);
        if (effect === 'pat') ctx.fillText("✋", cx - 15 + Math.sin(now/150)*25, cy - 100);
        if (effect === 'feed') ctx.fillText("❤️", cx - 15, cy - 100);
    }
}

// --- 이벤트 연결 ---
document.getElementById('feedBtn').onclick = () => trigger('feed', 10, 0);
document.getElementById('waterBtn').onclick = () => trigger('water', 5, 0);
document.getElementById('cookieBtn').onclick = () => trigger('cookie', 20, 0);
document.getElementById('showerBtn').onclick = () => trigger('bubbles', 0, 20);
document.getElementById('ballBtn').onclick = () => trigger('ball', -5, -5, 1);
document.getElementById('patBtn').onclick = () => trigger('pat', 0, 0, 1);

canvas.onmousedown = () => { state = 4; };
window.onmouseup = () => { state = 1; };

function animate() { drawSlime(); requestAnimationFrame(animate); }
animate(); updateBars();