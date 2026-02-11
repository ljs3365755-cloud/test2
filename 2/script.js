const container = document.querySelector('.game-container');
const menuItems = document.querySelectorAll('.menu-item');
let dragItem = null;
let shiftX, shiftY;
let lastTap = 0;

// 아이템 생성 함수
function spawn(e) {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget;
    const newItem = document.createElement('img');
    newItem.src = target.src;
    
    const sizeClass = Array.from(target.classList).find(c => c.startsWith('size-'));
    newItem.className = 'dropped-item ' + (sizeClass || '');
    
    // 중앙 배치
    newItem.style.left = '50%';
    newItem.style.top = '40%';
    newItem.style.transform = 'translate(-50%, -50%)';

    // 생성된 아이템에 이벤트 부여
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

// 메뉴 아이템에 생성 이벤트 연결
menuItems.forEach(item => {
    item.addEventListener('click', spawn);
    // 모바일에서 스크롤과 클릭이 겹치지 않게 방지
    item.addEventListener('dragstart', (de) => de.preventDefault());
});

// 드래그 시작
function startDrag(e) {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    
    dragItem = e.target;
    dragItem.style.transform = 'none'; // 드래그 시작 시 translate 제거
    
    const event = e.type.includes('touch') ? e.touches[0] : e;
    const rect = dragItem.getBoundingClientRect();
    
    shiftX = event.clientX - rect.left;
    shiftY = event.clientY - rect.top;
    
    dragItem.style.zIndex = 3000;
}

// 이동 처리 (전역)
const moveHandler = (e) => {
    if (!dragItem) return;
    if (e.cancelable) e.preventDefault();
    
    const event = e.type.includes('touch') ? e.touches[0] : e;
    
    dragItem.style.left = (event.clientX - shiftX) + 'px';
    dragItem.style.top = (event.clientY - shiftY) + 'px';
};

// 종료 처리 (전역)
const endHandler = () => {
    if (dragItem) {
        dragItem.style.zIndex = 2000;
        dragItem = null;
    }
};

document.addEventListener('mousemove', moveHandler);
document.addEventListener('touchmove', moveHandler, { passive: false });
document.addEventListener('mouseup', endHandler);
document.addEventListener('touchend', endHandler);