// js/main.js

// グローバル変数の宣言
let selectedMode = ''; // 'practice', 'learning', 'quiz', 'userCreated'
let selectedPracticeMode = ''; // 'timeattack', 'partofspeech', 'review'
let selectedPartOfSpeech = ''; // 'verbs', 'adjectives', etc.
let selectedLevel = ''; // 'beginner', 'intermediate', 'advanced'

let currentWordList = [];
let currentWordIndex = 0;
let score = 0;
let timeLeft = 60;
let timer = null;

let learningWordList = [];
let learningWordIndex = 0;
let studyingList = [];

let quizQuestions = [];
let currentQuizQuestionIndex = 0;
let quizScore = 0;
let userAnswers = [];

// 間違えた単語のリストを保存するための変数
let incorrectWords = [];

// ユーザー作成モード用の変数
let userWordList = [];
let userQuizQuestions = [];
let currentUserQuizQuestionIndex = 0;
let userQuizScore = 0;
let editingWordIndex = null;

// カスタムアラートモーダル用のプロパティ
let alertMessage = '';

// カスタム確認モーダル用のプロパティ
let confirmMessage = '';
let confirmYesCallback = null;

// 音量設定
let isSoundOn = true;
let bgm = new Audio('audio/bgm.mp3');
bgm.loop = true;

// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
  // ローカルストレージからデータを読み込む
  studyingList = JSON.parse(localStorage.getItem('studyingList') || '[]');
  incorrectWords = JSON.parse(localStorage.getItem('incorrectWords') || '[]');
  userWordList = JSON.parse(localStorage.getItem('userWordList') || '[]');

  // サウンド設定の読み込み
  const soundSetting = localStorage.getItem('isSoundOn');
  if (soundSetting !== null) {
    isSoundOn = JSON.parse(soundSetting);
    updateSoundStatus();
  }

  // 音量設定の読み込み
  const volumeSetting = localStorage.getItem('bgmVolume');
  if (volumeSetting !== null) {
    bgm.volume = parseFloat(volumeSetting);
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
      volumeSlider.value = volumeSetting;
    }
  }

  // ミュート状態を設定
  bgm.muted = !isSoundOn;

  // BGMの再生はユーザーのインタラクション後に行う
  const startBGM = () => {
    if (isSoundOn) {
      bgm.play().catch((error) => {
        console.error('BGMの再生に失敗しました:', error);
      });
    }
    // イベントリスナーを削除して再生を一度だけ行うようにする
    document.removeEventListener('click', startBGM);
    document.removeEventListener('touchstart', startBGM);
  };

  // ユーザーの最初のクリックまたはタッチでBGMを再生
  document.addEventListener('click', startBGM);
  document.addEventListener('touchstart', startBGM);

  // 表示する単語リストの初期化
  updateStudyingWordsList();
  updateUserWordList();
});

// モード選択関数
function selectMode(mode) {
  commonReset();
  selectedMode = mode;
  hideAllScreens();
  if (mode === 'practice') {
    showScreen('koreanKeyboardWarningScreen');
  } else if (mode === 'learning') {
    showScreen('partOfSpeechSelectionScreen');
  } else if (mode === 'quiz') {
    showScreen('levelSelectionScreen');
  } else if (mode === 'userCreated') {
    showScreen('userCreatedMenuScreen');
  }
}

// 設定ボタンをクリックしたときの処理
function showSettings() {
  hideAllScreens();
  showScreen('settingsScreen');
}

// 設定画面で「戻る」ボタンをクリックしたときの処理
function closeSettings() {
  hideAllScreens();
  showScreen('modeSelectionScreen');
}

// サウンドのオン/オフを切り替える関数
function toggleSound() {
  isSoundOn = !isSoundOn;
  localStorage.setItem('isSoundOn', JSON.stringify(isSoundOn));
  bgm.muted = !isSoundOn;
  updateSoundStatus();
}

// サウンドステータスを更新する関数
function updateSoundStatus() {
  const soundIcon = document.getElementById('soundIcon');
  const soundStatus = document.getElementById('soundStatus');
  if (isSoundOn) {
    soundIcon.className = 'fas fa-volume-up';
    soundStatus.textContent = 'オン';
    document.getElementById('volumeControl').style.display = 'block';
  } else {
    soundIcon.className = 'fas fa-volume-mute';
    soundStatus.textContent = 'オフ';
    document.getElementById('volumeControl').style.display = 'none';
  }
}

// 音量を調節する関数
function setVolume(volume) {
  bgm.volume = parseFloat(volume);
  localStorage.setItem('bgmVolume', volume.toString());
}

// 利用規約画面を表示
function showTermsOfUse() {
  hideAllScreens();
  showScreen('termsOfUseScreen');
}

// 利用規約画面を閉じる
function closeTermsOfUse() {
  hideAllScreens();
  showScreen('settingsScreen');
}

// プライバシーポリシー画面を表示
function showPrivacyPolicy() {
  hideAllScreens();
  showScreen('privacyPolicyScreen');
}

// プライバシーポリシー画面を閉じる
function closePrivacyPolicy() {
  hideAllScreens();
  showScreen('settingsScreen');
}

// アプリ情報画面を表示
function showAppInfo() {
  hideAllScreens();
  showScreen('appInfoScreen');
}

// アプリ情報画面を閉じる
function closeAppInfo() {
  hideAllScreens();
  showScreen('settingsScreen');
}

