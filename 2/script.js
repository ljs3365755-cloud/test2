const container = document.querySelector('.game-container');
const menuItems = document.querySelectorAll('.menu-item');

let dragItem = null;
let shiftX, shiftY;

// 1. 아이템 생성 (클릭/터치 시 1회 생성)
menuItems.forEach(menuItem => {
    const spawn = (e) => {
        e.preventDefault();
        const newItem = document.createElement('img');
        newItem.src = menuItem.src;
        // 메뉴 아이템의 클래스(사이즈)를 그대로 가져옴
        newItem.className = 'dropped-item ' + menuItem.classList[1];
        
        // 생성 위치: 클릭/터치한 바로 그 자리
        const event = e.type.includes('touch') ? e.touches[0] : e;
        newItem.style.left = (event.clientX - menuItem.offsetWidth / 2) + 'px';
        newItem.style.top = (event.clientY - menuItem.offsetHeight / 2) + 'px';

        // 배치된 아이템에 드래그 및 삭제 이벤트 연결
        newItem.addEventListener('mousedown', startDrag);
        newItem.addEventListener('touchstart', startDrag, { passive: false });
        newItem.addEventListener('dblclick', () => newItem.remove());

        container.appendChild(newItem);
    };

    menuItem.addEventListener('mousedown', spawn);
    menuItem.addEventListener('touchstart', spawn, { passive: false });
});

// 2. 드래그 시작 함수
function startDrag(e) {
    e.preventDefault();
    e.stopPropagation(); // 메뉴 아이템과 겹침 방지
    dragItem = e.target;
    
    const event = e.type.includes('touch') ? e.touches[0] : e;
    const rect = dragItem.getBoundingClientRect();
    
    shiftX = event.clientX - rect.left;
    shiftY = event.clientY - rect.top;
    dragItem.style.zIndex = 1000;
}

// 3. 마우스/터치 이동 처리
const moveHandler = (e) => {
    if (!dragItem) return;
    const event = e.type.includes('touch') ? e.touches[0] : e;
    
    dragItem.style.left = (event.clientX - shiftX) + 'px';
    dragItem.style.top = (event.clientY - shiftY) + 'px';
};

// 4. 드래그 종료
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