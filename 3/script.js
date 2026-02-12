const SLIME_COLOR = "#CDB4DB"; 
const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');

// 버튼들
const buttons = {
    feed: document.getElementById('feedBtn'),
    water: document.getElementById('waterBtn'),
    cookie: document.getElementById('cookieBtn'),
    shower: document.getElementById('showerBtn')
};

// 게이지 요소
const fullnessBar = document.getElementById('fullnessBar');
const cleanBar = document.getElementById('cleanBar');

// 상태 변수
let state = 1; 
let lastActionTime = Date.now();
let isDragging = false, isFull = false, isShaking = false, isBlinking = false;
let effectType = null;
let shakeOffset = 0;

// [추가] 게이지 및 제한 관리
let fullness = 100;
let cleanliness = 100;
let waterCount = 0;
let lastCookieTime = 0;

function safePlay(filename) {
    try { new Audio(filename).play().catch(() => {}); } catch (e) {}
}

// [수정] 비누 거품 그리기 (샤워 효과)
function drawBubbles() {
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    for(let i=0; i<8; i++) {
        const x = 60 + Math.sin(Date.now()/200 + i) * 50 + 40;
        const y = 100 + Math.cos(Date.now()/300 + i) * 30 + 40;
        ctx.beginPath();
        ctx.arc(x + shakeOffset, y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.stroke();
    }
}

// [수정] 하트, 물방울, 별 그리기 (이전 로직 유지/확대)
function drawEffect(type) {
    const yBounce = Math.sin(Date.now() / 150) * 10;
    const x = 100 + shakeOffset;
    const y = 25 + yBounce;
    
    if (type === 'heart') {
        ctx.fillStyle = "#ff4d4d";
        ctx.fillRect(x-5, y+5, 15, 15); ctx.fillRect(x-20, y-3, 15, 15); ctx.fillRect(x+10, y-3, 15, 15);
    } else if (type === 'water') {
        ctx.fillStyle = "#3A86FF";
        ctx.beginPath(); ctx.moveTo(x, y-5); ctx.bezierCurveTo(x-12, y+7, x-12, y+23, x, y+23); ctx.bezierCurveTo(x+12, y+23, x+12, y+7, x, y-5); ctx.fill();
    } else if (type === 'star') {
        ctx.fillStyle = "#FFD700";
        let rot = Math.PI/2*3; for(let i=0; i<5; i++) {
            ctx.lineTo(x+Math.cos(rot)*18, y+10+Math.sin(rot)*18); rot+=Math.PI/5;
            ctx.lineTo(x+Math.cos(rot)*9, y+10+Math.sin(rot)*9); rot+=Math.PI/5;
        } ctx.fill();
    }
}

function updateBars() {
    fullnessBar.style.height = fullness + "%";
    cleanBar.style.height = cleanliness + "%";
}

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();
    shakeOffset = isShaking ? Math.sin(now / 50) * 15 : 0;

    // 30초 부동 시 Zzz
    if (now - lastActionTime > 30000 && !isDragging && !isFull) {
        ctx.fillStyle = "#555"; ctx.font = "bold 18px Arial";
        ctx.fillText("Zzz...", 135 + shakeOffset, 55 + Math.sin(now / 300) * 5);
    }

    if (effectType === 'bubbles') drawBubbles();
    else if (effectType) drawEffect(effectType);

    // 몸체 및 눈 그리기 (기존 로직 동일하게 유지 - 생략 가능하나 완결성을 위해 유지)
    ctx.fillStyle = SLIME_COLOR;
    // ... (기존 몸체 그리기 코드 적용)
    ctx.fillRect(60 + shakeOffset, 100, 80, 50); ctx.fillRect(70 + shakeOffset, 90, 60, 10);
    ctx.fillRect(50 + shakeOffset, 110, 10, 30); ctx.fillRect(140 + shakeOffset, 110, 10, 30);
    
    // 눈 모양 ^^
    ctx.strokeStyle = "black"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
    if (state === 5 || effectType) {
        ctx.beginPath();
        ctx.moveTo(78+shakeOffset, 115); ctx.lineTo(85+shakeOffset, 108); ctx.lineTo(92+shakeOffset, 115);
        ctx.moveTo(108+shakeOffset, 115); ctx.lineTo(115+shakeOffset, 108); ctx.lineTo(122+shakeOffset, 115);
        ctx.stroke();
    } else {
        ctx.fillStyle = "black";
        ctx.fillRect(82+shakeOffset, 110, 6, 6); ctx.fillRect(112+shakeOffset, 110, 6, 6);
    }
}

// 공통 반응 함수
function triggerReaction(newState, newEffect, fullnessPlus, cleanPlus) {
    if (isFull) { alert("슬라임이 너무 지쳤어요! 잠시 쉬게 해주세요."); return; }
    state = newState; effectType = newEffect; lastActionTime = Date.now();
    fullness = Math.min(100, fullness + fullnessPlus);
    cleanliness = Math.min(100, cleanliness + cleanPlus);
    updateBars();
    setTimeout(() => { state = 1; effectType = null; }, 2000);
}

// 이벤트 리스너
buttons.feed.addEventListener('click', () => triggerReaction(5, 'heart', 2, 0));
buttons.water.addEventListener('click', () => {
    waterCount++;
    if (waterCount > 5) {
        alert("물을 너무 많이 마셨어요! (제한)");
        waterCount = 0; // 초기화
    } else {
        triggerReaction(5, 'water', 1, 0);
    }
});
buttons.cookie.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastCookieTime < 3600000) { // 1시간(3600,000ms) 제한
        alert("쿠키는 한 시간에 하나만 줄 수 있어요!");
    } else {
        lastCookieTime = now;
        triggerReaction(5, 'star', 3, 0);
    }
});
buttons.shower.addEventListener('click', () => triggerReaction(5, 'bubbles', 0, 5));

// [핵심] 10분에 1% 감소 로직 (600,000ms)
setInterval(() => {
    fullness = Math.max(0, fullness - 1);
    cleanliness = Math.max(0, cleanliness - 1);
    updateBars();
}, 600000);

function animate() {
    drawSlime();
    requestAnimationFrame(animate);
}
updateBars();
animate();