// js/quiz.js

// グローバル変数の宣言
let quizQuestions = [];
let currentQuizQuestionIndex = 0;
let quizScore = 0;
let userAnswers = [];
let incorrectWords = [];

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
  // 間違えた単語をローカルストレージから取得
  incorrectWords = JSON.parse(localStorage.getItem('incorrectWords')) || [];
  
  // クイズ開始の初期設定
  if (location.pathname.includes('quiz.html')) {
    showScreen('levelSelectionScreen');
  }
});

// レベル選択時に呼び出される関数
function selectLevel(level) {
  sessionStorage.setItem('selectedLevel', level);
  startQuiz();
}

// レビュー モード開始（レベル選択画面から）
function startReviewModeFromLevelSelection() {
  sessionStorage.setItem('reviewMode', 'true');
  startReviewMode();
}

function startQuiz() {
  // 通常モード開始時にレビュー モードを無効化
  sessionStorage.removeItem('reviewMode');

  // 初期化
  quizQuestions = [];
  currentQuizQuestionIndex = 0;
  quizScore = 0;
  userAnswers = [];
  
  // クイズ画面を表示
  showScreen('quizScreen');
  
  // クイズ用の質問を読み込む
  loadQuizQuestions();
}


// レビュー モードの開始関数
function startReviewMode() {
  // レビュー モードのフラグを設定
  sessionStorage.setItem('reviewMode', 'true');
  
  // レビュー モード専用の質問を準備（間違えた単語のみ）
  prepareReviewModeQuestions();
  
  // クイズ画面を表示
  showScreen('quizScreen');
  
  // クイズ画面の初期化
  currentQuizQuestionIndex = 0;
  quizScore = 0;
  userAnswers = [];
  
  // クイズを開始
  showQuizQuestion();
}

