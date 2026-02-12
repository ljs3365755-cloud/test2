const SLIME_COLOR = "#CDB4DB"; 
const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');

const buttons = {
    feed: document.getElementById('feedBtn'),
    water: document.getElementById('waterBtn'),
    cookie: document.getElementById('cookieBtn'),
    shower: document.getElementById('showerBtn')
};

let state = 1; 
let effectType = null;
let isDragging = false;
let lastActionTime = Date.now();

// 초기 게이지 50% 설정
let fullness = 50;
let cleanliness = 50;

function drawEffect(type) {
    const now = Date.now();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const bounce = Math.sin(now / 150) * 10;

    ctx.save();
    if (type === 'heart') {
        ctx.fillStyle = "#ff4d4d";
        const x = cx; const y = cy - 60 + bounce;
        ctx.beginPath(); ctx.moveTo(x, y+5);
        ctx.quadraticCurveTo(x, y-10, x-15, y-10); ctx.quadraticCurveTo(x-30, y-10, x-30, y+5);
        ctx.quadraticCurveTo(x-30, y+20, x, y+35); ctx.quadraticCurveTo(x+30, y+20, x+30, y+5);
        ctx.quadraticCurveTo(x+30, y-10, x+15, y-10); ctx.quadraticCurveTo(x, y-10, x, y+5); ctx.fill();
    } else if (type === 'water') {
        ctx.fillStyle = "#3A86FF";
        ctx.beginPath(); ctx.arc(cx, cy - 50 + bounce, 12, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx - 12, cy - 50 + bounce); ctx.lineTo(cx, cy - 75 + bounce); ctx.lineTo(cx + 12, cy - 50 + bounce); ctx.fill();
    } else if (type === 'star') {
        ctx.fillStyle = "#FFD700";
        const x = cx; const y = cy - 60 + bounce;
        let rot = Math.PI / 2 * 3; ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(x + Math.cos(rot) * 18, y + Math.sin(rot) * 18); rot += Math.PI / 5;
            ctx.lineTo(x + Math.cos(rot) * 9, y + Math.sin(rot) * 9); rot += Math.PI / 5;
        } ctx.closePath(); ctx.fill();
    } else if (type === 'bubbles') {
        for (let i = 0; i < 6; i++) {
            const bx = cx + (i % 2 === 0 ? -65 : 65) + Math.sin(now / 200 + i) * 10;
            const by = cy + 20 + Math.cos(now / 300 + i) * 20;
            ctx.beginPath(); ctx.arc(bx, by, 12, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(173, 216, 230, 0.5)"; ctx.fill();
            ctx.strokeStyle = "white"; ctx.stroke();
        }
    }
    ctx.restore();
}

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();
    const idleTime = now - lastActionTime;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    
    if (idleTime > 30000 && !isDragging) {
        ctx.fillStyle = "#555"; ctx.font = "bold 16px Arial";
        ctx.fillText("Zzz...", cx + 45, cy - 40 + Math.sin(now/300)*5);
    }

    if (effectType) drawEffect(effectType);

    ctx.fillStyle = SLIME_COLOR;
    let eyeY = cy + 15;

    // 슬라임 몸체 (상/하단 라인 포함)
    if (state === 3) { // 늘어남
        ctx.fillRect(cx - 15, cy - 60, 30, 10); // 상단 한 줄
        ctx.fillRect(cx - 20, cy - 50, 40, 100);
        ctx.fillRect(cx - 30, cy - 30, 10, 80);
        ctx.fillRect(cx + 20, cy - 30, 10, 80);
        ctx.fillRect(cx - 30, cy + 50, 60, 10); // 하단 한 줄
        eyeY = cy - 20;
    } else if (state === 4) { // 눌림
        ctx.fillRect(cx - 50, cy + 0, 100, 10); // 상단 한 줄
        ctx.fillRect(cx - 60, cy + 10, 120, 40);
        ctx.fillRect(cx - 60, cy + 50, 120, 10); // 하단 한 줄
        eyeY = cy + 25;
    } else { // 평소
        ctx.fillRect(cx - 30, cy - 20, 60, 10); // 상단 한 줄
        ctx.fillRect(cx - 40, cy - 10, 80, 50);
        ctx.fillRect(cx - 50, cy + 10, 100, 30);
        ctx.fillRect(cx - 50, cy + 40, 100, 10); // 하단 한 줄
        eyeY = cy + 15;
    }

    ctx.strokeStyle = "black"; ctx.lineWidth = 3; ctx.lineCap = "round";
    const isBlinking = (!isDragging && state === 1 && now % 5000 > 4800);

    if (state === 4 || state === 5) { // >< 눈
        ctx.beginPath();
        ctx.moveTo(cx - 22, eyeY - 5); ctx.lineTo(cx - 12, eyeY); ctx.lineTo(cx - 22, eyeY + 5);
        ctx.moveTo(cx + 22, eyeY - 5); ctx.lineTo(cx + 12, eyeY); ctx.lineTo(cx + 22, eyeY + 5);
        ctx.stroke();
    } else if (isBlinking || idleTime > 30000) { 
        // 감은 눈 사이즈를 뜬 눈의 너비와 일치시킴
        ctx.beginPath();
        ctx.moveTo(cx - 18, eyeY); ctx.lineTo(cx - 8, eyeY);
        ctx.moveTo(cx + 8, eyeY); ctx.lineTo(cx + 18, eyeY);
        ctx.stroke();
    } else { // 뜬 눈
        ctx.fillStyle = "black";
        ctx.fillRect(cx - 18, eyeY - 3, 6, 6);
        ctx.fillRect(cx + 12, eyeY - 3, 6, 6);
    }
}

function updateBars() {
    document.getElementById('fullnessBar').style.height = Math.min(100, fullness) + "%";
    document.getElementById('cleanBar').style.height = Math.min(100, cleanliness) + "%";
}

function trigger(s, e, f, c) {
    state = s; effectType = e; lastActionTime = Date.now();
    fullness = Math.min(100, fullness + f);
    cleanliness = Math.min(100, cleanliness + c);
    updateBars();
    setTimeout(() => { if(!isDragging) { state = 1; effectType = null; } }, 1500);
}

buttons.feed.onclick = () => trigger(5, 'heart', 10, 0);
buttons.water.onclick = () => trigger(5, 'water', 5, 0);
buttons.cookie.onclick = () => trigger(5, 'star', 15, 0);
buttons.shower.onclick = () => trigger(5, 'bubbles', 0, 10);

canvas.onmousedown = () => { isDragging = true; state = 4; lastActionTime = Date.now(); };
window.onmousemove = (e) => {
    if(!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    state = (e.clientY - rect.top < 100) ? 3 : 4;
};
window.onmouseup = () => { isDragging = false; state = 1; };

function animate() { drawSlime(); requestAnimationFrame(animate); }

// 초기화 실행
updateBars(); 
animate();