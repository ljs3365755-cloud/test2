const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');

// --- 변수 및 상태 관리 ---
let slimeName = "", level = 1, exp = 0, fullness = 50, cleanliness = 50;
let state = 1, effect = null, isDragging = false, renderSize = 250;
let lastActionTime = Date.now(), lastBallTime = 0, playCount = 0;
let isTiredState = false;

// 슬라임 색상 관리 (기본색: 보라색 계열)
let slimeColor = "#CDB4DB"; 

// 레벨업 시 변경될 색상 목록
const palette = ["#CDB4DB", "#FFCCF9", "#A2D2FF", "#BEE1E6", "#E2ECE9", "#DFE7FD", "#FFD700", "#FF6B6B", "#C1F0C1"];

// --- 데이터 저장 및 불러오기 ---
function saveData() {
    const data = { slimeName, level, exp, fullness, cleanliness, slimeColor };
    localStorage.setItem('slimeData', JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem('slimeData');
    if (saved) {
        const data = JSON.parse(saved);
        slimeName = data.slimeName;
        level = data.level; 
        exp = data.exp;
        fullness = data.fullness; 
        cleanliness = data.cleanliness;
        slimeColor = data.slimeColor || "#CDB4DB"; // 저장된 색상 로드
        
        document.getElementById('nameModal').style.display = 'none';
        document.getElementById('slimeNameDisplay').innerText = slimeName + " 슬라임";
        updateBars();
    }
}

// --- 인터페이스 이벤트 ---
document.getElementById('nameConfirmBtn').onclick = () => {
    const input = document.getElementById('nameInput').value.trim();
    if (input) {
        slimeName = input;
        document.getElementById('slimeNameDisplay').innerText = slimeName + " 슬라임";
        document.getElementById('nameModal').style.display = 'none';
        saveData();
    }
};

document.getElementById('resetBtn').onclick = () => {
    if (confirm("정말 새로 키우시겠습니까? 모든 기록이 삭제됩니다.")) {
        localStorage.removeItem('slimeData');
        location.reload();
    }
};

// --- 핵심 로직: 상호작용 (trigger) ---
function trigger(type, fChange, cChange, expGain = 0) {
    if (!slimeName) return;
    const now = Date.now();

    // 오디오 요소 연결
    const sEat = document.getElementById('soundEat');     // ggd-yumyum.mp3
    const sShw = document.getElementById('soundShower');  // bubble-pop.mp3
    const sWhistle = document.getElementById('soundWhistle'); // whistle.mp3
    const sPat = document.getElementById('soundPat');     // uiiiiiiii.mp3

    // 축구공 제한 로직 (1분 제한)
    if (type === 'ball' && isTiredState) {
        const left = Math.ceil((60000 - (now - lastBallTime)) / 1000);
        if (left > 0) {
            alert(`슬라임이 너무 지쳤어요! ${left}초 뒤에 가능.`);
            return;
        } else {
            isTiredState = false;
            playCount = 0;
        }
    }

    // 상황별 사운드 재생
    if (type === 'feed' || type === 'water' || type === 'cookie') {
        if(sEat) { sEat.currentTime = 0; sEat.play(); }
    } else if (type === 'bubbles') {
        if(sShw) { sShw.currentTime = 0; sShw.play(); }
    } else if (type === 'ball') {
        if(sWhistle) { 
            sWhistle.currentTime = 0; 
            sWhistle.play(); 
            // 휘슬 사운드 3초 후 정지
            setTimeout(() => { sWhistle.pause(); sWhistle.currentTime = 0; }, 3000);
        }
        playCount++; 
        if (playCount >= 5) { isTiredState = true; lastBallTime = now; }
    } else if (type === 'pat') {
        if(sPat) { sPat.currentTime = 0; sPat.play(); }
    }

    // 수치 업데이트
    fullness = Math.max(0, Math.min(100, fullness + fChange));
    cleanliness = Math.max(0, Math.min(100, cleanliness + cChange));

    // 경험치 및 레벨업 (색상 변경 포함)
    if (expGain > 0) {
        exp += expGain;
        const plus = document.getElementById('expPlus');
        plus.classList.remove('show');
        void plus.offsetWidth; // 애니메이션 리셋용
        plus.classList.add('show');
        
        if (exp >= 100) {
            level++;
            exp = 0;
            // 레벨업 시 랜덤 색상 변경
            slimeColor = palette[Math.floor(Math.random() * palette.length)];
            alert(`Level Up! ${level}레벨이 되었습니다!`);
        }
    }

    state = 5; // 기쁜 상태
    effect = type; 
    lastActionTime = now;
    updateBars(); 
    saveData();
    setTimeout(() => { state = 1; effect = null; }, 2000);
}

// --- 화면 업데이트 ---
function updateBars() {
    document.getElementById('fullBar').style.width = fullness + "%";
    document.getElementById('cleanBar').style.width = cleanliness + "%";
    document.getElementById('expBar').style.width = exp + "%";
    document.getElementById('lvlNum').innerText = level;
}

// --- 렌더링: 슬라임 그리기 ---
function drawSlime() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = renderSize / 2, cy = renderSize / 2 + 30;
    const now = Date.now();
    const idleTime = now - lastActionTime;
    
    // 상태 결정: 30초 이상 가만히 있으면 졸음(2)
    let currentDisplayState = (state === 1 && now % 5000 > 4700) ? 2 : state;
    if (idleTime > 30000 && !isDragging && state === 1) currentDisplayState = 2;

    ctx.fillStyle = slimeColor;
    let eyeY = 0;

    // 몸체 픽셀 스타일
    if (currentDisplayState === 3) { // 늘어남
        eyeY = -25;
        ctx.fillRect(cx-25, cy-90, 50, 10); ctx.fillRect(cx-35, cy-80, 70, 70); ctx.fillRect(cx-25, cy-10, 50, 10);
    } else if (currentDisplayState === 4) { // 눌림
        eyeY = 10;
        ctx.fillRect(cx-40, cy-50, 80, 10); ctx.fillRect(cx-60, cy-40, 120, 30); ctx.fillRect(cx-40, cy-10, 80, 10);
    } else { // 기본
        ctx.fillRect(cx-30, cy-70, 60, 10); ctx.fillRect(cx-40, cy-60, 80, 10);
        ctx.fillRect(cx-50, cy-50, 100, 40); ctx.fillRect(cx-40, cy-10, 80, 10);
    }

    // 눈 및 Zzz... 효과
    ctx.fillStyle = "black";
    if (currentDisplayState === 3) { // 세로 눈 ㅣ ㅣ
        ctx.fillRect(cx-18, cy-45 + eyeY, 4, 12); ctx.fillRect(cx+14, cy-45 + eyeY, 4, 12);
    } else if (currentDisplayState === 4) { // 가로 눈 - -
        ctx.fillRect(cx-22, cy-35 + eyeY, 12, 4); ctx.fillRect(cx+10, cy-35 + eyeY, 12, 4);
    } else if (currentDisplayState === 2) { // 감은 눈
        ctx.fillRect(cx-22, cy-35 + eyeY, 12, 3); ctx.fillRect(cx+10, cy-35 + eyeY, 12, 3);
        // 졸 때 Zzz... 표시
        if (idleTime > 30000) { 
            ctx.fillStyle = "#555"; ctx.font = "bold 18px Arial"; 
            ctx.fillText("Zzz...", cx+60, cy-80 + Math.sin(now/400)*8); 
        }
    } else if (currentDisplayState === 5) { // 기쁜 눈 ^ ^
        ctx.font = "bold 20px Arial"; ctx.fillText("^", cx-22, cy-30+eyeY); ctx.fillText("^", cx+10, cy-30+eyeY);
    } else { // 기본
        ctx.fillRect(cx-20, cy-39, 8, 8); ctx.fillRect(cx+12, cy-39, 8, 8);
    }

    // 이펙트 그리기
if (effect) {
        ctx.font = "35px Arial";
        const bounce = Math.sin(now / 200) * 10;
        if (effect === 'feed') ctx.fillText("❤️", cx - 18, cy - 90 + bounce);
        if (effect === 'water') ctx.fillText("💧", cx - 18, cy - 90 + bounce);
        if (effect === 'cookie') ctx.fillText("🍪", cx - 18, cy - 90 + bounce);
        if (effect === 'ball') {
        const ballJump = Math.abs(Math.sin(now/250)) * 40; // 통통 튀는 높이
        ctx.fillText("⚽", cx-15, cy-80 - ballJump);}
        if (effect === 'pat') ctx.fillText("✋", cx - 18 + Math.sin(now/150)*25, cy - 90);
        if (effect === 'bubbles') { ctx.fillText("🫧", cx - 75 + Math.sin(now/200)*10, cy - 60); ctx.fillText("🫧", cx + 45 - Math.sin(now/200)*10, cy - 90); }
    }
}

