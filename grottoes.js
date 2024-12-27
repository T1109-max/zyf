// 石窟页面交互逻辑
document.addEventListener('DOMContentLoaded', () => {
    // 为所有工艺卡片添加点击事件
    document.querySelectorAll('.grotto-card').forEach(card => {
        card.addEventListener('click', () => {
            const section = card.dataset.section;
            console.log('Clicked section:', section); // 添加调试信息
            
            switch(section) {
                case 'excavation':
                    window.location.href = 'excavation.html';
                    break;
                case 'decoration':
                    window.location.href = 'technique.html';
                    break;
                case 'support':
                    window.location.href = 'support.html';
                    break;
            }
        });
    });
}); 