// クイズ用の質問を読み込む関数
function loadQuizQuestions() {
  const selectedLevel = sessionStorage.getItem('selectedLevel') || 'beginner';
  const fileName = getFileName(selectedLevel);
  
  fetch(`data/${fileName}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('ネットワークレスポンスに問題があります');
      }
      return response.json();
    })
    .then((data) => {
      const levelData = data[selectedLevel];
      let allWords = [];
      
      // 各品詞から単語を収集
      for (let pos in levelData) {
        if (Array.isArray(levelData[pos])) {
          allWords = allWords.concat(levelData[pos]);
        }
      }
      
      if (allWords.length === 0) {
        showCustomAlert('選択したレベルに対応する単語がありません。');
        resetApp();
        return;
      }
      
      // 単語をシャッフル
      shuffleArray(allWords);
      
      // 質問数を設定（例: 10問）
      const numberOfQuestions = Math.min(10, allWords.length);
      
      for (let i = 0; i < numberOfQuestions; i++) {
        const correctWord = allWords[i];
        const wrongChoices = getWrongChoices(allWords, correctWord, 3);
        const choices = shuffleArray([correctWord.japanese, ...wrongChoices]);
        
        quizQuestions.push({
          korean: correctWord.korean,
          correct: correctWord.japanese,
          choices: choices,
          example: correctWord.example.japanese // 例文を追加
        });
      }
      
      // 最初の質問を表示
      showQuizQuestion();
    })
    .catch((error) => {
      console.error('クイズ用の単語データの読み込みに失敗しました:', error);
      showCustomAlert('クイズ用の単語データの読み込みに失敗しました。');
      resetApp();
    });
}

// レビュー モード用の質問を準備する関数
function prepareReviewModeQuestions() {
  if (incorrectWords.length === 0) {
    showCustomAlert('間違えた単語がありません。');
    showScreen('levelSelectionScreen');
    return;
  }
  
  // 単語をシャッフル
  shuffleArray(incorrectWords);
  
  // 質問数を設定（例: 10問または間違えた単語数）
  const numberOfQuestions = Math.min(10, incorrectWords.length);
  
  for (let i = 0; i < numberOfQuestions; i++) {
    const correctWord = incorrectWords[i];
    const wrongChoices = getWrongChoices(incorrectWords, correctWord, 3);
    const choices = shuffleArray([correctWord.japanese, ...wrongChoices]);
    
    quizQuestions.push({
      korean: correctWord.korean,
      correct: correctWord.japanese,
      choices: choices
    });
  }
}

// 質問を表示する関数
function showQuizQuestion() {
  if (currentQuizQuestionIndex >= quizQuestions.length) {
    // クイズ終了
    showQuizSummary();
    return;
  }
  
  const question = quizQuestions[currentQuizQuestionIndex];
  document.getElementById('quizQuestionText').textContent = `「${question.korean}」の意味は？`;
  
  // 選択肢ボタンにテキストを設定
  const choicesDiv = document.getElementById('quizChoices');
  const buttons = choicesDiv.getElementsByTagName('button');
  
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].textContent = question.choices[i];
    buttons[i].disabled = false; // ボタンを有効化
  }
  
  // フィードバックと例文をクリア
  document.getElementById('quizFeedbackText').textContent = '';
}
  
// ユーザーの選択を処理する関数
function handleQuizChoice(selectedIndex) {
  const question = quizQuestions[currentQuizQuestionIndex];
  const selectedChoice = question.choices[selectedIndex];
  const isCorrect = selectedChoice === question.correct;

  // ユーザーの回答を記録
  userAnswers.push({
    korean: question.korean,
    selected: selectedChoice,
    correct: question.correct,
    isCorrect: isCorrect
    // example: question.example // 例文を削除
  });

  // スコアを更新
  if (isCorrect) {
    quizScore++;
  } else {
    // 間違えた単語を追加（レビュー モード以外の場合）
    if (!incorrectWords.some(word => word.korean === question.korean)) {
      incorrectWords.push({
        korean: question.korean,
        japanese: question.correct
      });
      // ローカルストレージに保存
      localStorage.setItem('incorrectWords', JSON.stringify(incorrectWords));
    }    
    
  }

  // スコアを表示
  document.getElementById('quizScoreText').textContent = `スコア: ${quizScore}`;

  // フィードバックを表示
  const feedbackText = document.getElementById('quizFeedbackText');
  feedbackText.textContent = isCorrect ? '〇' : '✖';
  feedbackText.style.color = isCorrect ? 'green' : 'red';

  // 選択肢ボタンを無効化
  const choicesDiv = document.getElementById('quizChoices');
  const buttons = choicesDiv.getElementsByTagName('button');
  for (let btn of buttons) {
    btn.disabled = true;
  }

  // 例文を表示する部分を削除

  // 次の質問に移行
  currentQuizQuestionIndex++;

  setTimeout(() => {
    showQuizQuestion();
  }, 1500); // 1.5秒後に次の質問へ
}


// クイズのまとめ画面を表示する関数
function showQuizSummary() {
  const summaryList = document.getElementById('quizSummaryList');
  summaryList.innerHTML = ''; // リストをクリア

  userAnswers.forEach((answer, index) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<strong>Q${index + 1}: 「${answer.korean}」</strong><br>
                          あなたの答え: ${answer.selected} ${answer.isCorrect ? '<span style="color: green;">〇</span>' : '<span style="color: red;">✖</span>'}<br>
                          正解: ${answer.correct}`;
                          // 例文を削除
    summaryList.appendChild(listItem);
  });

  document.getElementById('quizFinalScoreText').textContent = `最終スコア: ${quizScore} / ${quizQuestions.length}`;

  showScreen('quizSummaryScreen');
}

// クイズを再試行する関数
function retryQuiz() {
  // クイズ変数をリセット
  quizQuestions = [];
  currentQuizQuestionIndex = 0;
  quizScore = 0;
  userAnswers = [];
  
  // クイズ画面を再表示
  showScreen('quizScreen');
  
  // クイズ用の質問を再読み込み
  loadQuizQuestions();
}

// 間違えた単語一覧を表示する関数（レベル選択画面から）
function viewIncorrectWordsFromLevelSelection() {
  populateIncorrectWordsList();
  showScreen('incorrectWordsScreen');
}

// 間違えた単語一覧を表示する関数（クイズまとめ画面から）
function viewIncorrectWordsFromSummaryScreen() {
  populateIncorrectWordsList();
  showScreen('incorrectWordsScreen');
}

// 間違えた単語一覧を表示する関数
function populateIncorrectWordsList() {
  const list = document.getElementById('incorrectWordsList');
  list.innerHTML = ''; // リストをクリア
  
  if (incorrectWords.length === 0) {
    const listItem = document.createElement('li');
    listItem.textContent = '間違えた単語はありません。';
    list.appendChild(listItem);
    return;
  }
  
  incorrectWords.forEach((word, index) => {
    const listItem = document.createElement('li');
    
    // 単語情報を表示
    const wordText = document.createElement('span');
    wordText.innerHTML = `<strong>${word.korean}</strong> - ${word.japanese}`;
    
    // 削除ボタンを作成
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.classList.add('delete-button'); // スタイル調整用のクラス
    deleteButton.setAttribute('data-korean', word.korean); // 削除対象の単語を識別するためのデータ属性
    
    // 削除ボタンのクリックイベントリスナーを追加
    deleteButton.addEventListener('click', deleteIncorrectWord);
    
    // リストアイテムに単語情報と削除ボタンを追加
    listItem.appendChild(wordText);
    listItem.appendChild(deleteButton);
    
    list.appendChild(listItem);
  });
}


