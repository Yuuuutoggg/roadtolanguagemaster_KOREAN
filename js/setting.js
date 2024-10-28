// js/setting.js

// サウンド設定関連の変数
let isSoundOn = true;
let bgm = new Audio('audio/bgm.mp3');
bgm.loop = true;

// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
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
});

// サウンドのオン/オフを切り替える関数
function toggleSound() {
  isSoundOn = !isSoundOn;
  localStorage.setItem('isSoundOn', JSON.stringify(isSoundOn));
  updateSoundStatus();
}

// 音量を設定する関数
function setVolume(volume) {
  bgm.volume = parseFloat(volume);
  localStorage.setItem('bgmVolume', volume.toString());
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