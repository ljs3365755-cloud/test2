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
let fullness = 50; // 시작 시 50%
let cleanliness = 50;

function drawEffect(type) {
    const now = Date.now();
    const cx = canvas.width / 2;
    if (type === 'bubbles') {
        for (let i = 0; i < 6; i++) {
            const bx = cx + (i % 2 === 0 ? -60 : 60) + Math.sin(now/200 + i)*10;
            const by = 130 + Math.cos(now/300 + i)*20;
            ctx.beginPath(); ctx.arc(bx, by, 12, 0, Math.PI*2);
            ctx.fillStyle = "rgba(173, 216, 230, 0.5)"; ctx.fill();
            ctx.strokeStyle = "white"; ctx.stroke();
        }
    }
}

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    
    ctx.fillStyle = SLIME_COLOR;
    let eyeY = cy + 15;

    // 몸체 그리기
    if (state === 3) { // 늘어남
        ctx.fillRect(cx - 20, cy - 50, 40, 100);
        eyeY = cy - 20;
    } else if (state === 4) { // 눌림 (드래그 중)
        ctx.fillRect(cx - 60, cy + 20, 120, 30);
        ctx.fillRect(cx - 50, cy + 10, 100, 10);
        eyeY = cy + 25;
    } else { // 평소
        ctx.fillRect(cx - 40, cy, 80, 50);
        ctx.fillRect(cx - 50, cy + 10, 100, 30);
        eyeY = cy + 15;
    }

    if (effectType === 'bubbles') drawEffect('bubbles');

    // 눈 그리기 (>< 모양 로직 강화)
    ctx.strokeStyle = "black"; ctx.lineWidth = 3; ctx.lineCap = "round";
    
    // state 4(눌림) 이거나 state 5(반응) 일 때 >< 모양 출력
    if (state === 4 || state === 5) {
        // 왼쪽 눈 >
        ctx.beginPath();
        ctx.moveTo(cx - 22, eyeY - 5); ctx.lineTo(cx - 12, eyeY); ctx.lineTo(cx - 22, eyeY + 5);
        ctx.stroke();
        // 오른쪽 눈 <
        ctx.beginPath();
        ctx.moveTo(cx + 22, eyeY - 5); ctx.lineTo(cx + 12, eyeY); ctx.lineTo(cx + 22, eyeY + 5);
        ctx.stroke();
    } else {
        // 평소 눈 (점)
        ctx.fillStyle = "black";
        ctx.fillRect(cx - 18, eyeY - 3, 6, 6);
        ctx.fillRect(cx + 12, eyeY - 3, 6, 6);
    }
}

function updateBars() {
    document.getElementById('fullnessBar').style.height = fullness + "%";
    document.getElementById('cleanBar').style.height = cleanliness + "%";
}

function trigger(s, e, f, c) {
    state = s; effectType = e;
    fullness = Math.min(100, fullness + f);
    cleanliness = Math.min(100, cleanliness + c);
    updateBars();
    setTimeout(() => { if(!isDragging) { state = 1; effectType = null; } }, 1500);
}

buttons.feed.onclick = () => trigger(5, 'heart', 10, 0);
buttons.shower.onclick = () => trigger(5, 'bubbles', 0, 10);

canvas.onmousedown = () => { isDragging = true; state = 4; };
window.onmousemove = (e) => {
    if(!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    state = (e.clientY - rect.top < 100) ? 3 : 4;
};
window.onmouseup = () => { isDragging = false; state = 1; };

function animate() { drawSlime(); requestAnimationFrame(animate); }
updateBars(); animate();