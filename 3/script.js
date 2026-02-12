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
let isDragging = false, isFull = false, isBlinking = false;
let effectType = null;
let shakeOffset = 0;

let fullness = 50;
let cleanliness = 50;
let waterCount = 0;
let lastCookieTime = 0;

function safePlay(filename) { try { new Audio(filename).play().catch(() => {}); } catch (e) {} }

// 효과 그리기 (거품 포함 모든 이펙트에 튀어오르는 모션 적용)
function drawEffect(type) {
    const now = Date.now();
    const x = 100 + shakeOffset;
    // 하트나 물방울처럼 위아래로 통통 튀는 모션
    const y = 35 + Math.sin(now / 150) * 12;
    
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
        // [수정] 거품 모션: 몽글몽글 튀어오르는 효과
        for (let i = 0; i < 6; i++) {
            const offset = i * 20;
            const bx = x - 50 + (i * 20);
            const by = 130 + Math.sin((now + (i * 500)) / 200) * 15;
            const size = 10 + Math.cos(now / 300 + i) * 3;

            ctx.beginPath();
            ctx.arc(bx, by, size, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fill();
            ctx.strokeStyle = "rgba(200, 200, 255, 0.6)";
            ctx.stroke();
        }
    }
}

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();
    const idleTime = now - lastActionTime;
    shakeOffset = 0; // 드래그 중엔 흔들림 제외

    if (idleTime > 30000 && !isDragging) {
        ctx.fillStyle = "#555"; ctx.font = "bold 18px Arial";
        ctx.fillText("Zzz...", 135, 55 + Math.sin(now/300)*5);
    }

    if (effectType && effectType !== 'bubbles') drawEffect(effectType);

    ctx.fillStyle = SLIME_COLOR;
    let eyeY = 110; // 기본 눈 높이

    if (state === 3) { // 늘어남
        ctx.fillRect(80, 50, 40, 110);
        ctx.fillRect(70, 70, 10, 70); ctx.fillRect(120, 70, 10, 70);
        eyeY = 80; // 눈이 위로 따라감
    } else if (state === 4) { // 눌림
        ctx.fillRect(40, 130, 120, 30);
        ctx.fillRect(50, 120, 100, 10);
        eyeY = 135; // 눈이 아래로 내려감 [수정완료]
    } else { // 평소
        ctx.fillRect(60, 100, 80, 50); ctx.fillRect(70, 90, 60, 10);
        ctx.fillRect(50, 110, 10, 30); ctx.fillRect(140, 110, 10, 30);
        eyeY = 110;
    }

    if (effectType === 'bubbles') drawEffect('bubbles');

    // 눈 그리기 (위치 보정 반영)
    ctx.strokeStyle = "black"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
    if (idleTime > 30000 && !isDragging || isBlinking) {
        ctx.beginPath(); 
        ctx.moveTo(81, eyeY + 2); ctx.lineTo(89, eyeY + 2);
        ctx.moveTo(111, eyeY + 2); ctx.lineTo(119, eyeY + 2);
        ctx.stroke();
    } else if (state === 5 || effectType) {
        ctx.beginPath(); 
        ctx.moveTo(78, eyeY + 5); ctx.lineTo(85, eyeY - 2); ctx.lineTo(92, eyeY + 5);
        ctx.moveTo(108, eyeY + 5); ctx.lineTo(115, eyeY - 2); ctx.lineTo(122, eyeY + 5);
        ctx.stroke();
    } else {
        ctx.fillStyle = "black";
        ctx.fillRect(82, eye