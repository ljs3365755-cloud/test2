const SLIME_COLOR = "#CDB4DB"; 
const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');
const feedBtn = document.getElementById('feedBtn');
const waterBtn = document.getElementById('waterBtn');
const cookieBtn = document.getElementById('cookieBtn');

let state = 1; // 1:평소, 2:눈감음, 3:늘어남, 4:눌림, 5:행복, 6:별눈
let lastActionTime = Date.now();
let isDragging = false;
let effectType = null; 
let feedCount = 0;
let isFull = false;
let isShaking = false; 
let shakeOffset = 0;

// 눈 깜빡임 관련 변수
let lastBlinkTime = Date.now();
let isBlinking = false;

function safePlay(filename) {
    try { new Audio(filename).play().catch(() => {}); } catch (e) {}
}

// [수정 2] 물방울 모양 그리기 함수
function drawWaterDrop(x, y) {
    ctx.fillStyle = "#3A86FF";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - 5, y + 5, x - 5, y + 12, x, y + 12);
    ctx.bezierCurveTo(x + 5, y + 12, x + 5, y + 5, x, y);
    ctx.fill();
}

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();
    const idleTime = now - lastActionTime;
    
    shakeOffset = isShaking ? Math.sin(now / 50) * 15 : 0;

    // [수정 3] 15초 -> 30초로 변경
    if (idleTime > 30000 && !isDragging && !isFull) {
        ctx.fillStyle = "#555";
        ctx.font = "bold 16px Arial";
        ctx.fillText("Zzz...", 130 + shakeOffset, 60 + Math.sin(now / 300) * 5);
    }

    // [수정 1 & 2] 아이템 효과 로직
    if (effectType && !isFull) {
        const yBounce = Math.sin(now / 150) * 8;
        if (effectType === 'heart') {
            ctx.fillStyle = "#ff4d4d"; // 하트 복구
            ctx.fillRect(95 + shakeOffset, 30 + yBounce, 10, 10);
            ctx.fillRect(85 + shakeOffset, 25 + yBounce, 10, 10);
            ctx.fillRect(105 + shakeOffset, 25 + yBounce, 10, 10);
        } else if (effectType === 'water') {
            drawWaterDrop(100 + shakeOffset, 25 + yBounce);
        }
    }

    // 몸체 그리기
    ctx.fillStyle = SLIME_COLOR;
    if (state === 3) {
        ctx.fillRect(80 + shakeOffset, 50, 40, 110);
        ctx.fillRect(70 + shakeOffset, 70, 10, 70);
        ctx.fillRect(120 + shakeOffset, 70, 10, 70);
    } else if (state === 4 && !isFull) {
        ctx.fillRect(40 + shakeOffset, 130, 120, 30);
        ctx.fillRect(50 + shakeOffset, 120, 100, 10);
    } else {
        ctx.fillRect(60 + shakeOffset, 100, 80, 50);
        ctx.fillRect(70 + shakeOffset, 90, 60, 10);
        ctx.fillRect(50 + shakeOffset, 110, 10, 30);
        ctx.fillRect(140 + shakeOffset, 110, 10, 30);
    }

    // [수정 4] 눈 그리기 로직 (눈 깜빡임 포함)
    ctx.fillStyle = "black";
    
    // 강제 눈감기 상태(isFull, 졸음)가 아니고, 0.5초 눈 깜빡임 타이밍일 때
    if (isFull || (state === 2 && !isDragging) || isBlinking) {
        ctx.fillRect(80 + shakeOffset, 112, 10, 2); 
        ctx.fillRect(110 + shakeOffset, 112, 10, 2);
    } else if (state === 6) { // 별 눈
        ctx.fillStyle = "#FFD700";
        drawStar(85 + shakeOffset, 110, 5, 8, 4);
        drawStar(115 + shakeOffset, 110, 5, 8, 4);
    } else if (state === 4) { // > <
        ctx.fillRect(70+shakeOffset, 136, 6, 2); ctx.fillRect(126+shakeOffset, 136, 6, 2);
    } else if (state === 5) { // ^^
        ctx.fillRect(77+shakeOffset, 110, 6, 2); ctx.fillRect(117+shakeOffset, 110, 6, 2);
    } else { // 기본 눈
        let eyeY = (state === 3) ? 80 : 110;
        ctx.fillRect(82+shakeOffset, eyeY, 6, 6); ctx.fillRect(112+shakeOffset, eyeY, 6, 6);
    }
}

// 별 그리기 함수
function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3; let step = Math.PI / spikes;
    ctx.beginPath(); ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        let x = cx + Math.cos(rot) * outerRadius; let y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y); rot += step;
        x = cx + Math.cos(rot) * innerRadius; y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y); rot += step;
    }
    ctx.closePath(); ctx.fill();
}

// 공통 반응
function triggerReaction(newState, newEffect, sound) {
    if (isFull) { alert("슬라임이 아직 배가 부릅니다!"); return; }
    state = newState; effectType = newEffect; lastActionTime = Date.now();
    safePlay(sound);
    setTimeout(() => { if(!isFull) { state = 1; effectType = null; } }, 2000);
}

feedBtn.addEventListener('click', () => {
    feedCount++;
    if (feedCount >= 5) {
        isFull = true; isShaking = true; safePlay('no.mp3');
        alert("너무 배불러요! (10초 휴식)");
        setTimeout(() => { isShaking = false; }, 2000);
        setTimeout(() => { isFull = false; feedCount = 0; state = 1; lastActionTime = Date.now(); }, 10000);
    } else { triggerReaction(5, 'heart', 'ggd-yumyum.mp3'); }
});

waterBtn.addEventListener('click', () => triggerReaction(5, 'water', 'ggd-yumyum.mp3'));
cookieBtn.addEventListener('click', () => triggerReaction(6, 'heart', 'ggd-yumyum.mp3'));

canvas.addEventListener('mousedown', () => { if(!isFull){ isDragging = true; state = 4; lastActionTime = Date.now(); safePlay('squeaky.mp3'); }});
window.addEventListener('mousemove', (e) => { 
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        state = (e.clientY - rect.top < 70) ? 3 : 4;
    }
});
window.addEventListener('mouseup', () => { isDragging = false; if(!isFull) state = 1; });

function animate() {
    const now = Date.now();
    
    // [수정 4] 5초 눈뜨고 0.5초 깜빡이는 로직
    if (!isDragging && !isFull && ![5, 6].includes(state)) {
        const cycle = now % 5500; // 5.5초 주기
        if (cycle > 5000) { // 마지막 0.5초 동안
            isBlinking = true;
        } else {
            isBlinking = false;
            // 3초 이상 입력 없으면 눈 감는 기존 로직과 병합
            state = (now - lastActionTime > 3000) ? 2 : 1;
        }
    } else {
        isBlinking = false;
    }

    drawSlime();
    requestAnimationFrame(animate);
}
animate();