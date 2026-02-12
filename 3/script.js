const SLIME_COLOR = "#CDB4DB"; 
const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');

let state = 1; // 1: 평소, 4: 눌림/터치(><), 5: 아이콘 반응
let fullness = 50; 
let cleanliness = 50;

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 30;

    ctx.fillStyle = SLIME_COLOR;

    // 사진 속 계단식 픽셀 모양 재현
    if (state === 4 || state === 5) { // 터치하거나 버튼 클릭 시 (납작해짐)
        ctx.fillRect(cx - 30, cy - 35, 60, 10); // 상단
        ctx.fillRect(cx - 40, cy - 25, 80, 10);
        ctx.fillRect(cx - 55, cy - 15, 110, 15); // 몸통
        ctx.fillRect(cx - 65, cy, 130, 15); // 하단
    } else { // 평소 상태
        ctx.fillRect(cx - 30, cy - 45, 60, 10); // 상단 한줄 복구
        ctx.fillRect(cx - 40, cy - 35, 80, 10);
        ctx.fillRect(cx - 50, cy - 25, 100, 25); // 몸통
        ctx.fillRect(cx - 40, cy, 80, 10); // 하단 한줄
    }

    // 눈 그리기 (깜빡임과 떴을 때 사이즈 동일하게 유지)
    const eyeY = (state === 4 || state === 5) ? cy - 15 : cy - 20;
    ctx.strokeStyle = "black"; ctx.lineWidth = 3; ctx.lineCap = "round";

    if (state === 4 || state === 5) { // >< 눈
        ctx.beginPath();
        ctx.moveTo(cx - 20, eyeY - 4); ctx.lineTo(cx - 10, eyeY); ctx.lineTo(cx - 20, eyeY + 4);
        ctx.moveTo(cx + 20, eyeY - 4); ctx.lineTo(cx + 10, eyeY); ctx.lineTo(cx + 20, eyeY + 4);
        ctx.stroke();
    } else { // 기본 점 눈 (사진과 동일한 정사각형)
        ctx.fillStyle = "black";
        ctx.fillRect(cx - 18, eyeY - 3, 6, 6);
        ctx.fillRect(cx + 12, eyeY - 3, 6, 6);
    }
}

// 상호작용 및 게이지 업데이트
function triggerAction(newState, f, c) {
    state = newState;
    fullness = Math.min(100, fullness + f);
    cleanliness = Math.min(100, cleanliness + c);
    updateBars();
    setTimeout(() => { state = 1; }, 800);
}

function updateBars() {
    document.getElementById('fullnessBar').style.height = fullness + "%";
    document.getElementById('cleanBar').style.height = cleanliness + "%";
}

// 슬라임 터치(클릭) 이벤트 추가
canvas.addEventListener('mousedown', () => { state = 4; });
canvas.addEventListener('mouseup', () => { state = 1; });

// 버튼 이벤트
document.getElementById('feedBtn').onclick = () => triggerAction(5, 10, 0);
document.getElementById('waterBtn').onclick = () => triggerAction(5, 5, 0);
document.getElementById('cookieBtn').onclick = () => triggerAction(5, 15, 0);
document.getElementById('showerBtn').onclick = () => triggerAction(5, 0, 10);

function animate() { drawSlime(); requestAnimationFrame(animate); }
updateBars();
animate();