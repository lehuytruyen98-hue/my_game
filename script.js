import { DATA } from "./constants.js";

class EnhancedMemoryGame {
    constructor() {
        this.currentNumber = null;
        this.previousNumber = null;
        this.score = 0;
        this.round = 0;
        this.isGameActive = true;
        this.gameStartTime = null;
        this.currentTimer = null;
        this.progressTimer = null;
        this.memoryTime = 3;
        this.answerTime = 5;
        this.numberOfChoices = 3;

        this.elements = {
            welcomeScreen: document.getElementById("welcomeScreen"),
            gameContainer: document.getElementById("gameContainer"),
            currentNumber: document.getElementById("currentNumber"),
            choicesContainer:
                document.getElementById("choicesContainer"),
            message: document.getElementById("message"),
            scoreDisplay: document.getElementById("scoreDisplay"),
            progressFill: document.getElementById("progressFill"),
            scrollingIcons: document.getElementById("scrollingIcons"),
        };
        this.init();
    }

    init() {
        // Luôn hiện welcome screen mỗi khi reload trang
        this.elements.welcomeScreen.style.display = "flex";
        this.elements.gameContainer.style.display = "none";

        // Render scrolling icons ngay lập tức
        this.renderScrollingIcons();
    }

    renderScrollingIcons() {
        const iconsContainer = this.elements.scrollingIcons;
        iconsContainer.innerHTML = '';

        // Tạo 2 bộ icon để tạo hiệu ứng lặp liên tục
        for (let i = 0; i < 5; i++) {
            Object.values(DATA)
                .sort(() => Math.random() - 0.5)
                .forEach(({ code, icon, name }) => {
                    const iconElement = document.createElement('div');
                    iconElement.className = 'scrolling-icon';
                    iconElement.innerHTML = `
                    <img src="${icon}" alt="${name}">
                    <div style="flex-direction: column; min-width: 250px;">
                        <span style="font-size: 16px;">${name}</span>
                        <br>
                        <span style="font-size: 12px; color: #64748b; font-weight: 400;">${code}</span>
                    </div>
            `;
                    iconsContainer.appendChild(iconElement);
                });
        }
    }

    startFirstGame() {
        // Ẩn welcome screen và hiện game container
        this.elements.welcomeScreen.style.display = "none";
        this.elements.gameContainer.style = null;
        this.elements.gameContainer.className = "game-container-wrapper";


        // Bắt đầu game
        this.startRound();
    }

    generateRandomNumber() {
        return Math.floor(Math.random() * 25) + 1;
    }

    generateChoices(correctNumber) {
        const choices = new Set([correctNumber]);

        while (choices.size < this.numberOfChoices) {
            choices.add(this.generateRandomNumber());
        }

        return Array.from(choices).sort(() => Math.random() - 0.5);
    }

    showMessage(text, type = "info") {
        this.elements.message.style.display = "";
        this.elements.message.textContent = text;
        this.elements.message.className = `message ${type}`;
    }

    clearMessage() {
        this.elements.message.style.display = "none";
        this.elements.message.textContent = "";
        this.elements.message.className = "message";
    }

    updateStats() {
        this.elements.scoreDisplay.textContent = `${this.score}/12`;
    }

