// main.js

window.MainApp = (function() {
  // グローバル変数の宣言
  let selectedMode = sessionStorage.getItem('selectedMode') || ''; 
  let learningWordList = [];
  let learningWordIndex = 0;
  let alertMessage = '';
  let confirmMessage = '';
  let confirmYesCallback = null;

  // モード選択関数
  function selectMode(mode) {
    console.log(`選択されたモード: ${mode}`);
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
  function showCustomConfirm() {
    console.log('カスタム確認モーダルを表示');
    document.getElementById('confirmMessage').textContent = confirmMessage;
    document.getElementById('customConfirmModal').style.display = 'flex';
  }

  function showCustomAlert(message) {
    console.log(`カスタムアラート表示: ${message}`);
    const alertModal = document.getElementById('customAlertModal');
    if (alertModal) {
      document.getElementById('alertMessage').textContent = message;
      alertModal.style.display = 'flex';
    }
  }

  function closeCustomAlert() {
    console.log('カスタムアラートを閉じる');
    document.getElementById('customAlertModal').style.display = 'none';
  }

  function confirmYesCustom() {
    console.log('カスタム確認モーダルで「はい」が選択された');
    if (confirmYesCallback && typeof confirmYesCallback === 'function') {
      confirmYesCallback();
    }
    document.getElementById('customConfirmModal').style.display = 'none';
  }

  function confirmNoCustom() {
    console.log('カスタム確認モーダルで「いいえ」が選択された');
    document.getElementById('customConfirmModal').style.display = 'none';
  }

  function resetApp() {
    console.log('アプリをリセット');
    commonReset();
    hideAllScreens();
    showScreen('modeSelectionScreen');
  }

  function commonReset() {
    console.log('共通リセット処理');
    selectedMode = '';
    sessionStorage.removeItem('selectedMode');
    learningWordList = [];
    learningWordIndex = 0;
    hideAllScreens();
    closeCustomAlert();
    document.getElementById('customConfirmModal').style.display = 'none';
  }

  function backToUserCreatedMenu() {
    console.log('ユーザー作成メニューに戻る');
    hideAllScreens();
    showScreen('userCreatedMenuScreen');
  }

  function resetAppWithAd() {
    console.log('アプリをリセットし、広告を表示');
    resetApp();
    // AdMob関連のコードは削除されています。
  }

  function hideAllScreens() {
    console.log('すべての画面を非表示');
    const screens = document.querySelectorAll('.screen');
    screens.forEach((screen) => {
      if (screen) {
        screen.style.display = 'none';
      }
    });
  }

  function showScreen(screenId) {
    console.log(`画面を表示: ${screenId}`);
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.style.display = 'flex';
    } else {
      console.warn(`画面ID "${screenId}" が見つかりません`);
    }
  }

  function getFileName(level) {
    console.log(`ファイル名を取得: レベル=${level}`);
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

  function shuffleArray(array) {
    console.log('配列をシャッフル');
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // 公開する関数
  return {
    selectMode,
    showCustomConfirm,
    showCustomAlert,
    closeCustomAlert,
    confirmYesCustom,
    confirmNoCustom,
    resetApp,
    commonReset,
    backToUserCreatedMenu,
    resetAppWithAd,
    hideAllScreens,
    showScreen,
    getFileName,
    shuffleArray
  };
})();
