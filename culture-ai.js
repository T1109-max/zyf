class AIChatBot {
    constructor() {
        this.knowledgeBase = {
            // 壁画艺术
            "壁画": "敦煌壁画是莫高窟艺术的精华，现存壁画面积约45000平方米。壁画内容丰富，包括佛教故事、历史场景、民俗风情等。其艺术风格融合了中西方艺术特点，展现了独特的敦煌画风。",
            "绘画": "敦煌壁画采用了独特的绘画技法，主要包括线描、晕染、重彩等。画工们运用矿物颜料和植物染料，创造出绚丽多彩的艺术效果。壁画保存了大量古代绘画范本，对研究中国美术史具有重要价值。",
            "飞天": "飞天是敦煌壁画中最具代表性的艺术形象，体现了中国古代艺术家对理想美的追求。飞天形象优美动人，姿态轻盈，飘带飞舞，展现了独特的东方审美。",
            
            // 佛教文化
            "佛教": "敦煌是佛教东传的重要枢纽，莫高窟保存了大量佛教艺术，完整展现了佛教在中国的发展历程。从早期的印度风格到后来的中国化过程，反映了佛教艺术的本土化演变。",
            "佛像": "敦煌石窟中的佛像造型丰富多样，从印度风格到中国化的演变清晰可见。佛像的面相、服饰、手势都具有丰富的象征意义，体现了不同时期的审美特点和宗教观念。",
            "经变画": "经变画是对佛经故事的图像化表现，是敦煌壁画的重要组成部分。通过生动的画面展现佛经内容，帮助民众理解佛教教义，具有重要的宗教教化作用。",

            // 丝路文明
            "丝绸之路": "敦煌是古代丝绸之路的重要枢纽，促进了东西方文化、商贸的交流。这里汇聚了中原、西域、印度等多地的商人，形成了独特的丝路文化。",
            "商贸": "敦煌是重要的商贸中心，各种商品在此交汇。除了丝绸，还有香料、宝石、瓷器等贸易品。壁画中保存了大量商贸活动的场景，反映了当时繁荣的商业文明。",
            "驿站": "敦煌设有重要的驿站系统，为商旅提供休息和补给。驿站不仅是交通枢纽，也是文化交流的重要场所，促进了各地文化的融合。",

            // 建筑艺术
            "莫高窟": "莫高窟始建于前秦时期，历经千年营造，是世界上现存规模最大、内容最丰富的佛教艺术圣地。现存洞窟735个，展现了不同时期的建筑艺术特色。",
            "建筑": "莫高窟的建筑艺术独具特色，洞窟形制多样，包括禅窟、佛殿窟、僧房窟等不同类型。建筑设计考虑了采光、通风等实用功能，体现了古代建筑智慧。",
            "窟龛": "窟龛是莫高窟建筑的重要组成部分，形制精巧，装饰华丽。龛内常有佛像和壁画，是重要的礼拜空间。",

            // 音乐舞蹈
            "乐舞": "敦煌壁画中保存了大量乐舞图像，记录了古代音乐舞蹈艺术的发展。壁画中的乐器、舞姿、乐队编制等内容，为研究古代音乐艺术提供了重要资料。",
            "乐器": "壁画中记录了多种乐器，包括琵琶、箜篌、笛子等。这些乐器的形制和演奏方法，反映了古代音乐文化的发展。",
            "舞蹈": "敦煌壁画中的舞蹈形象丰富多样，包括胡旋舞、伎乐舞等。这些舞蹈展现了中外文化交融的特点。",

            // 文献研究
            "文献": "藏经洞出土的大量文献，数量超过5万件，包括佛经、世俗文书、艺术作品等。这些文献为研究古代社会各个方面提供了珍贵资料。",
            "藏经洞": "藏经洞的发现是20世纪考古史上的重大发现。洞内保存的文献涉及宗教、文学、艺术、经济等多个领域，展现了丰富的历史文化信息。",
            "写本": "敦煌写本包括多种文字，如汉文、藏文、回鹘文等。这些写本的书法艺术、装帧形式都具有重要的研究价值。",

            // 民俗文化
            "民俗": "敦煌壁画记录了丰富的民俗生活场景，包括节日庆典、婚丧礼仪、饮食服饰等。这些内容真实反映了古代社会的日常生活。",
            "服饰": "壁画中的人物服饰样式多样，反映了不同时期、不同民族的服饰特点。从服饰可以看出当时的社会等级和文化交流情况。",
            "节日": "壁画中记录了多种节日庆典活动，如燃灯节、浴佛节等。这些场景展现了古代社会的精神文化生活。"
        };

        this.init();
    }

    init() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');

        this.sendButton.addEventListener('click', () => this.handleUserInput());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUserInput();
            }
        });
    }

    handleUserInput() {
        const userText = this.userInput.value.trim();
        if (!userText) return;

        // 添加用户消息
        this.addMessage(userText, 'user');
        this.userInput.value = '';

        // 生成 AI 回答
        const response = this.generateResponse(userText);
        setTimeout(() => {
            this.addMessage(response, 'ai');
        }, 500);
    }

    generateResponse(userInput) {
        // 多关键词匹配
        let responses = [];
        for (const [keyword, response] of Object.entries(this.knowledgeBase)) {
            if (userInput.includes(keyword)) {
                responses.push(response);
            }
        }

        // 如果找到多个匹配，组合回答
        if (responses.length > 0) {
            return responses.join('\n\n');
        }

        // 默认回答
        return "您可以询问关于敦煌的以下方面：\n" +
               "1. 壁画艺术（壁画、绘画、飞天）\n" +
               "2. 佛教文化（佛教、佛像、经变画）\n" +
               "3. 丝路文明（丝绸之路、商贸、驿站）\n" +
               "4. 建筑艺术（莫高窟、建筑、窟龛）\n" +
               "5. 音乐舞蹈（乐舞、乐器、舞蹈）\n" +
               "6. 文献研究（文献、藏经洞、写本）\n" +
               "7. 民俗文化（民俗、服饰、节日）";
    }

    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// 初始化 AI 聊天机器人
window.addEventListener('load', () => {
    const aiChat = new AIChatBot();
}); 