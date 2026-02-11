const container = document.querySelector('.game-container');
const menuItems = document.querySelectorAll('.menu-item');
let dragItem = null;
let shiftX, shiftY;
let lastTap = 0;

// 1. 아이템 생성 함수
function spawn(e) {
    e.stopPropagation();
    // 모바일에서 스크롤 중에 아이템이 생기는 것 방지
    if (e.type === 'touchend' && Math.abs(e.changedTouches[0].clientX - startX) > 10) return;

    const target = e.currentTarget;
    const newItem = document.createElement('img');
    newItem.src = target.src;
    
    // 클래스에 따른 사이즈 적용
    const sizeClass = Array.from(target.classList).find(c => c.startsWith('size-'));
    newItem.className = 'dropped-item ' + sizeClass;
    
    // 화면 중앙 생성
    newItem.style.left = '50%';
    newItem.style.top = '40%';
    newItem.style.transform = 'translate(-50%, -50%)';

    // 배치된 아이템 이벤트 부여 (PC 마우스 + 모바일 터치)
    newItem.addEventListener('mousedown', startDrag);
    newItem.addEventListener('touchstart', startDrag, { passive: false });
    newItem.addEventListener('dblclick', () => newItem.remove());
    
    // 모바일 더블탭 삭제
    newItem.addEventListener('touchend', (te) => {
        const now = Date.now();
        if (now - lastTap < 300) {
            newItem.remove();
            te.preventDefault();
        }
        lastTap = now;
    });

    container.appendChild(newItem);
}

// 2. 메뉴 아이템 이벤트 등록
let startX = 0;
menuItems.forEach(item => {
    // PC용: 클릭하면 생성
    item.addEventListener('click', spawn);
    
    // 모바일용: 터치 시작 위치 기록 (스크롤 구분을 위해)
    item.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });
    
    // 모바일용: 탭하면 생성
    item.addEventListener('touchend', spawn, { passive: false });
});

// 3. 드래그 시작 로직 (중요: PC/모바일 통합)
function startDrag(e) {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    
    dragItem = e.target;
    dragItem.style.transform = 'none'; // 잡는 순간 translate 해제
    
    const event = e.type.includes('touch') ? e.touches[0] : e;
    const rect = dragItem.getBoundingClientRect();
    
    // 클릭한 지점과 이미지 좌상단 사이의 거리 계산
    shiftX = event.clientX - rect.left;
    shiftY = event.clientY - rect.top;
    
    dragItem.style.zIndex = 2000;
}

// 4. 움직임 (전역 감지)
const moveHandler = (e) => {
    if (!dragItem) return;
    if (e.cancelable) e.preventDefault();
    
    const event = e.type.includes('touch') ? e.touches[0] : e;
    
    dragItem.style.left = (event.clientX - shiftX) + 'px';
    dragItem.style.top = (event.clientY - shiftY) + 'px';
};

// 5. 놓기 (전역 감지)
const stopDrag = () => {
    if (dragItem) {
        dragItem.style.zIndex = 500;
        dragItem = null;
    }
};

document.addEventListener('mousemove', moveHandler);
document.addEventListener('touchmove', moveHandler, { passive: false });
document.addEventListener('mouseup', stopDrag);
document.addEventListener('touchend', stopDrag);