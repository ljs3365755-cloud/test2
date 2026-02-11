const items = document.querySelectorAll('.item');
const dropTarget = document.getElementById('drop-target');

items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        // 아이템의 이미지 경로와 타입을 저장 (data-type 속성 활용 권장)
        e.dataTransfer.setData('src', e.target.src);
        e.dataTransfer.setData('alt', e.target.alt);
    });
});

dropTarget.addEventListener('dragover', (e) => e.preventDefault());

dropTarget.addEventListener('drop', (e) => {
    e.preventDefault();
    const imgSrc = e.dataTransfer.getData('src');
    const itemAlt = e.dataTransfer.getData('alt');

    let targetLayer;

    // 아이템 이름에 따라 입힐 위치를 결정 (세밀하게 분류 가능)
    if (itemAlt.includes('hat') || itemAlt.includes('pin')) {
        targetLayer = document.getElementById('wear-head');
    } else if (itemAlt.includes('reborn') || itemAlt.includes('fur')) {
        targetLayer = document.getElementById('wear-body');
    } else {
        targetLayer = document.getElementById('wear-acc');
    }

    if (targetLayer) {
        targetLayer.src = imgSrc;
        targetLayer.style.display = 'block';
    }
});