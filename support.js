// 支护模拟器类
class SupportSimulator {
    constructor() {
        this.canvas = document.getElementById('supportSimulation');
        this.ctx = this.canvas.getContext('2d');
        this.isSimulating = false;
        this.supports = [];
        this.selectedTool = null;
        this.isDragging = false;
        this.draggedSupport = null;
        this.stability = 0;
        this.load = 0;
        this.pressurePoints = [];
        this.showGrid = true;
        this.gridSize = 20;

        // 工具配置
        this.tools = {
            pillar: { name: '石柱', icon: '🏛️', maxCount: 5 },
            beam: { name: '横梁', icon: '🪵', maxCount: 3 },
            brace: { name: '斜撑', icon: '📏', maxCount: 4 }
        };

        // 初始化资源数量
        this.resources = {};
        Object.keys(this.tools).forEach(tool => {
            this.resources[tool] = this.tools[tool].maxCount;
        });

        this.initCanvas();
        this.setupTools();
        this.bindEvents();
        this.generatePressurePoints();
        this.drawAll();
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

    setupTools() {
        const toolsContainer = document.createElement('div');
        toolsContainer.className = 'simulation-tools';
        
        Object.entries(this.tools).forEach(([type, config]) => {
            const toolItem = document.createElement('div');
            toolItem.className = 'tool-item';
            toolItem.dataset.tool = type;
            toolItem.innerHTML = `
                <span class="tool-icon">${config.icon}</span>
                <span class="tool-name">${config.name}</span>
                <span class="tool-count">x${this.resources[type]}</span>
            `;
            toolsContainer.appendChild(toolItem);
        });

        this.canvas.parentElement.appendChild(toolsContainer);
    }

    bindEvents() {
        // 工具选择
        document.querySelectorAll('.tool-item').forEach(tool => {
            tool.addEventListener('click', () => this.selectTool(tool.dataset.tool));
        });

        // 画布交互
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));

        // 控制按钮
        document.querySelector('[data-action="test"]').addEventListener('click', () => this.testStructure());
        document.querySelector('[data-action="reset"]').addEventListener('click', () => this.reset());

