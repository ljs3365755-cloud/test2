const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');
const foodCanvas = document.getElementById('foodCanvas');
const foodCtx = foodCanvas.getContext('2d');
const feedBtn = document.getElementById('feedBtn');

// 색상 변수 확인
const SLIME_COLOR = "#CDB4DB"; 
let state = 1; 
let lastActionTime = Date.now();
let isDragging = false;
let showHeart = false;
let feedCount = 0;
let isFull = false;
let isShaking = false; 
let shakeOffset = 0;

// 오디오 (파일이 없어도 에러로 멈추지 않게 처리)
const squeakSound = new Audio('squeaky.mp3');
const yumSound = new Audio('ggd-yumyum.mp3');
const noSound = new Audio('no.mp3');

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

function drawSlime() {
    // 캔버스를 깨끗하게 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (isShaking) {
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

    // 슬라임 그리기 시작
    ctx.fillStyle = SLIME_COLOR; 
    
    if (state === 3) {
        ctx.fillRect(80 + shakeOffset, 50, 40, 110);
        ctx.fillRect(70 + shakeOffset, 70, 10, 70);
        ctx.fillRect(120 + shakeOffset, 70, 10, 70);
    } else if (state === 4 && !isFull) {
        ctx.fillRect(40 + shakeOffset, 130, 120, 30);
        ctx.fillRect(50 + shakeOffset, 120, 100, 10);
    } else {
        // 기본 체형
        ctx.fillRect(60 + shakeOffset, 100, 80, 50);
        ctx.fillRect(70 + shakeOffset, 90, 60, 10);
        ctx.fillRect(50 + shakeOffset, 110, 10, 30);
        ctx.fillRect(140 + shakeOffset, 110, 10, 30);
    }

    // 눈 그리기 (눈이 안 보이면 슬라임이 투명해 보일 수 있음)
    ctx.fillStyle = "black";
    if (isFull || state === 2) { 
        ctx.fillRect(80 + shakeOffset, 112, 10, 2); 
        ctx.fillRect(110 + shakeOffset, 112, 10, 2);
    } else if (state === 1) { 
        ctx.fillRect(82 + shakeOffset, 110, 6, 6); 
        ctx.fillRect(11