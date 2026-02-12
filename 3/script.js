const SLIME_COLOR = "#CDB4DB"; 
const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');

const buttons = {
    feed: document.getElementById('feedBtn'),
    water: document.getElementById('waterBtn'),
    cookie: document.getElementById('cookieBtn'),
    shower: document.getElementById('showerBtn')
};

let state = 1; // 1: 평소, 4: 눌림(><), 5: 반응
let fullness = 50; 
let cleanliness = 50;
let lastActionTime = Date.now();

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 30; // 바닥 근처 배치
    const now = Date.now();

    ctx.fillStyle = SLIME_COLOR;

    // [픽셀 재현] 사진 속 계단식 슬라임 모양 그리기
    if (state === 4 || state === 5) { // 눌렸을 때 (><)
        ctx.fillRect(cx - 30, cy - 35, 60, 10); // top
        ctx.fillRect(cx - 40, cy - 25, 80, 10);
        ctx.fillRect(cx - 50, cy - 15, 100, 15); // body
        ctx.fillRect(cx - 60, cy, 120, 15); // bottom
    } else { // 평소 상태 (사진과 동일)
        ctx.fillRect(cx - 30, cy - 45, 60, 10); // top layer
        ctx.fillRect(cx - 40, cy - 35, 80, 10); // middle layer 1
        ctx.fillRect(cx - 50, cy - 25, 100, 25); // main body
        ctx.fillRect(cx - 40, cy, 80, 10); // bottom step
    }

    // 눈 위치 설정
    const eyeY = (state === 4 || state === 5) ? cy - 15 : cy - 20;
    ctx.strokeStyle = "black"; ctx.lineWidth = 3; ctx.lineCap = "round";

    if (state === 4 || state === 5) { // >< 눈
        ctx.beginPath();
        ctx.moveTo(cx - 20, eyeY - 4); ctx.lineTo(cx - 10, eyeY); ctx.lineTo(cx - 20, eyeY + 4);
        ctx.moveTo(cx + 20, eyeY - 4); ctx.lineTo(cx + 10, eyeY); ctx.lineTo(cx + 20, eyeY + 4);
        ctx.stroke();
    } else { // 사진 속 검은 점 눈 (정사각형 픽셀)
        ctx.fillStyle = "black";
        ctx.fillRect(cx - 18, eyeY - 3, 6, 6);
        ctx.fillRect(cx + 12, eyeY - 3, 6, 6);
    }
}

function updateBars() {
    document.getElementById('fullnessBar').style.height = fullness + "%";
    document.getElementById('cleanBar').style.height = cleanliness + "%";
}

function triggerAction(s, f, c) {
    state = s; 
    fullness = Math.min(100, fullness + f);
    cleanliness = Math.min(100, cleanliness + c);
    updateBars();
    setTimeout(() => { state = 1; }, 1000);
}

// 이벤트 연결
buttons.feed.onclick = () => triggerAction(5, 10, 0);
buttons.water.onclick = () => triggerAction(5, 5, 0);
buttons.cookie.onclick = () => triggerAction(5, 15, 0);
buttons.shower.onclick = () => triggerAction(5, 0, 10);

function animate() { drawSlime(); requestAnimationFrame(animate); }
updateBars();
animate();