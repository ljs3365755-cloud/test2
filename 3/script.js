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
let lastBallTime = 0; // 축구공 제한 시간 체크용

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

// --- 상호작용 로직 (축구공 1분 제한 추가) ---
function trigger(type, fChange, cChange, expGain = 0) {
    const now = Date.now();
    const sNo = document.getElementById('soundReject');

    if (type === 'feed' && isFullState) { alert("슬라임이 배불러요!"); if(sNo) sNo.play(); return; }
    
    // [수정] 축구공 1분(60초) 제한 로직
    if (type === 'ball' && isTiredState) {
        const remaining = Math.ceil((60000 - (now - lastBallTime)) / 1000);
        if (remaining > 0) {
            alert(`슬라임이 너무 지쳤어요! ${remaining}초 뒤에 다시 놀아주세요.`);
            if(sNo) sNo.play(); return;
        } else {
            isTiredState = false; // 시간 다 되면 해제
            playCount = 0;
        }
    }

    if (type === 'pat' && isPatLimitState) { alert("그만 만지래요!"); if(sNo) sNo.play(); return; }
    if (type === 'cookie' && (now - lastCookieTime < 3600000)) {
        alert("쿠키는 1시간에 한 번만!"); if(sNo) sNo.play(); return;
    }

    const sEat = document.getElementById('soundEat'), sShw = document.getElementById('soundShower');
    const sWhistle = document.getElementById('soundWhistle'), sPat = document.getElementById('soundPat');

    if (type === 'ball' && sWhistle) { sWhistle.currentTime = 0; sWhistle.play(); setTimeout(() => sWhistle.pause(), 3000); }
    else if (type === 'pat' && sPat) sPat.play();
    else if (type === 'bubbles' && sShw) sShw.play();
    else if (sEat) sEat.play();

    fullness = Math.max(0, Math.min(100, fullness + fChange));
    cleanliness = Math.max(0, Math.min(100, cleanliness + cChange));
    
    if (type === 'feed') { feedCount++; if(feedCount>=5) { isFullState=true; setTimeout(()=>isFullState=false, 10000); } }
    
    // [수정] 축구공 5회 클릭 시 1분 제한 시작
    if (type === 'ball') { 
        playCount++; 
        if(playCount >= 5) { 
            isTiredState = true; 
            lastBallTime = now; 
            // 1분(60000ms) 뒤에 자동으로 풀리게 설정
            setTimeout(() => { isTiredState = false; playCount = 0; }, 60000); 
        } 
    }
    
    if (type === 'pat') { patCount++; if(patCount>=5) { isPatLimitState=true; setTimeout(()=>patCount=0, 10000); } }
    if (type === 'cookie') lastCookieTime = now;

    if (expGain > 0) {
        exp += expGain;
        if (exp >= 100) { level++; exp = 0; alert("Level Up!"); }
        document.getElementById('lvlNum').innerText = level;
        document.getElementById('expNum').innerText = exp;
    }

    state = 5; effect = type; lastActionTime = now; updateBars();
    setTimeout(() => { state = 1; effect = null; }, 2000);
}

function updateBars() {
    document.getElementById('fullBar').style.height = fullness + "%";
    document.getElementById('cleanBar').style.height = cleanliness + "%";
}

