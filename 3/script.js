const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');
const SLIME_COLOR = "#CDB4DB";

let renderSize = 250; 
let state = 1, fullness = 50, cleanliness = 50, effect = null;
let level = 1, exp = 0; 
let isDragging = false, lastActionTime = Date.now();
let feedCount = 0, playCount = 0, patCount = 0;
let isFullState = false, isTiredState = false, isPatLimitState = false;
let lastCookieTime = 0, lastBallTime = 0;

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

function trigger(type, fChange, cChange, expGain = 0) {
    const now = Date.now();
    const sNo = document.getElementById('soundReject');

    if (type === 'feed' && isFullState) { alert("슬라임이 배불러요!"); if(sNo) sNo.play(); return; }
    if (type === 'ball' && isTiredState) {
        const remaining = Math.ceil((60000 - (now - lastBallTime)) / 1000);
        if (remaining > 0) { alert(`슬라임이 지쳤어요! ${remaining}초 뒤에 가능합니다.`); if(sNo) sNo.play(); return; }
        else { isTiredState = false; playCount = 0; }
    }
    if (type === 'pat' && isPatLimitState) { alert("그만 만지래요!"); if(sNo) sNo.play(); return; }
    if (type === 'cookie' && (now - lastCookieTime < 3600000)) { alert("쿠키는 1시간에 한 번!"); if(sNo) sNo.play(); return; }

    const sEat = document.getElementById('soundEat'), sShw = document.getElementById('soundShower');
    const sWhistle = document.getElementById('soundWhistle'), sPat = document.getElementById('soundPat');

    if (type === 'ball' && sWhistle) { sWhistle.currentTime = 0; sWhistle.play(); setTimeout(() => sWhistle.pause(), 3000); }
    else if (type === 'pat' && sPat) sPat.play();
    else if (type === 'bubbles' && sShw) sShw.play();
    else if (sEat) sEat.play();

    fullness = Math.max(0, Math.min(100, fullness + fChange));
    cleanliness = Math.max(0, Math.min(100, cleanliness + cChange));
    
    if (type === 'feed') { feedCount++; if(feedCount>=5) { isFullState=true; setTimeout(()=>isFullState=false, 10000); } }
    if (type === 'ball') { playCount++; if(playCount >= 5) { isTiredState = true; lastBallTime = now; setTimeout(() => { isTiredState = false; playCount = 0; }, 60000); } }
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

// --- 원래 픽셀 외형 복구 및 눈 모양 변형 ---
function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = renderSize / 2, cy = renderSize / 2 + 30;
    const now = Date.now();
    const idleTime = now - lastActionTime;
    
    let currentDisplayState = (state === 1 && now % 5500 > 5000) ? 2 : state;
    if (idleTime > 30000 && !isDragging && state === 1) currentDisplayState = 2;

    ctx.fillStyle = SLIME_COLOR;
    let eyeY = 0;

    // [복구] 예전 픽셀 스타일 몸체 로직
    if (currentDisplayState === 3) { // 늘어남
        eyeY = -25;
        ctx.fillRect(cx-25, cy-90, 50, 10); ctx.fillRect(cx-35, cy-80, 70, 70); ctx.fillRect(cx-25, cy-10, 50, 10);
    } else if (currentDisplayState === 4) { // 눌림
        eyeY = 10;
        ctx.fillRect(cx-40, cy-50, 80, 10); ctx.fillRect(cx-60, cy-40, 120, 30); ctx.fillRect(cx-40, cy-10, 80, 10);
    } else { // 기본
        ctx.fillRect(cx-30, cy-70, 60, 10); ctx.fillRect(cx-40, cy-60, 80, 10);
        ctx.fillRect(cx-50, cy-50, 100, 40); ctx.fillRect(cx-40, cy-10, 80, 10);
    }

    // [수정] 눈 모양 변형 (눌림/늘어남 시 가느다란 눈)
    ctx.fillStyle = "black";
    if (currentDisplayState === 3 || currentDisplayState === 4) {
        // 드래그 중에는 가느다란 눈 (- 모양)
        ctx.fillRect(cx-22, cy-35 + eyeY, 12, 4); ctx.fillRect(cx+10, cy-35 + eyeY, 12, 4);
    } else if (currentDisplayState === 1) {
        // 평상시 동그란 눈
        ctx.fillRect(cx-20, cy-39, 8, 8); ctx.fillRect(cx+12, cy-39, 8, 8);
    } else if (currentDisplayState === 2) {
        // 감은 눈 및 Zzz...
        ctx.fillRect(cx-22, cy-35 + eyeY, 12, 3); ctx.fillRect(cx+10, cy-35 + eyeY, 12, 3);
        if (idleTime > 30000) {
            ctx.fillStyle = "#555"; ctx.font = "bold 18px Arial";
            ctx.fillText("Zzz...", cx + 60, cy - 80 + Math.sin(now/400)*8);
        }
    } else if (currentDisplayState === 5) {
        ctx.font = "bold 20px Arial"; ctx.fillText("^", cx-22, cy-30 + eyeY); ctx.fillText("^", cx+10, cy-30 + eyeY);
    }

    // 이펙트 그리기 (동일)
    if (effect) {
        ctx.font = "35px Arial";
        const bounce = Math.sin(now / 200) * 10;
        if (effect === 'feed') ctx.fillText("❤️", cx - 18, cy - 90 + bounce);
        if (effect === 'water') ctx.fillText("💧", cx - 18, cy - 90 + bounce);
        if (effect === 'cookie') ctx.fillText("🍪", cx - 18, cy - 90 + bounce);
        if (effect === 'ball') ctx.fillText("⚽", cx - 18, cy - 110 - Math.abs(Math.sin(now/250))*50);
        if (effect === 'pat') ctx.fillText("✋", cx - 18 + Math.sin(now/150)*25, cy - 90);
        if (effect === 'bubbles') { ctx.fillText("🫧", cx - 70, cy - 50); ctx.fillText("🫧", cx + 40, cy - 80); }
    }
}

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