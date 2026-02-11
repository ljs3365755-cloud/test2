const container = document.querySelector('.game-container');
const items = document.querySelectorAll('.item');

let dragItem = null;
let shiftX, shiftY;

// 1. 원본 아이템 드래그 (PC용 기본 드래그앤드롭 유지)
items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('imgSrc', e.target.src);
        e.dataTransfer.setData('width', e.target.offsetWidth);
        e.dataTransfer.setData('offsetX', e.offsetX);
        e.dataTransfer.setData('offsetY', e.offsetY);
    });
});

container.addEventListener('dragover', (e) => e.preventDefault());

// 2. 드롭 시 복사본 생성
container.addEventListener('drop', (e) => {
    e.preventDefault();
    const imgSrc = e.dataTransfer.getData('imgSrc');
    if (!imgSrc) return;

    const width = e.dataTransfer.getData('width');
    const offsetX = e.dataTransfer.getData('offsetX');
    const offsetY = e.dataTransfer.getData('offsetY');

    createDroppedItem(imgSrc, width, e.clientX - offsetX, e.clientY - offsetY);
});

// 3. 아이템 생성 및 이벤트 부여 함수
function createDroppedItem(src, width, left, top) {
    const newItem = document.createElement('img');
    newItem.src = src;
    newItem.classList.add('dropped-item');
    newItem.style.width = width + "px";
    newItem.style.left = left + 'px';
    newItem.style.top = top + 'px';

    // [PC용 이동]
    newItem.addEventListener('mousedown', startDrag);
    // [모바일용 이동]
    newItem.addEventListener('touchstart', startDrag, {passive: false});
    // [더블클릭 삭제]
    newItem.addEventListener('dblclick', () => newItem.remove());

    container.appendChild(newItem);
}

// 4. 드래그 시작 함수 (PC/모바일 공용)
function startDrag(e) {
    e.preventDefault();
    dragItem = e.target;
    
    // 터치인지 마우스인지 구분해서 좌표 계산
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    shiftX = clientX - dragItem.getBoundingClientRect().left;
    shiftY = clientY - dragItem.getBoundingClientRect().top;
    dragItem.style.zIndex = 1000;
}

// 5. 움직임 처리 (PC/모바일 공용)
const moveHandler = (e) => {
    if (!dragItem) return;
    e.preventDefault();

    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    dragItem.style.left = (clientX - shiftX) + 'px';
    dragItem.style.top = (clientY - shiftY) + 'px';
};

// 6. 종료 처리
const endHandler = () => {
    if (dragItem) {
        dragItem.style.zIndex = 50;
        dragItem = null;
    }
};

document.addEventListener('mousemove', moveHandler);
document.addEventListener('touchmove', moveHandler, {passive: false});
document.addEventListener('mouseup', endHandler);
document.addEventListener('touchend', endHandler);