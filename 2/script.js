const container = document.querySelector('.game-container');
const menuItems = document.querySelectorAll('.menu-item');
let dragItem = null;
let shiftX, shiftY;
let lastTap = 0;

// 1. 아이템 생성 함수
function spawn(e) {
    e.stopPropagation();
    const target = e.currentTarget;
    const newItem = document.createElement('img');
    newItem.src = target.src;
    
    // 클래스에 따른 사이즈 적용
    const sizeClass = Array.from(target.classList).find(c => c.startsWith('size-'));
    newItem.className = 'dropped-item ' + sizeClass;
    
    // 화면 중앙에 생성
    newItem.style.left = '50%';
    newItem.style.top = '40%';
    newItem.style.transform = 'translate(-50%, -50%)';

    // 이벤트 부여
    newItem.addEventListener('mousedown', startDrag);
    newItem.addEventListener('touchstart', startDrag, { passive: false });
    newItem.addEventListener('dblclick', () => newItem.remove());
    
    // 모바일 더블탭 삭제 (따닥!)
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

// 2. 메뉴 아이템 클릭/터치 이벤트
menuItems.forEach(item => {
    item.addEventListener('click', spawn);
});

// 3. 드래그 로직
function startDrag(e) {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    dragItem = e.target;
    dragItem.style.transform = 'none'; // 잡는 순간 위치 고정 해제
    
    const event = e.type.includes('touch') ? e.touches[0] : e;
    const rect = dragItem.getBoundingClientRect();
    shiftX = event.clientX - rect.left;
    shiftY = event.clientY - rect.top;
    dragItem.style.zIndex = 2000;
}

document.addEventListener('mousemove', (e) => {
    if (!dragItem) return;
    dragItem.style.left = (e.clientX - shiftX) + 'px';
    dragItem.style.top = (e.clientY - shiftY) + 'px';
});

document.addEventListener('touchmove', (e) => {
    if (!dragItem) return;
    if (e.cancelable) e.preventDefault();
    const touch = e.touches[0];
    dragItem.style.left = (touch.clientX - shiftX) + 'px';
    dragItem.style.top = (touch.clientY - shiftY) + 'px';
}, { passive: false });

const stopDrag = () => {
    if (dragItem) {
        dragItem.style.zIndex = 500;
        dragItem = null;
    }
};

document.addEventListener('mouseup', stopDrag);
document.addEventListener('touchend', stopDrag);