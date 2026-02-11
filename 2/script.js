const container = document.querySelector('.game-container');
const itemBar = document.getElementById('itemBar');
const menuItems = document.querySelectorAll('.menu-item');
let dragItem = null;
let shiftX, shiftY;
let lastTap = 0;

// 1. 화살표 스크롤 기능
function scrollGrid(val) {
    itemBar.scrollBy({ left: val, behavior: 'smooth' });
}

// 2. 아이템 생성
function spawn(e) {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget;
    const newItem = document.createElement('img');
    newItem.src = target.src;
    
    const sizeClass = Array.from(target.classList).find(c => c.startsWith('size-'));
    newItem.className = 'dropped-item ' + (sizeClass || '');
    
    newItem.style.left = '50%';
    newItem.style.top = '40%';
    newItem.style.transform = 'translate(-50%, -50%)';

    newItem.addEventListener('mousedown', startDrag);
    newItem.addEventListener('touchstart', startDrag, { passive: false });
    newItem.addEventListener('dblclick', () => newItem.remove());
    
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

// 메뉴 아이템 이벤트
menuItems.forEach(item => {
    item.addEventListener('click', spawn);
    item.addEventListener('dragstart', (de) => de.preventDefault());
});

// 3. 드래그 시작
function startDrag(e) {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    
    dragItem = e.target;
    dragItem.style.transform = 'none';
    
    const event = e.type.includes('touch') ? e.touches[0] : e;
    const rect = dragItem.getBoundingClientRect();
    
    shiftX = event.clientX - rect.left;
    shiftY = event.clientY - rect.top;
    
    dragItem.style.zIndex = 3000;
}

// 4. 전역 이동 및 종료 처리
const moveHandler = (e) => {
    if (!dragItem) return;
    if (e.cancelable) e.preventDefault();
    const event = e.type.includes('touch') ? e.touches[0] : e;
    dragItem.style.left = (event.clientX - shiftX) + 'px';
    dragItem.style.top = (event.clientY - shiftY) + 'px';
};

const stopDrag = () => {
    if (dragItem) {
        dragItem.style.zIndex = 2000;
        dragItem = null;
    }
};

document.addEventListener('mousemove', moveHandler);
document.addEventListener('touchmove', moveHandler, { passive: false });
document.addEventListener('mouseup', stopDrag);
document.addEventListener('touchend', stopDrag);