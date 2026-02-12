const SLIME_COLOR = "#CDB4DB"; 
const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');
const feedBtn = document.getElementById('feedBtn');
const waterBtn = document.getElementById('waterBtn');
const cookieBtn = document.getElementById('cookieBtn');

let state = 1; // 1:평소, 2:눈감음, 3:늘어남, 4:눌림, 5:행복, 6:별눈
let lastActionTime = Date.now();
let isDragging = false;
let effectType = null; // 'heart', 'water', 'star'
let feedCount = 0;
let isFull = false;
let isShaking = false; 
let shakeOffset = 0;

// 눈 깜빡임 관련
let isBlinking = false;

function safePlay(filename) {
    try { new Audio(filename).play().catch(() => {}); } catch (e) {}
}

// [수정 2] 물방울 모양 그리기 (크기 확대)
function drawWaterDrop(x, y) {
    ctx.fillStyle = "#3A86FF";
    ctx.beginPath();
    ctx.moveTo(x, y);
    // 베지어 곡선 좌표를 키워 크기 확대
    ctx.bezierCurveTo(x - 10, y + 10, x - 10, y + 25, x, y + 25);
    ctx.bezierCurveTo(x + 10, y + 25, x + 10, y + 10, x, y);
    ctx.fill();
}

// [수정 4] 별 모양 그리기 (효과용, 크기 확대)
function drawEffectStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        let x = cx + Math.cos(rot) * outerRadius;
        let y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.closePath();
    ctx.fill();
}

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();
    const idleTime = now - lastActionTime;
    
    shakeOffset = isShaking ? Math.sin(now / 50) * 15 : 0;

    // 30초 이상 반응 없을 시 Zzz...
    if (idleTime > 30000 && !isDragging && !isFull) {
        ctx.fillStyle = "#555";
        ctx.font = "bold 16px Arial";
        ctx.fillText("Zzz...", 130 + shakeOffset, 60 + Math.sin(now / 300) * 5);
    }

    // [수정 2 & 4] 아이템 효과 그리기 (크기 확대 버전)
    if (effectType && !isFull) {
        const yBounce = Math.sin(now / 150) * 8;
        if (effectType === 'heart') {
            ctx.fillStyle = "#ff4d4d";
            // 사각형 크기 확대 (기존 10 -> 15)
            ctx.fillRect(95 + shakeOffset, 30 + yBounce, 15, 15);
            ctx.fillRect(80 + shakeOffset, 22 + yBounce, 15, 15);
            ctx.fillRect(110 + shakeOffset, 22 + yBounce, 15, 15);
        } else if (effectType === 'water') {
            drawWaterDrop(100 + shakeOffset, 20 + yBounce);
        } else if (effectType === 'star') {
            drawEffectStar(105 + shakeOffset, 35 + yBounce, 5, 15, 7);
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

    // 눈 그리기 로직
    ctx.fillStyle = "black";
    
    // 강제 눈감기(isFull, 졸음) 혹은 깜빡임 상태
    if (isFull || (state === 2 && !isDragging) || isBlinking) {
        ctx.fillRect(80 + shakeOffset, 112, 10, 2); 
        ctx.fillRect(110 + shakeOffset, 112, 10, 2);
    } else if (state === 6) { // 별 눈 (쿠키를 먹었을 때 눈동자 모양)
        ctx.fillStyle = "#FFD700";
        drawEffectStar(85 + shakeOffset, 110, 5, 8, 4);
        drawEffectStar(115 + shakeOffset, 110, 5, 8, 4);
    } else if (state === 4) { // > <
        ctx.fillRect(70 + shakeOffset, 136, 6, 2); ctx.fillRect(126 + shakeOffset, 136, 6, 2);
    } else if (state === 5) { // [수정 3] ^^ (삼각김밥, 물 선택 시)
        ctx.fillRect(77 + shakeOffset, 110, 10, 2); ctx.fillRect(117 + shakeOffset, 110, 10, 2);
        ctx.fillRect(77 + shakeOffset, 110, 2, 4); ctx.fillRect(85 + shakeOffset, 110, 2, 4);
        ctx.fillRect(117 + shakeOffset, 110, 2, 4); ctx.fillRect(125 + shakeOffset, 110, 2, 4);
    } else { // 기본 눈
        let eyeY = (state === 3) ? 80 : 110;
        ctx.fillRect(82 + shakeOffset, eyeY, 6, 6); ctx.fillRect(112 + shakeOffset, eyeY, 6, 6);
    }
}

// 공통 반응 함수
function triggerReaction(newState, newEffect, sound) {
    if (isFull) { alert("슬라임이 아직 배가 부릅니다!"); return; }
    state = newState; 
    effectType = newEffect; 
    lastActionTime = Date.now();
    safePlay(sound);
    // 2초 뒤에 원래대로
    setTimeout(() => { if(!isFull) { state = 1; effectType = null; } }, 2000);
}

// 아이콘 클릭 이벤트
feedBtn.addEventListener('click', () => {
    feedCount++;
    if (feedCount >= 5) {
        isFull = true; isShaking = true; safePlay('no.mp3');
        alert("너무 배불러요! (10초 휴식)");
        setTimeout(() => { isShaking = false; }, 2000);
        setTimeout(() => { isFull = false; feedCount = 0; state = 1; lastActionTime = Date.now(); }, 10000);
    } else { 
        // [수정 3] 삼각김밥 -> ^^ 눈 (state 5)
        triggerReaction(5, 'heart', 'ggd-yumyum.mp3'); 
    }
});

waterBtn.addEventListener('click', () => {
    // [수정 3] 물 -> ^^ 눈 (state 5)
    triggerReaction(5, 'water', 'ggd-yumyum.mp3');
});

cookieBtn.addEventListener('click', () => {
    // [수정 3 & 4] 쿠키 -> ^^ 눈 (state 5) + 별 효과 (star)
    // 눈을 별모양으로 유지하고 싶다면 state 6을, ^^로 하고 싶다면 5를 쓰세요. 요청대로 5로 설정합니다.
    triggerReaction(5, 'star', 'ggd-yumyum.mp3');
});

// 상호작용
canvas.addEventListener('mousedown', () => { if(!isFull){ isDragging = true; state = 4; lastActionTime = Date.now(); safePlay('squeaky.mp3'); }});
window.addEventListener('mousemove', (e) => { 
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        state = (e.clientY - rect.top < 70) ? 3 : 4;
    }
});
window.addEventListener('mouseup', () => { isDragging = false; if(!isFull) state = 1; });

// [수정 1] 애니메이션 루프 (눈 깜빡임 복구)
function animate() {
    const now = Date.now();
    
    // 5초 눈뜨고 0.5초 깜빡이는 로직
    if (!isDragging && !isFull && state === 1) {
        const cycle = now % 5500; // 5.5초 주기
        if (cycle > 5000) { 
            isBlinking = true;
        } else {
            isBlinking = false;
            // 3초 이상 가만히 있으면 조는 상태(state 2)로 전환
            if (now - lastActionTime > 3000) state = 2;
        }
    } else if (state === 2) {
        // 조는 중에도 깜빡임은 멈추고 눈감은 상태 유지
        isBlinking = false;
        if (now - lastActionTime < 3000) state = 1; 
    } else {
        isBlinking = false;
    }

    drawSlime();
    requestAnimationFrame(animate);
}
animate();