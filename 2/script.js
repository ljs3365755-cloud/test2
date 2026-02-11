const container = document.querySelector('.game-container');
const items = document.querySelectorAll('.item');

let dragItem = null;
let shiftX, shiftY;

// 1. 원본 아이템 드래그 이벤트 (복사본 생성용)
items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('imgSrc', e.target.src);
        e.dataTransfer.setData('offsetX', e.offsetX);
        e.dataTransfer.setData('offsetY', e.offsetY);
    });
});

container.addEventListener('dragover', (e) => e.preventDefault());

// 2. 드롭 시 복사본 생성 및 배치
container.addEventListener('drop', (e) => {
    e.preventDefault();
    const imgSrc = e.dataTransfer.getData('imgSrc');
    if (!imgSrc) return; // 배치된 거 옮길 땐 새로 안 만듦

    const offsetX = e.dataTransfer.getData('offsetX');
    const offsetY = e.dataTransfer.getData('offsetY');

    const newItem = document.createElement('img');
    newItem.src = imgSrc;
    newItem.classList.add('dropped-item');
    newItem.style.width = "100px"; // 크기 고정
    newItem.style.left = (e.clientX - offsetX) + 'px';
    newItem.style.top = (e.clientY - offsetY) + 'px';

    addDragFeature(newItem);
    container.appendChild(newItem);
});

// 3. 배치된 아이템을 다시 움직이게 하는 함수
function addDragFeature(el) {
    el.addEventListener('mousedown', (e) => {
        if (e.button === 2) return; // 우클릭은 무시
        dragItem = el;
        shiftX = e.clientX - el.getBoundingClientRect().left;
        shiftY = e.clientY - el.getBoundingClientRect().top;
        el.style.zIndex = 1000;
    });

    // 우클릭 시 삭제
    el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        el.remove();
    });
}

// 4. 마우스 이동 처리
document.addEventListener('mousemove', (e) => {
    if (!dragItem) return;
    dragItem.style.left = (e.clientX - shiftX) + 'px';
    dragItem.style.top = (e.clientY - shiftY) + 'px';
});

document.addEventListener('mouseup', () => {
    if (dragItem) {
        dragItem.style.zIndex = 50;
        dragItem = null;
    }
});