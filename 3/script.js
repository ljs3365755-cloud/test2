const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');
const feedBtn = document.getElementById('feedBtn');

let state = 1; // 1:평소, 2:눈감음, 3:늘어남, 4:눌림, 5:행복(^^)
let lastActionTime = Date.now();
let isDragging = false;
let heartY = 0; // 하트 위아래 위치 변수
let showHeart = false;

const squeakSound = new Audio('squeaky.mp3');

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ced4da"; 

    // 하트 그리기 (상태 5일 때)
    if (showHeart) {
        ctx.fillStyle = "#ff4d4d";
        const yOffset = Math.sin(Date.now() / 200) * 10; // 위아래 흔들림 효과
        // 도트 하트 모양
        ctx.fillRect(95, 20 + yOffset, 10, 10);
        ctx.fillRect(85, 15 + yOffset, 10, 10);
        ctx.fillRect(105, 15 + yOffset, 10, 10);
    }

    ctx.fillStyle = "#ced4da";
    // 슬라임 몸통 (기본형)
    if (state !== 3 && state !== 4) {
        ctx.fillRect(60, 100, 80, 50);
        ctx.fillRect(70, 90, 60, 10);
        ctx.fillRect(50, 110, 10, 30);
        ctx.fillRect(140, 110, 10, 30);
    }

    ctx.fillStyle = "black";
    if (state === 1) { // 평소
        ctx.fillRect(82, 110, 6, 6); ctx.fillRect(112, 110, 6, 6);
    } else if (state === 2) { // 감음
        ctx.fillRect(80, 112, 10, 2); ctx.fillRect(110, 112, 10, 2);
    } else if (state === 3) { // 늘어남
        ctx.fillStyle = "#ced4da";
        ctx.fillRect(80, 50, 40, 110);
        ctx.fillStyle = "black";
        ctx.fillRect(86, 80, 4, 12); ctx.fillRect(110, 80, 4, 12);
    } else if (state === 4) { // 눌림 (> <)
        ctx.fillStyle = "#ced4da";
        ctx.fillRect(40, 130, 120, 30);
        ctx.fillStyle = "black";
        // > < 눈
        ctx.fillRect(70, 136, 2, 2); ctx.fillRect(72, 138, 2, 2); ctx.fillRect(74, 140, 2, 2);
        ctx.fillRect(72, 142, 2, 2); ctx.fillRect(70, 144, 2, 2);
        ctx.fillRect(126, 136, 2, 2); ctx.fillRect(124, 138, 2, 2); ctx.fillRect(122, 140, 2, 2);
        ctx.fillRect(124, 142, 2, 2); ctx.fillRect(126, 144, 2, 2);
    } else if (state === 5) { // 행복 (^^)
        // 왼쪽 ^
        ctx.fillRect(75, 112, 2, 2); ctx.fillRect(77, 110, 4, 2); ctx.fillRect(81, 112, 2, 2);
        // 오른쪽 ^
        ctx.fillRect(115, 112, 2, 2); ctx.fillRect(117, 110, 4, 2); ctx.fillRect(121, 112, 2, 2);
    }
}

// 음식 주기 동작
feedBtn.addEventListener('click', () => {
    state = 5;
    showHeart = true;
    lastActionTime = Date.now();
    // 2초 뒤에 다시 평소 상태로
    setTimeout(() => {
        showHeart = false;
        state = 1;
    }, 2000);
});

// ... (기존 handleStart, handleMove, handleEnd 로직은 동일하게 유지) ...

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
animate();