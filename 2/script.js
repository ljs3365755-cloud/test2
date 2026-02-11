const items = document.querySelectorAll('.item');
const container = document.querySelector('.game-container');

// 1. 드래그 시작 시 아이템 정보 저장
items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('imgSrc', e.target.src);
        e.dataTransfer.setData('offsetX', e.offsetX);
        e.dataTransfer.setData('offsetY', e.offsetY);
    });
});

// 2. 드롭 허용
container.addEventListener('dragover', (e) => {
    e.preventDefault();
});

// 3. 드롭했을 때 자유 좌표에 아이템 생성 (자유롭게 배치)
container.addEventListener('drop', (e) => {
    e.preventDefault();
    
    const imgSrc = e.dataTransfer.getData('imgSrc');
    const offsetX = e.dataTransfer.getData('offsetX');
    const offsetY = e.dataTransfer.getData('offsetY');

    // 새로운 이미지 엘리먼트 생성 (복사본 생성으로 2번 문제 해결)
    const newItem = document.createElement('img');
    newItem.src = imgSrc;
    newItem.classList.add('dropped-item');
    
    // 마우스 위치에서 클릭 지점을 보정하여 정확한 위치에 드롭 (3번 문제 해결)
    newItem.style.left = (e.clientX - offsetX) + 'px';
    newItem.style.top = (e.clientY - offsetY) + 'px';
    newItem.style.width = "100px"; // 필요시 크기 조절

    // 우클릭하면 삭제되는 기능 (선택 사항)
    newItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        newItem.remove();
    });

    container.appendChild(newItem);
});