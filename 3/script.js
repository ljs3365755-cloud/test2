const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');
const SLIME_COLOR = "#CDB4DB";

let renderSize = 250; 
function initCanvas() {
    const ratio = window.devicePixelRatio || 1;
    renderSize = window.innerWidth < 768 ? window.innerWidth * 0.8 : 250;
    canvas.style.width = renderSize + "px";
    canvas.style.height = renderSize + "px";
    canvas.width = renderSize * ratio;
    canvas.height = renderSize * ratio;
    ctx.scale(ratio, ratio);
}
window.addEventListener('resize', initCanvas);
initCanvas();

// 상태 변수
let state = 1, fullness = 50, cleanliness = 50, effect = null;
let level = 1, exp = 0; // 레벨 시스템
let isDragging = false, lastActionTime = Date.now();
let feedCount = 0, playCount = 0, patCount = 0; // 연속 횟수 제한
let isFullState = false, isTiredState = false, isPatLimitState = false;

function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = renderSize / 2, cy = renderSize / 2 + 30;
    const now = Date.now();
    let currentDisplayState = (state === 1 && now % 5500 > 5000) ? 2 : state;

    if (isFullState || isTiredState || isPatLimitState) currentDisplayState = 2;

    ctx.fillStyle = SLIME_COLOR;
    let offsetX = (isFullState || isTiredState) ? Math.sin(now / 100) * 5 : 0;

    // 몸체 (이미지 1~4번)
    if (currentDisplayState === 3) {
        ctx.fillRect(cx-30+offsetX, cy-90, 60, 100); // 늘어남
    } else if (currentDisplayState === 4) {
        ctx.fillRect(cx-55+offsetX, cy-40, 110, 20); // 클릭
    } else {
        ctx.fillRect(cx-50+offsetX, cy-50, 100, 40); // 기본
    }

    // 눈 그리기
    let eyeY = (currentDisplayState === 3) ? cy - 75 : cy - 35;
    ctx.fillStyle = "black";
    if (currentDisplayState === 1) {
        ctx.fillRect(cx-20+offsetX, eyeY-4, 8, 8); ctx.fillRect(cx+12+offsetX, eyeY-4, 8, 8);
    } else if (currentDisplayState === 5) { // ^^ 눈
        ctx.font = "bold 20px Arial"; ctx.fillText("^", cx-22+offsetX, eyeY+5); ctx.fillText("^", cx+10+offsetX, eyeY+5);
    }

    // 특수 모션 추가
    if (effect === 'ball') { // 축구공 통통
        const ballBounce = Math.abs(Math.sin(now / 200)) * 40;
        ctx.font = "30px Arial"; ctx.fillText("⚽", cx - 15, cy - 100 - ballBounce);
    }
    if (effect === 'pat') { // 손바닥 좌우
        const handSwing = Math.sin(now / 150) * 20;
        ctx.font = "30px Arial"; ctx.fillText("✋", cx - 15 + handSwing, cy - 100);
    }
    if (effect === 'bubbles') { // 비누방울
        ctx.font = "30px Arial"; ctx.fillText("🫧", cx - 60 + Math.sin(now/200)*10, cy - 80);
    }
}

function trigger(type, fChange, cChange, expGain = 0) {
    const now = Date.now();
    const sEat = document.getElementById('soundEat'), sNo = document.getElementById('soundReject'), sShw = document.getElementById('soundShower');

    // 거부 로직
    if ((type === 'feed' && isFullState) || (type === 'ball' && isTiredState) || (type === 'pat' && isPatLimitState)) {
        if(sNo) { sNo.currentTime = 0; sNo.play(); }
        alert("슬라임이 거절했어요!"); return;
    }

    // 사운드 재생
    if (type === 'bubbles') { if(sShw) sShw.play(); } else { if(sEat) sEat.play(); }

    // 연속 횟수 관리
    if (type === 'feed') { feedCount++; if(feedCount>=5) { isFullState=true; setTimeout(()=>isFullState=false, 5000); } }
    if (type === 'ball') { playCount++; if(playCount>=5) { isTiredState=true; setTimeout(()=>playCount=0, 5000); } }
    if (type === 'pat') { patCount++; if(patCount>=5) { isPatLimitState=true; setTimeout(()=>patCount=0, 5000); } }

    // 경험치 및 레벨업
    if (expGain > 0) {
        exp += expGain;
        const plusTxt = document.getElementById('expPlus');
        plusTxt.classList.add('show'); setTimeout(()=>plusTxt.classList.remove('show'), 800);
        if (exp >= 100 && level < 100) { level++; exp = 0; alert("Level Up!"); }
        document.getElementById('lvlNum').innerText = level;
        document.getElementById('expNum').innerText = exp;
    }

    state = 5; effect = type;
    fullness = Math.min(100, fullness + fChange);
    cleanliness = Math.min(100, cleanliness + cChange);
    updateBars();
    setTimeout(() => { state = 1; effect = null; }, 2000);
}

function updateBars() {
    document.getElementById('fullBar').style.height = fullness + "%";
    document.getElementById('cleanBar').style.height = cleanliness + "%";
}

// 이벤트 연결
document.getElementById('feedBtn').onclick = () => trigger('feed', 10, 0);
document.getElementById('showerBtn').onclick = () => trigger('bubbles', 0, 20);
document.getElementById('ballBtn').onclick = () => trigger('ball', -5, -5, 1); // 공놀이 경험치 +1
document.getElementById('patBtn').onclick = () => trigger('pat', 0, 0, 1); // 쓰다듬기 경험치 +1

canvas.onmousedown = () => { const s = document.getElementById('soundSelect'); if(s) s.play(); state = 4; };
window.onmouseup = () => { state = 1; };

function animate() { drawSlime(); requestAnimationFrame(animate); }
animate(); updateBars();