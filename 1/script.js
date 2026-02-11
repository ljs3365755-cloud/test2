const items = document.querySelectorAll('.item');
const dropTarget = document.getElementById('drop-target');

items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        // 옷의 정보만 살짝 복사해서 전달합니다.
        e.dataTransfer.setData('itemName', item.alt.toLowerCase());
        e.dataTransfer.setData('itemSrc', item.src);
    });
});

dropTarget.addEventListener('dragover', (e) => {
    e.preventDefault(); // 캐릭터 영역 위로 오면 드롭 허용
});

dropTarget.addEventListener('drop', (e) => {
    e.preventDefault();
    
    const name = e.dataTransfer.getData('itemName');
    const src = e.dataTransfer.getData('itemSrc');

    let targetId = '';
    if (name.includes('hood')) targetId = 'wear-hood';
    else if (name.includes('shirt')) targetId = 'wear-shirt';
    else if (name.includes('pants')) targetId = 'wear-pants';

    if (targetId) {
        const targetLayer = document.getElementById(targetId);
        targetLayer.src = src; // 캐릭터 위 레이어의 주소를 바꿈
        targetLayer.style.display = 'block'; // 옷 보이게 하기
    }
});