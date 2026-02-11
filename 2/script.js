const container = document.querySelector('.game-container');
const menuItems = document.querySelectorAll('.menu-item');

let dragItem = null;
let shiftX, shiftY;
let lastTap = 0; // 모바일 더블탭 감지용

// 1. 아이템 생성 (중복 생성 방지 로직 강화)
function handleSpawn(e) {
    e.preventDefault();
    e.stopPropagation(); // 이벤트가 부모로 퍼지는 것 차단 (겹침 방지)

    const target = e.currentTarget;
    const newItem = document.createElement('img');
    newItem.src = target.src;
    newItem.className = 'dropped-item ' + target.classList[1];

    const event = e.type.includes('touch') ? e.touches[0] : e;
    
    // 생성 위치 설정
    newItem.style.left = (event.clientX - 50) + 'px'; // 대략 중앙 배치
    newItem.style.top = (event.clientY - 50) + 'px';

    // 이벤트 연결
    newItem.addEventListener('mousedown', startDrag);
    newItem.addEventListener('touchstart', startDrag, { passive: false });
    
    // PC용 더블클릭 삭제
    newItem.addEventListener('dblclick', () => newItem.remove());
    
    // 모바일 전용 더블탭 삭제 로직
    newItem.addEventListener('touchend', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
            newItem.remove(); // 0.3초 안에 두 번 탭하면 삭제
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

// 2. 드래그 시작
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

// 3. 이동 처리
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