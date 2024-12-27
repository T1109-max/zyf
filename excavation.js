class ExcavationSimulator {
    constructor() {
        this.canvas = document.getElementById('excavationCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.selectedTool = null;
        this.isDrawing = false;
        
        this.tools = {
            chisel: { name: '錾子', size: 10 },
            hammer: { name: '锤子', size: 20 },
            measure: { name: '测量', size: 2 }
        };

        this.initCanvas();
        this.bindEvents();
        this.setupQuiz();
    }

    initCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.drawInitialRock();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.offsetWidth - 100;
        this.canvas.height = 400;
    }

    drawInitialRock() {
        // 绘制岩壁背景
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 添加岩石纹理
        this.ctx.strokeStyle = '#654321';
        for (let i = 0; i < 50; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(Math.random() * this.canvas.width, Math.random() * this.canvas.height);
            this.ctx.lineTo(Math.random() * this.canvas.width, Math.random() * this.canvas.height);
            this.ctx.stroke();
        }
    }

    bindEvents() {
        // 工具选择
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectTool(btn.dataset.tool));
        });

        // 画布交互
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseleave', this.stopDrawing.bind(this));
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
        
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.tools[this.selectedTool].size, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.lastX = x;
        this.lastY = y;
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    setupQuiz() {
        const quizContainer = document.querySelector('.quiz-container');
        const questions = [
            {
                question: "古代工匠是如何确定开凿位置的？",
                options: [
                    { text: "根据岩层结构和朝向", correct: true },
                    { text: "随机选择", correct: false },
                    { text: "按照风水", correct: false }
                ]
            },
            {
                question: "开凿石窟的正确顺序是什么？",
                options: [
                    { text: "从下到上", correct: false },
                    { text: "从上到下", correct: true },
                    { text: "从中间开始", correct: false }
                ]
            }
        ];

        let currentQuestion = 0;
        this.renderQuestion(questions[currentQuestion], quizContainer);
    }

    renderQuestion(question, container) {
        container.innerHTML = `
            <div class="quiz-question">
                <p>${question.question}</p>
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <button class="quiz-option" data-correct="${option.correct}">
                            ${option.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        container.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const isCorrect = btn.dataset.correct === 'true';
                btn.classList.add(isCorrect ? 'correct' : 'wrong');
                setTimeout(() => this.showFeedback(isCorrect), 500);
            });
        });
    }

    showFeedback(isCorrect) {
        const feedback = document.createElement('div');
        feedback.className = 'quiz-feedback';
        feedback.textContent = isCorrect ? '回答正确！' : '再想想看！';
        document.querySelector('.quiz-container').appendChild(feedback);
    }
}

// 初始化系统
window.addEventListener('load', () => {
    const simulator = new ExcavationSimulator();
}); 