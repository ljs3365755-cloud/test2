const container = document.querySelector('.game-container');
const items = document.querySelectorAll('.item');

let dragItem = null;
let shiftX, shiftY;

// 1. 메뉴 아이템 클릭/터치 시 생성
items.forEach(item => {
    // 클릭(PC)과 터치(모바일) 모두 대응
    const createEvent = (e) => {
        e.preventDefault();
        // 화면 정중앙 좌표 계산
        const centerX = window.innerWidth / 2 - (item.offsetWidth / 2);
        const centerY = window.innerHeight / 2 - (item.offsetHeight / 2);
        
        // 아이템 복제 생성
        createDroppedItem(item.src, item.offsetWidth, centerX, centerY);
    };

    item.addEventListener('click', createEvent);
});

// 2. 배치된 아이템 생성 및 이벤트 부여
function createDroppedItem(src, width, left, top) {
    const newItem = document.createElement('img');
    newItem.src = src;
    newItem.classList.add('dropped-item');
    newItem.style.width = width + "px";
    newItem.style.left = left + 'px';
    newItem.style.top = top + 'px';

    // 잡고 옮기기 (PC/모바일 공용)
    newItem.addEventListener('mousedown', startDrag);
    newItem.addEventListener('touchstart', startDrag, { passive: false });
    
    // 더블클릭(PC) 또는 더블탭(모바일) 삭제
    newItem.addEventListener('dblclick', () => newItem.remove());

    container.appendChild(newItem);
}

// 3. 드래그 시작
function startDrag(e) {
    e.preventDefault();
    dragItem = e.target;
    
    const isTouch = e.type.startsWith('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    const rect = dragItem.getBoundingClientRect();
    shiftX = clientX - rect.left;
    shiftY = clientY - rect.top;
    
    dragItem.style.zIndex = 1000;
}

// 4. 드래그 중
const moveHandler = (e) => {
    if (!dragItem) return;

    const isTouch = e.type.startsWith('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    dragItem.style.left = (clientX - shiftX) + 'px';
    dragItem.style.top = (clientY - shiftY) + 'px';

    if (isTouch) e.preventDefault(); // 스크롤 방지
};

// 5. 드래그 끝
const endHandler = () => {
    if (dragItem) {
        dragItem.style.zIndex = 50;
        dragItem = null;
    }
};

document.addEventListener('mousemove', moveHandler);
document.addEventListener('touchmove', moveHandler, { passive: false });
document.addEventListener('mouseup', endHandler);
document.addEventListener('touchend', endHandler);