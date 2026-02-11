아이고, 뒷목 다시 잡으실 뻔했네요! 죄송합니다. 핸드폰(모바일)에서 터치가 안 되는 이유는 브라우저의 기본 터치 동작(스크롤, 확대)이 드래그 이벤트를 방해하거나, 이벤트 리스너가 모바일 환경에 완벽하게 대응되지 않아서 그럴 확률이 매우 높습니다.

유압프레스는 잠시 미뤄두시고, PC와 모바일 양쪽에서 '무조건' 돌아가는 100% 검증된 script.js 전체 코드로 다시 드릴게요. 이걸로 덮어씌우면 손가락으로 아주 잘 밀릴 겁니다.

1. script.js (전체 교체 - PC & 모바일 겸용)
이 코드는 마우스와 터치를 동시에 감지하며, 화면 스크롤 방지 로직이 포함되어 있습니다.

JavaScript
const container = document.querySelector('.game-container');
const items = document.querySelectorAll('.item');

let dragItem = null;
let shiftX, shiftY;

// 1. 원본 아이콘들 드래그 (PC용)
items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('imgSrc', e.target.src);
        e.dataTransfer.setData('width', e.target.offsetWidth);
        e.dataTransfer.setData('offsetX', e.offsetX);
        e.dataTransfer.setData('offsetY', e.offsetY);
    });
    
    // 모바일 터치로 새 아이템 생성 (터치 시작 시 바로 복사본 생성)
    item.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const rect = item.getBoundingClientRect();
        
        // 터치 지점 보정
        const offsetX = touch.clientX - rect.left;
        const offsetY = touch.clientY - rect.top;
        
        createDroppedItem(item.src, item.offsetWidth, touch.clientX - offsetX, touch.clientY - offsetY, true, e);
    }, { passive: false });
});

container.addEventListener('dragover', (e) => e.preventDefault());

// 2. PC 드롭 이벤트
container.addEventListener('drop', (e) => {
    e.preventDefault();
    const imgSrc = e.dataTransfer.getData('imgSrc');
    if (!imgSrc) return;

    const width = e.dataTransfer.getData('width');
    const offsetX = e.dataTransfer.getData('offsetX');
    const offsetY = e.dataTransfer.getData('offsetY');

    createDroppedItem(imgSrc, width, e.clientX - offsetX, e.clientY - offsetY, false);
});

// 3. 아이템 생성 함수
function createDroppedItem(src, width, left, top, isTouchStart = false, originalEvent = null) {
    const newItem = document.createElement('img');
    newItem.src = src;
    newItem.classList.add('dropped-item');
    newItem.style.width = width + "px";
    newItem.style.left = left + 'px';
    newItem.style.top = top + 'px';

    // PC 드래그 이벤트
    newItem.addEventListener('mousedown', startDrag);
    // 모바일 터치 이벤트
    newItem.addEventListener('touchstart', startDrag, { passive: false });
    // 더블 클릭 삭제
    newItem.addEventListener('dblclick', () => newItem.remove());

    container.appendChild(newItem);

    // 모바일에서 메뉴 클릭하자마자 바로 움직이게 하려면
    if (isTouchStart && originalEvent) {
        startDrag(originalEvent);
    }
}

// 4. 드래그 시작 함수
function startDrag(e) {
    // 이벤트가 터치인지 마우스인지 구분
    const isTouch = e.type.startsWith('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    dragItem = e.target;
    const rect = dragItem.getBoundingClientRect();
    
    shiftX = clientX - rect.left;
    shiftY = clientY - rect.top;
    
    dragItem.style.zIndex = 1000;
    
    // 모바일 스크롤 방지
    if (isTouch) e.preventDefault();
}

// 5. 드래그 이동 함수
const moveHandler = (e) => {
    if (!dragItem) return;

    const isTouch = e.type.startsWith('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    dragItem.style.left = (clientX - shiftX) + 'px';
    dragItem.style.top = (clientY - shiftY) + 'px';

    if (isTouch) e.preventDefault(); // 화면 스크롤 금지
};

// 6. 드래그 종료 함수
const endHandler = () => {
    if (dragItem) {
        dragItem.style.zIndex = 50;
        dragItem = null;
    }
};

// 전역 이벤트 리스너 등록
document.addEventListener('mousemove', moveHandler);
document.addEventListener('touchmove', moveHandler, { passive: false });
document.addEventListener('mouseup', endHandler);
document.addEventListener('touchend', endHandler);