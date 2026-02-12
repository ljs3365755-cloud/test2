const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');

let state = 1; 
let lastActionTime = Date.now();
let isDragging = false;

const squeakSound = new Audio('squeaky.mp3');

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ced4da"; 

    if (state === 1 || state === 2) {
        ctx.fillRect(60, 100, 80, 50);
        ctx.fillRect(70, 90, 60, 10);
        ctx.fillRect(50, 110, 10, 30);
        ctx.fillRect(140, 110, 10, 30);
        ctx.fillStyle = "black";
        if (state === 1) {
            ctx.fillRect(82, 110, 6, 6);
            ctx.fillRect(112, 110, 6, 6);
        } else {
            ctx.fillRect(80, 112, 10, 2);
            ctx.fillRect(110, 112, 10, 2);
        }
    } 
    else if (state === 3) {
        ctx.fillRect(80, 50, 40, 110);
        ctx.fillRect(70, 70, 10, 70);
        ctx.fillRect(120, 70, 10, 70);
        ctx.fillRect(90, 40, 20, 10);
        ctx.fillStyle = "black";
        ctx.fillRect(86, 80, 4, 12);
        ctx.fillRect(110, 80, 4, 12);
    }
    else if (state === 4) {
        ctx.fillRect(40, 130, 120, 30);
        ctx.fillRect(50, 120, 100, 10);
        ctx.fillStyle = "black";
        // 정교해진 > < 눈
        ctx.fillRect(70, 136, 2, 2); ctx.fillRect(72, 138, 2, 2);
        ctx.fillRect(74, 140, 2, 2); ctx.fillRect(72, 142, 2, 2);
        ctx.fillRect(70, 144, 2, 2);
        ctx.fillRect(126, 136, 2, 2); ctx.fillRect(124, 138, 2, 2);
        ctx.fillRect(122, 140, 2, 2); ctx.fillRect(124, 142, 2, 2);
        ctx.fillRect(126, 144, 2, 2);
    }
}

function handleStart(e) {
    isDragging = true;
    state = 4;
    lastActionTime = Date.now();
    squeakSound.currentTime = 0;
    squeakSound.play().catch(() => {});
    if (e.cancelable) e.preventDefault();
}

function handleMove(e) {
    if (!isDragging) return;
    // 터치와 마우스 좌표 통합 처리
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = canvas.getBoundingClientRect();
    const offsetY = clientY - rect.top;

    if (offsetY < 70) state = 3;
    else state = 4;
    if (e.cancelable) e.preventDefault();
}

function handleEnd() {
    isDragging = false;
    state = 1;
    lastActionTime = Date.now();
}

// 이벤트 리스너 등록 (마우스 + 터치)
canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('touchstart', handleStart, {passive: false});

window.addEventListener('mousemove', handleMove);
window.addEventListener('touchmove', handleMove, {passive: false});

window.addEventListener('mouseup', handleEnd);
window.addEventListener('touchend', handleEnd);

function animate() {
    const now = Date.now();
    if (!isDragging && state !== 4) {
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