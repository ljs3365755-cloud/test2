const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');
const foodCanvas = document.getElementById('foodCanvas');
const foodCtx = foodCanvas.getContext('2d');
const feedBtn = document.getElementById('feedBtn');

// --- 설정: 슬라임 색상 및 상태 변수 ---
const SLIME_COLOR = "#CDB4DB"; // 보라색 포도맛 슬라임
let state = 1; // 1:평소, 2:눈감음, 3:늘어남, 4:눌림, 5:행복(^^)
let lastActionTime = Date.now();
let isDragging = false;
let showHeart = false;

// 거절 관련 변수
let feedCount = 0;
let isFull = false;
let isShaking = false; 
let shakeOffset = 0;

// 오디오 설정
const squeakSound = new Audio('squeaky.mp3');
const yumSound = new Audio('ggd-yumyum.mp3');
const noSound = new Audio('no.mp3');

// 삼각김밥 도트 그리기
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
    
    // 1. 도리도리 애니메이션 계산
    if (isShaking) {
        shakeOffset = Math.sin(Date.now() / 50) * 15;
    } else {
        shakeOffset = 0;
    }

    // 2. 하트 그리기
    if (showHeart && !isFull) {
        ctx.fillStyle = "#ff4d4d";
        const yOffset = Math.sin(Date.now() / 150) * 8;
        ctx.fillRect(95 + shakeOffset, 30 + yOffset, 10, 10);
        ctx.fillRect(85 + shakeOffset, 25 + yOffset, 10, 10);
        ctx.fillRect(105 + shakeOffset, 25 + yOffset, 10, 10);
    }

    // 3. 슬라임 몸통 그리기 (모든 상태에 SLIME_COLOR 적용)
    ctx.fillStyle = SLIME_COLOR; 
    
    if (state === 3) { // 늘어남
        ctx.fillRect(