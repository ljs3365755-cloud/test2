const items = document.querySelectorAll('.item');
const dropTarget = document.getElementById('drop-target');

// 1. 드래그 시작: 어떤 옷을 잡았는지 정보를 담습니다.
items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        // 옷의 이름(alt)과 이미지 경로(src)를 전달
        e.dataTransfer.setData('itemName', item.alt.toLowerCase());
        e.dataTransfer.setData('itemSrc', item.src);
    });
});

// 2. 캐릭터 영역 위에 있을 때: 드롭이 가능하도록 설정
dropTarget.addEventListener('dragover', (e) => {
    e.preventDefault(); // 중요: 이걸 안 하면 드롭이 안 됩니다.
});

// 3. 캐릭터 영역에 옷을 놓았을 때: 옷을 입힙니다.
dropTarget.addEventListener('drop', (e) => {
    e.preventDefault();
    
    const name = e.dataTransfer.getData('itemName');
    const src = e.dataTransfer.getData('itemSrc');

    // 파일 이름에 포함된 단어로 어떤 부위인지 확인
    let targetId = '';
    if (name.includes('hood')) {
        targetId = 'wear-hood';
    } else if (name.includes('shirt')) {
        targetId = 'wear-shirt';
    } else if (name.includes('pants')) {
        targetId = 'wear-pants';
    }

    // 해당 부위 레이어에 이미지 적용
    if (targetId) {
        const targetLayer = document.getElementById(targetId);
        targetLayer.src = src;
    }
});