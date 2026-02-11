const items = document.querySelectorAll('.item');
const dropTarget = document.getElementById('drop-target');

// 1. 목록에 있는 옷들을 드래그할 때 정보 전달
items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('itemName', item.alt.toLowerCase());
        e.dataTransfer.setData('itemSrc', item.src);
    });
});

// 2. 캐릭터 구역에 드롭 허용
dropTarget.addEventListener('dragover', (e) => {
    e.preventDefault();
});

// 3. 옷을 캐릭터에게 드롭했을 때 (입히기)
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
        targetLayer.src = src;
        targetLayer.style.display = 'block';
    }
});

// 4. [핵심] 캐릭터가 입고 있는 옷을 클릭하면 다시 제자리로 (벗기기)
document.querySelectorAll('.layered-item').forEach(layer => {
    layer.addEventListener('click', () => {
        layer.style.display = 'none'; // 레이어를 숨겨서 원래 자리로 돌아간 것처럼 보임
        layer.src = ""; // 이미지 경로 초기화
    });
});
items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('itemName', item.alt.toLowerCase());
        e.dataTransfer.setData('itemSrc', item.src);
        // [추가] 선택한 바지의 고유 클래스명을 전달합니다
        e.dataTransfer.setData('itemClass', item.className); 
    });
});

dropTarget.addEventListener('drop', (e) => {
    e.preventDefault();
    const name = e.dataTransfer.getData('itemName');
    const src = e.dataTransfer.getData('itemSrc');
    const className = e.dataTransfer.getData('itemClass'); // [추가]

    let targetId = '';
    if (name.includes('hood')) targetId = 'wear-hood';
    else if (name.includes('shirt')) targetId = 'wear-shirt';
    else if (name.includes('pants')) targetId = 'wear-pants';

    if (targetId) {
        const targetLayer = document.getElementById(targetId);
        targetLayer.src = src;
        // [추가] 기존 클래스를 지우고 새로 선택한 바지의 클래스를 입힙니다
        targetLayer.className = 'layered-item ' + className.replace('item', '').trim();
        targetLayer.style.display = 'block';
    }
});