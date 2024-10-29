// js/main.js

// グローバル変数の宣言
let selectedMode = sessionStorage.getItem('selectedMode') || ''; 

let learningWordList = [];
let learningWordIndex = 0;
// カスタムアラートモーダル用のプロパティ
let alertMessage = '';

// カスタム確認モーダル用のプロパティ
let confirmMessage = '';
let confirmYesCallback = null;

// モード選択関数
function selectMode(mode) {
  selectedMode = mode;
  sessionStorage.setItem('selectedMode', mode);
  if (mode === 'learning') {
      window.location.href = 'learning.html';
  } else if (mode === 'quiz') {
      window.location.href = 'quiz.html';
  } else if (mode === 'practice') {
      window.location.href = 'practice.html';
  } else if (mode === 'userCreated') {
      window.location.href = 'user_created.html';
  }
}


// モーダル関連の関数

// 確認ダイアログを表示する関数
function showCustomConfirm() {
  document.getElementById('confirmMessage').textContent = confirmMessage;
  document.getElementById('customConfirmModal').style.display = 'flex';
}

// カスタムアラートを表示する関数
function showCustomAlert(message) {
  const alertModal = document.getElementById('customAlertModal');
  if (alertModal) {
      document.getElementById('alertMessage').textContent = message;
      alertModal.style.display = 'flex';
  }
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
  sessionStorage.removeItem('selectedMode');
  // 他のモードに関連するセッションストレージはpractice.js側で管理されているためmain.jsでは不要

  learningWordList = [];
  learningWordIndex = 0;

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

// 各HTMLファイルで対応するスクリーンのみ表示する関数
function hideAllScreens() {
  const screens = document.querySelectorAll('.screen');
  screens.forEach((screen) => {
      if (screen) {
          screen.style.display = 'none';
      }
  });
}

// 各スクリーンを表示する関数
function showScreen(screenId) {
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.style.display = 'flex';
  }
}

// 共通関数
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

// 単語シャッフル関数
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}



