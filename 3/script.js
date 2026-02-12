const SLIME_COLOR = "#CDB4DB"; 
const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');
const feedBtn = document.getElementById('feedBtn');
const waterBtn = document.getElementById('waterBtn');
const cookieBtn = document.getElementById('cookieBtn');

let state = 1; // 1:평소, 2:눈감음, 3:늘어남, 4:눌림, 5:행복, 6:별눈
let lastActionTime = Date.now();
let isDragging = false;
let effectType = null; // 'heart', 'water'
let feedCount = 0;
let isFull = false;
let isShaking = false; 
let shakeOffset = 0;

function safePlay(filename) {
    try { new Audio(filename).play().catch(() => {}); } catch (e) {}
}

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();
    const idleTime = now - lastActionTime;
    
    // 도리도리 계산
    shakeOffset = isShaking ? Math.sin(now / 50) * 15 : 0;

    // 15초 이상 반응 없을 시 Zzz... 표시
    if (idleTime > 15000 && !isDragging && !isFull) {
        ctx.fillStyle = "#555";
        ctx.font = "bold 16px Arial";
        ctx.fillText("Zzz...", 130 + shakeOffset, 60 + Math.sin(now / 300) * 5);
    }

    // 아이템 효과 (하트 또는 물방울)
    if (effectType && !isFull) {
        if (effectType === 'heart') {
            ctx.fillStyle = "#ff4d4d";
            ctx.fillRect(95 + shakeOffset, 30 + Math.sin(now / 150) * 8, 10, 10);
        } else if (effectType === 'water') {
            ctx.fillStyle = "#3A86FF";
            ctx.beginPath(); // 물방울 모양
            ctx.arc(100 + shakeOffset, 35 + Math.sin(now / 150) * 10, 6, 0, Math.PI * 2);
            ctx.fill();
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

    // 눈 그리기
    ctx.fillStyle = "black";
    if (isFull || (state === 2 && !isDragging)) { // 눈 감음
        ctx.fillRect(80 + shakeOffset, 112, 10, 2); 
        ctx.fillRect(110 + shakeOffset, 112, 10, 2);
    } else if (state === 6) { // 별 모양 눈 (쿠키)
        ctx.fillStyle = "#FFD700"; // 금색 별
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

function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3; let x = cx; let y = cy; let step = Math.PI / spikes;
    ctx.beginPath(); ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius; y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y); rot += step;
        x = cx + Math.cos(rot) * innerRadius; y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y); rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius); ctx.closePath(); ctx.fill();
}

// 공통 반응 함수
function triggerReaction(newState, newEffect, sound) {
    if (isFull) { alert("슬라임이 아직 배가 부릅니다!"); return; }
    state = newState; effectType = newEffect; lastActionTime = Date.now();
    safePlay(sound);
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
    } else { triggerReaction(5, 'heart', 'ggd-yumyum.mp3'); }
});

waterBtn.addEventListener('click', () => triggerReaction(5, 'water', 'ggd-yumyum.mp3'));
cookieBtn.addEventListener('click', () => triggerReaction(6, 'heart', 'ggd-yumyum.mp3'));

// 상호작용 로직
canvas.addEventListener('mousedown', () => { if(!isFull){ isDragging = true; state = 4; lastActionTime = Date.now(); safePlay('squeaky.mp3'); }});
window.addEventListener('mousemove', (e) => { 
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        state = (e.clientY - rect.top < 70) ? 3 : 4;
    }
});
window.addEventListener('mouseup', () => { isDragging = false; if(!isFull) state = 1; });

function animate() {
    // 눈 감기 오류 수정: 3초 후 눈 감고, 움직임 발생 시 즉시 해제
    if (!isDragging && !isFull && ![5,6].includes(state)) {
        state = (Date.now() - lastActionTime > 3000) ? 2 : 1;
    }
    drawSlime();
    requestAnimationFrame(animate);
}
animate();