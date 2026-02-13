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

// --- [해결 3, 4] 게이지 로직 수정 및 안내 팝업 복구 ---
function trigger(type, fChange, cChange, expGain = 0) {
    const now = Date.now();
    const sEat = document.getElementById('soundEat');
    const sNo = document.getElementById('soundReject');
    const sShw = document.getElementById('soundShower');
    const sWhistle = document.getElementById('soundWhistle'); 
    const sPat = document.getElementById('soundPat');

    // [해결 4] 제한 안내 팝업 다시 추가
    if (type === 'feed' && isFullState) { alert("슬라임이 너무 배불러요! (5회 제한)"); if(sNo) sNo.play(); return; }
    if (type === 'ball' && isTiredState) { alert("슬라임이 지쳤어요! (5회 제한)"); if(sNo) sNo.play(); return; }
    if (type === 'pat' && isPatLimitState) { alert("그만 쓰다듬으래요! (5회 제한)"); if(sNo) sNo.play(); return; }

    if (type === 'cookie' && (now - lastCookieTime < 3600000)) {
        const left = Math.ceil((3600000 - (now - lastCookieTime)) / 60000);
        alert(`쿠키는 ${left}분 뒤에 줄 수 있어요!`); return;
    }

    // 사운드 재생 로직
    if (type === 'ball') {
        if (sWhistle) { sWhistle.currentTime = 0; sWhistle.play(); setTimeout(() => sWhistle.pause(), 3000); }
    } else if (type === 'pat') {
        if (sPat) { sPat.currentTime = 0; sPat.play(); }
    } else if (type === 'bubbles') {
        if (sShw) { sShw.currentTime = 0; sShw.play(); }
    } else {
        if (sEat) { sEat.currentTime = 0; sEat.play(); }
    }

    // [해결 3] 축구공 선택 시 게이지 감소 방지 (축구공은 마이너스 값을 주지 않도록 설정 가능)
    fullness = Math.max(0, Math.min(100, fullness + fChange));
    cleanliness = Math.max(0, Math.min(100, cleanliness + cChange));

    // 경험치 및 카운트
    if (type === 'feed') { feedCount++; if(feedCount>=5) { isFullState=true; setTimeout(()=>isFullState=false, 10000); } }
    if (type === 'ball') { playCount++; if(playCount>=5) { isTiredState=true; setTimeout(()=>playCount=0, 10000); } }
    if (type === 'pat') { patCount++; if(patCount>=5) { isPatLimitState=true; setTimeout(()=>patCount=0, 10000); } }
    
    if (expGain > 0) {
        exp += expGain;
        const plusTxt = document.getElementById('expPlus');
        if(plusTxt) { plusTxt.classList.add('show'); setTimeout(()=>plusTxt.classList.remove('show'), 800); }
        if (exp >= 100) { level++; exp = 0; alert("Level Up!"); }
        document.getElementById('lvlNum').innerText = level;
        document.getElementById('expNum').innerText = exp;
    }

    state = 5; 
    effect = type; 
    lastActionTime = now; 
    updateBars();

    // 2초 뒤 자동 복구
    setTimeout(() => { state = 1; effect = null; }, 2000);
}

function updateBars() {
    document.getElementById('fullBar').style.height = fullness + "%";
    document.getElementById('cleanBar').style.height = cleanliness + "%";
}

// --- [해결 1, 2] 슬라임 얼굴 및 아이콘 그리기 로직 복구 ---
function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = renderSize / 2, cy = renderSize / 2 + 30;
    const now = Date.now();
    
    let currentDisplayState = (state === 1 && now % 5500 > 5000) ? 2 : state;

    // 몸체
    ctx.fillStyle = SLIME_COLOR;
    ctx.fillRect(cx-30, cy-70, 60, 10); ctx.fillRect(cx-40, cy-60, 80, 10);
    ctx.fillRect(cx-50, cy-50, 100, 40); ctx.fillRect(cx-40, cy-10, 80, 10);

    // [해결 1] 눈 그리기 복구
    ctx.fillStyle = "black";
    if (currentDisplayState === 1 || currentDisplayState === 3) {
        ctx.fillRect(cx-20, cy-39, 8, 8); ctx.fillRect(cx+12, cy-39, 8, 8);
    } else if (currentDisplayState === 2) { // 감은 눈
        ctx.fillRect(cx-20, cy-35, 12, 3); ctx.fillRect(cx+8, cy-35, 12, 3);
    } else if (currentDisplayState === 5) { // 기쁜 눈 (^^)
        ctx.font = "bold 20px Arial"; ctx.fillText("^", cx-22, cy-30); ctx.fillText("^", cx+10, cy-30);
    }

    // [해결 2] 상호작용 아이콘(하트, 공, 손바닥) 그리기 복구
    if (effect) {
        ctx.font = "35px Arial";
        const bounce = Math.sin(now / 200) * 10;
        if (effect === 'feed') ctx.fillText("❤️", cx - 18, cy - 90 + bounce);
        if (effect === 'water') ctx.fillText("💧", cx - 18, cy - 90 + bounce);
        if (effect === 'cookie') ctx.fillText("🍪", cx - 18, cy - 90 + bounce);
        if (effect === 'ball') ctx.fillText("⚽", cx - 18, cy - 100 - Math.abs(Math.sin(now/250))*50);
        if (effect === 'pat') ctx.fillText("✋", cx - 18 + Math.sin(now/150)*25, cy - 90);
        if (effect === 'bubbles') ctx.fillText("🫧", cx - 70 + Math.sin(now/200)*15, cy - 50);
    }
}

// --- 이벤트 연결 ---
document.getElementById('feedBtn').onclick = () => trigger('feed', 10, 0);
document.getElementById('waterBtn').onclick = () => trigger('water', 5, 0);
document.getElementById('cookieBtn').onclick = () => trigger('cookie', 20, 0);
document.getElementById('showerBtn').onclick = () => trigger('bubbles', 0, 20);
// [해결 3] 공놀이 시 게이지 감소를 없애고 싶다면 0, 0으로 수정
document.getElementById('ballBtn').onclick = () => trigger('ball', 5, 5, 1); 
document.getElementById('patBtn').onclick = () => trigger('pat', 0, 0, 1);

function animate() { drawSlime(); requestAnimationFrame(animate); }
animate(); updateBars();