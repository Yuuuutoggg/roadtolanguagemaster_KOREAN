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
    document.getElementById('confirmMessage').textContent = confirmMessage;
    document.getElementById('customConfirmModal').style.display = 'flex';
  }

  function showCustomAlert(message) {
    const alertModal = document.getElementById('customAlertModal');
    if (alertModal) {
      document.getElementById('alertMessage').textContent = message;
      alertModal.style.display = 'flex';
    }
  }

  function closeCustomAlert() {
    document.getElementById('customAlertModal').style.display = 'none';
  }

  function confirmYesCustom() {
    if (confirmYesCallback && typeof confirmYesCallback === 'function') {
      confirmYesCallback();
    }
    document.getElementById('customConfirmModal').style.display = 'none';
  }

  function confirmNoCustom() {
    document.getElementById('customConfirmModal').style.display = 'none';
  }

  function resetApp() {
    commonReset();
    hideAllScreens();
    showScreen('modeSelectionScreen');
  }

  function commonReset() {
    selectedMode = '';
    sessionStorage.removeItem('selectedMode');
    learningWordList = [];
    learningWordIndex = 0;
    hideAllScreens();
    closeCustomAlert();
    document.getElementById('customConfirmModal').style.display = 'none';
  }

  function backToUserCreatedMenu() {
    hideAllScreens();
    showScreen('userCreatedMenuScreen');
  }

  function resetAppWithAd() {
    resetApp();
    // AdMob関連のコードは削除されています。
  }

  function hideAllScreens() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach((screen) => {
      if (screen) {
        screen.style.display = 'none';
      }
    });
  }

  function showScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.style.display = 'flex';
    }
  }

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

  function shuffleArray(array) {
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