        // 跟踪鼠标位置
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            this.draw();
        });

        // 难度选择
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const level = parseInt(btn.dataset.level);
                this.level = level;
                this.loadLevel(level);
            });
        });
    }

    selectTool(tool) {
        if (this.resources[tool] > 0) {
            this.selectedTool = tool;
            document.querySelectorAll('.tool-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
        } else {
            this.showMessage('该工具已用完！');
        }
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const clickedSupport = this.supports.find(s => {
            const dx = x - s.x;
            const dy = y - s.y;
            return Math.sqrt(dx * dx + dy * dy) < s.radius;
        });

        if (clickedSupport) {
            this.isDragging = true;
            this.draggedSupport = clickedSupport;
        } else if (this.selectedTool && this.resources[this.selectedTool] > 0) {
            this.placeSupport(x, y);
        }
    }

    placeSupport(x, y) {
        const support = {
            x,
            y,
            type: this.selectedTool,
            radius: this.selectedTool === 'pillar' ? 30 : 25,
            angle: 0,
            health: 100
        };

        this.supports.push(support);
        this.resources[this.selectedTool]--;
        this.updateToolCount(this.selectedTool);
        this.calculateStability();
        this.drawAll();
    }

    updateToolCount(tool) {
        const toolElement = document.querySelector(`[data-tool="${tool}"] .tool-count`);
        if (toolElement) {
            toolElement.textContent = `x${this.resources[tool]}`;
        }
    }

    drawAll() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.showGrid) {
            this.drawGrid();
        }
        
        this.drawCave();
        this.drawPressurePoints();
        this.supports.forEach(support => this.drawSupport(support));
        
        if (this.selectedTool && !this.isDragging) {
            this.drawGhostSupport(this.mousePos);
        }
    }

    drawCave() {
        // 绘制洞窟背景
        this.ctx.fillStyle = '#F5DEB3';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制洞窟轮廓
        this.ctx.strokeStyle = '#8B2323';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(50, 50);
        this.ctx.lineTo(this.canvas.width - 50, 50);
        this.ctx.lineTo(this.canvas.width - 50, this.canvas.height - 50);
        this.ctx.lineTo(50, this.canvas.height - 50);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    drawPressurePoints() {
        this.ctx.fillStyle = 'rgba(139, 35, 35, 0.2)';
        this.pressurePoints.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 20, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawSupport(support) {
        this.ctx.save();
        this.ctx.translate(support.x, support.y);
        this.ctx.rotate(support.angle);

        switch (support.type) {
            case 'pillar':
                this.drawPillar();
                break;
            case 'beam':
                this.drawBeam();
                break;
            case 'brace':
                this.drawBrace();
                break;
        }
        this.ctx.restore();
    }

    drawGhostSupport(pos) {
        if (!pos) return;
        
        this.ctx.globalAlpha = 0.5;
        this.drawSupport({
            x: pos.x,
            y: pos.y,
            type: this.selectedTool,
            angle: 0
        });
        this.ctx.globalAlpha = 1;
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        if (this.isDragging && this.draggedSupport) {
            this.draggedSupport.x = this.mousePos.x;
            this.draggedSupport.y = this.mousePos.y;
        }

        this.drawAll();
    }

    handleMouseUp() {
        if (this.isDragging) {
            this.calculateStability();
        }
        this.isDragging = false;
        this.draggedSupport = null;
    }

    handleWheel(e) {
        if (this.draggedSupport) {
            e.preventDefault();
            this.draggedSupport.angle += e.deltaY > 0 ? 0.1 : -0.1;
            this.drawAll();
        }
    }

    testStructure() {
        this.isSimulating = true;
        let testDuration = 3000; // 3秒测试
        let startTime = Date.now();
        
        const simulate = () => {
            const progress = (Date.now() - startTime) / testDuration;
            
            if (progress >= 1) {
                this.isSimulating = false;
                this.showTestResults();
                return;
            }

            this.applyPressure(progress);
            this.drawAll();
            requestAnimationFrame(simulate);
        };

        simulate();
    }

    showTestResults() {
        const stability = this.calculateStability();
        const message = stability >= 0.7 
            ? `测试通过！稳定性：${Math.round(stability * 100)}%` 
            : `结构不稳定，需要改进。稳定性：${Math.round(stability * 100)}%`;
        
        this.showMessage(message);
    }

    showMessage(text) {
        const message = document.createElement('div');
        message.className = 'simulation-message';
        message.textContent = text;
        this.canvas.parentElement.appendChild(message);
        
        setTimeout(() => message.remove(), 3000);
    }

    reset() {
        this.supports = [];
        Object.keys(this.tools).forEach(tool => {
            this.resources[tool] = this.tools[tool].maxCount;
            this.updateToolCount(tool);
        });
        this.selectedTool = null;
        this.stability = 0;
        this.load = 0;
        document.querySelectorAll('.tool-item').forEach(item => item.classList.remove('active'));
        this.drawAll();
    }

    drawPillar() {
        this.ctx.fillStyle = '#8B2323';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        
        // 绘制柱身
        this.ctx.beginPath();
        this.ctx.rect(-15, -30, 30, 60);
        this.ctx.fill();
        this.ctx.stroke();
        
        // 绘制装饰
        this.ctx.fillStyle = '#D4574E';
        this.ctx.beginPath();
        this.ctx.rect(-20, -35, 40, 10);
        this.ctx.rect(-20, 25, 40, 10);
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawBeam() {
        this.ctx.fillStyle = '#8B2323';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        
        // 绘制横梁
        this.ctx.beginPath();
        this.ctx.rect(-40, -10, 80, 20);
        this.ctx.fill();
        this.ctx.stroke();
        
        // 绘制加固部分
        this.ctx.fillStyle = '#D4574E';
        this.ctx.beginPath();
        this.ctx.moveTo(-45, 0);
        this.ctx.lineTo(-35, -15);
        this.ctx.lineTo(-25, 0);
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(25, 0);
        this.ctx.lineTo(35, -15);
        this.ctx.lineTo(45, 0);
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawBrace() {
        this.ctx.fillStyle = '#8B2323';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        
        // 绘制斜撑
        this.ctx.save();
        this.ctx.rotate(Math.PI / 4);
        this.ctx.beginPath();
        this.ctx.rect(-35, -10, 70, 20);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
    }

    generatePressurePoints() {
        this.pressurePoints = [];
        const numPoints = 5;
        
        // 生成顶部压力点
        for (let i = 0; i < numPoints; i++) {
            const x = 100 + (this.canvas.width - 200) * (i / (numPoints - 1));
            this.pressurePoints.push({
                x: x,
                y: 70,
                pressure: 100
            });
        }
        
        // 生成侧面压力点
        for (let i = 1; i < numPoints - 1; i++) {
            const y = 70 + (this.canvas.height - 140) * (i / (numPoints - 1));
            this.pressurePoints.push({
                x: 70,
                y: y,
                pressure: 80
            });
            this.pressurePoints.push({
                x: this.canvas.width - 70,
                y: y,
                pressure: 80
            });
        }
    }

    calculateStability() {
        if (this.supports.length === 0) return 0;

        let totalStability = 0;
        let coveredPressurePoints = 0;

        this.pressurePoints.forEach(point => {
            let pointCovered = false;
            let minDistance = Infinity;

            this.supports.forEach(support => {
                const dx = point.x - support.x;
                const dy = point.y - support.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < support.radius + 30) {
                    pointCovered = true;
                    minDistance = Math.min(minDistance, distance);
                }
            });

            if (pointCovered) {
                coveredPressurePoints++;
                totalStability += 1 - (minDistance / (support.radius + 30));
            }
        });

        return totalStability / this.pressurePoints.length;
    }

    applyPressure(progress) {
        this.supports.forEach(support => {
            let totalPressure = 0;
            
            this.pressurePoints.forEach(point => {
                const dx = point.x - support.x;
                const dy = point.y - support.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < support.radius + 50) {
                    totalPressure += (point.pressure * progress) / (distance + 1);
                }
            });
            
            support.health = Math.max(0, support.health - totalPressure * 0.01);
        });
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(139, 35, 35, 0.1)';
        this.ctx.lineWidth = 1;

        for (let x = 0; x < this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
}

// 知识问答类
class QuizSystem {
    constructor() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.questions = [
            {
                question: "古代工匠是如何确保大型洞窟顶部不会塌陷的？",
                options: [
                    { text: "使用多层支撑系统", correct: true, explanation: "古代工匠通过科学的多层支撑系统，合理分散顶部压力。" },
                    { text: "纯粹靠岩石强度", correct: false, explanation: "仅靠岩石强度无法确保长期稳定性。" },
                    { text: "采用现代钢筋", correct: false, explanation: "古代并没有现代钢筋技术。" }
                ]
            },
            {
                question: "莫高窟石窟支护中最常用的临时支护材料是什么？",
                options: [
                    { text: "钢筋混凝土", correct: false, explanation: "这是现代材料。" },
                    { text: "木材和竹篾", correct: true, explanation: "木材和竹篾具有良好的弹性和承重能力，是理想的临时支护材料。" },
                    { text: "塑料支架", correct: false, explanation: "古代没有塑料材料。" }
                ]
            }
        ];

        this.initQuiz();
        this.bindEvents();
    }

    initQuiz() {
        const quizContainer = document.querySelector('.quiz-container');
        this.renderQuestion();
    }

    renderQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        const quizContainer = document.querySelector('.quiz-container');
        
        quizContainer.innerHTML = `
            <div class="quiz-progress">
                <span>问题 ${this.currentQuestionIndex + 1}/${this.questions.length}</span>
                <span>得分：${this.score}</span>
            </div>
            <div class="quiz-content">
                <p class="quiz-question">${question.question}</p>
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <button class="quiz-option" data-correct="${option.correct}">
                            <span class="option-marker">${String.fromCharCode(65 + index)}</span>
                            <span class="option-text">${option.text}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        this.bindOptionEvents();
    }

    bindOptionEvents() {
        const options = document.querySelectorAll('.quiz-option');
        options.forEach(option => {
            option.addEventListener('click', () => this.handleAnswer(option));
        });
    }

    handleAnswer(selectedOption) {
        if (selectedOption.classList.contains('answered')) return;

        const options = document.querySelectorAll('.quiz-option');
        options.forEach(opt => opt.classList.add('answered'));

        const isCorrect = selectedOption.dataset.correct === 'true';
        selectedOption.classList.add(isCorrect ? 'correct' : 'wrong');

        if (isCorrect) {
            this.score += 20;
        }

        // 显示正确答案和解释
        const question = this.questions[this.currentQuestionIndex];
        const explanation = document.createElement('div');
        explanation.className = 'quiz-explanation';
        explanation.innerHTML = `
            <div class="explanation-content">
                <h4>${isCorrect ? '回答正确！' : '回答错误'}</h4>
                <p>${question.options.find(opt => opt.correct).explanation}</p>
                ${this.currentQuestionIndex < this.questions.length - 1 ? 
                    '<button class="next-question">下一题</button>' :
                    '<button class="show-results">查看结果</button>'}
            </div>
        `;

        document.querySelector('.quiz-content').appendChild(explanation);

        // 绑定下一题或显示结果按钮事件
        const button = explanation.querySelector('button');
        button.addEventListener('click', () => {
            if (this.currentQuestionIndex < this.questions.length - 1) {
                this.currentQuestionIndex++;
                this.renderQuestion();
            } else {
                this.showResults();
            }
        });
    }

    showResults() {
        const quizContainer = document.querySelector('.quiz-container');
        const percentage = (this.score / (this.questions.length * 20)) * 100;
        
        quizContainer.innerHTML = `
            <div class="quiz-results">
                <h3>测试完成！</h3>
                <div class="score-circle">
                    <span class="score-number">${this.score}</span>
                    <span class="score-label">分</span>
                </div>
                <div class="score-analysis">
                    <p>${this.getScoreAnalysis(percentage)}</p>
                </div>
                <button class="restart-quiz">重新测试</button>
            </div>
        `;

        document.querySelector('.restart-quiz').addEventListener('click', () => {
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.renderQuestion();
        });
    }

    getScoreAnalysis(percentage) {
        if (percentage === 100) return "太棒了！你是支护工艺的专家！";
        if (percentage >= 80) return "很好！你对支护工艺有很深的理解。";
        if (percentage >= 60) return "不错！但还有提升空间。";
        return "建议重新学习支护知识。";
    }
}

// 支护挑战游戏类
class SupportGame {
    constructor() {
        this.canvas = document.getElementById('supportGame');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'ready';
        this.score = 0;
        this.level = 1;
        this.timeLeft = 60;
        this.supports = [];
        this.cracks = [];
        this.selectedTool = 'support'; // 默认选择支撑工具
        this.isDragging = false;
        this.draggedSupport = null;
        this.mousePos = null;

        // 游戏配置
        this.levelConfig = {
            1: { name: "初级", cracks: 3, time: 60, supports: 5, reinforces: 3, crackSpeed: 0.1 },
            2: { name: "中级", cracks: 5, time: 50, supports: 4, reinforces: 2, crackSpeed: 0.15 },
            3: { name: "高级", cracks: 7, time: 45, supports: 3, reinforces: 2, crackSpeed: 0.2 }
        };

        this.resources = {
            support: 5,
            reinforce: 3
        };

        this.initGame();
        this.bindEvents();
    }

    initGame() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.loadLevel(this.level);
        
        // 初始化工具选择
        document.querySelector('[data-tool="support"]').classList.add('active');
        
        // 禁用暂停按钮
        document.getElementById('pauseGame').disabled = true;
    }

    bindEvents() {
        // 游戏控制按钮
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('pauseGame').addEventListener('click', () => this.togglePause());
        document.getElementById('restartGame').addEventListener('click', () => this.restartGame());

        // 难度选择
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.level = parseInt(btn.dataset.level);
                this.loadLevel(this.level);
            });
        });

        // 工具选择
        document.querySelectorAll('.game-tools .tool-item').forEach(tool => {
            tool.addEventListener('click', () => {
                if (this.gameState === 'playing' && this.resources[tool.dataset.tool] > 0) {
                    document.querySelectorAll('.game-tools .tool-item').forEach(t => t.classList.remove('active'));
                    tool.classList.add('active');
                    this.selectedTool = tool.dataset.tool;
                }
            });
        });

        // 画布交互
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    }

    startGame() {
        if (this.gameState === 'ready' || this.gameState === 'over') {
            this.gameState = 'playing';
            this.startGameLoop();
            this.startTimer();
            document.getElementById('startGame').disabled = true;
            document.getElementById('pauseGame').disabled = false;
        }
    }

    startGameLoop() {
        this.gameLoop = setInterval(() => {
            if (this.gameState === 'playing') {
                this.update();
                this.draw();
            }
        }, 1000 / 60);
    }

    startTimer() {
        this.timer = setInterval(() => {
            if (this.gameState === 'playing') {
                if (this.timeLeft > 0) {
                    this.timeLeft--;
                    if (this.timeLeft <= 10) {
                        document.getElementById('gameTimer').classList.add('warning');
                    }
                } else {
                    this.endGame('timeout');
                }
                this.updateUI();
            }
        }, 1000);
    }

    update() {
        // 更新裂缝状态
        let allProtected = true;
        this.cracks.forEach(crack => {
            if (!crack.isProtected) {
                crack.size += this.levelConfig[this.level].crackSpeed;
                allProtected = false;
                if (crack.size > 50) {
                    this.endGame('damage');
                }
            }
        });

        // 检查是否完成关卡
        if (allProtected) {
            this.endGame('complete');
        }

        // 更新得分
        this.score = this.calculateScore();
        this.updateUI();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCave();
        this.drawCracks();
        this.drawSupports();
        
        // 绘制预览
        if (this.selectedTool && this.gameState === 'playing' && !this.isDragging && this.mousePos) {
            this.drawSupportPreview();
        }
    }

    drawCave() {
        // 绘制洞窟背景和轮廓
        this.ctx.fillStyle = '#F5DEB3';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = '#8B2323';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(50, 50);
        this.ctx.lineTo(this.canvas.width - 50, 50);
        this.ctx.lineTo(this.canvas.width - 50, this.canvas.height - 50);
        this.ctx.lineTo(50, this.canvas.height - 50);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    drawCracks() {
        this.cracks.forEach(crack => {
            this.ctx.beginPath();
            this.ctx.fillStyle = crack.isProtected ? 'rgba(40, 167, 69, 0.3)' : 'rgba(220, 53, 69, 0.3)';
            this.ctx.arc(crack.x, crack.y, crack.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 绘制裂缝纹理
            this.ctx.strokeStyle = crack.isProtected ? '#28a745' : '#dc3545';
            this.ctx.lineWidth = 2;
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI / 2) * i;
                this.ctx.beginPath();
                this.ctx.moveTo(crack.x, crack.y);
                this.ctx.lineTo(
                    crack.x + Math.cos(angle) * crack.size,
                    crack.y + Math.sin(angle) * crack.size
                );
                this.ctx.stroke();
            }
        });
    }

    drawSupports() {
        this.supports.forEach(support => {
            this.ctx.fillStyle = '#8B2323';
            this.ctx.beginPath();
            this.ctx.arc(support.x, support.y, 20, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 绘制支撑效果范围
            this.ctx.strokeStyle = 'rgba(139, 35, 35, 0.2)';
            this.ctx.beginPath();
            this.ctx.arc(support.x, support.y, 40, 0, Math.PI * 2);
            this.ctx.stroke();
        });
    }

    calculateScore() {
        const protectedCracks = this.cracks.filter(crack => crack.isProtected).length;
        const baseScore = (protectedCracks / this.cracks.length) * 1000;
        const timeBonus = this.timeLeft * 10;
        return baseScore + timeBonus;
    }

    endGame(reason) {
        this.gameState = 'over';
        clearInterval(this.gameLoop);
        clearInterval(this.timer);
        
        const finalScore = Math.floor(this.score);
        const highScore = parseInt(localStorage.getItem('gameHighScore')) || 0;
        
        if (finalScore > highScore) {
            localStorage.setItem('gameHighScore', finalScore);
        }
        
        this.showGameOver(finalScore, reason, finalScore > highScore);
    }

    showGameOver(score, reason, isNewRecord) {
        const messages = {
            timeout: '时间到！',
            damage: '洞窟受损过大！',
            complete: '完成支护！'
        };

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-content">
                <h2>${isNewRecord ? '新纪录！' : messages[reason]}</h2>
                <div class="final-score">
                    <span class="score-number">${score}</span>
                    <span class="score-label">分</span>
                </div>
                <div class="score-details">
                    <p>完成关卡：${this.level}</p>
                    <p>剩余时间：${this.timeLeft}秒</p>
                    <p>最高记录：${localStorage.getItem('gameHighScore')}分</p>
                </div>
                <button class="restart-game">再来一次</button>
            </div>
        `;

        this.canvas.parentElement.appendChild(overlay);
        overlay.querySelector('.restart-game').addEventListener('click', () => {
            overlay.remove();
            this.restartGame();
        });
    }

    restartGame() {
        this.gameState = 'ready';
        this.score = 0;
        this.timeLeft = this.levelConfig[this.level].time;
        this.supports = [];
        this.loadLevel(this.level);
        this.updateUI();
        document.getElementById('startGame').disabled = false;
        document.getElementById('pauseGame').disabled = true;
        document.getElementById('gameTimer').classList.remove('warning');
        this.draw();
    }

    loadLevel(level) {
        const config = this.levelConfig[level];
        this.timeLeft = config.time;
        this.resources = {
            support: config.supports,
            reinforce: config.reinforces
        };
        this.score = 0;
        this.supports = [];
        this.cracks = [];
        
        // 生成裂缝
        for (let i = 0; i < config.cracks; i++) {
            this.cracks.push({
                x: 100 + (this.canvas.width - 200) * Math.random(),
                y: 100 + (this.canvas.height - 200) * Math.random(),
                size: 15,
                isProtected: false
            });
        }
        
        this.updateUI();
        this.draw();
    }

    updateUI() {
        // 更新时间和分数显示
        document.getElementById('gameTimer').textContent = this.timeLeft;
        document.getElementById('gameScore').textContent = Math.floor(this.score);
        
        // 更新工具数量显示
        Object.entries(this.resources).forEach(([type, count]) => {
            const toolElement = document.querySelector(`[data-tool="${type}"] .tool-count`);
            if (toolElement) {
                toolElement.textContent = `x${count}`;
            }
        });
    }

    handleMouseDown(e) {
        if (this.gameState !== 'playing') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 检查是否点击了已有支撑
        const clickedSupport = this.supports.find(s => {
            const dx = x - s.x;
            const dy = y - s.y;
            return Math.sqrt(dx * dx + dy * dy) < 20;
        });

        if (clickedSupport) {
            this.isDragging = true;
            this.draggedSupport = clickedSupport;
        } else if (this.selectedTool && this.resources[this.selectedTool] > 0) {
            // 放置新支撑
            this.placeSupport(x, y);
        }
    }

    handleMouseMove(e) {
        if (!this.isDragging || this.gameState !== 'playing') return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.draggedSupport) {
            this.draggedSupport.x = x;
            this.draggedSupport.y = y;
            this.checkCrackProtection();
        }
    }

    handleMouseUp() {
        this.isDragging = false;
        this.draggedSupport = null;
    }

    placeSupport(x, y) {
        if (this.resources[this.selectedTool] <= 0) return;

        const support = {
            x,
            y,
            type: this.selectedTool,
            radius: 40
        };

        this.supports.push(support);
        this.resources[this.selectedTool]--;
        this.checkCrackProtection();
        this.updateUI();
    }

    checkCrackProtection() {
        this.cracks.forEach(crack => {
            crack.isProtected = this.supports.some(support => {
                const dx = crack.x - support.x;
                const dy = crack.y - support.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance < support.radius + crack.size;
            });
        });
    }

    drawSupportPreview() {
        if (!this.mousePos) return;
        
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = '#8B2323';
        this.ctx.beginPath();
        this.ctx.arc(this.mousePos.x, this.mousePos.y, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = 'rgba(139, 35, 35, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc(this.mousePos.x, this.mousePos.y, 40, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.globalAlpha = 1;
    }
}

// 初始化所有系统
window.addEventListener('load', () => {
    const simulator = new SupportSimulator();
    const quiz = new QuizSystem();
    const game = new SupportGame();
}); 