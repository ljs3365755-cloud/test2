const container = document.querySelector('.game-container');
const items = document.querySelectorAll('.item');

let dragItem = null;
let shiftX, shiftY;

items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('imgSrc', e.target.src);
        e.dataTransfer.setData('width', e.target.offsetWidth);
        e.dataTransfer.setData('offsetX', e.offsetX);
        e.dataTransfer.setData('offsetY', e.offsetY);
    });
});

container.addEventListener('dragover', (e) => e.preventDefault());

container.addEventListener('drop', (e) => {
    e.preventDefault();
    const imgSrc = e.dataTransfer.getData('imgSrc');
    if (!imgSrc) return;

    const width = e.dataTransfer.getData('width');
    const offsetX = e.dataTransfer.getData('offsetX');
    const offsetY = e.dataTransfer.getData('offsetY');

    const newItem = document.createElement('img');
    newItem.src = imgSrc;
    newItem.classList.add('dropped-item');
    newItem.style.width = width + "px";
    newItem.style.left = (e.clientX - offsetX) + 'px';
    newItem.style.top = (e.clientY - offsetY) + 'px';

    // 드래그 기능 및 더블 클릭 삭제 추가
    newItem.addEventListener('mousedown', (e) => {
        dragItem = newItem;
        shiftX = e.clientX - newItem.getBoundingClientRect().left;
        shiftY = e.clientY - newItem.getBoundingClientRect().top;
        newItem.style.zIndex = 1000;
    });

    newItem.addEventListener('dblclick', () => newItem.remove());
    container.appendChild(newItem);
});

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