// --- 이벤트 핸들러 및 초기화 ---
function initCanvas() {
    const ratio = window.devicePixelRatio || 1;
    renderSize = Math.min(window.innerWidth * 0.8, 250);
    canvas.style.width = renderSize + "px"; canvas.style.height = renderSize + "px";
    canvas.width = renderSize * ratio; canvas.height = renderSize * ratio;
    ctx.scale(ratio, ratio);
}

function handleStart(e) { 
    if(!slimeName) return; 
    isDragging = true; state = 4; lastActionTime = Date.now();
    // 슬라임 누를 때 사운드 (squeaky.mp3)
    const sSelect = document.getElementById('soundSelect');
    if(sSelect) { sSelect.currentTime = 0; sSelect.play(); }
}
function handleMove(e) {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const clientY = (e.touches ? e.touches[0].clientY : e.clientY);
    const mouseY = (clientY - rect.top) * (renderSize / rect.height);
    state = (mouseY < 80) ? 3 : 4;
}
function handleEnd() { isDragging = false; state = 1; saveData(); }

canvas.onmousedown = handleStart; window.onmousemove = handleMove; window.onmouseup = handleEnd;
canvas.addEventListener('touchstart', handleStart, {passive:false});
canvas.addEventListener('touchmove', handleMove, {passive:false});
window.addEventListener('touchend', handleEnd);

window.addEventListener('resize', initCanvas);
initCanvas(); 
loadData();

function animate() { drawSlime(); requestAnimationFrame(animate); }
animate();