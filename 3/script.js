const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');

let state = 1; // 1: 평소, 2: 눈감음, 3: 늘어남, 4: 눌림
let lastActionTime = Date.now();
let isDragging = false;

// 오디오 파일 설정
const squeakSound = new Audio('squeaky.mp3');

// 슬라임 그리기 함수
function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#ced4da"; // 슬라임 몸체 색상

    if (state === 1 || state === 2) {
        // [상태 1, 2] 평상시 및 눈 깜빡임
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
        // [상태 3] 마우스로 끌어올렸을 때 (주욱 늘어남)
        ctx.fillRect(80, 50, 40, 110);
        ctx.fillRect(70, 70, 10, 70);
        ctx.fillRect(120, 70, 10, 70);
        ctx.fillRect(90, 40, 20, 10);
        
        ctx.fillStyle = "black";
        ctx.fillRect(86, 80, 4, 12);
        ctx.fillRect(110, 80, 4, 12);
    }
    else if (state === 4) {
        // [상태 4] 클릭했을 때 (납작해지며 > < 눈)
        ctx.fillRect(40, 130, 120, 30);
        ctx.fillRect(50, 120, 100, 10);
        
        ctx.fillStyle = "black";
        // 왼쪽 눈 ( > )
        ctx.fillRect(70, 136, 8, 2);
        ctx.fillRect(70, 142, 8, 2);
        ctx.fillRect(76, 138, 2, 4);
        
        // 오른쪽 눈 ( < )
        ctx.fillRect(122, 136, 8, 2); 
        ctx.fillRect(122, 142, 8, 2);
        ctx.fillRect(122, 138, 2, 4);
    }
}

// 메인 루프 (애니메이션)
function animate() {
    const now = Date.now();

    if (!isDragging && state !== 4) {
        const diff = now - lastActionTime;
        if (diff > 3000) { 
            state = 2;
            if (diff > 3500) {
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

// 마우스 인터랙션 이벤트
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    state = 4;
    lastActionTime = Date.now();

    // 소리 재생 로직 추가
    squeakSound.currentTime = 0; // 연속 클릭 시 소리가 끊기지 않고 처음부터 다시 나게 함
    squeakSound.play().catch(e => console.log("소리 재생을 위해 화면을 한 번 클릭해주세요!"));
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
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

animate();