const container = document.querySelector('.game-container');
const menuItems = document.querySelectorAll('.menu-item');
let dragItem = null;
let shiftX, shiftY;
let lastTap = 0;

function handleSpawn(e) {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget;
    const newItem = document.createElement('img');
    newItem.src = target.src;
    newItem.className = 'dropped-item';
    
    // 생성된 스티커 크기는 하단 바 크기가 아닌 원래 정해주신 크기대로
    newItem.style.width = target.naturalWidth * 0.5 + "px"; 
    // 혹은 고정: newItem.style.width = "120px";

    const event = e.type.includes('touch') ? e.touches[0] : e;
    newItem.style.left = (event.clientX - 50) + 'px';
    newItem.style.top = (event.clientY - 50) + 'px';

    newItem.addEventListener('mousedown', startDrag);
    newItem.addEventListener('touchstart', startDrag, { passive: false });
    newItem.addEventListener('dblclick', () => newItem.remove());
    
    newItem.addEventListener('touchend', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
            newItem.remove();
            e.preventDefault();
        }
        lastTap = currentTime;
    });

    container.appendChild(newItem);
}

menuItems.forEach(item => {
    item.addEventListener('mousedown', handleSpawn);
    item.addEventListener('touchstart', handleSpawn, { passive: false });
});

function startDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    dragItem = e.target;
    const event = e.type.includes('touch') ? e.touches[0] : e;
    const rect = dragItem.getBoundingClientRect();
    shiftX = event.clientX - rect.left;
    shiftY = event.clientY - rect.top;
    dragItem.style.zIndex = 1000;
}

const moveHandler = (e) => {
    if (!dragItem) return;
    const event = e.type.includes('touch') ? e.touches[0] : e;
    dragItem.style.left = (event.clientX - shiftX) + 'px';
    dragItem.style.top = (event.clientY - shiftY) + 'px';
};

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