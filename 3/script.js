const SLIME_COLOR = "#CDB4DB"; 
const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');

let state = 1; // 1: 평소, 3: 늘어남, 4: 상호작용(모양 유지, 눈 ^^)
let effectType = null;
let fullness = 50; 
let cleanliness = 50;
let lastActionTime = Date.now();
let isDragging = false;

// 지정된 효과 그리기 (하트, 물방울, 별, 거품)
function drawEffect(type) {
    const now = Date.now();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const bounce = Math.sin(now / 150) * 10;

    ctx.save();
    if (type === 'heart') {
        ctx.fillStyle = "#ff4d4d";
        const x = cx, y = cy - 75 + bounce;
        ctx.beginPath(); ctx.moveTo(x, y+5);
        ctx.quadraticCurveTo(x, y-10, x-15, y-10); ctx.quadraticCurveTo(x-30, y-10, x-30, y+5);
        ctx.quadraticCurveTo(x-30, y+20, x, y+35); ctx.quadraticCurveTo(x+30, y+20, x+30, y+5);
        ctx.quadraticCurveTo(x+30, y-10, x+15, y-10); ctx.quadraticCurveTo(x, y-10, x, y+5); ctx.fill();
    } else if (type === 'water') {
        ctx.fillStyle = "#3A86FF";
        ctx.beginPath(); ctx.arc(cx, cy - 75 + bounce, 12, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx - 12, cy - 75 + bounce); ctx.lineTo(cx, cy - 100 + bounce); ctx.lineTo(cx + 12, cy - 75 + bounce); ctx.fill();
    } else if (type === 'star') {
        ctx.fillStyle = "#FFD700";
        const x = cx, y = cy - 85 + bounce;
        let rot = Math.PI / 2 * 3; ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(x + Math.cos(rot) * 18, y + Math.sin(rot) * 18); rot += Math.PI / 5;
            ctx.lineTo(x + Math.cos(rot) * 9, y + Math.sin(rot) * 9); rot += Math.PI / 5;
        } ctx.closePath(); ctx.fill();
    } else if (type === 'bubbles') {
        for (let i = 0; i < 6; i++) {
            const bx = cx + (i % 2 === 0 ? -70 : 70) + Math.sin(now / 200 + i) * 15;
            const by = cy + 20 + Math.cos(now / 300 + i) * 25;
            ctx.beginPath(); ctx.arc(bx, by, 10, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(173, 216, 230, 0.6)"; ctx.fill();
            ctx.strokeStyle = "white"; ctx.stroke();
        }
    }
    ctx.restore();
}

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 40;
    const now = Date.now();
    const idleTime = now - lastActionTime;

    if (idleTime > 30000 && !isDragging) {
        ctx.fillStyle = "#555"; ctx.font = "bold 16px Arial";
        ctx.fillText("Zzz...", cx + 50, cy - 65 + Math.sin(now/300)*5);
    }

    if (effectType) drawEffect(effectType);

    ctx.fillStyle = SLIME_COLOR;

    // image_e1cade.png 참고 디자인 및 상호작용 시 모양 유지
    if (state === 3) { // 위로 드래그 시만 늘어남
        ctx.fillRect(cx - 15, cy - 80, 30, 10); ctx.fillRect(cx - 20, cy - 70, 40, 90);
        ctx.fillRect(cx - 30, cy - 50, 10, 70); ctx.fillRect(cx + 20, cy - 50, 10, 70);
        ctx.fillRect(cx - 30, cy + 20, 60, 10);
    } else { // 평소 및 상호작용 시 고정된 계단 모양
        ctx.fillRect(cx - 35, cy - 50, 70, 10);
        ctx.fillRect(cx - 45, cy - 40, 90, 10);
        ctx.fillRect(cx - 55, cy - 30, 110, 30);
        ctx.fillRect(cx - 45, cy, 90, 10);
    }

    let eyeY = (state === 3) ? cy - 40 : cy - 25;
    ctx.strokeStyle = "black"; ctx.lineWidth = 3.5; ctx.lineCap = "round";

    const blinkCycle = now % 5500;
    const isBlinking = (state === 1 && blinkCycle > 5000);

    if (state === 4) { // 상호작용 시 ^^ 눈 (모양은 그대로)
        ctx.beginPath();
        ctx.moveTo(cx - 22, eyeY + 2); ctx.lineTo(cx - 17, eyeY - 4); ctx.lineTo(cx - 12, eyeY + 2);
        ctx.moveTo(cx + 12, eyeY + 2); ctx.lineTo(cx + 17, eyeY - 4); ctx.lineTo(cx + 22, eyeY + 2);
        ctx.stroke();
    } else if (isBlinking || (idleTime > 30000 && !isDragging)) { 
        ctx.beginPath();
        ctx.moveTo(cx - 20, eyeY); ctx.lineTo(cx - 13, eyeY);
        ctx.moveTo(cx + 13, eyeY); ctx.lineTo(cx + 20, eyeY);
        ctx.stroke();
    } else { 
        ctx.fillStyle = "black";
        ctx.fillRect(cx - 20, eyeY - 3, 7, 7); ctx.fillRect(cx + 13, eyeY - 3, 7, 7);
        ctx.beginPath(); ctx.arc(cx, eyeY + 8, 5, 0, Math.PI); ctx.stroke();
    }
}

function triggerAction(effect, f, c) {
    state = 4; effectType = effect; lastActionTime = Date.now();
    fullness = Math.min(100, fullness + f);
    cleanliness = Math.min(100, cleanliness + c);
    updateBars();
    setTimeout(() => { if(!isDragging) { state = 1; effectType = null; } }, 1000);
}

function updateBars() {
    document.getElementById('fullnessBar').style.height = fullness + "%";
    document.getElementById('cleanBar').style.height = cleanliness + "%";
}

canvas.onmousedown = () => { isDragging = true; lastActionTime = Date.now(); };
window.onmousemove = (e) => {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    state = (e.clientY - rect.top < 120) ? 3 : 4;
};
window.onmouseup = () => { isDragging = false; state = 1; };

document.getElementById('feedBtn').onclick = () => triggerAction('heart', 10, 0);
document.getElementById('waterBtn').onclick = () => triggerAction('water', 5, 0);
document.getElementById('cookieBtn').onclick = () => triggerAction('star', 15, 0);
document.getElementById('showerBtn').onclick = () => triggerAction('bubbles', 0, 10);

function animate() { drawSlime(); requestAnimationFrame(animate); }
updateBars(); animate();