const items = document.querySelectorAll('.item');
const dropTarget = document.getElementById('drop-target');

items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        // 어떤 옷을 잡았는지 정보(id, src) 전달
        e.dataTransfer.setData('itemName', item.alt.toLowerCase());
        e.dataTransfer.setData('itemSrc', item.src);
    });
});

dropTarget.addEventListener('dragover', (e) => {
    e.preventDefault(); // 드롭 허용
});

dropTarget.addEventListener('drop', (e) => {
    e.preventDefault();
    
    const name = e.dataTransfer.getData('itemName');
    const src = e.dataTransfer.getData('itemSrc');

    let targetId = '';
    // 이름에 따라 어떤 레이어에 입힐지 결정
    if (name.includes('hood')) targetId = 'wear-hood';
    else if (name.includes('shirt')) targetId = 'wear-shirt';
    else if (name.includes('pants')) targetId = 'wear-pants';

    if (targetId) {
        const targetLayer = document.getElementById(targetId);
        targetLayer.src = src; // 캐릭터 위 레이어의 이미지만 바꿈
        targetLayer.style.display = 'block';
    }
});