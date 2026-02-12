const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');
const foodCanvas = document.getElementById('foodCanvas');
const foodCtx = foodCanvas.getContext('2d');
const feedBtn = document.getElementById('feedBtn');

// 1. 설정 및 상태 변수
const SLIME_COLOR = "#CDB4DB"; 
let state = 1; 
let lastActionTime = Date.now();
let isDragging = false;
let showHeart = false;
let feedCount = 0;
let isFull = false;
let isShaking = false; 
let shakeOffset = 0;

// 2. 오디오 에러 방지 처리 (파일이 없어도 코드가 안 멈춤)
const playSound = (audioFile) => {
    try {
        const sound = new Audio(audioFile);
        sound.play().catch(() => { /* 소리 파일 없어도 무시하고 진행 */ });
    } catch (e) {
        console.log("사운드 재생 불가:", audioFile);
    }
};

// 3. 삼각김밥 그리기
function drawFood() {
    foodCtx.clearRect(0, 0, foodCanvas.width, foodCanvas.height);
    foodCtx.fillStyle = "white";
    foodCtx.fillRect(20, 15, 10, 5);
    foodCtx.fillRect(15, 20, 20, 5);
    foodCtx.fillRect(10, 25, 30, 5);
    foodCtx.fillRect(5, 30, 40, 10);
    foodCtx.fillStyle = "black";
    foodCtx.fillRect(20, 32, 10, 8);
}

// 4. 슬라임 그리기 핵심 (이 부분이 실행되어야 보입니다)
function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (isShaking) {
        shakeOffset = Math.sin(Date.now() / 50) * 15;
    } else {
        shakeOffset = 0;
    }

    // 하트
    if (showHeart && !isFull) {
        ctx.fillStyle = "#ff4d4d";
        const yOffset = Math.sin(Date.now() / 150) * 8;
        ctx.fillRect(95 + shakeOffset, 30 + yOffset, 10, 10);
        ctx.fillRect(85 + shakeOffset, 25 + yOffset, 10, 10);
        ctx.fillRect(105 + shakeOffset, 25 + yOffset, 10, 10);
    }

    // 몸통
    ctx.fillStyle = SLIME_COLOR; 
    if (state === 3) {
        ctx.fillRect(80 + shakeOffset, 50, 40, 110);
        ctx.fillRect(70 + shakeOffset, 70, 10, 70);
        ctx.fillRect(120 + shakeOffset, 70, 10, 70);
    } else if (state === 4 && !isFull) {
        ctx.fillRect(40 + shakeOffset, 130, 120, 30);
        ctx.fillRect(50 + shakeOffset, 120, 100, 10);
    } else {
        ctx.fillRect(60 + shakeOffset, 100, 80, 50);
        ctx.fillRect(70 + shakeOffset,