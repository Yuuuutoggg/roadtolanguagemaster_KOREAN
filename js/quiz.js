// js/quiz.js

// クイズ開始関数
function startQuiz() {
    quizQuestions = [];
    quizScore = 0;
    currentQuizQuestionIndex = 0;
    userAnswers = [];
    loadQuizQuestions();
  }
  
  // クイズ用の質問読み込み関数
  function loadQuizQuestions() {
    const fileName = getFileName(selectedLevel);
    fetch(`data/${fileName}`)
      .then((response) => response.json())
      .then((data) => {
        let allWords = [];
        for (let pos in data[selectedLevel]) {
          if (Array.isArray(data[selectedLevel][pos])) {
            allWords = allWords.concat(data[selectedLevel][pos]);
          }
        }
  
        if (allWords.length === 0) {
          showCustomAlert('選択したレベルに対応する単語がありません。');
          resetApp();
          return;
        }
  
        shuffleArray(allWords);
        const numberOfQuestions = Math.min(10, allWords.length);
        for (let i = 0; i < numberOfQuestions; i++) {
          const correctWord = allWords[i];
          const wrongChoices = getWrongChoices(allWords, correctWord, 3);
          const choices = shuffleArray([correctWord.japanese, ...wrongChoices]);
          quizQuestions.push({
            korean: correctWord.korean,
            correct: correctWord.japanese,
            choices: choices,
          });
        }
  
        showQuizQuestion();
      })
      .catch((error) => {
        console.error('クイズ用の単語データの読み込みに失敗しました:', error);
        showCustomAlert('クイズ用の単語データの読み込みに失敗しました。');
        resetApp();
      });
  }
  
  // 間違い選択肢を取得する関数
  function getWrongChoices(allWords, correctWord, count) {
    const wrongWords = allWords.filter((word) => word.japanese !== correctWord.japanese);
    shuffleArray(wrongWords);
    const choices = wrongWords.slice(0, count).map((word) => word.japanese);
    return choices;
  }
  
  // クイズの質問を表示する関数
  function showQuizQuestion() {
    if (currentQuizQuestionIndex < quizQuestions.length) {
      const question = quizQuestions[currentQuizQuestionIndex];
      document.getElementById('quizQuestionText').textContent = `「${question.korean}」の意味は？`;
      document.getElementById('quizFeedbackText').textContent = '';
      document.getElementById('quizScoreText').textContent = `スコア: ${quizScore}`;
  
      const quizChoicesDiv = document.getElementById('quizChoices');
      quizChoicesDiv.innerHTML = '';
      question.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'quiz-choice-button';
        button.textContent = choice;
        button.onclick = () => handleQuizChoice(index);
        quizChoicesDiv.appendChild(button);
      });
  
      showScreen('quizScreen');
    } else {
      endQuiz();
    }
  }
  
  // クイズの選択肢を処理する関数
  function handleQuizChoice(selectedIndex) {
    const question = quizQuestions[currentQuizQuestionIndex];
    const selectedChoice = question.choices[selectedIndex];
    const isCorrect = selectedChoice === question.correct;
  
    userAnswers.push({
      korean: question.korean,
      selected: selectedChoice,
      correct: question.correct,
      isCorrect: isCorrect,
    });
  
    if (!isCorrect) {
      // 間違えた単語を保存
      if (!incorrectWords.some((word) => word.korean === question.korean)) {
        incorrectWords.push({
          korean: question.korean,
          japanese: question.correct,
        });
        localStorage.setItem('incorrectWords', JSON.stringify(incorrectWords));
      }
    }
  
    if (isCorrect) {
      quizScore++;
    }
    document.getElementById('quizScoreText').textContent = `スコア: ${quizScore}`;
    document.getElementById('quizFeedbackText').textContent = isCorrect ? '〇' : '✖';
  
    // 選択肢を一時的に無効化
    const quizChoicesDiv = document.getElementById('quizChoices');
    const buttons = quizChoicesDiv.getElementsByTagName('button');
    for (let btn of buttons) {
      btn.disabled = true;
    }
  
    setTimeout(() => {
      currentQuizQuestionIndex++;
      showQuizQuestion();
    }, 1000);
  }
  
  // クイズ終了関数
  function endQuiz() {
    hideAllScreens();
    populateQuizSummary();
    showScreen('quizSummaryScreen');
  }
  
  // クイズ終了後の解答一覧を表示する関数
  function populateQuizSummary() {
    const list = document.getElementById('quizSummaryList');
    list.innerHTML = '';
  
    if (userAnswers.length === 0) {
      const li = document.createElement('li');
      li.textContent = '解答がありません。';
      list.appendChild(li);
    } else {
      userAnswers.forEach((answer, index) => {
        const li = document.createElement('li');
        li.className = answer.isCorrect ? 'correct' : 'incorrect';
  
        const pQuestion = document.createElement('p');
        pQuestion.textContent = `Q${index + 1}: 「${answer.korean}」の意味は？`;
        li.appendChild(pQuestion);
  
        const pYourAnswer = document.createElement('p');
        pYourAnswer.textContent = `あなたの答え: ${answer.selected} ${answer.isCorrect ? '〇' : '✖'}`;
        li.appendChild(pYourAnswer);
  
        const pCorrect = document.createElement('p');
        pCorrect.textContent = `正解: ${answer.correct}`;
        li.appendChild(pCorrect);
  
        list.appendChild(li);
      });
    }
  
    document.getElementById('quizFinalScoreText').textContent = `最終スコア: ${quizScore} / ${quizQuestions.length}`;
  }
  
  // クイズをリトライする関数
  function retryQuiz() {
    hideAllScreens();
    startQuiz();
  }
  
  // 間違えた単語の一覧を表示する関数
  function viewIncorrectWords() {
    hideAllScreens();
    updateIncorrectWordsList();
    showScreen('incorrectWordsScreen');
  }
  
  // 間違えた単語の一覧を表示する関数（レベル選択画面から）
  function viewIncorrectWordsFromLevelSelection() {
    hideAllScreens();
    updateIncorrectWordsList();
    showScreen('incorrectWordsScreen');
  }
  
  // 間違えた単語リストを更新する関数
  function updateIncorrectWordsList() {
    const list = document.getElementById('incorrectWordsList');
    list.innerHTML = '';
  
    if (incorrectWords.length === 0) {
      const li = document.createElement('li');
      li.textContent = '間違えた単語はありません。';
      list.appendChild(li);
    } else {
      incorrectWords.forEach((word, index) => {
        const li = document.createElement('li');
        const div = document.createElement('div');
        div.className = 'word-list-item';
  
        const pKorean = document.createElement('p');
        pKorean.innerHTML = `<strong>韓国語:</strong> ${word.korean}`;
        div.appendChild(pKorean);
  
        const pJapanese = document.createElement('p');
        pJapanese.innerHTML = `<strong>日本語訳:</strong> ${word.japanese}`;
        div.appendChild(pJapanese);
  
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.onclick = () => removeFromIncorrectWords(index);
        div.appendChild(deleteButton);
  
        li.appendChild(div);
        list.appendChild(li);
      });
    }
  }
  
  // 間違えた単語を削除する関数
  function removeFromIncorrectWords(index) {
    incorrectWords.splice(index, 1);
    localStorage.setItem('incorrectWords', JSON.stringify(incorrectWords));
    updateIncorrectWordsList();
  }
  
  // 間違えた単語一覧画面を閉じる関数
  function closeIncorrectWordsScreen() {
    hideAllScreens();
    if (selectedMode === 'quiz') {
      showScreen('levelSelectionScreen');
    } else {
      showScreen('modeSelectionScreen');
    }
  }
  
  // 復習モードを開始する関数
  function startReviewMode() {
    if (incorrectWords.length === 0) {
      showCustomAlert('間違えた単語はありません。');
      return;
    }
    hideAllScreens();
    selectedMode = 'quiz';
    quizQuestions = [];
    quizScore = 0;
    currentQuizQuestionIndex = 0;
    userAnswers = [];
    loadReviewQuizQuestions();
  }
  
  // レベル選択画面から復習モードを開始する関数
  function startReviewModeFromLevelSelection() {
    if (incorrectWords.length === 0) {
      showCustomAlert('間違えた単語はありません。');
      return;
    }
    hideAllScreens();
    selectedMode = 'quiz';
    quizQuestions = [];
    quizScore = 0;
    currentQuizQuestionIndex = 0;
    userAnswers = [];
    loadReviewQuizQuestions();
  }
  
  // 復習モード用のクイズ質問を読み込む関数
  function loadReviewQuizQuestions() {
    if (incorrectWords.length === 0) {
      showCustomAlert('復習する単語がありません。');
      resetApp();
      return;
    }
  
    loadAllWords()
      .then((allWords) => {
        incorrectWords.forEach((word) => {
          const wrongChoices = getWrongChoicesForReview(word, allWords, 3);
          const choices = shuffleArray([word.japanese, ...wrongChoices]);
          quizQuestions.push({
            korean: word.korean,
            correct: word.japanese,
            choices: choices,
          });
        });
  
        showQuizQuestion();
      })
      .catch((error) => {
        console.error('単語データの読み込みに失敗しました:', error);
        showCustomAlert('単語データの読み込みに失敗しました。');
        resetApp();
      });
  }
  
  // 復習モード用に全ての単語を読み込む関数
  function loadAllWords() {
    const levels = ['beginner', 'intermediate', 'advanced'];
    const promises = levels.map((level) => {
      const fileName = getFileName(level);
      return fetch(`data/${fileName}`)
        .then((response) => response.json())
        .then((data) => {
          let allWords = [];
          for (let pos in data[level]) {
            if (Array.isArray(data[level][pos])) {
              allWords = allWords.concat(data[level][pos]);
            }
          }
          return allWords;
        });
    });
  
    return Promise.all(promises).then((results) => {
      return results.flat();
    });
  }
  
  // 復習モード用の間違い選択肢を取得する関数
  function getWrongChoicesForReview(correctWord, allWords, count) {
    const wrongWords = allWords.filter((word) => word.japanese !== correctWord.japanese);
    shuffleArray(wrongWords);
    const choices = wrongWords.slice(0, count).map((word) => word.japanese);
    return choices;
  }
  