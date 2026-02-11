const container = document.querySelector('.game-container');
const menuItems = document.querySelectorAll('.menu-item');
let dragItem = null;
let shiftX, shiftY;
let lastTap = 0;

// 1. 아이템 생성 함수 (하단 바 전용)
function handleSpawn(e) {
    // 하단 바의 스크롤을 방해하지 않기 위해 드래그 중에는 생성 안 함
    if (dragItem) return;

    const target = e.currentTarget;
    const newItem = document.createElement('img');
    newItem.src = target.src;
    
    // 배치된 아이콘임을 알리는 클래스 추가
    newItem.className = 'dropped-item';
    
    // PC/모바일 좌표 통합
    const event = e.type.includes('touch') ? e.touches[0] : e;
    
    // 초기 생성 위치 (중앙 근처)
    newItem.style.left = '50%';
    newItem.style.top = '40%';
    newItem.style.transform = 'translate(-50%, -50%)';

    // 배치된 아이템에 드래그 및 삭제 이벤트 부여
    newItem.addEventListener('mousedown', startDrag);
    newItem.addEventListener('touchstart', startDrag, { passive: false });
    newItem.addEventListener('dblclick', () => newItem.remove());
    
    // 모바일 더블탭 삭제
    newItem.addEventListener('touchend', function(touchEvent) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
            newItem.remove();
            touchEvent.preventDefault();
        }
        lastTap = currentTime;
    });

    container.appendChild(newItem);
}

// 메뉴 아이템들에 이벤트 등록 (passive: true로 스크롤 살리기)
menuItems.forEach(item => {
    item.addEventListener('click', handleSpawn); // PC 클릭
    item.addEventListener('touchstart', (e) => {
        // 터치 시작 시점을 기록하지만 스크롤을 막지 않음
    }, { passive: true });
    
    item.addEventListener('touchend', (e) => {
        // 손가락을 뗐을 때 드래그가 아니었다면 아이템 생성
        handleSpawn(e);
    }, { passive: true });
});

// 2. 드래그 시작
function startDrag(e) {
    e.preventDefault();
    e.stopPropagation(); 
    
    dragItem = e.target;
    // 잡을 때 transform 제거 (좌표 계산 꼬임 방지)
    dragItem.style.transform = 'none';
    
    const event = e.type.includes('touch') ? e.touches[0] : e;
    const rect = dragItem.getBoundingClientRect();
    
    shiftX = event.clientX - rect.left;
    shiftY = event.clientY - rect.top;
    dragItem.style.zIndex = 1000;
}

// 3. 드래그 이동 (전역)
const moveHandler = (e) => {
    if (!dragItem) return;
    
    // 드래그 중에는 화면 스크롤 방지
    if (e.cancelable) e.preventDefault(); 
    
    const event = e.type.includes('touch') ? e.touches[0] : e;
    dragItem.style.left = (event.clientX - shiftX) + 'px';
    dragItem.style.top = (event.clientY - shiftY) + 'px';
};

// 4. 드래그 종료 (전역)
const endHandler = () => {
    if (dragItem) {
        dragItem.style.zIndex = 500;
        dragItem = null;
    }
};

document.addEventListener('mousemove', moveHandler);
document.addEventListener('touchmove', moveHandler, { passive: false });
document.addEventListener('mouseup', endHandler);
document.addEventListener('touchend', endHandler);