const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');
const foodCanvas = document.getElementById('foodCanvas');
const foodCtx = foodCanvas.getContext('2d');
const feedBtn = document.getElementById('feedBtn');

let state = 1; // 1:평소, 2:눈감음, 3:늘어남, 4:눌림, 5:행복(^^)
let lastActionTime = Date.now();
let isDragging = false;
let showHeart = false;

const squeakSound = new Audio('squeaky.mp3');

// 삼각김밥 도트 그리기 (50x50 캔버스 기준)
function drawFood() {
    foodCtx.clearRect(0, 0, foodCanvas.width, foodCanvas.height);
    
    // 밥 (흰색 삼각형)
    foodCtx.fillStyle = "white";
    foodCtx.fillRect(20, 15, 10, 5);
    foodCtx.fillRect(15, 20, 20, 5);
    foodCtx.fillRect(10, 25, 30, 5);
    foodCtx.fillRect(5, 30, 40, 10);
    
    // 김 (검은색 중앙)
    foodCtx.fillStyle = "black";
    foodCtx.fillRect(20, 32, 10, 8);
    
    // 테두리 살짝 (도트 느낌 강조)
    foodCtx.strokeStyle = "#ccc";
    foodCtx.strokeRect(5, 30, 40, 10);
}

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. 하트 애니메이션 (상태 5일 때)
    if (showHeart) {
        ctx.fillStyle = "#ff4d4d";
        const yOffset = Math.sin(Date.now() / 150) * 8; // 위아래 흔들림
        // 도트 하트
        ctx.fillRect(95, 30 + yOffset, 10, 10);
        ctx.fillRect(85, 25 + yOffset, 10, 10);
        ctx.fillRect(105, 25 + yOffset, 10, 10);
    }

    ctx.fillStyle = "#ced4da"; 
    
    // 2. 슬라임 몸통
    if (state === 3) { // 위로 늘어남
        ctx.fillRect(80, 50, 40, 110);
        ctx.fillRect(70, 70, 10, 70);
        ctx.fillRect(120, 70, 10, 70);
    } else if (state === 4) { // 눌림
        ctx.fillRect(40, 130, 120, 30);
        ctx.fillRect(50, 120, 100, 10);
    } else { // 기본 (평소, 눈감음, 행복)
        ctx.fillRect(60, 100, 80, 50);
        ctx.fillRect(70, 90, 60, 10);
        ctx.fillRect(50, 110, 10, 30);
        ctx.fillRect(140, 110, 10, 30);
    }

    // 3. 표정
    ctx.fillStyle = "black";
    if (state === 1) { // 평소
        ctx.fillRect(82, 110, 6, 6); ctx.fillRect(112, 110, 6, 6);
    } else if (state === 2) { // 눈감음
        ctx.fillRect(80, 112, 10, 2); ctx.fillRect(110, 112, 10, 2);
    } else if (state === 3) { // 늘어남 눈
        ctx.fillRect(86, 80, 4, 12); ctx.fillRect(110, 80, 4, 12);
    } else if (state === 4) { // > < 눈
        ctx.fillRect(70, 136, 2, 2); ctx.fillRect(72, 138, 2, 2); ctx.fillRect(74, 140, 2, 2);
        ctx.fillRect(72, 142, 2, 2); ctx.fillRect(70, 144, 2, 2);
        ctx.fillRect(126, 136, 2, 2); ctx.fillRect(124, 138, 2, 2); ctx.fillRect(122, 140, 2, 2);
        ctx.fillRect(124, 142, 2, 2); ctx.fillRect(126, 144, 2, 2);
    } else if (state === 5) { // ^^ 눈
        // 왼쪽 ^
        ctx.fillRect(75, 112, 2, 2); ctx.fillRect(77, 110, 4, 2); ctx.fillRect(81, 112, 2, 2);
        // 오른쪽 ^
        ctx.fillRect(115, 112, 2, 2); ctx.fillRect(117, 110, 4, 2); ctx.fillRect(121, 112, 2, 2);
    }
}

// 상호작용 함수들
function handleStart(e) {
    isDragging = true;
    state = 4;
    lastActionTime = Date.now();
    squeakSound.currentTime = 0;
    squeakSound.play().catch(() => {});
}

function handleMove(e) {
    if (!isDragging) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = canvas.getBoundingClientRect();
    const offsetY = clientY - rect.top;
    state = (offsetY < 70) ? 3 : 4;
}

function handleEnd() {
    isDragging = false;
    state = 1;
    lastActionTime = Date.now();
}

// 이벤트 리스너
canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('touchstart', (e) => { handleStart(); e.preventDefault(); }, {passive: false});
window.addEventListener('mousemove', handleMove);
window.addEventListener('touchmove', (e) => { handleMove(e); e.preventDefault(); }, {passive: false});
window.addEventListener('mouseup', handleEnd);
window.addEventListener('touchend', handleEnd);

// 음식 주기 버튼
feedBtn.addEventListener('click', () => {
    state = 5;
    showHeart = true;
    foodCanvas.style.visibility = 'visible';
    drawFood();
    
    setTimeout(() => {
        state = 1;
        showHeart = false;
        foodCanvas.style.visibility = 'hidden';
        lastActionTime = Date.now();
    }, 2000);
});

function animate() {
    const now = Date.now();
    if (!isDragging && state !== 4 && state !== 5) {
        const diff = now - lastActionTime;
        if (diff > 3000) {
            state = 2;
            if (diff > 3500) { state = 1; lastActionTime = now; }
        } else state = 1;
    }
    drawSlime();
    requestAnimationFrame(animate);
}

drawFood(); // 초기 로드 시 삼각김밥 그려둠
animate();