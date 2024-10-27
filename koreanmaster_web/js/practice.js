// js/practice.js

// グローバル変数の宣言
let lastKey = ''; // 最後に押されたキー

// タイピング練習開始関数
function startTypingPractice() {
    score = 0;
    currentWordIndex = 0;
    updateScore();

    if (selectedPracticeMode === 'timeattack') {
        timeLeft = 60;
        updateTimer();
        startTimer();
    }

    if (selectedPracticeMode === 'review') {
        showNextWord();
    } else {
        loadWords();
    }

    showScreen('typingPracticeScreen');

    // タイムアタックモードの場合のみタイマーを表示
    if (selectedPracticeMode === 'timeattack') {
        document.getElementById('currentTimerText').style.display = 'block';
    } else {
        document.getElementById('currentTimerText').style.display = 'none';
    }
}

// 単語読み込み関数
function loadWords() {
    let fileName = '';
    if (selectedPracticeMode === 'timeattack' || selectedPracticeMode === 'partofspeech') {
        fileName = getFileName(selectedLevel);
    }

    fetch(`data/${fileName}`)
        .then((response) => response.json())
        .then((data) => {
            if (selectedPracticeMode === 'timeattack') {
                currentWordList = [];
                for (let pos in data[selectedLevel]) {
                    if (Array.isArray(data[selectedLevel][pos])) {
                        currentWordList = currentWordList.concat(data[selectedLevel][pos]);
                    }
                }
            } else if (selectedPracticeMode === 'partofspeech') {
                currentWordList = data[selectedLevel][selectedPartOfSpeech] || [];
            }

            if (currentWordList.length === 0) {
                showCustomAlert('選択したレベルや品詞に対応する単語がありません。');
                return;
            }

            shuffleArray(currentWordList);
            showNextWord();
        })
        .catch((error) => {
            console.error('単語データの読み込みに失敗しました:', error);
            showCustomAlert('単語データの読み込みに失敗しました。');
        });
}

// 次の単語表示関数
function showNextWord() {
    if (currentWordIndex < currentWordList.length) {
        const word = currentWordList[currentWordIndex];
        document.getElementById('currentKoreanWord').textContent = `韓国語: ${word.korean}`;
        document.getElementById('currentJapaneseTranslation').textContent = `日本語訳: ${word.japanese}`;
        document.getElementById('currentProgress').textContent = `単語 ${currentWordIndex + 1} / ${currentWordList.length}`;

        const userInput = document.getElementById('user-input');
        userInput.value = '';
        userInput.focus();
    } else {
        endTypingPractice('completed');
    }
}

// 入力チェック関数
function checkInput() {
    if (lastKey !== 'Enter') {
        return;
    }

    const userInput = document.getElementById('user-input').value.trim();
    const currentWord = currentWordList[currentWordIndex];

    if (userInput === currentWord.korean) {
        score++;
        updateScore();
        currentWordIndex++;
        showNextWord();
    }

    lastKey = ''; // リセット
}

// スコア更新関数
function updateScore() {
    document.getElementById('currentScoreText').textContent = `スコア: ${score}`;
}

// タイマー更新関数
function updateTimer() {
    document.getElementById('currentTimerText').textContent = `残り時間: ${timeLeft}秒`;
}

// タイマー開始関数
function startTimer() {
    // 既にタイマーが動作している場合はクリア
    if (timer) {
        clearInterval(timer);
    }
    timer = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            clearInterval(timer);
            endTypingPractice('timeup');
        }
    }, 1000);
}

// タイピング練習終了関数
function endTypingPractice(reason) {
    clearInterval(timer);
    hideAllScreens();

    let message = '';
    if (reason === 'completed') {
        message = `すべて終了しました！あなたのスコアは ${score} です。`;
    } else if (reason === 'timeup') {
        message = `時間切れです！あなたのスコアは ${score} です。`;
    }

    document.getElementById('finalScoreMessage').textContent = message;
    showScreen('scoreScreen');
}

// スコアをX（Twitter）で共有する関数
function postToX() {
    const message = encodeURIComponent(`私は韓国語タイピング練習でスコア ${score} を獲得しました！`);
    const url = encodeURIComponent(window.location.href);
    const shareUrl = `https://twitter.com/intent/tweet?text=${message}&url=${url}`;
    window.open(shareUrl, '_blank');
}

// ゲームをリトライする関数
function retryGame() {
    hideAllScreens();
    startTypingPractice();
}

// レベル選択画面に戻る関数
function goToLevelSelection() {
    hideAllScreens();
    if (selectedPracticeMode === 'timeattack') {
        showScreen('timeAttackLevelSelectionScreen');
    } else if (selectedPracticeMode === 'partofspeech') {
        showScreen('difficultySelectionScreen');
    }
}

// DOMContentLoaded イベントでイベントリスナーを設定
document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');

    // キーアップイベントで最後に押されたキーを記録
    userInput.addEventListener('keyup', function(event) {
        lastKey = event.key;
    });
});
