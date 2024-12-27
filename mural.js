class MuralQuiz {
    constructor() {
        this.questions = [
            {
                question: "敦煌壁画最早始建于哪个时期？",
                options: ["前秦时期", "汉朝时期", "唐朝时期", "宋朝时期"],
                correct: 0,
                detail: "敦煌莫高窟始建于前秦建元二年（366年），由僧人乐僔开创。"
            },
            {
                question: "敦煌壁画最常用的颜料是什么？",
                options: ["植物颜料", "矿物颜料", "化学颜料", "合成颜料"],
                correct: 1,
                detail: "敦煌壁画主要使用天然矿物颜料，如朱砂、青金石、孔雀石等。"
            },
            {
                question: "敦煌壁画中的飞天形象最早出现在哪个时期？",
                options: ["十六国", "北魏", "隋朝", "唐朝"],
                correct: 1,
                detail: "飞天形象最早出现在北魏时期，之后在隋唐时期达到艺术巅峰。"
            },
            {
                question: "敦煌壁画中常见的本生故事是关于什么的？",
                options: ["神话传说", "民间故事", "佛陀前世", "历史事件"],
                correct: 2,
                detail: "本生故事讲述佛陀前世修行的故事，展现佛教慈悲和智慧的精神。"
            },
            {
                question: "莫高窟现存最早的壁画在哪个洞窟？",
                options: ["61窟", "275窟", "428窟", "285窟"],
                correct: 3,
                detail: "285窟是莫高窟现存最早的洞窟之一，保存有十六国时期的壁画。"
            }
        ];
        
        this.currentQuestion = 0;
        this.score = 0;
        this.init();
    }

    init() {
        this.updateQuestion();
        this.bindNextButton();
    }

    bindNextButton() {
        const nextButton = document.getElementById('nextQuestion');
        nextButton.addEventListener('click', () => {
            this.currentQuestion++;
            if (this.currentQuestion < this.questions.length) {
                this.updateQuestion();
            } else {
                this.showFinalResult();
            }
        });
    }

    updateQuestion() {
        const question = this.questions[this.currentQuestion];
        document.getElementById('questionNumber').textContent = this.currentQuestion + 1;
        document.getElementById('questionText').textContent = question.question;
        
        const optionsContainer = document.querySelector('.quiz-options');
        optionsContainer.innerHTML = ''; // 清空选项
        
        // 重新创建选项按钮
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.dataset.correct = (index === question.correct).toString();
            button.addEventListener('click', (e) => this.checkAnswer(e));
            optionsContainer.appendChild(button);
        });

        // 重置反馈和下一题按钮
        document.querySelector('.quiz-feedback').classList.add('hidden');
        document.getElementById('nextQuestion').classList.add('hidden');
        
        // 启用所有选项按钮
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'wrong');
        });
    }

    checkAnswer(e) {
        const selectedBtn = e.target;
        const isCorrect = selectedBtn.dataset.correct === 'true';
        const feedback = document.querySelector('.quiz-feedback');
        const question = this.questions[this.currentQuestion];

        // 禁用所有选项
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.correct === 'true') {
                btn.classList.add('correct');
            } else if (btn === selectedBtn && !isCorrect) {
                btn.classList.add('wrong');
            }
        });

        // 更新分数和反馈
        if (isCorrect) {
            this.score++;
            document.getElementById('score').textContent = this.score;
            feedback.classList.add('correct');
            feedback.classList.remove('wrong');
            feedback.querySelector('.feedback-text').textContent = '回答正确！';
        } else {
            feedback.classList.add('wrong');
            feedback.classList.remove('correct');
            feedback.querySelector('.feedback-text').textContent = '回答错误！';
        }

        feedback.querySelector('.feedback-detail').textContent = question.detail;
        feedback.classList.remove('hidden');
        document.getElementById('nextQuestion').classList.remove('hidden');
    }

    showFinalResult() {
        const quizCard = document.querySelector('.quiz-card');
        quizCard.innerHTML = `
            <div class="quiz-result">
                <h3>测试完成！</h3>
                <p>你的得分：${this.score}/${this.questions.length}</p>
                <p class="result-feedback">${this.getResultFeedback()}</p>
                <button onclick="location.reload()" class="restart-btn">重新开始</button>
            </div>
        `;
    }

    getResultFeedback() {
        const percentage = (this.score / this.questions.length) * 100;
        if (percentage === 100) return "太棒了！你是敦煌文化专家！";
        if (percentage >= 80) return "很好！你对敦煌壁画很了解！";
        if (percentage >= 60) return "不错！继续加油！";
        return "要多了解敦煌文化哦！";
    }
}

// 初始化问答游戏
window.addEventListener('load', () => {
    const quiz = new MuralQuiz();
}); 