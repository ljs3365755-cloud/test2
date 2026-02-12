const SLIME_COLOR = "#CDB4DB"; 
const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');
const feedBtn = document.getElementById('feedBtn');
const waterBtn = document.getElementById('waterBtn');
const cookieBtn = document.getElementById('cookieBtn');

let state = 1; 
let lastActionTime = Date.now();
let isDragging = false;
let effectType = null; 
let feedCount = 0;
let isFull = false;
let isShaking = false; 
let shakeOffset = 0;

// 눈 깜빡임 관련
let isBlinking = false;

function safePlay(filename) {
    try { new Audio(filename).play().catch(() => {}); } catch (e) {}
}

// [수정 3] 다듬어진 하트 모양 그리기
function drawHeart(x, y, size) {
    ctx.fillStyle = "#ff4d4d";
    ctx.beginPath();
    ctx.moveTo(x, y + size / 4);
    ctx.quadraticCurveTo(x, y, x - size / 2, y);
    ctx.quadraticCurveTo(x - size, y, x - size, y + size / 4);
    ctx.quadraticCurveTo(x - size, y + size / 2, x, y + size);
    ctx.quadraticCurveTo(x + size, y + size / 2, x + size, y + size / 4);
    ctx.quadraticCurveTo(x + size, y, x + size / 2, y);
    ctx.quadraticCurveTo(x, y, x, y + size / 4);
    ctx.fill();
}

function drawWaterDrop(x, y) {
    ctx.fillStyle = "#3A86FF";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - 12, y + 12, x - 12, y + 28, x, y + 28);
    ctx.bezierCurveTo(x + 12, y + 28, x + 12, y + 12, x, y);
    ctx.fill();
}

function drawEffectStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3; let step = Math.PI / spikes;
    ctx.fillStyle = "#FFD700";
    ctx.beginPath(); ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
        rot += step;
        ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
        rot += step;
    }
    ctx.closePath(); ctx.fill();
}

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();
    const idleTime = now - lastActionTime;
    
    shakeOffset = isShaking ? Math.sin(now / 50) * 15 : 0;

    // 30초 이상 반응 없을 시 Zzz...
    if (idleTime > 30000 && !isDragging && !isFull) {
        ctx.fillStyle = "#555";
        ctx.font = "bold 18px Arial";
        ctx.fillText("Zzz...", 135 + shakeOffset, 55 + Math.sin(now / 300) * 5);
    }

    // 아이템 효과 (크기 및 모양 개선)
    if (effectType && !isFull) {
        const yBounce = Math.sin(now / 150) * 10;
        if (effectType === 'heart') drawHeart(100 + shakeOffset, 25 + yBounce, 15);
        else if (effectType === 'water') drawWaterDrop(100 + shakeOffset, 20 + yBounce);
        else if (effectType === 'star') drawEffectStar(100 + shakeOffset, 35 + yBounce, 5, 18, 9);
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
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";

    if (isFull || (idleTime > 30000 && !isDragging) || isBlinking) {
        // 일직선 눈 (자는 상태, 배부른 상태, 깜빡임)
        ctx.beginPath();
        ctx.moveTo(78 + shakeOffset, 112); ctx.lineTo(92 + shakeOffset, 112);
        ctx.moveTo(108 + shakeOffset, 112); ctx.lineTo(122 + shakeOffset, 112);
        ctx.stroke();
    } else if (state === 5) { 
        // [수정 2] 완벽한 ^^ 눈 모양
        ctx.beginPath();
        // 왼쪽 ^
        ctx.moveTo(75 + shakeOffset, 115);
        ctx.lineTo(82 + shakeOffset, 108);
        ctx.lineTo(89 + shakeOffset, 115);
        // 오른쪽 ^
        ctx.moveTo(111 + shakeOffset, 115);
        ctx.lineTo(118 + shakeOffset, 108);
        ctx.lineTo(125 + shakeOffset, 115);
        ctx.stroke();
    } else if (state === 4) { // > <
        ctx.beginPath();
        ctx.moveTo(72+shakeOffset, 136); ctx.lineTo(80+shakeOffset, 140); ctx.lineTo(72+shakeOffset, 144);
        ctx.moveTo(128+shakeOffset, 136); ctx.lineTo(120+shakeOffset, 140); ctx.lineTo(128+shakeOffset, 144);
        ctx.stroke();
    } else { // 기본 눈 (● ●)
        ctx.fillStyle = "black";
        let eyeY = (state === 3) ? 80 : 110;
        ctx.fillRect(82+shakeOffset, eyeY, 6, 6); ctx.fillRect(112+shakeOffset, eyeY, 6, 6);
    }
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
        setTimeout(() => { isFull = false; feedCount = 0; lastActionTime = Date.now(); }, 10000);
    } else { triggerReaction(5, 'heart', 'ggd-yumyum.mp3'); }
});

waterBtn.addEventListener('click', () => triggerReaction(5, 'water', 'ggd-yumyum.mp3'));
cookieBtn.addEventListener('click', () => triggerReaction(5, 'star', 'ggd-yumyum.mp3'));

canvas.addEventListener('mousedown', () => { if(!isFull){ isDragging = true; state = 4; lastActionTime = Date.now(); safePlay('squeaky.mp3'); }});
window.addEventListener('mouseup', () => { isDragging = false; if(!isFull) state = 1; });

// [수정 1] 눈 깜빡임 로직 (30초 전까지 무한 반복)
function animate() {
    const now = Date.now();
    const idleTime = now - lastActionTime;

    if (!isDragging && !isFull && state === 1 && idleTime < 30000) {
        const blinkCycle = now % 5500; // 5.5초마다 반복
        isBlinking = (blinkCycle > 5000); 
    } else {
        isBlinking = false;
    }

    drawSlime();
    requestAnimationFrame(animate);
}
animate();