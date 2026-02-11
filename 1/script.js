// 나중에 옷을 클릭해서 캐릭터에게 입히는 기능을 여기에 작성합니다.
document.querySelectorAll('.item').forEach(item => {
    item.addEventListener('click', () => {
        console.log(item.alt + " 선택됨!");
        // 여기에 캐릭터 이미지 위에 옷을 겹치는 로직을 추가할 수 있습니다.
    });
});