// お問い合わせ画面を表示
function contactUs() {
  hideAllScreens();
  showScreen('contactScreen');
}

// お問い合わせ画面を閉じる
function closeContact() {
  hideAllScreens();
  showScreen('settingsScreen');
}

// タイピング練習モードのサブモード選択関数
function selectPracticeMode(practiceMode) {
  selectedPracticeMode = practiceMode;
  hideAllScreens();
  if (practiceMode === 'timeattack') {
    showScreen('timeAttackLevelSelectionScreen');
  } else if (practiceMode === 'partofspeech') {
    showScreen('practicePartOfSpeechSelectionScreen');
  }
}

// タイムアタックモードの韓国語キーボード警告を確認
function acknowledgeKoreanKeyboard() {
  hideAllScreens();
  showScreen('practiceModeSelectionScreen');
}

// レベル選択関数
function selectLevel(level) {
  selectedLevel = level; // レベルを設定
  hideAllScreens();

  if (selectedMode === 'quiz') {
    startQuiz(selectedLevel); // クイズモードを開始
    showScreen('quizScreen'); // クイズ画面に移動
  } else if (selectedMode === 'practice') {
    startTypingPractice(); // タイピング練習を開始
    showScreen('typingPracticeScreen'); // タイピング練習画面に移動
  }
}

// 難易度選択関数
function selectDifficulty(level) {
  selectedLevel = level;
  hideAllScreens();
  showScreen('typingPracticeScreen');
  startTypingPractice();
}

// 品詞選択関数
function selectPartOfSpeech(partOfSpeech, skipDifficulty = false) {
  selectedPartOfSpeech = partOfSpeech;
  if (selectedMode === 'practice') {
    if (skipDifficulty) {
      hideAllScreens();
      showScreen('typingPracticeScreen');
      startTypingPractice();
    } else {
      hideAllScreens();
      showScreen('difficultySelectionScreen');
    }
  } else if (selectedMode === 'learning') {
    hideAllScreens();
    showScreen('learningLevelSelectionScreen');
  }
}

// 学習モード用のレベル選択関数
function selectLearningLevel(level) {
  selectedLevel = level;
  hideAllScreens();
  fetchLearningWords();
}

// モーダル関連の関数

// 確認ダイアログを表示する関数
function showCustomConfirm() {
  document.getElementById('confirmMessage').textContent = confirmMessage;
  document.getElementById('customConfirmModal').style.display = 'flex';
}

// カスタムアラートを表示する関数
function showCustomAlert(message) {
  alertMessage = message;
  document.getElementById('alertMessage').textContent = alertMessage;
  document.getElementById('customAlertModal').style.display = 'flex';
}

// カスタムアラートを閉じる関数
function closeCustomAlert() {
  document.getElementById('customAlertModal').style.display = 'none';
}

// カスタム確認ダイアログで「はい」をクリックした時の処理
function confirmYesCustom() {
  if (confirmYesCallback && typeof confirmYesCallback === 'function') {
    confirmYesCallback();
  }
  document.getElementById('customConfirmModal').style.display = 'none';
}

// カスタム確認ダイアログで「いいえ」をクリックした時の処理
function confirmNoCustom() {
  document.getElementById('customConfirmModal').style.display = 'none';
}

// アプリをリセットしてタイトル画面に戻る
function resetApp() {
  commonReset();
  hideAllScreens();
  showScreen('modeSelectionScreen');
}

// 共通リセット関数
function commonReset() {
  selectedMode = '';
  selectedPracticeMode = '';
  selectedPartOfSpeech = '';
  selectedLevel = '';
  currentWordList = [];
  currentWordIndex = 0;
  score = 0;
  timeLeft = 60;
  clearInterval(timer);
  learningWordList = [];
  learningWordIndex = 0;
  quizQuestions = [];
  currentQuizQuestionIndex = 0;
  quizScore = 0;
  userAnswers = [];
  userQuizQuestions = [];
  currentUserQuizQuestionIndex = 0;
  userQuizScore = 0;
  editingWordIndex = null;

  // 画面の表示状態をリセット
  hideAllScreens();

  // アラートと確認モーダルを閉じる
  closeCustomAlert();
  document.getElementById('customConfirmModal').style.display = 'none';
}

// モード選択に戻る関数
function backToUserCreatedMenu() {
  hideAllScreens();
  showScreen('userCreatedMenuScreen');
}

// アプリをリセットしてタイトル画面に戻る関数（広告関連のコードは削除済み）
function resetAppWithAd() {
  resetApp();
  // AdMob関連のコードは削除されています。
}

// スクリーンの表示関数
function showScreen(screenId) {
  document.getElementById(screenId).style.display = 'flex';
}

// 全てのスクリーンを非表示にする関数
function hideAllScreens() {
  const screens = document.querySelectorAll('.screen');
  screens.forEach((screen) => {
    screen.style.display = 'none';
  });
}

// 共通関数（main.jsからインポートされている前提）
function getFileName(level) {
  if (level === 'beginner') {
    return 'words_beginner.json';
  } else if (level === 'intermediate') {
    return 'words_intermediate.json';
  } else if (level === 'advanced') {
    return 'words_advanced.json';
  } else {
    return 'words_beginner.json';
  }
}

// 単語シャッフル関数（main.jsからインポートされている前提）
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}