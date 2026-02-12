// 1. 설정: 슬라임 색상 및 상태 변수
const SLIME_COLOR = "#CDB4DB"; // 요청하신 보라색
const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');
const foodCanvas = document.getElementById('foodCanvas');
const foodCtx = foodCanvas.getContext('2d');
const feedBtn = document.getElementById('feedBtn');

let state = 1; // 1:평소, 2:눈감음, 3:늘어남, 4:눌림, 5:행복(^^)
let lastActionTime = Date.now();
let isDragging = false;
let showHeart = false;

// 거절 관련 변수
let feedCount = 0;
let isFull = false;
let isShaking = false; 
let shakeOffset = 0;

// 2. 오디오 안전 재생 함수 (파일이 없어도 에러로 멈추지 않음)
function safePlay(filename) {
    try {
        const audio = new Audio(filename);
        audio.play().catch(() => {}); 
    } catch (e) {
        console.log("사운드 재생 실패:", filename);
    }
}

// 3. 삼각김밥 도트 그리기
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

// 4. 슬라임 그리기 (에러 수정 완료)
function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 도리도리 애니메이션 계산
    if (isShaking) {
        shakeOffset = Math.sin(Date.now() / 50) * 15;
    } else {
        shakeOffset = 0;
    }

    // 하트 그리기
    if (showHeart && !isFull) {
        ctx.fillStyle = "#ff4d4d";
        const yOffset = Math.sin(Date.now() / 150) * 8;
        ctx.fillRect(95 + shakeOffset, 30 + yOffset, 10, 10);
        ctx.fillRect(85 + shakeOffset, 25 + yOffset, 10, 10);
        ctx.fillRect(105 + shakeOffset, 25 + yOffset, 10, 10);
    }

    // 슬라임 몸통 그리기
    ctx.fillStyle = SLIME_COLOR; 
    
    if (state === 3) { // 늘어남
        ctx.fillRect(80 + shakeOffset, 50, 40, 110);
        ctx.fillRect(70 + shakeOffset, 70, 10, 70); // 수정됨
        ctx.fillRect(120 + shakeOffset, 70, 10, 70);
    } else if (state === 4 && !isFull) { // 눌림
        ctx.fillRect(40 + shakeOffset, 130, 120, 30);
        ctx.fillRect(50 + shakeOffset, 120, 100, 10);
    } else { // 기본 체형 (평소, 감음, 행복, 거절)
        ctx.fillRect(60 + shakeOffset, 100, 80, 50);
        ctx.fillRect(70 + shakeOffset, 90, 60, 10);
        ctx.fillRect(50 + shakeOffset, 110, 10, 30);
        ctx.fillRect(140 + shakeOffset, 110, 10, 30);
    }

    // 표정 그리기
    ctx.fillStyle = "black";
    if (isFull || state === 2) { // 거절/눈감음 (ㅡ ㅡ)
        ctx.fillRect(80 + shakeOffset, 112, 10, 2); 
        ctx.fillRect(110 + shakeOffset, 112, 10, 2);
    } else if (state === 1) { // 평소
        ctx.fillRect(82 + shakeOffset, 110, 6, 6); 
        ctx.fillRect(112 + shakeOffset, 110, 6, 6);
    } else if (state === 5) { // 행복 (^^)
        ctx.fillRect(75 + shakeOffset, 112, 2, 2); ctx.fillRect(77 + shakeOffset, 110, 4, 2); ctx.fillRect(81 + shakeOffset, 112, 2, 2);
        ctx.fillRect(115 + shakeOffset, 112, 2, 2); ctx.fillRect(117 + shakeOffset, 110, 4, 2); ctx.fillRect(121 + shakeOffset, 112, 2, 2);
    }
}

// 5. 상호작용 (마우스 & 터치)
function handleStart(e) {
    if(isFull) return;
    isDragging = true;
    state = 4;
    lastActionTime = Date.now();
    safePlay('squeaky.mp3');
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
canvas.addEventListener('touchstart', (e) => { handleStart(e); e.preventDefault(); }, {passive: false});
window.addEventListener('mousemove', handleMove);
window.addEventListener('touchmove', (e) => { handleMove(e); e.preventDefault(); }, {passive: false});
window.addEventListener('mouseup', handleEnd);
window.addEventListener('touchend', handleEnd);

// 6. 음식 주기 버튼 이벤트
feedBtn.addEventListener('click', () => {
    if (isFull) return;
    feedCount++;

    if (feedCount >= 5) {
        isFull = true;
        isShaking = true; // 2초 도리도리 시작
        showHeart = false;
        foodCanvas.style.visibility = 'hidden';
        safePlay('no.mp3');
        alert("슬라임이 너무 배가 부릅니다! (10초간 휴식)");

        setTimeout(() => { isShaking = false; }, 2000);
        setTimeout(() => {
            isFull = false;
            feedCount = 0;
            state = 1;
            lastActionTime = Date.now();
        }, 10000);
    } else {
        state = 5;
        showHeart = true;
        foodCanvas.style.visibility = 'visible';
        safePlay('ggd-yumyum.mp3');
        drawFood();
        setTimeout(() => {
            if (!isFull) {
                state = 1;
                showHeart = false;
                foodCanvas.style.visibility = 'hidden';
                lastActionTime = Date.now();
            }
        }, 2000);
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