// 間違えた単語一覧画面を閉じる関数
function closeIncorrectWordsScreen() {
  showScreen('levelSelectionScreen');
}

// 間違えた単語一覧画面を閉じて前の画面に戻る場合
function closeIncorrectWordsScreenToPrevious() {
  // 任意の前の画面に戻るロジックを追加可能
  showScreen('levelSelectionScreen');
}

// 間違えた単語を削除する関数
function deleteIncorrectWord(event) {
  const koreanWord = event.target.getAttribute('data-korean');
  
  // 間違えた単語リストから該当する単語を削除
  incorrectWords = incorrectWords.filter(word => word.korean !== koreanWord);
  
  // ローカルストレージを更新
  localStorage.setItem('incorrectWords', JSON.stringify(incorrectWords));
  
  // 間違えた単語一覧を再表示
  populateIncorrectWordsList();
}


// ユーティリティ関数

// ファイル名を取得する関数
function getFileName(level) {
  switch(level) {
    case 'beginner':
      return 'words_beginner.json';
    case 'intermediate':
      return 'words_intermediate.json';
    case 'advanced':
      return 'words_advanced.json';
    default:
      return 'words_beginner.json';
  }
}

// 配列をシャッフルする関数（Fisher-Yatesアルゴリズム）
function shuffleArray(array) {
  for (let i = array.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i +1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 間違えた選択肢を取得する関数
function getWrongChoices(allWords, correctWord, numberOfChoices) {
  const wrongWords = allWords.filter(word => word.japanese !== correctWord.japanese);
  shuffleArray(wrongWords);
  return wrongWords.slice(0, numberOfChoices).map(word => word.japanese);
}

// クイズをリセットする関数（必要に応じて実装可能）
function resetQuiz() {
  quizQuestions = [];
  currentQuizQuestionIndex = 0;
  quizScore = 0;
  userAnswers = [];
  showScreen('levelSelectionScreen');
}

// クイズアプリケーション全体をリセットする関数
function resetApp() {
  // すべてのクイズデータをリセット
  quizQuestions = [];
  currentQuizQuestionIndex = 0;
  quizScore = 0;
  userAnswers = [];
  incorrectWords = [];
  
  // ローカルストレージをクリア
  localStorage.removeItem('incorrectWords');
  
  // レベル選択画面に戻る
  showScreen('levelSelectionScreen');
}

// カスタムアラートを表示する関数
function showCustomAlert(message) {
  const alertModal = document.getElementById('customAlertModal');
  const alertMessage = document.getElementById('alertMessage');
  alertMessage.textContent = message;
  alertModal.style.display = 'flex';
}

// カスタムアラートを閉じる関数
function closeCustomAlert() {
  const alertModal = document.getElementById('customAlertModal');
  alertModal.style.display = 'none';
}

// カスタム確認モーダルの関数（必要に応じて実装可能）
function showCustomConfirm(message, onYes, onNo) {
  const confirmModal = document.getElementById('customConfirmModal');
  const confirmMessage = document.getElementById('confirmMessage');
  confirmMessage.textContent = message;
  
  // 一時的なコールバック関数を設定
  window.confirmYesCallback = onYes;
  window.confirmNoCallback = onNo;
  
  confirmModal.style.display = 'flex';
}

function confirmYesCustom() {
  const confirmModal = document.getElementById('customConfirmModal');
  confirmModal.style.display = 'none';
  if (window.confirmYesCallback) {
    window.confirmYesCallback();
  }
}

function confirmNoCustom() {
  const confirmModal = document.getElementById('customConfirmModal');
  confirmModal.style.display = 'none';
  if (window.confirmNoCallback) {
    window.confirmNoCallback();
  }
}

// ユーザーがホームに戻る場合の処理（必要に応じて実装可能）
function goToHome() {
  showScreen('levelSelectionScreen');
}

// スクリーンを表示する関数（main.js の showScreen 関数と連携）
function showScreen(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    if (screen.id === screenId) {
      screen.style.display = 'flex';
      screen.classList.add('fade-in');
    } else {
      screen.style.display = 'none';
    }
  });
}

// クイズを終了し、ホームに戻る関数（必要に応じて実装可能）
function endQuizAndGoHome() {
  showQuizSummary();
}

// その他の必要な関数やイベントリスナーを追加する場合はここに記述
