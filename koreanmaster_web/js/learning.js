// js/learning.js

// 学習モードの単語読み込み関数
function fetchLearningWords() {
    const fileName = getFileName(selectedLevel);
    fetch(`data/${fileName}`)
      .then((response) => response.json())
      .then((data) => {
        // 指定された品詞の単語リストを取得
        learningWordList = data[selectedLevel][selectedPartOfSpeech] || [];
        if (learningWordList.length === 0) {
          showCustomAlert('選択した品詞と難易度に対応する単語がありません。');
          return;
        }
        // 単語をシャッフル
        shuffleArray(learningWordList);
        learningWordIndex = 0;
        // 最初の単語を表示
        showLearningWord();
        // 学習モード画面を表示
        showScreen('learningModeScreen');
      })
      .catch((error) => {
        console.error('学習モードの単語データの読み込みに失敗しました:', error);
        showCustomAlert('学習モードの単語データの読み込みに失敗しました。');
      });
  }
  
  // 学習モードの単語表示関数
  function showLearningWord() {
    if (learningWordIndex >= 0 && learningWordIndex < learningWordList.length) {
      const word = learningWordList[learningWordIndex];
      document.getElementById('learningProgress').textContent = `単語 ${learningWordIndex + 1} / ${learningWordList.length}`;
      document.getElementById('learningKoreanWord').textContent = `韓国語: ${word.korean}`;
      document.getElementById('learningJapaneseTranslation').textContent = `日本語訳: ${word.japanese}`;
      document.getElementById('learningExampleKorean').textContent = `例文 (韓国語): ${word.example?.korean || 'なし'}`;
      document.getElementById('learningExampleJapanese').textContent = `例文訳 (日本語): ${word.example?.japanese || 'なし'}`;
    } else {
      showCustomAlert('これ以上単語がありません。');
    }
  
    updateLearningNavigationButtons();
  }
  
  // 学習モードで次の単語に進む関数
  function nextLearningWord() {
    if (learningWordIndex < learningWordList.length - 1) {
      learningWordIndex++;
      showLearningWord();
    } else {
      showCustomAlert('これ以上単語がありません。');
    }
  }
  
  // 学習モードで前の単語に戻る関数
  function prevLearningWord() {
    if (learningWordIndex > 0) {
      learningWordIndex--;
      showLearningWord();
    } else {
      showCustomAlert('これ以上前の単語はありません。');
    }
  }
  
  // 学習モードで「勉強中」リストに単語を追加する関数
  function addToStudyingList() {
    const currentWord = learningWordList[learningWordIndex];
    if (!studyingList.some((word) => word.korean === currentWord.korean)) {
      studyingList.push(currentWord);
      localStorage.setItem('studyingList', JSON.stringify(studyingList));
      showCustomAlert('この単語を勉強中リストに追加しました！');
      updateStudyingWordsList();
    } else {
      showCustomAlert('この単語は既に勉強中リストに含まれています。');
    }
  }
  
  // 学習モードの終了関数
  function endLearningMode() {
    hideAllScreens();
    if (selectedMode === 'practice' || selectedMode === 'learning') {
      showScreen('partOfSpeechSelectionScreen');
    }
  }
  
  // 学習モード用のナビゲーションボタンの更新関数
  function updateLearningNavigationButtons() {
    const prevButton = document.getElementById('prevLearningWordButton');
    const nextButton = document.getElementById('nextLearningWordButton');
  
    if (learningWordIndex > 0) {
      prevButton.disabled = false;
    } else {
      prevButton.disabled = true;
    }
  
    if (learningWordIndex < learningWordList.length - 1) {
      nextButton.disabled = false;
    } else {
      nextButton.disabled = true;
    }
  }
  
  // 勉強中リストを更新・表示する関数
  function updateStudyingWordsList() {
    const list = document.getElementById('studyingWordsList');
    list.innerHTML = '';
  
    if (studyingList.length === 0) {
      const li = document.createElement('li');
      li.textContent = '勉強中の単語はありません。';
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
  
        list.appendChild(li);
      });
    }
  }
  
  // 勉強中単語画面を表示する関数
function viewStudyingWords() {
    document.getElementById('studyingWordsScreen').style.display = 'flex';
}

// 勉強中単語画面を閉じる関数
function closeStudyingWords() {
    document.getElementById('studyingWordsScreen').style.display = 'none';
}