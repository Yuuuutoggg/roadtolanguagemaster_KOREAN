// js/practice.js

// グローバル変数の宣言
let currentWordList = [];
let currentWordIndex = 0;
let score = 0;
let timeLeft = 60;
let timer = null;

// セッションストレージから必要なデータを取得
selectedPracticeMode = sessionStorage.getItem('selectedPracticeMode') || '';
selectedLevel = sessionStorage.getItem('selectedLevel') || '';
selectedPartOfSpeech = sessionStorage.getItem('selectedPartOfSpeech') || '';


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

    loadWords();

    MainApp.showScreen('typingPracticeScreen'); // 修正箇所

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
        fileName = MainApp.getFileName(selectedLevel); // 修正箇所
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
                MainApp.showCustomAlert('選択したレベルや品詞に対応する単語がありません。'); // 修正箇所
                return;
            }

            currentWordList = MainApp.shuffleArray(currentWordList); // 修正箇所
            showNextWord();
        })
        .catch((error) => {
            console.error('単語データの読み込みに失敗しました:', error);
            MainApp.showCustomAlert('単語データの読み込みに失敗しました。'); // 修正箇所
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
        if (userInput) {
            userInput.value = '';
            userInput.focus();
        }
    } else {
        endTypingPractice('completed');
    }
}

// 入力チェック関数
function checkInput() {
    const userInput = document.getElementById('user-input');
    if (!userInput) return;

    const inputValue = userInput.value.trim();
    const currentWord = currentWordList[currentWordIndex];

    if (inputValue === currentWord.korean) {
        score++;
        updateScore();
        currentWordIndex++;
        showNextWord();
    }
}

// スコア更新関数
function updateScore() {
    const scoreText = document.getElementById('currentScoreText');
    if (scoreText) {
        scoreText.textContent = `スコア: ${score}`;
    }
}

// タイマー更新関数
function updateTimer() {
    const timerText = document.getElementById('currentTimerText');
    if (timerText) {
        timerText.textContent = `残り時間: ${timeLeft}秒`;
    }
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
    if (timer) {
        clearInterval(timer);
    }
    MainApp.hideAllScreens(); // 修正箇所

    let message = '';
    if (reason === 'completed') {
        message = `すべて終了しました！あなたのスコアは ${score} です。`;
    } else if (reason === 'timeup') {
        message = `時間切れです！あなたのスコアは ${score} です。`;
    }

    const finalScoreMessage = document.getElementById('finalScoreMessage');
    if (finalScoreMessage) {
        finalScoreMessage.textContent = message;
    }

    MainApp.showScreen('scoreScreen'); // 修正箇所
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
    MainApp.hideAllScreens(); // 修正箇所
    startTypingPractice();
}

// レベル選択画面に戻る関数
function goToLevelSelection() {
    MainApp.hideAllScreens(); // 修正箇所
    if (selectedPracticeMode === 'timeattack') {
        MainApp.showScreen('timeAttackLevelSelectionScreen'); // 修正箇所
    } else if (selectedPracticeMode === 'partofspeech') {
        MainApp.showScreen('difficultySelectionScreen'); // 修正箇所
    }
}

// DOMContentLoaded イベントでイベントリスナーを設定
document.addEventListener('DOMContentLoaded', () => {
    // practice.htmlが読み込まれたときに初期画面を表示
    if (location.pathname.includes('practice.html')) {
        MainApp.showScreen('koreanKeyboardWarningScreen'); // 修正箇所
    }

    const userInput = document.getElementById('user-input');

    // キーアップイベントで入力をチェック
    if (userInput) {
        userInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                checkInput();
            }
        });
    }
});

// 練習モード選択関数（practiceModeSelectionScreen用）
function selectPracticeMode(practiceMode) {
    console.log(`選択された練習モード: ${practiceMode}`);
    // モード選択時に関連しないセッションストレージの項目をクリア
    if (practiceMode === 'timeattack') {
        sessionStorage.removeItem('selectedPartOfSpeech');
    } else if (practiceMode === 'partofspeech') {
        // タイムアタックモードの場合、selectedLevel は必要なのでクリアしない
        // ただし、特定の設定がある場合はここでクリアできます
    }

    sessionStorage.setItem('selectedPracticeMode', practiceMode); // 選択モードをセッションストレージに保存
    selectedPracticeMode = practiceMode; // 追加: グローバル変数を更新
    MainApp.hideAllScreens(); // 修正箇所
    if (practiceMode === 'timeattack') {
        MainApp.showScreen('timeAttackLevelSelectionScreen'); // 修正箇所
    } else if (practiceMode === 'partofspeech') {
        MainApp.showScreen('practicePartOfSpeechSelectionScreen'); // 修正箇所
    }
}


// 難易度選択関数（タイムアタックモードおよび品詞別モード用）
function selectDifficulty(level) {
    console.log(`選択された難易度: ${level}`);
    sessionStorage.setItem('selectedLevel', level); // 選択レベルをセッションストレージに保存
    selectedLevel = level; // 追加: グローバル変数を更新
    MainApp.hideAllScreens(); // 修正箇所
    startTypingPractice();
}


// 品詞選択後に難易度選択画面に遷移する関数（品詞別モード用）
function selectPartOfSpeech(partOfSpeech) {
    console.log(`選択された品詞: ${partOfSpeech}`);
    sessionStorage.setItem('selectedPartOfSpeech', partOfSpeech); // 選択した品詞をセッションストレージに保存
    selectedPartOfSpeech = partOfSpeech; // 追加: グローバル変数を更新
    MainApp.hideAllScreens(); // 修正箇所
    MainApp.showScreen('difficultySelectionScreen'); // 修正箇所
}


// 韓国語キーボード警告を確認する関数
function acknowledgeKoreanKeyboard() {
    MainApp.hideAllScreens(); // 修正箇所
    MainApp.showScreen('practiceModeSelectionScreen'); // 修正箇所
}

// 学習中の単語リストを表示する関数（必要に応じて実装）
function viewStudyingWords() {
    // 勉強中の単語一覧を表示する処理をここに追加
    // 例: 別の画面を表示する、モーダルを開くなど
    MainApp.showCustomAlert('現在勉強中の単語一覧を表示する機能は未実装です。'); // 修正箇所
}