// --- 렌더링 (Zzz... 및 눈 모양 변화 완벽 복구) ---
function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = renderSize / 2, cy = renderSize / 2 + 30;
    const now = Date.now();
    const idleTime = now - lastActionTime;
    
    // 30초 무반응 시 감은 눈(상태 2)으로 강제 전환
    let currentDisplayState = (state === 1 && now % 5500 > 5000) ? 2 : state;
    if (idleTime > 30000 && !isDragging && state === 1) currentDisplayState = 2;

    ctx.fillStyle = SLIME_COLOR;
    let sw = 100, sh = 60, eyeY = 0;
    if (currentDisplayState === 3) { sw = 80; sh = 90; eyeY = -25; } 
    else if (currentDisplayState === 4) { sw = 120; sh = 40; eyeY = 10; } 

    // 몸체 그리기
    ctx.fillRect(cx - sw/2 + 10, cy - sh - 10, sw - 20, 10);
    ctx.fillRect(cx - sw/2, cy - sh, sw, sh - 10);
    ctx.fillRect(cx - sw/2 + 10, cy - 10, sw - 20, 10);

    // [수정] 눈 그리기: state 3, 4일 때 위치와 모양 확실히 반영
    ctx.fillStyle = "black";
    if (currentDisplayState === 1 || currentDisplayState === 3 || currentDisplayState === 4) {
        // 드래그 중이거나 일반 상태일 때 (눈 위치 eyeY 적용)
        ctx.fillRect(cx - 20, cy - 39 + eyeY, 8, 8); 
        ctx.fillRect(cx + 12, cy - 39 + eyeY, 8, 8);
    } else if (currentDisplayState === 2) { 
        // 자거나 눈 깜빡일 때 (감은 눈)
        ctx.fillRect(cx - 22, cy - 35 + eyeY, 12, 3); 
        ctx.fillRect(cx + 10, cy - 35 + eyeY, 12, 3);
        
        // [수정] 자는 모션 Zzz... 표시 복구
        if (idleTime > 30000) {
            ctx.fillStyle = "#555"; ctx.font = "bold 18px Arial";
            ctx.fillText("Zzz...", cx + 60, cy - 80 + Math.sin(now/400)*8);
        }
    } else if (currentDisplayState === 5) {
        // 기쁜 표정
        ctx.font = "bold 20px Arial"; 
        ctx.fillText("^", cx - 22, cy - 30 + eyeY); 
        ctx.fillText("^", cx + 10, cy - 30 + eyeY);
    }

    // 이펙트 아이콘 그리기
    if (effect) {
        ctx.font = "35px Arial";
        const bounce = Math.sin(now / 200) * 10;
        if (effect === 'feed') ctx.fillText("❤️", cx - 18, cy - 90 + bounce);
        if (effect === 'water') ctx.fillText("💧", cx - 18, cy - 90 + bounce);
        if (effect === 'cookie') ctx.fillText("🍪", cx - 18, cy - 90 + bounce);
        if (effect === 'ball') ctx.fillText("⚽", cx - 18, cy - 110 - Math.abs(Math.sin(now/250))*50);
        if (effect === 'pat') ctx.fillText("✋", cx - 18 + Math.sin(now/150)*25, cy - 90);
        if (effect === 'bubbles') ctx.fillText("🫧", cx - 70 + Math.sin(now/200)*15, cy - 50);
    }
}

// --- 이벤트 연결 ---
function handleStart(e) {
    if(e.cancelable) e.preventDefault();
    isDragging = true; state = 4; lastActionTime = Date.now();
    const snd = document.getElementById('soundSelect');
    if(snd) { snd.currentTime = 0; snd.play(); }
}
function handleMove(e) {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const clientY = (e.touches ? e.touches[0].clientY : e.clientY);
    const mouseY = (clientY - rect.top) * (renderSize / rect.height);
    state = (mouseY < 80) ? 3 : 4; 
}
function handleEnd() { isDragging = false; state = 1; }

canvas.onmousedown = handleStart; window.onmousemove = handleMove; window.onmouseup = handleEnd;
canvas.addEventListener('touchstart', handleStart, {passive:false});
window.addEventListener('touchmove', handleMove, {passive:false});
window.addEventListener('touchend', handleEnd);

document.getElementById('feedBtn').onclick = () => trigger('feed', 10, 0);
document.getElementById('waterBtn').onclick = () => trigger('water', 5, 0);
document.getElementById('cookieBtn').onclick = () => trigger('cookie', 20, 0);
document.getElementById('showerBtn').onclick = () => trigger('bubbles', 0, 20);
document.getElementById('ballBtn').onclick = () => trigger('ball', -10, -5, 1);
document.getElementById('patBtn').onclick = () => trigger('pat', 0, 0, 1);

function animate() { drawSlime(); requestAnimationFrame(animate); }
animate(); updateBars();