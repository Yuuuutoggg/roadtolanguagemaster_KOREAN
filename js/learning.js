// learning.js

// 勉強中リストの初期化（修正後）
let studyingList = JSON.parse(localStorage.getItem('studyingList')) || [];
let selectedPartOfSpeech = '';
let selectedLevel = '';


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
  if (!location.pathname.includes('learning')) {
    console.log('Not on learning.html page.');
    return;
  }

  // sessionStorage から再取得
  selectedLevel = sessionStorage.getItem('selectedLevel') || '';
  selectedPartOfSpeech = sessionStorage.getItem('selectedPartOfSpeech') || '';
  console.log(`Fetching words for Level: ${selectedLevel}, Part of Speech: ${selectedPartOfSpeech}`);

  if (!selectedLevel || !selectedPartOfSpeech) {
    MainApp.showCustomAlert('品詞または難易度が選択されていません。');
    console.error('Selected Level or Part of Speech is missing.');
    return;
  }

  const fileName = MainApp.getFileName(selectedLevel);
  console.log(`Fetching file: data/${fileName}`);

  fetch(`data/${fileName}`)
    .then((response) => {
      console.log(`Response Status: ${response.status}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log('Data fetched successfully:', data);
      if (!data[selectedLevel]) {
        throw new Error(`Level "${selectedLevel}" not found in JSON.`);
      }
      if (!data[selectedLevel][selectedPartOfSpeech]) {
        throw new Error(`Part of Speech "${selectedPartOfSpeech}" not found under Level "${selectedLevel}" in JSON.`);
      }

      learningWordList = data[selectedLevel][selectedPartOfSpeech] || [];
      console.log(`Learning Word List Length: ${learningWordList.length}`);

      if (learningWordList.length === 0) {
        MainApp.showCustomAlert('選択した品詞と難易度に対応する単語がありません。');
        console.warn('No words found for the selected category.');
        return;
      }

      MainApp.shuffleArray(learningWordList);
      learningWordIndex = 0;
      showLearningWord();
      MainApp.showScreen('learningModeScreen');
      console.log('Learning mode screen displayed.');
    })
    .catch((error) => {
      console.error('Error fetching learning words:', error);
      MainApp.showCustomAlert('学習モードの単語データの読み込みに失敗しました。');
    });
}

// 学習モードの単語表示関数
function showLearningWord() {
  if (!location.pathname.includes('learning')) return;

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
MainApp.addToStudyingList = function() {
  const currentWord = learningWordList[learningWordIndex];
  if (!studyingList.some((word) => word.korean === currentWord.korean)) {
    studyingList.push(currentWord);
    localStorage.setItem('studyingList', JSON.stringify(studyingList));
    MainApp.showCustomAlert('この単語を勉強中リストに追加しました！');
    MainApp.updateStudyingWordsList();
  } else {
    MainApp.showCustomAlert('この単語は既に勉強中リストに含まれています。');
  }
};

// 学習モードの終了関数
function endLearningMode() {
  MainApp.hideAllScreens();
  MainApp.showScreen('partOfSpeechSelectionScreen');
}


// 学習モード用のナビゲーションボタンの更新関数
function updateLearningNavigationButtons() {
  if (!location.pathname.includes('learning')) return;

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
MainApp.updateStudyingWordsList = function() {
  if (!location.pathname.includes('learning')) return; // learning.htmlでのみ実行

  const list = document.getElementById('studyingWordsList');
  if (!list) return;

  list.innerHTML = '';

  if (studyingList.length === 0) {
    const li = document.createElement('li');
    li.textContent = '勉強中の単語がありません。';
    list.appendChild(li);
  } else {
    studyingList.forEach((word, index) => {
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
      deleteButton.onclick = () => MainApp.removeFromStudyingList(index);
      li.appendChild(deleteButton);

      list.appendChild(li);
    });
  }
};

// 勉強中リストから単語を削除する関数
MainApp.removeFromStudyingList = function(index) {
  if (index >= 0 && index < studyingList.length) {
    studyingList.splice(index, 1);
    localStorage.setItem('studyingList', JSON.stringify(studyingList));
    MainApp.showCustomAlert('単語が勉強中リストから削除されました。');
    MainApp.updateStudyingWordsList();
  } else {
    MainApp.showCustomAlert('無効なインデックスです。');
  }
};


// 勉強中単語画面を表示する関数
function viewStudyingWords() {
    document.getElementById('studyingWordsScreen').style.display = 'flex'; // 修正: MainApp.showStudyingWords を直接操作に変更
}

// 勉強中単語画面を閉じる関数
MainApp.closeStudyingWords = function() {
    document.getElementById('studyingWordsScreen').style.display = 'none';
};

// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
  if (location.pathname.includes('learning.html')) {
    MainApp.updateStudyingWordsList();
  }
});