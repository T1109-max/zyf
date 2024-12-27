// 装饰工艺交互系统
class TechniqueSystem {
    constructor() {
        this.canvas = document.getElementById('techniqueCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.selectedTool = null;
        this.selectedColor = '#8B2323';
        this.isDrawing = false;
        
        // 装饰纹样预设
        this.patterns = {
            飞天: '🧚',
            莲花: '🌸',
            忍冬: '🌿',
            云纹: '☁️'
        };

        this.initCanvas();
        this.bindEvents();
        this.setupScratchCards();
        this.setupColorWheel();
    }

    initCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.offsetWidth;
        this.canvas.height = container.offsetHeight;
    }

    bindEvents() {
        // 工具选择
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectTool(btn.dataset.tool));
        });

        // ���色选择
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectedColor = btn.style.background;
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // 画布交互
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseleave', this.stopDrawing.bind(this));
    }

    setupScratchCards() {
        document.querySelectorAll('.scratch-card').forEach(card => {
            const canvas = card.querySelector('.scratch-overlay');
            const ctx = canvas.getContext('2d');
            const pattern = canvas.dataset.pattern;
            
            // 设置刮刮卡尺寸
            canvas.width = card.offsetWidth;
            canvas.height = card.offsetHeight;
            
            // 填充初始颜色
            ctx.fillStyle = '#8B2323';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            let isScratching = false;
            
            // 添加刮��功能
            canvas.addEventListener('mousedown', () => isScratching = true);
            canvas.addEventListener('mouseup', () => isScratching = false);
            canvas.addEventListener('mouseleave', () => isScratching = false);
            
            canvas.addEventListener('mousemove', (e) => {
                if (!isScratching) return;
                
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.arc(x, y, 20, 0, Math.PI * 2);
                ctx.fill();
            });

            // 添加重置按钮
            const resetBtn = document.createElement('button');
            resetBtn.className = 'reset-btn';
            resetBtn.innerHTML = '🔄 重置';
            resetBtn.onclick = () => {
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = '#8B2323';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            };
            card.appendChild(resetBtn);

            // 添加触摸支持
            canvas.addEventListener('touchstart', (e) => {
                isScratching = true;
                e.preventDefault();
            });
            
            canvas.addEventListener('touchend', () => isScratching = false);
            canvas.addEventListener('touchcancel', () => isScratching = false);
            
            canvas.addEventListener('touchmove', (e) => {
                if (!isScratching) return;
                e.preventDefault();
                
                const rect = canvas.getBoundingClientRect();
                const touch = e.touches[0];
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.arc(x, y, 20, 0, Math.PI * 2);
                ctx.fill();
            });
        });
    }

    selectTool(tool) {
        this.selectedTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });
    }

    startDrawing(e) {
        if (!this.selectedTool) return;
        
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
    }

    draw(e) {
        if (!this.isDrawing || !this.selectedTool) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.selectedColor;
        this.ctx.lineWidth = this.selectedTool === 'brush' ? 5 : 10;
        this.ctx.lineCap = 'round';
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        
        this.lastX = x;
        this.lastY = y;
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    setupColorWheel() {
        const wheel = document.querySelector('.color-wheel');
        const segments = document.querySelectorAll('.color-segment');
        let rotation = 0;
        let isDragging = false;
        let startAngle = 0;

        // 设置每个颜色段的初始旋转角度
        segments.forEach((segment, index) => {
            const angle = (360 / segments.length) * index;
            segment.style.setProperty('--rotation', `${angle}deg`);
            segment.style.transform = `rotate(${angle}deg)`;

            // 添加点击事件
            segment.addEventListener('click', (e) => {
                e.stopPropagation();
                const color = segment.dataset.color;
                this.showColorInfo(color, segment);
            });
        });

        // 添加拖拽旋转功能
        wheel.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = wheel.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);
            startAngle = Math.atan2(y, x);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const rect = wheel.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);
            const angle = Math.atan2(y, x);
            const delta = angle - startAngle;
            rotation += delta * (180 / Math.PI);
            startAngle = angle;

            document.querySelector('.color-segments').style.transform = `rotate(${rotation}deg)`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // 添加滚轮旋转功能
        wheel.addEventListener('wheel', (e) => {
            e.preventDefault();
            rotation += e.deltaY > 0 ? 15 : -15;
            document.querySelector('.color-segments').style.transform = `rotate(${rotation}deg)`;
        });
    }

    showColorInfo(color, segment) {
        // 隐藏其他颜色详情
        document.querySelectorAll('.color-detail').forEach(detail => {
            if (detail !== segment.querySelector('.color-detail')) {
                detail.style.opacity = '0';
                detail.style.transform = 'translateY(10px)';
            }
        });

        // 显示/隐藏当前颜色详情
        const detail = segment.querySelector('.color-detail');
        const isVisible = detail.style.opacity === '1';
        
        detail.style.opacity = isVisible ? '0' : '1';
        detail.style.transform = isVisible ? 'translateY(10px)' : 'translateY(0)';
    }
}

// 初始化系统
window.addEventListener('load', () => {
    const technique = new TechniqueSystem();
}); 