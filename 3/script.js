const SLIME_COLOR = "#CDB4DB"; 
const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');

const buttons = {
    feed: document.getElementById('feedBtn'),
    water: document.getElementById('waterBtn'),
    cookie: document.getElementById('cookieBtn'),
    shower: document.getElementById('showerBtn')
};
const fullnessBar = document.getElementById('fullnessBar');
const cleanBar = document.getElementById('cleanBar');

let state = 1; 
let lastActionTime = Date.now();
let isDragging = false, isBlinking = false;
let effectType = null;

let fullness = 50;
let cleanliness = 50;
let waterCount = 0;
let lastCookieTime = 0;

function safePlay(filename) { try { new Audio(filename).play().catch(() => {}); } catch (e) {} }

// [수정] 효과 그리기 (거품 모션을 사진처럼 양옆에 배치)
function drawEffect(type) {
    const now = Date.now();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const bounceY = Math.sin(now / 150) * 10;
    
    ctx.save();
    if (type === 'heart') {
        ctx.fillStyle = "#ff4d4d";
        const x = centerX; const y = 50 + bounceY;
        ctx.beginPath(); ctx.moveTo(x, y+5);
        ctx.quadraticCurveTo(x, y-10, x-15, y-10); ctx.quadraticCurveTo(x-30, y-10, x-30, y+5);
        ctx.quadraticCurveTo(x-30, y+20, x, y+35); ctx.quadraticCurveTo(x+30, y+20, x+30, y+5);
        ctx.quadraticCurveTo(x+30, y-10, x+15, y-10); ctx.quadraticCurveTo(x, y-10, x, y+5); ctx.fill();
    } else if (type === 'water') {
        ctx.fillStyle = "#3A86FF";
        ctx.beginPath(); ctx.arc(centerX, 60 + bounceY, 15, 0, Math.PI * 2); ctx.fill();
    } else if (type === 'bubbles') {
        // [수정] 보내주신 사진(image_fca425.png)처럼 양옆에 몽글몽글하게 배치
        const bubblePoints = [
            {x: -60, y: 20}, {x: -45, y: -10}, {x: -70, y: -30}, 
            {x: 60, y: 10}, {x: 50, y: -20}, {x: 75, y: 0}
        ];
        bubblePoints.forEach((p, i) => {
            const bx = centerX + p.x;
            const by = centerY + p.y + Math.sin(now/200 + i)*5;
            const size = 15 + Math.sin(now/300 + i)*5;
            ctx.beginPath();
            ctx.arc(bx, by, size, 0, Math.PI*2);
            ctx.fillStyle = "rgba(173, 216, 230, 0.4)"; ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"; ctx.stroke();
        });
    }
    ctx.restore();
}

// [핵심] 슬라임 그리기 (좌표를 canvas.width/2 기준으로 고정)
function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();
    const idleTime = now - lastActionTime;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    if (idleTime > 30000 && !isDragging) {
        ctx.fillStyle = "#555"; ctx.font = "bold 16px Arial";
        ctx.fillText("Zzz...", centerX + 40, centerY - 50);
    }

    if (effectType && effectType !== 'bubbles') drawEffect(effectType);

    ctx.fillStyle = SLIME_COLOR;
    let eyeY = centerY + 10;

    // 슬라임 몸체 (중앙 기준)
    if (state === 3) { // 늘어남
        ctx.fillRect(centerX - 20, centerY - 50, 40, 100);
        ctx.fillRect(centerX - 30, centerY - 30, 10, 60);
        ctx.fillRect(centerX + 20, centerY - 30, 10, 60);
        eyeY = centerY - 20; // 눈이 위로 따라감
    } else if (state === 4) { // 눌림
        ctx.fillRect(centerX - 60, centerY + 20, 120, 30);
        ctx.fillRect(centerX - 50, centerY + 10, 100, 10);
        eyeY = centerY + 25; // 눈이 아래로 확실히 내려감
    } else { // 평소
        ctx.fillRect(centerX - 40, centerY, 80, 50);
        ctx.fillRect(centerX - 30, centerY - 10, 60, 10);
        ctx.fillRect(centerX - 50, centerY + 10, 10, 30);
        ctx.fillRect(centerX + 40, centerY + 10, 10, 30);
        eyeY = centerY + 15;
    }

    if (effectType === 'bubbles') drawEffect('bubbles');

    // 눈 그리기
    ctx.strokeStyle = "black"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
    if (isBlinking || (idleTime > 30000 && !isDragging)) {
        ctx.beginPath();
        ctx.moveTo(centerX - 18, eyeY); ctx.lineTo(centerX - 8, eyeY);
        ctx.moveTo(centerX + 8, eyeY); ctx.lineTo(centerX + 18, eyeY);
        ctx.stroke();
    } else if (state === 5 || effectType) {
        ctx.beginPath();
        ctx.moveTo(centerX - 22, eyeY + 5); ctx.lineTo(centerX - 15, eyeY); ctx.lineTo(centerX - 8, eyeY + 5);
        ctx.moveTo(centerX + 8, eyeY + 5); ctx.lineTo(centerX + 15, eyeY); ctx.lineTo(centerX + 22, eyeY + 5);
        ctx.stroke();
    } else {
        ctx.fillStyle = "black";
        ctx.fillRect(centerX - 18, eyeY - 3, 6, 6);
        ctx.fillRect(centerX + 12, eyeY - 3, 6, 6);
    }
}

function updateBars() {
    fullnessBar.style.height = Math.min(100, Math.max(0, fullness)) + "%";
    cleanBar.style.height = Math.min(100, Math.max(0, cleanliness)) + "%";
}

function triggerReaction(newState, newEffect, fPlus, cPlus) {
    state = newState; effectType = newEffect; lastActionTime = Date.now();
    fullness = Math.min(100, fullness + fPlus);
    cleanliness = Math.min(100, cleanliness + cPlus);
    updateBars();
    setTimeout(() => { if(!isDragging) { state = 1; effectType = null; } }, 2000);
}

buttons.feed.addEventListener('click', () => triggerReaction(5, 'heart', 5, 0));
buttons.water.addEventListener('click', () => triggerReaction(5, 'water', 2, 0));
buttons.cookie.addEventListener('click', () => triggerReaction(5, 'star', 10, 0));
buttons.shower.addEventListener('click', () => triggerReaction(5, 'bubbles', 0, 10));

function handleStart() { isDragging = true; state = 4; lastActionTime = Date.now(); }
function handleMove(e) {
    if(!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    state = (clientY - rect.top < 100) ? 3 : 4;
}
function handleEnd() { isDragging = false; state = 1; }

canvas.addEventListener('mousedown', handleStart);
window.addEventListener('mousemove', handleMove);
window.addEventListener('mouseup', handleEnd);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleStart(); }, {passive: false});
window.addEventListener('touchmove', (e) => { if(isDragging) e.preventDefault(); handleMove(e); }, {passive: false});
window.addEventListener('touchend', handleEnd);

function animate() {
    const now = Date.now();
    isBlinking = (!isDragging && state === 1 && now % 5000 > 4700);
    drawSlime(); requestAnimationFrame(animate);
}

updateBars(); animate();