const container = document.querySelector('.game-container');
const items = document.querySelectorAll('.item');

let dragItem = null;
let shiftX, shiftY;

// 아이템 생성 및 이동 로직
items.forEach(item => {
    // 1. 메뉴 아이템을 클릭하거나 터치했을 때 복사본 생성
    const handleStart = (e) => {
        e.preventDefault();
        const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

        const newItem = document.createElement('img');
        newItem.src = item.src;
        newItem.className = 'dropped-item ' + item.classList[1]; // 사이즈 클래스 포함
        
        // 생성 위치를 클릭/터치한 지점으로 설정
        newItem.style.position = 'absolute';
        newItem.style.left = (clientX - item.offsetWidth / 2) + 'px';
        newItem.style.top = (clientY - item.offsetHeight / 2) + 'px';
        newItem.style.zIndex = 1000;

        container.appendChild(newItem);
        dragItem = newItem;

        // 생성 직후 바로 드래그 상태로 전환
        const rect = newItem.getBoundingClientRect();
        shiftX = clientX - rect.left;
        shiftY = clientY - rect.top;

        // 새로 생성된 아이템에도 이동/삭제 이벤트 부여
        newItem.addEventListener('mousedown', startMove);
        newItem.addEventListener('touchstart', startMove, { passive: false });
        newItem.addEventListener('dblclick', () => newItem.remove());
    };

    item.addEventListener('mousedown', handleStart);
    item.addEventListener('touchstart', handleStart, { passive: false });
});

// 2. 이미 배치된 아이템을 다시 잡을 때
function startMove(e) {
    e.preventDefault();
    e.stopPropagation(); // 부모 이벤트 방해 금지
    dragItem = e.target;
    
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

    const rect = dragItem.getBoundingClientRect();
    shiftX = clientX - rect.left;
    shiftY = clientY - rect.top;
    dragItem.style.zIndex = 1000;
}

// 3. 움직임 처리 (전역)
const onMove = (e) => {
    if (!dragItem) return;
    
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

    dragItem.style.left = (clientX - shiftX) + 'px';
    dragItem.style.top = (clientY - shiftY) + 'px';
};

const onEnd = () => {
    if (dragItem) {
        dragItem.style.zIndex = 500;
        dragItem = null;
    }
};

document.addEventListener('mousemove', onMove);
document.addEventListener('touchmove', onMove, { passive: false });
document.addEventListener('mouseup', onEnd);
document.addEventListener('touchend', onEnd);