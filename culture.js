class CultureQuiz {
    constructor() {
        this.questions = [
            {
                question: "敦煌最早的佛教艺术受到哪个地区的影响？",
                options: ["印度犍陀罗", "波斯", "中亚", "希腊"],
                correct: 0,
                detail: "早期敦煌佛教艺术主要受到印度犍陀罗艺术的影响，体现在造像风格和技法上。"
            },
            {
                question: "敦煌石窟中保存了多少种文字的文献？",
                options: ["5种", "10种", "15种", "20种"],
                correct: 2,
                detail: "敦煌文献使用了汉、藏、回鹘、梵、粟特等15种文字，展现了多元文化交融。"
            },
            {
                question: "以下哪种乐器最早通过丝绸之路传入中国？",
                options: ["琵琶", "箜篌", "笛子", "羌笛"],
                correct: 0,
                detail: "琵琶最早从西域传入，在敦煌壁画中有大量相关演奏场景的描绘。"
            },
            {
                question: "敦���壁画中最常见的舞蹈形式是？",
                options: ["胡旋舞", "霓裳羽衣舞", "健舞", "龙凤舞"],
                correct: 0,
                detail: "胡旋舞是丝路文化交流的典型代表，在敦煌壁画中多有描绘。"
            },
            {
                question: "敦煌石窟艺术的鼎盛时期是？",
                options: ["魏晋时期", "隋唐时期", "宋元时期", "明清时期"],
                correct: 1,
                detail: "隋唐时期是敦煌艺术的黄金时代，创作了大量精美的壁画和雕塑。"
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
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.dataset.correct = (index === question.correct).toString();
            button.addEventListener('click', (e) => this.checkAnswer(e));
            optionsContainer.appendChild(button);
        });

        document.querySelector('.quiz-feedback').classList.add('hidden');
        document.getElementById('nextQuestion').classList.add('hidden');
    }

    checkAnswer(e) {
        const selectedBtn = e.target;
        const isCorrect = selectedBtn.dataset.correct === 'true';
        const feedback = document.querySelector('.quiz-feedback');
        const question = this.questions[this.currentQuestion];

        document.querySelectorAll('.quiz-options button').forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.correct === 'true') {
                btn.classList.add('correct');
            } else if (btn === selectedBtn && !isCorrect) {
                btn.classList.add('wrong');
            }
        });

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
        if (percentage >= 80) return "很好！你对敦煌文化很了解！";
        if (percentage >= 60) return "不错！继续加油！";
        return "要多了解敦煌文化哦！";
    }
}

// 初始化问答游戏
window.addEventListener('load', () => {
    const quiz = new CultureQuiz();
}); 