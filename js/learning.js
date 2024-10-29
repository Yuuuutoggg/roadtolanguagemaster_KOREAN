// learning.js

// 勉強中リストの初期化
let studyingList = JSON.parse(localStorage.getItem('studyingList')) || [];

// 選択されたレベルと品詞の取得
let selectedLevel = sessionStorage.getItem('selectedLevel') || '';
let selectedPartOfSpeech = sessionStorage.getItem('selectedPartOfSpeech') || '';

// 学習単語リストとインデックスの初期化
let learningWordList = [];
let learningWordIndex = 0;

// 品詞選択後にレベル選択画面に遷移する関数
function selectPartOfSpeech(partOfSpeech) {
  // 品詞を選択
  selectedPartOfSpeech = partOfSpeech;
  sessionStorage.setItem('selectedPartOfSpeech', partOfSpeech);

  // 現在の画面を非表示
  const partOfSpeechScreen = document.getElementById('partOfSpeechSelectionScreen');
  if (partOfSpeechScreen) {
    partOfSpeechScreen.style.display = 'none';
  }

  // レベル選択画面を表示
  const levelSelectionScreen = document.getElementById('learningLevelSelectionScreen');
  if (levelSelectionScreen) {
    levelSelectionScreen.style.display = 'flex';
  }
}

// 難易度選択関数
function selectLearningLevel(level) {
  selectedLevel = level;
  sessionStorage.setItem('selectedLevel', level);
  MainApp.hideAllScreens();
  fetchLearningWords();
}

// 学習モードの単語読み込み関数
function fetchLearningWords() {
  if (!location.pathname.includes('learning.html')) return; // learning.htmlでのみ実行

  const fileName = MainApp.getFileName(selectedLevel);
  fetch(`data/${fileName}`)
    .then((response) => response.json())
    .then((data) => {
      // 指定された品詞の単語リストを取得
      learningWordList = data[selectedLevel][selectedPartOfSpeech] || [];
      if (learningWordList.length === 0) {
        MainApp.showCustomAlert('選択した品詞と難易度に対応する単語がありません。');
        return;
      }
      // 単語をシャッフル
      MainApp.shuffleArray(learningWordList);
      learningWordIndex = 0;
      // 最初の単語を表示
      showLearningWord();
      // 学習モード画面を表示
      MainApp.showScreen('learningModeScreen');
    })
    .catch((error) => {
      console.error('学習モードの単語データの読み込みに失敗しました:', error);
      MainApp.showCustomAlert('学習モードの単語データの読み込みに失敗しました。');
    });
}

// 学習モードの単語表示関数
function showLearningWord() {
  if (!location.pathname.includes('learning.html')) return; // learning.htmlでのみ実行

  if (learningWordIndex >= 0 && learningWordIndex < learningWordList.length) {
    const word = learningWordList[learningWordIndex];
    const progressElement = document.getElementById('learningProgress');
    const koreanWordElement = document.getElementById('learningKoreanWord');
    const japaneseTranslationElement = document.getElementById('learningJapaneseTranslation');
    const exampleKoreanElement = document.getElementById('learningExampleKorean');
    const exampleJapaneseElement = document.getElementById('learningExampleJapanese');
    
    if (progressElement) {
      progressElement.textContent = `単語 ${learningWordIndex + 1} / ${learningWordList.length}`;
    }
    if (koreanWordElement) {
      koreanWordElement.textContent = `韓国語: ${word.korean}`;
    }
    if (japaneseTranslationElement) {
      japaneseTranslationElement.textContent = `日本語訳: ${word.japanese}`;
    }
    if (exampleKoreanElement) {
      exampleKoreanElement.textContent = `例文 (韓国語): ${word.example?.korean || 'なし'}`;
    }
    if (exampleJapaneseElement) {
      exampleJapaneseElement.textContent = `例文訳 (日本語): ${word.example?.japanese || 'なし'}`;
    }
  } else {
    MainApp.showCustomAlert('これ以上単語がありません。');
  }

  updateLearningNavigationButtons();
}

// 学習モードで次の単語に進む関数
function nextLearningWord() {
  if (learningWordIndex < learningWordList.length - 1) {
    learningWordIndex++;
    showLearningWord();
  } else {
    MainApp.showCustomAlert('これ以上単語がありません。');
  }
}

