const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');
const foodCanvas = document.getElementById('foodCanvas');
const foodCtx = foodCanvas.getContext('2d');
const feedBtn = document.getElementById('feedBtn');

let state = 1; 
let lastActionTime = Date.now();
let isDragging = false;
let showHeart = false;

// 연속 급여 및 거절 관련 변수
let feedCount = 0;
let isFull = false;
let shakeOffset = 0;

// 오디오 파일 설정
const squeakSound = new Audio('squeaky.mp3');
const yumSound = new Audio('ggd-yumyum.mp3');
const noSound = new Audio('no.mp3'); // 거절 사운드 추가

function drawFood() {
    foodCtx.clearRect(0, 0, foodCanvas.width, foodCanvas.height);
    foodCtx.fillStyle = "white";
    foodCtx.fillRect(20, 15, 10, 5);
    foodCtx.fillRect(15, 20, 20, 5);
    foodCtx.fillRect(10, 25, 30, 5);
    foodCtx.fillRect(5, 30, 40, 10);
    foodCtx.fillStyle = "black";
    foodCtx.fillRect(20, 32, 10, 8);
    foodCtx.strokeStyle = "#ccc";
    foodCtx.strokeRect(5, 30, 40, 10);
}

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 도리도리 애니메이션 계산
    if (isFull) {
        shakeOffset = Math.sin(Date.now() / 50) * 15; 
    } else {
        shakeOffset = 0;
    }

    if (showHeart && !isFull) {
        ctx.fillStyle = "#ff4d4d";
        const yOffset = Math.sin(Date.now() / 150) * 8;
        ctx.fillRect(95 + shakeOffset, 30 + yOffset, 10, 10);
        ctx.fillRect(85 + shakeOffset, 25 + yOffset, 10, 10);
        ctx.fillRect(105 + shakeOffset, 25 + yOffset, 10, 10);
    }

    ctx.fillStyle = "#ced4da"; 
    
    if (state === 3) { // 늘어남
        ctx.fillRect(80 + shakeOffset, 50, 40, 110);
        ctx.fillRect(70 + shakeOffset, 70, 10, 70);
        ctx.fillRect(120 + shakeOffset, 70, 10, 70);
    } else if (state === 4 && !isFull) { // 눌림
        ctx.fillRect(40 + shakeOffset, 130, 120, 30);
        ctx.fillRect(50 + shakeOffset, 120, 100, 10);
    } else { // 기본 체형
        ctx.fillRect(60 + shakeOffset, 100, 80, 50);
        ctx.fillRect(70 + shakeOffset, 90, 60, 10);
        ctx.fillRect(50 + shakeOffset, 110, 10, 30);
        ctx.fillRect(140 + shakeOffset, 110, 10, 30);
    }

    ctx.fillStyle = "black";
    if (isFull || state === 2) { // 거절 중이거나 눈 감음 (ㅡ ㅡ)
        ctx.fillRect(80 + shakeOffset, 112, 10, 2); 
        ctx.fillRect(110 + shakeOffset, 112, 10, 2);
    } else if (state === 1) { // 평소
        ctx.fillRect(82 + shakeOffset, 110, 6, 6); 
        ctx.fillRect(112 + shakeOffset, 110, 6, 6);
    } else if (state === 3) { // 늘어남 눈
        ctx.fillRect(86 + shakeOffset, 80, 4, 12); 
        ctx.fillRect(110 + shakeOffset, 80, 4, 12);
    } else if (state === 4) { // > < 눈
        ctx.fillRect(70 + shakeOffset, 136, 2, 2); ctx.fillRect(72 + shakeOffset, 138, 2, 2); ctx.fillRect(74 + shakeOffset, 140, 2, 2);
        ctx.fillRect(72 + shakeOffset, 142, 2, 2); ctx.fillRect(70 + shakeOffset, 144, 2, 2);
        ctx.fillRect(126 + shakeOffset, 136, 2, 2); ctx.fillRect(124 + shakeOffset, 138, 2, 2); ctx.fillRect(122 + shakeOffset, 140, 2, 2);
        ctx.fillRect(124 + shakeOffset, 142, 2, 2); ctx.fillRect(126 + shakeOffset, 144, 2, 2);
    } else if (state === 5) { // ^^ 눈
        ctx.fillRect(75 + shakeOffset, 112, 2, 2); ctx.fillRect(77 + shakeOffset, 110, 4, 2); ctx.fillRect(81 + shakeOffset, 112, 2, 2);
        ctx.fillRect(115 + shakeOffset, 112, 2, 2); ctx.fillRect(117 + shakeOffset, 110, 4, 2); ctx.fillRect(121 + shakeOffset, 112, 2, 2);
    }
}

function handleStart(e) {
    if(isFull) return;
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
    if(!isFull) state = 1;
    lastActionTime = Date.now();
}

canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('touchstart', (e) => { handleStart(); e.preventDefault(); }, {passive: false});
window.addEventListener('mousemove', handleMove);
window.addEventListener('touchmove', (e) => { handleMove(e); e.preventDefault(); }, {passive: false});
window.addEventListener('mouseup', handleEnd);
window.addEventListener('touchend', handleEnd);

// 음식 주기 버튼 (거절 사운드 로직 반영)
feedBtn.addEventListener('click', () => {
    if (isFull) return;

    feedCount++;

    if (feedCount >= 5) {
        // 거절 시작
        isFull = true;
        showHeart = false;
        foodCanvas.style.visibility = 'hidden';
        
        // 거절 사운드 재생
        noSound.currentTime = 0;
        noSound.play().catch(() => {});
        
        setTimeout(() => {
            isFull = false;
            feedCount = 0;
            state = 1;
            lastActionTime = Date.now();
        }, 10000);
    } else {
        // 냠냠 모션
        state = 5;
        showHeart = true;
        foodCanvas.style.visibility = 'visible';
        yumSound.currentTime = 0;
        yumSound.play().catch(() => {});
        drawFood();
        
        setTimeout(() => {
            if (!isFull) {
                state = 1;
                showHeart = false;
                foodCanvas.style.visibility = 'hidden';
                lastActionTime = Date.now();
            }
        }, 1000);
    }
});

function animate() {
    const now = Date.now();
    if (!isDragging && state !== 4 && state !== 5 && !isFull) {
        const diff = now - lastActionTime;
        if (diff > 3000) {
            state = 2;
            if (diff > 3500) { state = 1; lastActionTime = now; }
        } else state = 1;
    }
    drawSlime();
    requestAnimationFrame(animate);
}

drawFood();
animate();