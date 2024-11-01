//showSettings.js
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
  }

  // 音量設定の読み込み
  const volumeSetting = localStorage.getItem('bgmVolume');
  if (volumeSetting !== null) {
    bgm.volume = parseFloat(volumeSetting) / 100; // スライダーが0-100のため
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
      volumeSlider.value = volumeSetting;
    }
  } else {
    bgm.volume = 1; // デフォルトは最大音量
  }

  // ミュート状態を設定
  bgm.muted = !isSoundOn;

  // サウンドステータスを更新
  updateSoundStatus();

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

function toggleSound() {
  isSoundOn = !isSoundOn;
  localStorage.setItem('isSoundOn', JSON.stringify(isSoundOn));
  updateSoundStatus();

  // 画面の表示状態を変更する必要がないため、MainApp.hideAllScreens() の呼び出しを削除
}



// 音量を設定する関数
function setVolume(volume) {
  bgm.volume = parseFloat(volume) / 100; // スライダーが0-100のため
  localStorage.setItem('bgmVolume', volume.toString());
}

// サウンドステータスを更新する関数
function updateSoundStatus() {
  const soundIcon = document.getElementById('soundIcon');
  const soundStatus = document.getElementById('soundStatus');
  const volumeControl = document.getElementById('volumeControl');

  if (isSoundOn) {
    soundIcon.className = 'fas fa-volume-up';
    soundStatus.textContent = 'オン';
    volumeControl.style.display = 'block';
    bgm.muted = false;
  } else {
    soundIcon.className = 'fas fa-volume-mute';
    soundStatus.textContent = 'オフ';
    volumeControl.style.display = 'none';
    bgm.muted = true;
  }
}


// 設定ボタンをクリックしたときの処理
function showSettings() {
  MainApp.hideAllScreens();
  MainApp.showScreen('settingsScreen');
}

// 設定画面で「戻る」ボタンをクリックしたときの処理
function closeSettings() {
  MainApp.hideAllScreens();
  MainApp.showScreen('modeSelectionScreen');
}

// 利用規約画面を表示
function showTermsOfUse() {
  MainApp.hideAllScreens();
  MainApp.showScreen('termsOfUseScreen');
}

// 利用規約画面を閉じる
function closeTermsOfUse() {
  MainApp.hideAllScreens();
  MainApp.showScreen('settingsScreen');
}

// プライバシーポリシー画面を表示
function showPrivacyPolicy() {
  MainApp.hideAllScreens();
  MainApp.showScreen('privacyPolicyScreen');
}

// プライバシーポリシー画面を閉じる
function closePrivacyPolicy() {
  MainApp.hideAllScreens();
  MainApp.showScreen('settingsScreen');
}

// アプリ情報画面を表示
function showAppInfo() {
  MainApp.hideAllScreens();
  MainApp.showScreen('appInfoScreen');
}

// アプリ情報画面を閉じる
function closeAppInfo() {
  MainApp.hideAllScreens();
  MainApp.showScreen('settingsScreen');
}

// お問い合わせ画面を表示
function contactUs() {
  MainApp.hideAllScreens();
  MainApp.showScreen('contactScreen');
}

// お問い合わせ画面を閉じる
function closeContact() {
  MainApp.hideAllScreens();
  MainApp.showScreen('settingsScreen');
}

// グローバル関数としてMainAppのメソッドを割り当て
function closeCustomAlert() {
  MainApp.closeCustomAlert();
}

function confirmYesCustom() {
  MainApp.confirmYesCustom();
}

function confirmNoCustom() {
  MainApp.confirmNoCustom();
}