// 学習モードで前の単語に戻る関数
function prevLearningWord() {
  if (learningWordIndex > 0) {
    learningWordIndex--;
    showLearningWord();
  } else {
    MainApp.showCustomAlert('これ以上前の単語はありません。');
  }
}

// 学習モードで「勉強中」リストに単語を追加する関数
function addToStudyingList() {
  const currentWord = learningWordList[learningWordIndex];
  if (!studyingList.some((word) => word.korean === currentWord.korean)) {
    studyingList.push(currentWord);
    localStorage.setItem('studyingList', JSON.stringify(studyingList));
    MainApp.showCustomAlert('この単語を勉強中リストに追加しました！');
    updateStudyingWordsList();
  } else {
    MainApp.showCustomAlert('この単語は既に勉強中リストに含まれています。');
  }
}

// 学習モードの終了関数
function endLearningMode() {
  MainApp.hideAllScreens();
  MainApp.showScreen('partOfSpeechSelectionScreen');
}

// 学習モード用のナビゲーションボタンの更新関数
function updateLearningNavigationButtons() {
  if (!location.pathname.includes('learning.html')) return; // learning.htmlでのみ実行

  const prevButton = document.getElementById('prevLearningWordButton');
  const nextButton = document.getElementById('nextLearningWordButton');

  if (prevButton) {
    prevButton.disabled = learningWordIndex <= 0;
  }

  if (nextButton) {
    nextButton.disabled = learningWordIndex >= learningWordList.length - 1;
  }
}

// 学習モードの勉強中リストを更新・表示する関数
function updateStudyingWordsList() {
  if (!location.pathname.includes('learning.html')) return; // learning.htmlでのみ実行

  const list = document.getElementById('studyingWordsList');
  if (!list) return;

  list.innerHTML = '';

  if (studyingList.length === 0) {
    const li = document.createElement('li');
    li.textContent = '勉強中の単語がありません。';
    list.appendChild(li);
  } else {
    studyingList.forEach((word, index) => { // インデックスを取得
      const li = document.createElement('li');
      li.className = 'word-list-item';

      const pKorean = document.createElement('p');
      pKorean.innerHTML = `<strong>韓国語:</strong> ${word.korean}`;
      li.appendChild(pKorean);

      const pJapanese = document.createElement('p');
      pJapanese.innerHTML = `<strong>日本語訳:</strong> ${word.japanese}`;
      li.appendChild(pJapanese);

      if (word.example?.korean) {
        const pExampleKorean = document.createElement('p');
        pExampleKorean.innerHTML = `<strong>例文 (韓国語):</strong> ${word.example.korean}`;
        li.appendChild(pExampleKorean);
      }

      if (word.example?.japanese) {
        const pExampleJapanese = document.createElement('p');
        pExampleJapanese.innerHTML = `<strong>例文訳 (日本語):</strong> ${word.example.japanese}`;
        li.appendChild(pExampleJapanese);
      }

      // 削除ボタンを追加
      const deleteButton = document.createElement('button');
      deleteButton.textContent = '削除';
      deleteButton.className = 'delete-button'; // スタイル用クラス
      deleteButton.onclick = () => removeFromStudyingList(index);
      li.appendChild(deleteButton);

      list.appendChild(li);
    });
  }
}

// 勉強中単語画面を表示する関数
function viewStudyingWords() {
  MainApp.hideAllScreens(); // 既存の画面を隠す場合
  document.getElementById('studyingWordsScreen').style.display = 'flex';
}

// 勉強中リストから単語を削除する関数
function removeFromStudyingList(index) {
  // 指定されたインデックスの単語を削除
  studyingList.splice(index, 1);
  // ローカルストレージを更新
  localStorage.setItem('studyingList', JSON.stringify(studyingList));
  // リストを再表示
  updateStudyingWordsList();
}

// 勉強中単語画面を閉じる関数
function closeStudyingWords() {
  document.getElementById('studyingWordsScreen').style.display = 'none';
}

// 初期化処理（learning.js専用）
document.addEventListener('DOMContentLoaded', () => {
  if (location.pathname.includes('learning.html')) {
    updateStudyingWordsList();
  }
});
