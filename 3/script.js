const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');

let state = 1; // 1: 평소, 2: 눈감음, 3: 늘어남, 4: 눌림
let lastActionTime = Date.now();
let isDragging = false;

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 슬라임 기본 색상 (회색 도트 느낌)
    ctx.fillStyle = "#ced4da"; 

    if (state === 1 || state === 2) {
        // [상태 1, 2] 평상시 모습
        ctx.fillRect(60, 100, 80, 50);
        ctx.fillRect(70, 90, 60, 10);
        ctx.fillRect(50, 110, 10, 30);
        ctx.fillRect(140, 110, 10, 30);

        ctx.fillStyle = "black";
        if (state === 1) {
            // 눈 뜸
            ctx.fillRect(80, 110, 6, 6);
            ctx.fillRect(115, 110, 6, 6);
        } else {
            // 눈 감음 (ㅡ ㅡ)
            ctx.fillRect(78, 112, 10, 2);
            ctx.fillRect(113, 112, 10, 2);
        }
    } 
    else if (state === 3) {
        // [상태 3] 위로 주욱 늘어남
        ctx.fillRect(80, 50, 40, 110);
        ctx.fillRect(70, 70, 10, 70);
        ctx.fillRect(120, 70, 10, 70);
        
        ctx.fillStyle = "black";
        ctx.fillRect(85, 80, 6, 12); // 눈도 길어짐
        ctx.fillRect(110, 80, 6, 12);
    }
    else if (state === 4) {
        // [상태 4] 클릭 시 납작하게 눌림
        ctx.fillRect(40, 130, 120, 30);
        ctx.fillRect(50, 120, 100, 10);
        
        ctx.fillStyle = "black";
        ctx.fillRect(75, 135, 6, 6);
        ctx.fillRect(120, 135, 6, 6);
    }
}

function animate() {
    const now = Date.now();

    // 드래그나 클릭 중이 아닐 때만 눈 깜빡임 로직 작동
    if (!isDragging && state !== 4) {
        const diff = now - lastActionTime;
        if (diff > 3000) { // 3초 경과
            state = 2; // 눈 감기
            if (diff > 3500) { // 0.5초 동안 감음
                state = 1;
                lastActionTime = now;
            }
        } else {
            state = 1;
        }
    }

    drawSlime();
    requestAnimationFrame(animate);
}

// 마우스 이벤트 핸들러
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    state = 4; // 누르는 순간 납작
    lastActionTime = Date.now();
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        // 마우스 커서가 캔버스 위쪽(상단 1/3 지점)으로 가면 늘어남
        if (e.offsetY < 70) {
            state = 3;
        } else {
            state = 4;
        }
    }
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    state = 1;
    lastActionTime = Date.now();
});

// 애니메이션 시작
animate();