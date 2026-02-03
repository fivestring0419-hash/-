class WhackAMoleGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.isGameActive = false;
        this.moleTimer = null;
        this.gameTimer = null;
        this.currentMole = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadSounds();
    }
    
    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.gameGrid = document.getElementById('gameGrid');
        this.holes = document.querySelectorAll('.hole');
        this.popupOverlay = document.getElementById('popupOverlay');
        this.finalScoreElement = document.getElementById('finalScore');
        this.gradeElement = document.getElementById('grade');
        this.playAgainBtn = document.getElementById('playAgainBtn');
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        
        this.holes.forEach(hole => {
            hole.addEventListener('click', (e) => this.hitMole(e.target));
        });
        
        // 팝업 오버레이 클릭 시 닫기
        this.popupOverlay.addEventListener('click', (e) => {
            if (e.target === this.popupOverlay) {
                this.closePopup();
            }
        });
    }
    
    loadSounds() {
        // 무료 효과음 플레이스홀더 (실제로는 Web Audio API나 HTML5 Audio 사용)
        this.hitSound = {
            play: () => {
                // 간단한 비프음 생성
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
            }
        };
    }
    
    startGame() {
        this.isGameActive = true;
        this.score = 0;
        this.timeLeft = 30;
        
        this.updateDisplay();
        this.startBtn.disabled = true;
        this.startBtn.textContent = '게임 중...';
        
        // 게임 타이머 시작
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
        
        // 두더지 등장 시작
        this.spawnMole();
    }
    
    spawnMole() {
        if (!this.isGameActive) return;
        
        // 이전 두더지 제거
        if (this.currentMole) {
            this.currentMole.classList.remove('mole');
        }
        
        // 무작위 위치에 새 두더지 등장
        const randomIndex = Math.floor(Math.random() * this.holes.length);
        this.currentMole = this.holes[randomIndex];
        this.currentMole.classList.add('mole');
        
        // 1초 후 다음 두더지 등장
        this.moleTimer = setTimeout(() => {
            if (this.currentMole) {
                this.currentMole.classList.remove('mole');
            }
            this.spawnMole();
        }, 1000);
    }
    
    hitMole(hole) {
        if (!this.isGameActive || !hole.classList.contains('mole')) {
            return;
        }
        
        // 점수 증가
        this.score++;
        this.updateDisplay();
        
        // 효과음 재생
        try {
            this.hitSound.play();
        } catch (error) {
            console.log('Sound play failed:', error);
        }
        
        // 시각적 효과
        hole.classList.remove('mole');
        hole.classList.add('hit');
        
        setTimeout(() => {
            hole.classList.remove('hit');
        }, 300);
        
        this.currentMole = null;
    }
    
    endGame() {
        this.isGameActive = false;
        
        // 타이머 정리
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        if (this.moleTimer) {
            clearTimeout(this.moleTimer);
        }
        
        // 두더지 제거
        if (this.currentMole) {
            this.currentMole.classList.remove('mole');
        }
        
        // 버튼 상태 복원
        this.startBtn.disabled = false;
        this.startBtn.textContent = '게임 시작';
        
        // 결과 팝업 표시
        this.showResults();
    }
    
    showResults() {
        this.finalScoreElement.textContent = this.score;
        
        // 등급 계산
        let grade, gradeClass;
        if (this.score >= 25) {
            grade = '최고예요! 🏆';
            gradeClass = 'excellent';
        } else if (this.score >= 20) {
            grade = '훌륭해요! 🎉';
            gradeClass = 'excellent';
        } else if (this.score >= 15) {
            grade = '잘했어요! 👍';
            gradeClass = 'good';
        } else if (this.score >= 10) {
            grade = '괜찮아요! 😊';
            gradeClass = 'normal';
        } else {
            grade = '연습이 필요해요! 💪';
            gradeClass = 'poor';
        }
        
        this.gradeElement.textContent = grade;
        this.gradeElement.className = `grade ${gradeClass}`;
        
        this.popupOverlay.classList.add('show');
    }
    
    closePopup() {
        this.popupOverlay.classList.remove('show');
    }
    
    playAgain() {
        this.closePopup();
        this.resetGame();
        setTimeout(() => {
            this.startGame();
        }, 100);
    }
    
    resetGame() {
        this.isGameActive = false;
        this.score = 0;
        this.timeLeft = 30;
        
        // 타이머 정리
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        if (this.moleTimer) {
            clearTimeout(this.moleTimer);
        }
        
        // 두더지 제거
        this.holes.forEach(hole => {
            hole.classList.remove('mole', 'hit');
        });
        
        this.currentMole = null;
        
        // 버튼 상태 복원
        this.startBtn.disabled = false;
        this.startBtn.textContent = '게임 시작';
        
        // 화면 업데이트
        this.updateDisplay();
        
        // 팝업 닫기
        this.closePopup();
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.timerElement.textContent = this.timeLeft;
        
        // 시간이 10초 이하일 때 빨간색으로 표시
        if (this.timeLeft <= 10 && this.timeLeft > 0) {
            this.timerElement.style.color = '#f44336';
        } else {
            this.timerElement.style.color = '#333';
        }
    }
}

// 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
    new WhackAMoleGame();
});