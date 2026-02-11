모바일이 완벽하게 해결되었다니 정말 다행입니다! 이제 마지막 관문인 PC 마우스 드래그만 확실하게 뚫어버리면 되겠네요.

보여주신 캡처 화면을 보니, 현재 아이템들이 하단 바에 가려져 있거나 PC 브라우저가 아이템을 '파일 드래그'로 오해해서 이동을 막고 있는 상황입니다.

PC에서도 모바일만큼 쫀득하게 움직이도록 **script.js**를 최종적으로 보강했습니다. 기존 코드를 싹 비우고 이 버전으로 갈아 끼워주세요.

🛠️ 최종 통합 script.js (PC 드래그 완벽 보정)
JavaScript
const container = document.querySelector('.game-container');
const menuItems = document.querySelectorAll('.menu-item');
let dragItem = null;
let shiftX, shiftY;
let lastTap = 0;

// 1. 아이템 생성 함수
function spawn(e) {
    // 이벤트 전파 방지
    e.stopPropagation();

    const target = e.currentTarget;
    const newItem = document.createElement('img');
    newItem.src = target.src;
    
    // 사이즈 클래스 상속
    const sizeClass = Array.from(target.classList).find(c => c.startsWith('size-'));
    newItem.className = 'dropped-item ' + (sizeClass || '');
    
    // 초기 생성 위치 (중앙 근처)
    newItem.style.left = '50%';
    newItem.style.top = '40%';
    newItem.style.transform = 'translate(-50%, -50%)';

    // 배치된 아이템 이벤트 부여 (PC + 모바일)
    newItem.addEventListener('mousedown', startDrag);
    newItem.addEventListener('touchstart', startDrag, { passive: false });
    newItem.addEventListener('dblclick', () => newItem.remove());
    
    // 모바일 더블탭 삭제
    newItem.addEventListener('touchend', (te) => {
        const now = Date.now();
        if (now - lastTap < 300) {
            newItem.remove();
            te.preventDefault();
        }
        lastTap = now;
    });

    container.appendChild(newItem);
}

// 2. 메뉴 아이템 클릭 이벤트 (PC/모바일 통합)
menuItems.forEach(item => {
    // 브라우저 기본 드래그 기능 원천 차단 (PC에서 안 움직이는 주범)
    item.addEventListener('dragstart', (e) => e.preventDefault());
    
    // 클릭(PC) 또는 탭(모바일) 시 생성
    item.addEventListener('click', spawn);
});

// 3. 드래그 시작 로직
function startDrag(e) {
    // PC 브라우저가 이미지를 파일처럼 드래그하려는 기능 차단
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    
    dragItem = e.target;
    dragItem.style.transform = 'none'; // 잡는 순간 중앙 정렬 해제
    
    const event = e.type.includes('touch') ? e.touches[0] : e;
    const rect = dragItem.getBoundingClientRect();
    
    // 마우스/손가락이 아이템의 어느 지점을 잡았는지 계산
    shiftX = event.clientX - rect.left;
    shiftY = event.clientY - rect.top;
    
    dragItem.style.zIndex = 2000;
}

// 4. 드래그 이동 (전역 감지)
const moveHandler = (e) => {
    if (!dragItem) return;
    
    // PC에서 텍스트 드래그 등이 발생하지 않도록 차단
    if (e.cancelable) e.preventDefault(); 
    
    const event = e.type.includes('touch') ? e.touches[0] : e;
    
    dragItem.style.left = (event.clientX - shiftX) + 'px';
    dragItem.style.top = (event.clientY - shiftY) + 'px';
};

// 5. 드래그 종료
const stopDrag = () => {
    if (dragItem) {
        dragItem.style.zIndex = 500;
        dragItem = null;
    }
};

// 마우스와 터치 이벤트 각각 등록
document.addEventListener('mousemove', moveHandler);
document.addEventListener('touchmove', moveHandler, { passive: false });
document.addEventListener('mouseup', stopDrag);
document.addEventListener('touchend', stopDrag);