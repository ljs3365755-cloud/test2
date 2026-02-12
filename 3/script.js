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
let isDragging = false, isFull = false, isShaking = false, isBlinking = false;
let effectType = null;
let shakeOffset = 0;

let fullness = 100;
let cleanliness = 100;
let waterCount = 0;
let lastCookieTime = 0;

function safePlay(filename) { try { new Audio(filename).play().catch(() => {}); } catch (e) {} }

function drawEffect(type) {
    const now = Date.now();
    const x = 100 + shakeOffset;
    const y = 30 + Math.sin(now / 150) * 10;
    
    if (type === 'heart') {
        ctx.fillStyle = "#ff4d4d";
        ctx.beginPath(); ctx.moveTo(x, y+5);
        ctx.quadraticCurveTo(x, y-10, x-15, y-10); ctx.quadraticCurveTo(x-30, y-10, x-30, y+5);
        ctx.quadraticCurveTo(x-30, y+20, x, y+35); ctx.quadraticCurveTo(x+30, y+20, x+30, y+5);
        ctx.quadraticCurveTo(x+30, y-10, x+15, y-10); ctx.quadraticCurveTo(x, y-10, x, y+5); ctx.fill();
    } else if (type === 'water') {
        ctx.fillStyle = "#3A86FF";
        ctx.beginPath(); ctx.moveTo(x, y-5);
        ctx.bezierCurveTo(x-15, y+10, x-15, y+30, x, y+30); ctx.bezierCurveTo(x+15, y+30, x+15, y+10, x, y-5); ctx.fill();
    } else if (type === 'star') {
        ctx.fillStyle = "#FFD700";
        let rot = Math.PI/2*3; ctx.beginPath();
        for(let i=0; i<5; i++){
            ctx.lineTo(x+Math.cos(rot)*20, y+10+Math.sin(rot)*20); rot+=Math.PI/5;
            ctx.lineTo(x+Math.cos(rot)*10, y+10+Math.sin(rot)*10); rot+=Math.PI/5;
        } ctx.fill();
    } else if (type === 'bubbles') {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        for(let i=0; i<6; i++) {
            const bx = 60 + Math.sin(now/200 + i)*60 + 40;
            const by = 100 + Math.cos(now/300 + i)*40 + 40;
            ctx.beginPath(); ctx.arc(bx + shakeOffset, by, 10, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = "white"; ctx.stroke();
        }
    }
}

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();
    const idleTime = now - lastActionTime;
    shakeOffset = isShaking ? Math.sin(now / 50) * 15 : 0;

    if (idleTime > 30000 && !isDragging && !isFull) {
        ctx.fillStyle = "#555"; ctx.font = "bold 18px Arial";
        ctx.fillText("Zzz...", 135 + shakeOffset, 55 + Math.sin(now/300)*5);
    }

    if (effectType) drawEffect(effectType);

    ctx.fillStyle = SLIME_COLOR;
    if (state === 3) {
        ctx.fillRect(80+shakeOffset, 50, 40, 110); ctx.fillRect(70+shakeOffset, 70, 10, 70); ctx.fillRect(120+shakeOffset, 70, 10, 70);
    } else if (state === 4 && !isFull) {
        ctx.fillRect(40+shakeOffset, 130, 120, 30); ctx.fillRect(50+shakeOffset, 120, 100, 10);
    } else {
        ctx.fillRect(60+shakeOffset, 100, 80, 50); ctx.fillRect(70+shakeOffset, 90, 60, 10);
        ctx.fillRect(50+shakeOffset, 110, 10, 30); ctx.fillRect(140+shakeOffset, 110, 10, 30);
    }

    ctx.strokeStyle = "black"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
    if (isFull || (idleTime > 30000 && !isDragging) || isBlinking) {
        ctx.beginPath(); ctx.moveTo(81+shakeOffset, 112); ctx.lineTo(89+shakeOffset, 112);
        ctx.moveTo(111+shakeOffset, 112); ctx.lineTo(119+shakeOffset, 112); ctx.stroke();
    } else if (state === 5 || effectType) {
        ctx.beginPath(); ctx.moveTo(78+shakeOffset, 115); ctx.lineTo(85+shakeOffset, 108); ctx.lineTo(92+shakeOffset, 115);
        ctx.moveTo(108+shakeOffset, 115); ctx.lineTo(115+shakeOffset, 108); ctx.lineTo(122+shakeOffset, 115); ctx.stroke();
    } else {
        ctx.fillStyle = "black";
        let eyeY = (state === 3) ? 80 : 110;
        ctx.fillRect(82+shakeOffset, eyeY, 6, 6); ctx.fillRect(112+shakeOffset, eyeY, 6, 6);
    }
}

function updateBars() {
    fullnessBar.style.height = fullness + "%";
    cleanBar.style.height = cleanliness + "%";
}

function triggerReaction(newState, newEffect, fPlus, cPlus) {
    if (isFull) return;
    state = newState; effectType = newEffect; lastActionTime = Date.now();
    fullness = Math.min(100, fullness + fPlus);
    cleanliness = Math.min(100, cleanliness + cPlus);
    updateBars(); safePlay('ggd-yumyum.mp3');
    setTimeout(() => { if (!isFull) { state = 1; effectType = null; } }, 2000);
}

buttons.feed.addEventListener('click', () => triggerReaction(5, 'heart', 2, 0));
buttons.water.addEventListener('click', () => {
    waterCount++; if(waterCount > 5) { alert("물을 너무 많이 마셨어요!"); waterCount = 0; }
    else triggerReaction(5, 'water', 1, 0);
});
buttons.cookie.addEventListener('click', () => {
    const now = Date.now(); if(now - lastCookieTime < 3600000) alert("쿠키는 한 시간에 한 번만!");
    else { lastCookieTime = now; triggerReaction(5, 'star', 3, 0); }
});
buttons.shower.addEventListener('click', () => triggerReaction(5, 'bubbles', 0, 5));

function handleStart() { if(!isFull){ isDragging = true; state = 4; lastActionTime = Date.now(); safePlay('squeaky.mp3'); }}
function handleMove(e) {
    if(!isDragging || isFull) return;
    const rect = canvas.getBoundingClientRect();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    state = (clientY - rect.top < 80) ? 3 : 4;
}
function handleEnd() { isDragging = false; if(!isFull) state = 1; }

canvas.addEventListener('mousedown', handleStart);
window.addEventListener('mousemove', handleMove);
window.addEventListener('mouseup', handleEnd);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleStart(); }, {passive: false});
window.addEventListener('touchmove', (e) => { if(isDragging) e.preventDefault(); handleMove(e); }, {passive: false});
window.addEventListener('touchend', handleEnd);

setInterval(() => {
    fullness = Math.max(0, fullness - 1);
    cleanliness = Math.max(0, cleanliness - 1);
    updateBars();
}, 600000);

function animate() {
    const now = Date.now();
    if(!isDragging && !isFull && state === 1 && (now - lastActionTime < 30000)) {
        isBlinking = (now % 5500 > 5000);
    } else isBlinking = false;
    drawSlime(); requestAnimationFrame(animate);
}
updateBars(); animate();