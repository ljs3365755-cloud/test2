const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const size = window.innerWidth < 768 ? window.innerWidth * 0.8 : 250;
    
    // 스타일 크기 설정
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    
    // 실제 드로잉 해상도 설정 (픽셀 깨짐 방지)
    canvas.width = size * ratio;
    canvas.height = size * ratio;
    ctx.scale(ratio, ratio);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // 초기 실행
const SLIME_COLOR = "#CDB4DB";

let state = 1; // 1:기본, 2:눈감음, 3:늘어남, 4:클릭(><), 5:상호작용(^^)
let fullness = 50; 
let cleanliness = 50;
let effect = null;
let lastActionTime = Date.now();
let isDragging = false;
let feedCount = 0;
let lastCookieTime = 0;
let isFullState = false;

// 1. 눈 감기 모션 (5초 뜨고 0.5초 감기)
function getBlinkState() {
    if (state !== 1) return state;
    const now = Date.now();
    return (now % 5500 > 5000) ? 2 : 1;
}

// 픽셀 이미지 드로잉 (이미지 1~4번 좌표 및 늘어나는 눈 모션 완벽 구현)
function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2, cy = canvas.height / 2 + 40;
    const now = Date.now();
    const idleTime = now - lastActionTime;
    let currentDisplayState = getBlinkState();

    // 4. 30초 무반응 Zzz..
    if (idleTime > 30000 && !isDragging && state === 1) {
        currentDisplayState = 2;
        ctx.fillStyle = "#555"; ctx.font = "bold 18px Arial";
        ctx.fillText("Zzz...", cx + 60, cy - 80 + Math.sin(now/400)*8);
    }

    if (state !== 1) currentDisplayState = state;
    
    // 11. 배부름 좌우 흔들기
    let offsetX = 0;
    if (isFullState) {
        currentDisplayState = 2;
        offsetX = Math.sin(now / 100) * 5;
    }

    ctx.fillStyle = SLIME_COLOR;

    // --- 몸체 드로잉 (이미지 1~4번 픽셀 구조) ---
    if (currentDisplayState === 3) { // 3번 늘어남
        ctx.fillRect(cx-10+offsetX, cy-110, 20, 10); ctx.fillRect(cx-20+offsetX, cy-100, 40, 10);
        ctx.fillRect(cx-30+offsetX, cy-90, 60, 100); ctx.fillRect(cx-20+offsetX, cy+10, 40, 10);
    } else if (currentDisplayState === 4) { // 4번 클릭
        ctx.fillRect(cx-45+offsetX, cy-50, 90, 40); ctx.fillRect(cx-55+offsetX, cy-40, 110, 20);
    } else { // 1, 2번 기본
        ctx.fillRect(cx-30+offsetX, cy-70, 60, 10); ctx.fillRect(cx-40+offsetX, cy-60, 80, 10);
        ctx.fillRect(cx-50+offsetX, cy-50, 100, 40); ctx.fillRect(cx-40+offsetX, cy-10, 80, 10);
    }

    // --- 눈 그리기 (늘어남 모션 반영) ---
    let eyeY = (currentDisplayState === 3) ? cy - 75 : cy - 35; 
    ctx.strokeStyle = "black"; ctx.lineWidth = 4; ctx.lineCap = "round";
    
    if (currentDisplayState === 3) { 
        // 3번 이미지: 세로로 주욱 늘어난 눈
        ctx.fillStyle = "black";
        ctx.fillRect(cx - 20 + offsetX, eyeY, 8, 30); 
        ctx.fillRect(cx + 12 + offsetX, eyeY, 8, 30);
    } else if (currentDisplayState === 1) { 
        // 1번 이미지: 기본 점눈
        ctx.fillStyle = "black";
        ctx.fillRect(cx - 20 + offsetX, eyeY - 4, 8, 8); 
        ctx.fillRect(cx + 12 + offsetX, eyeY - 4, 8, 8);
    } else if (currentDisplayState === 2) { 
        // 2번 이미지: 감은 눈
        ctx.beginPath(); ctx.moveTo(cx-22+offsetX, eyeY); ctx.lineTo(cx-10+offsetX, eyeY);
        ctx.moveTo(cx+10+offsetX, eyeY); ctx.lineTo(cx+22+offsetX, eyeY); ctx.stroke();
    } else if (currentDisplayState === 4) { 
        // 4번 이미지: > < 눈
        ctx.beginPath();
        ctx.moveTo(cx-25+offsetX, eyeY-5); ctx.lineTo(cx-15+offsetX, eyeY); ctx.lineTo(cx-25+offsetX, eyeY+5);
        ctx.moveTo(cx+25+offsetX, eyeY-5); ctx.lineTo(cx+15+offsetX, eyeY); ctx.lineTo(cx+25+offsetX, eyeY+5);
        ctx.stroke();
    } else if (currentDisplayState === 5) { 
        // 상호작용: ^^ 눈
        ctx.beginPath();
        ctx.moveTo(cx-25+offsetX, eyeY+3); ctx.lineTo(cx-18+offsetX, eyeY-4); ctx.lineTo(cx-11+offsetX, eyeY+3);
        ctx.moveTo(cx+11+offsetX, eyeY+3); ctx.lineTo(cx+18+offsetX, eyeY-4); ctx.lineTo(cx+25+offsetX, eyeY+3);
        ctx.stroke();
    }

    if (effect) drawEffect(effect, cx, cy);
} // drawSlime 함수 끝

