const SLIME_COLOR = "#CDB4DB"; 
const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');

let state = 1; // 1: 평소, 3: 위로 늘어남, 4: 상호작용(납작)
let effectType = null;
let fullness = 50; 
let cleanliness = 50;
let lastActionTime = Date.now();
let isDragging = false;

// [기능 3] 아이콘별 지정 효과 복구
function drawEffect(type) {
    const now = Date.now();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const bounce = Math.sin(now / 150) * 10;

    if (type === 'heart') { // 밥 -> 하트
        ctx.fillStyle = "#ff4d4d";
        const x = cx; const y = cy - 70 + bounce;
        ctx.beginPath(); ctx.moveTo(x, y+5);
        ctx.quadraticCurveTo(x, y-10, x-15, y-10); ctx.quadraticCurveTo(x-30, y-10, x-30, y+5);
        ctx.quadraticCurveTo(x-30, y+20, x, y+35); ctx.quadraticCurveTo(x+30, y+20, x+30, y+5);
        ctx.quadraticCurveTo(x+30, y-10, x+15, y-10); ctx.quadraticCurveTo(x, y-10, x, y+5); ctx.fill();
    } else if (type === 'water') { // 물 -> 물방울
        ctx.fillStyle = "#3A86FF";
        ctx.beginPath(); ctx.arc(cx, cy - 70 + bounce, 12, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx - 12, cy - 70 + bounce); ctx.lineTo(cx, cy - 95 + bounce); ctx.lineTo(cx + 12, cy - 70 + bounce); ctx.fill();
    } else if (type === 'star') { // 쿠키 -> 별
        ctx.fillStyle = "#FFD700";
        const x = cx; const y = cy - 80 + bounce;
        let rot = Math.PI / 2 * 3; ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(x + Math.cos(rot) * 18, y + Math.sin(rot) * 18); rot += Math.PI / 5;
            ctx.lineTo(x + Math.cos(rot) * 9, y + Math.sin(rot) * 9); rot += Math.PI / 5;
        } ctx.closePath(); ctx.fill();
    } else if (type === 'bubbles') { // 샤워기 -> 주변 거품
        for (let i = 0; i < 6; i++) {
            const bx = cx + (i % 2 === 0 ? -65 : 65) + Math.sin(now / 200 + i) * 15;
            const by = cy + 20 + Math.cos(now / 300 + i) * 25;
            ctx.beginPath(); ctx.arc(bx, by, 10, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(173, 216, 230, 0.6)"; ctx.fill();
            ctx.strokeStyle = "white"; ctx.lineWidth = 1; ctx.stroke();
        }
    }
}

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 30;
    const now = Date.now();
    const idleTime = now - lastActionTime;

    // [기능 6] 30초 무반응 시 조는 모션
    if (idleTime > 30000 && !isDragging) {
        ctx.fillStyle = "#555"; ctx.font = "bold 16px Arial";
        ctx.fillText("Zzz...", cx + 45, cy - 60 + Math.sin(now/300)*5);
    }

    if (effectType) drawEffect(effectType);

    ctx.fillStyle = SLIME_COLOR;

    // [기능 2] 슬라임 모양 상호작용 (늘어나기 포함)
    if (state === 3) { // 위로 늘어남 (드래그 시)
        ctx.fillRect(cx - 15, cy - 80, 30, 10); // 상단 한줄
        ctx.fillRect(cx - 20, cy - 70, 40, 90);
        ctx.fillRect(cx - 30, cy - 50, 10, 70); 
        ctx.fillRect(cx + 20, cy - 50, 10, 70);
        ctx.fillRect(cx - 30, cy + 20, 60, 10); // 하단 한줄
    } else if (state === 4) { // 반응 시 납작
        ctx.fillRect(cx - 30, cy - 35, 60, 10); ctx.fillRect(cx - 40, cy - 25, 80, 10);
        ctx.fillRect(cx - 55, cy - 15, 110, 15); ctx.fillRect(cx - 65, cy, 130, 15);
    } else { // 평소
        ctx.fillRect(cx - 30, cy - 45, 60, 10); ctx.fillRect(cx - 40, cy - 35, 80, 10);
        ctx.fillRect(cx - 50, cy - 25, 100, 25); ctx.fillRect(cx - 40, cy, 80, 10);
    }

    // 눈 그리기 설정
    let eyeY = cy - 22;
    if (state === 3) eyeY = cy - 40;
    else if (state === 4) eyeY = cy - 15;

    ctx.strokeStyle = "black"; ctx.lineWidth = 3.5; ctx.lineCap = "round";

    // [기능 4] 5초 주기 눈 깜빡임 (5초 뜨고 0.5초 감기)
    const blinkCycle = now % 5500;
    const isBlinking = (state === 1 && blinkCycle > 5000);

    if (state === 4) { // [기능 3] 상호작용 시 ^^ 눈
        ctx.beginPath();
        ctx.moveTo(cx - 25, eyeY + 2); ctx.lineTo(cx - 20, eyeY - 4); ctx.lineTo(cx - 15, eyeY + 2);
        ctx.moveTo(cx + 15, eyeY + 2); ctx.lineTo(cx + 20, eyeY - 4); ctx.lineTo(cx + 25, eyeY + 2);
        ctx.stroke();
    } else if (isBlinking || (idleTime > 30000 && !isDragging)) { 
        // [기능 5] 감은 눈 사이즈는 떴을 때(7x7)와 동일하게 가로 폭 유지
        ctx.beginPath();
        ctx.moveTo(cx - 20, eyeY); ctx.lineTo(cx - 13, eyeY);
        ctx.moveTo(cx + 13, eyeY); ctx.lineTo(cx + 20, eyeY);
        ctx.stroke();
    } else { // 평소 점 눈
        ctx.fillStyle = "black";
        ctx.fillRect(cx - 20, eyeY - 3, 7, 7); ctx.fillRect(cx + 13, eyeY - 3, 7, 7);
    }
}

// 상호작용 실행
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

// [기능 2] 드래그 시 위로 늘어나는 상호작용
canvas.onmousedown = () => { isDragging = true; lastActionTime = Date.now(); };
window.onmousemove = (e) => {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    state = (mouseY < 120) ? 3 : 4; // 마우스 위치에 따라 늘어남/눌림 결정
};
window.onmouseup = () => { isDragging = false; state = 1; };

// 버튼 연결
document.getElementById('feedBtn').onclick = () => triggerAction('heart', 10, 0);
document.getElementById('waterBtn').onclick = () => triggerAction('water', 5, 0);
document.getElementById('cookieBtn').onclick = () => triggerAction('star', 15, 0);
document.getElementById('showerBtn').onclick = () => triggerAction('bubbles', 0, 10);

function animate() { drawSlime(); requestAnimationFrame(animate); }
updateBars(); animate();