    startCountdown(duration, onComplete, onTick) {
        if (this.currentTimer) {
            clearInterval(this.currentTimer);
        }
        if (this.progressTimer) {
            clearInterval(this.progressTimer);
        }

        const startTime = Date.now();
        const totalDuration = duration * 1000; // Convert to milliseconds

        // Update countdown display every second
        this.currentTimer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const timeLeft = Math.max(
                0,
                Math.ceil((totalDuration - elapsed) / 1000)
            );

            // Update progress bar color based on time left
            if (timeLeft <= 1) {
                this.elements.progressFill.className =
                    "progress-fill danger";
            } else {
                this.elements.progressFill.className =
                    "progress-fill";
            }

            if (onTick) onTick(timeLeft);

            if (timeLeft <= 0) {
                clearInterval(this.currentTimer);
                if (onComplete) onComplete();
            }
        }, 1000);

        // Update progress bar smoothly every 50ms
        this.progressTimer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(
                100,
                (elapsed / totalDuration) * 100
            );
            this.elements.progressFill.style.width = `${progress}%`;

            if (elapsed >= totalDuration) {
                clearInterval(this.progressTimer);
                this.elements.progressFill.style.width = "100%";
            }
        }, 50);
    }

    createChoiceButton(number) {
        const button = document.createElement("button");
        button.className = "choice-btn";
        const { icon, name, code } = DATA[number]
        if (this.round < 11) {
            button.innerHTML = `<img src="${icon}" alt="${name}" style="width:120px;height:120px;aspect-ratio:1/1;border-radius:8px;object-fit:cover;display:block;" />`;
        } else {
            button.innerHTML = `
                <span style="font-size: 16px; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; display: inline-block;">${this.round === 13 ? code : name}</span>
            `;
        }
        button.onclick = () => this.checkAnswer(number);
        return button;
    }

    startRound() {
        if (!this.isGameActive) return;

        document.getElementById("message2").textContent = "";

        this.round++;
        this.previousNumber = this.currentNumber;
        this.currentNumber = this.generateRandomNumber();
        switch (this.round) {
            case 4:
            case 8:
                this.answerTime -= 1;
                break;
            case 6:
                this.numberOfChoices += 1;
                this.elements.choicesContainer.style.cssText = "display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 12px; justify-items: center; align-items: center; max-width: 280px; margin: 12px auto;";
                break;
            case 10:
                this.showMessage(
                    "Hãy nhớ TÊN DỊCH VỤ này cho vòng tiếp theo!",
                    "info"
                );
                break;
            case 11:
                this.answerTime += 1;
                this.numberOfChoices -= 1;
                this.elements.choicesContainer.style.cssText = "";
                break;
            case 12:
                this.showMessage(
                    "Hãy nhớ FEATURE CODE này cho vòng tiếp theo!",
                    "info"
                );
                break;

            default:
                break;
        }

        const { icon, name, code } = DATA[this.currentNumber]
        this.elements.currentNumber.innerHTML = `
            <div style="background:rgb(250 249 250); border: 2px solid #e2e8f0; border-radius: 8px; padding: 12px; display: flex; flex-direction: row; align-items: center; gap: 12px;">
                <img src="${icon}" alt="${name}" class="icon-serivce">
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
                    <span style="font-size: 16px;">${name}</span>
                    <span style="font-size: 12px; color: #64748b; font-weight: 400;">${code}</span>
                </div>
            </div>
        `;
        this.elements.choicesContainer.innerHTML = "";
        this.updateStats();

        if (this.round === 1) {
            this.gameStartTime = Date.now();
            this.elements.currentNumber.classList.add("highlight");
            this.showMessage(
                "Hãy nhớ BIỂU TƯỢNG này cho vòng tiếp theo!",
                "info"
            );

            this.startCountdown(this.memoryTime, () => {
                this.elements.currentNumber.classList.remove(
                    "highlight"
                );
                this.startRound();
            });
            return;
        }

        const choices = this.generateChoices(this.previousNumber);
        choices.forEach((number) => {
            const button = this.createChoiceButton(number);
            this.elements.choicesContainer.appendChild(button);
        });

        this.startCountdown(this.answerTime, () => {
            this.timeUp();
        });
    }

    checkAnswer(selectedNumber) {
        if (!this.isGameActive) return;

        // Clear the countdown timers
        if (this.currentTimer) {
            clearInterval(this.currentTimer);
        }
        if (this.progressTimer) {
            clearInterval(this.progressTimer);
        }

        // Disable all buttons
        const buttons =
            this.elements.choicesContainer.querySelectorAll(
                ".choice-btn"
            );
        buttons.forEach((btn) => btn.classList.add("disabled"));

        if (selectedNumber === this.previousNumber) {
            this.score++;
            this.updateStats();
            if (this.score >= 12) {
                this.winGame();
                return;
            }

            setTimeout(() => {
                this.clearMessage();
                this.startRound();
            }, 200);
        } else {
            this.endGame(selectedNumber);
        }
    }

    timeUp() {
        if (!this.isGameActive) return;
        this.endGame();
    }

    endGame(selectedNumber) {
        this.isGameActive = false;
        if (this.score >= 10) {
            this.showMessage(
                '🎉 Bạn sẽ nhận được cổ vật từ BTC',
                "success"
            );
        } else {
            this.showMessage(
                '❌ Game over!',
                "error"
            );
        }

        if (typeof selectedNumber === "number") {
            document.getElementById(
                "message2"
            ).innerHTML = `✅ <b>Biểu tượng đúng:</b> ${DATA[this.previousNumber]?.name}.<br> ❌ <b>Bạn chọn:</b> ${DATA[selectedNumber]?.name}`;
        } else {
            document.getElementById("message2").textContent =
                "⌛ Hết thời gian";
        }

        this.elements.choicesContainer.style.cssText = ""
        this.elements.choicesContainer.innerHTML = `
            <div class="game-over-buttons">
                <button class="reset-btn" onclick="game.resetGame()">
                    🔄 Chơi lại
                </button>
            </div>
        `;
    }

    winGame() {
        this.showMessage(
            '🎉 Chúc mừng bạn đã chiến thắng!',
            "success"
        );

        // Chỉ hiện button lưu điểm khi thắng game
        this.elements.choicesContainer.style.cssText = ""
        this.elements.choicesContainer.innerHTML = `
            <div class="game-over-buttons">
                <button class="reset-btn" onclick="game.resetGame()">
                    🔄 Chơi lại
                </button>
            </div>
        `;
    }

    resetGame() {
        this.score = 0;
        this.round = 0;
        this.currentNumber = null;
        this.previousNumber = null;
        this.isGameActive = true;
        this.gameStartTime = null;
        this.numberOfChoices = 3;
        this.answerTime = 5;

        if (this.currentTimer) {
            clearInterval(this.currentTimer);
        }
        if (this.progressTimer) {
            clearInterval(this.progressTimer);
        }

        this.elements.progressFill.style.width = "0%";
        this.elements.progressFill.className = "progress-fill";
        this.elements.currentNumber.classList.remove("highlight");

        this.updateStats();
        this.clearMessage();
        this.elements.gameContainer.style.display = "none";
        this.elements.welcomeScreen.style.display = "flex";
    }
}

// Khởi tạo game
const game = new EnhancedMemoryGame();
window.game = game;
