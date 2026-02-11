const container = document.querySelector('.game-container');
const items = document.querySelectorAll('.item');

let dragItem = null;
let shiftX, shiftY;

// 1. 원본 아이콘 드래그 시작
items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('imgSrc', e.target.src);
        e.dataTransfer.setData('offsetX', e.offsetX);
        e.dataTransfer.setData('offsetY', e.offsetY);
    });
});

container.addEventListener('dragover', (e) => e.preventDefault());

// 2. 아이템 내려놓기 (복사본 생성)
container.addEventListener('drop', (e) => {
    e.preventDefault();
    const imgSrc = e.dataTransfer.getData('imgSrc');
    if (!imgSrc) return;

    const offsetX = e.dataTransfer.getData('offsetX');
    const offsetY = e.dataTransfer.getData('offsetY');

    const newItem = document.createElement('img');
    newItem.src = imgSrc;
    newItem.classList.add('dropped-item');
    newItem.style.width = "110px"; // 크기 고정
    newItem.style.left = (e.clientX - offsetX) + 'px';
    newItem.style.top = (e.clientY - offsetY) + 'px';

    // 새로운 기능 추가 (이동 + 삭제)
    addFeatures(newItem);
    container.appendChild(newItem);
});

// 3. 아이템 재이동 및 더블 클릭 삭제 함수
function addFeatures(el) {
    // [이동 기능]
    el.addEventListener('mousedown', (e) => {
        dragItem = el;
        shiftX = e.clientX - el.getBoundingClientRect().left;
        shiftY = e.clientY - el.getBoundingClientRect().top;
        el.style.zIndex = 1000;
    });

    // [핵심: 왼쪽 마우스 더블 클릭 시 삭제]
    el.addEventListener('dblclick', () => {
        el.remove();
    });
}

// 4. 전역 마우스 이동 처리
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