// 6~9. 특수 효과 구현
function drawEffect(type, cx, cy) {
    const bounce = Math.sin(Date.now() / 200) * 5;
    ctx.font = "30px Arial";
    if (type === 'heart') ctx.fillText("❤️", cx - 15, cy - 100 + bounce);
    if (type === 'water') ctx.fillText("💧", cx - 15, cy - 100 + bounce);
    if (type === 'star') ctx.fillText("⭐", cx - 15, cy - 100 + bounce);
    if (type === 'bubbles') {
        ctx.fillText("🫧", cx - 80, cy - 20 + bounce);
        ctx.fillText("🫧", cx + 50, cy - 40 - bounce);
    }
}

// 상호작용 처리
function trigger(type, fChange, cChange) {
    const now = Date.now();
    const soundEat = document.getElementById('soundEat');
    const soundReject = document.getElementById('soundReject');

    // 1. 거부 상황 체크 (배부름 혹은 쿠키 쿨타임)
    let isRejected = false;
    if (type === 'feed' && isFullState) isRejected = true;
    if (type === 'cookie' && (now - lastCookieTime < 3600000)) isRejected = true;

    if (isRejected) {
        // [추가] 거부 소리 (no.mp3)
        if(soundReject) { soundReject.currentTime = 0; soundReject.play(); }
        
        if (type === 'feed') alert("아직 배부르대요!");
        else {
            const left = Math.ceil((3600000 - (now - lastCookieTime)) / 60000);
            alert(`쿠키는 1시간에 한 번만! (${left}분 남음)`);
        }
        return; 
    }

    // 2. 정상 실행 (먹기/씻기)
    // [추가] 먹는 소리 (ggd-yumyum.mp3)
    if(soundEat) { soundEat.currentTime = 0; soundEat.play(); }

    if (type === 'feed') {
        feedCount++;
        if (feedCount >= 5) {
            isFullState = true;
            setTimeout(() => { isFullState = false; feedCount = 0; }, 10000);
        }
    }
    if (type === 'cookie') lastCookieTime = now;

    // 상태 변경 및 게이지 업데이트
    state = 5; 
    effect = type === 'feed' ? 'heart' : type === 'water' ? 'water' : type === 'cookie' ? 'star' : 'bubbles';
    fullness = Math.min(100, fullness + fChange);
    cleanliness = Math.min(100, cleanliness + cChange);
    lastActionTime = now; 
    updateBars();
    setTimeout(() => { state = 1; effect = null; }, 2000);
}
// 15. 게이지 감소 로직
setInterval(() => {
    fullness = Math.max(0, fullness - (1/1200));
    cleanliness = Math.max(0, cleanliness - (1/1200));
    updateBars();
}, 1000);

function updateBars() {
    const fb = document.getElementById('fullBar');
    const cb = document.getElementById('cleanBar');
    if(fb) fb.style.height = fullness + "%";
    if(cb) cb.style.height = cleanliness + "%";
}

// 2, 3. 드래그 및 클릭 이벤트 (늘어나는 모션 + 사운드 통합)
canvas.onmousedown = (e) => { 
    isDragging = true; 
    state = 4; // 클릭 눈 (> <)
    lastActionTime = Date.now();
    
    // 찍(squeaky) 소리 재생
    const snd = document.getElementById('soundSelect');
    if(snd) { snd.currentTime = 0; snd.play(); } 
};

window.onmousemove = (e) => {
    if (!isDragging) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;

    // 마우스가 위로 올라가면 이미지 3번(늘어남) 상태로 변경
    if (mouseY < 100) {
        state = 3; 
    } else {
        state = 4;
    }
};

window.onmouseup = () => { 
    isDragging = false; 
    state = 1; // 기본 상태로 복귀
};

// 버튼 연결 (상호작용 함수 연결)
document.getElementById('feedBtn').onclick = () => trigger('feed', 1, 0);
document.getElementById('waterBtn').onclick = () => trigger('water', 1, 0);
document.getElementById('cookieBtn').onclick = () => trigger('cookie', 2, 0);
document.getElementById('showerBtn').onclick = () => trigger('bubbles', 0, 10);

// 애니메이션 실행 루프
function animate() { drawSlime(); requestAnimationFrame(animate); }
animate(); 
updateBars(); // 초기 게이지 설정