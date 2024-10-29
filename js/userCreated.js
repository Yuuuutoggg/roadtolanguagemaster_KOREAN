// userCreated.js
const UserCreatedApp = (function(MainApp) {
  console.log('userCreated.js loaded');

  // グローバル変数の定義
  let userWordList = JSON.parse(localStorage.getItem('userWordList')) || [];
  let userQuizQuestions = [];
  let currentUserQuizQuestionIndex = 0;
  let userQuizScore = 0;
  let userAnswers = [];

  // 共通関数（main.jsと連携）
  function showAlert(message) {
    console.log('showAlert called with message:', message); // デバッグ用
    MainApp.showCustomAlert(message);
  }

  function closeAlert() {
    MainApp.closeCustomAlert();
  }

  function showConfirm(message, yesCallback, noCallback) {
    MainApp.confirmMessage = message;
    MainApp.confirmYesCallback = yesCallback;
    MainApp.showCustomConfirm();
  }

  // ========================
  // 単語管理機能
  // ========================

  function addUserWord() {
    const korean = document.getElementById('userWordKorean').value.trim();
    const japanese = document.getElementById('userWordJapanese').value.trim();
    const exampleKorean = document.getElementById('userWordExampleKorean').value.trim();
    const exampleJapanese = document.getElementById('userWordExampleJapanese').value.trim();

    if (!korean || !japanese) {
      showAlert('韓国語の単語と日本語訳は必須です。');
      return;
    }

    // 新しい単語をグローバルな userWordList に追加
    userWordList.push({
      korean: korean,
      japanese: japanese,
      example: {
        korean: exampleKorean || '',
        japanese: exampleJapanese || '',
      },
    });

    // ローカルストレージに保存
    localStorage.setItem('userWordList', JSON.stringify(userWordList));

    // 成功メッセージの表示
    showAlert('単語を追加しました。');

    // 単語一覧を即座に更新
    if (document.getElementById('userWordListScreen')) {
      updateUserWordList();
    }

    // フォームをリセット
    document.getElementById('addWordForm').reset();
  }

  // 単語一覧を更新する関数
  function updateUserWordList() {
    console.log('Updating user word list...'); // デバッグ用

    // 最新のローカルストレージから単語リストを取得
    userWordList = JSON.parse(localStorage.getItem('userWordList')) || [];
    console.log('Current userWordList:', userWordList); // 現在の単語リストを確認

    const list = document.getElementById('userWordList');

    // 要素が存在するか確認
    if (!list) {
      console.error('Element with ID "userWordList" not found');
      return;
    }

    list.innerHTML = '';

    if (userWordList.length === 0) {
      const li = document.createElement('li');
      li.textContent = '追加した単語がありません。';
      list.appendChild(li);
    } else {
      userWordList.forEach((word, index) => {
        const li = document.createElement('li');
        li.className = 'word-list-item';

        const div = document.createElement('div');
        div.className = 'word-details';

        // 韓国語の単語
        const pKorean = document.createElement('p');
        pKorean.innerHTML = `<strong>韓国語:</strong> ${word.korean}`;
        div.appendChild(pKorean);

        // 日本語訳
        const pJapanese = document.createElement('p');
        pJapanese.innerHTML = `<strong>日本語訳:</strong> ${word.japanese}`;
        div.appendChild(pJapanese);

        // 例文（韓国語）
        if (word.example.korean) {
          const pExampleKorean = document.createElement('p');
          pExampleKorean.innerHTML = `<strong>例文 (韓国語):</strong> ${word.example.korean}`;
          div.appendChild(pExampleKorean);
        }

        // 例文訳（日本語）
        if (word.example.japanese) {
          const pExampleJapanese = document.createElement('p');
          pExampleJapanese.innerHTML = `<strong>例文訳 (日本語):</strong> ${word.example.japanese}`;
          div.appendChild(pExampleJapanese);
        }

        // 編集ボタンの追加
        const editButton = document.createElement('button');
        editButton.textContent = '編集';
        editButton.className = 'edit-button';
        editButton.onclick = () => editUserWord(index);
        div.appendChild(editButton);

        // 削除ボタンの追加
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.className = 'delete-button';
        deleteButton.onclick = () => confirmDeleteWord(index);
        div.appendChild(deleteButton);

        li.appendChild(div);
        list.appendChild(li);
      });
    }
    console.log('User word list updated successfully'); // デバッグ用
  }

  // 編集する関数
  function editUserWord(index) {
    const word = userWordList[index];
    localStorage.setItem('editingWordIndex', index);
    localStorage.setItem('editingWordData', JSON.stringify(word));
    window.location.href = 'edit_word.html';
  }

  // 単語を削除する関数（確認モーダル付き）
  function confirmDeleteWord(index) {
    showConfirm('本当にこの単語を削除しますか？', () => deleteWord(index), () => {});
  }

  // 単語を削除する関数
  function deleteWord(index) {
    console.log(`Deleting word at index: ${index}`);
    userWordList.splice(index, 1);
    localStorage.setItem('userWordList', JSON.stringify(userWordList));
    showAlert('単語が削除されました。');

    // 単語一覧の更新
    updateUserWordList();
  }

// 編集した単語を保存する関数
function saveEditedWord() {
  const koreanElement = document.getElementById('editWordKorean');
  const japaneseElement = document.getElementById('editWordJapanese');
  const exampleKoreanElement = document.getElementById('editExampleKorean');
  const exampleJapaneseElement = document.getElementById('editExampleJapanese');

  if (!koreanElement || !japaneseElement || !exampleKoreanElement || !exampleJapaneseElement) {
    showAlert('フォームの要素が正しく読み込まれていません。');
    return;
  }

  const korean = koreanElement.value.trim();
  const japanese = japaneseElement.value.trim();
  const exampleKorean = exampleKoreanElement.value.trim();
  const exampleJapanese = exampleJapaneseElement.value.trim();

  if (!korean || !japanese) {
    showAlert('韓国語の単語と日本語訳は必須です。');
    return;
  }

  const index = localStorage.getItem('editingWordIndex');
  if (index === null) {
    showAlert('編集する単語が見つかりません。');
    return;
  }

  const wordIndex = parseInt(index, 10);
  if (isNaN(wordIndex) || wordIndex < 0 || wordIndex >= userWordList.length) {
    showAlert('編集する単語のインデックスが無効です。');
    return;
  }

  // 単語を更新
  userWordList[wordIndex] = {
    korean: korean,
    japanese: japanese,
    example: {
      korean: exampleKorean || '',
      japanese: exampleJapanese || '',
    },
  };

  // ローカルストレージに保存
  localStorage.setItem('userWordList', JSON.stringify(userWordList));

  // 編集フラグをクリア
  localStorage.removeItem('editingWordIndex');
  localStorage.removeItem('editingWordData');

  // 成功メッセージの表示
  showAlert('単語を更新しました。');

  // リダイレクト
  window.location.href = 'user_word_list.html';
}

// 閉じるアラート関数
function closeAlert() {
  MainApp.closeCustomAlert();
}

// 追加: グローバルに closeCustomAlert を定義
window.closeCustomAlert = closeAlert;


  // ========================
  // クイズ機能
  // ========================
// クイズを開始する関数
function startUserQuiz() {
  console.log('startUserQuiz called'); // デバッグメッセージ

  // クイズの単語が4つ未満の場合はアラートを表示
  if (userWordList.length < 4) {
    showAlert('クイズを始めるには、最低4つの単語が必要です。');
    return;
  }

  // クイズ用の単語リストをシャッフル
  userQuizQuestions = MainApp.shuffleArray([...userWordList]);
  userQuizScore = 0;
  currentUserQuizQuestionIndex = 0;
  userAnswers = [];

  console.log('Quiz initialized with questions:', userQuizQuestions); // デバッグメッセージ

  // 現在の画面を隠す
  MainApp.hideAllScreens();

  // クイズ画面を表示する（既存のHTML要素を使用）
  MainApp.showScreen('userQuizScreen');

  // クイズを開始する
  showUserQuizQuestion();
}

// クイズの質問を表示する関数
function showUserQuizQuestion() {
  console.log('showUserQuizQuestion called'); // デバッグ用

  // クイズが終了した場合
  if (currentUserQuizQuestionIndex >= userQuizQuestions.length) {
    endUserQuiz();
    return;
  }

  const question = userQuizQuestions[currentUserQuizQuestionIndex];
  const choices = getUserQuizChoices(question);

  // 必要な要素を取得
  const questionTextElement = document.getElementById('quizQuestionText');
  const feedbackTextElement = document.getElementById('quizFeedbackText');
  const scoreTextElement = document.getElementById('quizScoreText');
  const quizChoicesDiv = document.getElementById('quizChoices');

  // エラーチェック
  if (!questionTextElement || !feedbackTextElement || !scoreTextElement || !quizChoicesDiv) {
    console.error('Quiz elements not found');
    return;
  }

  // 質問と選択肢を表示
  questionTextElement.textContent = `「${question.korean}」の意味は？`;
  feedbackTextElement.textContent = '';
  scoreTextElement.textContent = `スコア: ${userQuizScore}`;

  quizChoicesDiv.innerHTML = '';
  choices.forEach(choice => {
    const button = document.createElement('button');
    button.className = 'user-quiz-choice-button';
    button.textContent = choice;
    button.onclick = () => handleUserQuizChoice(choice);
    quizChoicesDiv.appendChild(button);
  });

  console.log('Question displayed:', question); // デバッグメッセージ
}

// 選択肢を生成する関数
function getUserQuizChoices(correctQuestion) {
  let incorrectChoices = userWordList.filter(word => word.japanese !== correctQuestion.japanese);

  // 最大3つの不正解選択肢を抽出
  incorrectChoices = MainApp.shuffleArray(incorrectChoices).slice(0, 3);

  // 正解選択肢を追加
  const choices = incorrectChoices.map(word => word.japanese);
  choices.push(correctQuestion.japanese);

  console.log('Choices generated:', choices); // デバッグメッセージ
  return MainApp.shuffleArray(choices);
}

// 選択された選択肢を処理する関数
function handleUserQuizChoice(selectedChoice) {
  const question = userQuizQuestions[currentUserQuizQuestionIndex];
  const isCorrect = selectedChoice === question.japanese;

  userAnswers.push({
    korean: question.korean,
    selected: selectedChoice,
    correct: question.japanese,
    isCorrect: isCorrect,
  });

  if (isCorrect) {
    userQuizScore++;
  }

  // フィードバックの表示
  const feedbackTextElement = document.getElementById('quizFeedbackText');
  feedbackTextElement.textContent = isCorrect ? '〇' : '✖';

  // スコアの更新
  const scoreTextElement = document.getElementById('quizScoreText');
  scoreTextElement.textContent = `スコア: ${userQuizScore}`;

  // 次の質問に進む
  currentUserQuizQuestionIndex++;
  setTimeout(() => showUserQuizQuestion(), 500); // 短い遅延で次の質問を表示
}

// クイズを終了する関数
function endUserQuiz() {
  console.log('endUserQuiz called'); // デバッグ用

  // クイズ画面を非表示にする
  MainApp.hideAllScreens();

  // 結果画面を表示する
  populateUserQuizSummary(); 
  MainApp.showScreen('userQuizResultScreen');
}

// クイズの結果を表示する関数
function populateUserQuizSummary() {
  console.log('populateUserQuizSummary called'); // デバッグ用

  const list = document.getElementById('userQuizSummaryList');

  // エラーチェック
  if (!list) {
    console.error('Element with ID "userQuizSummaryList" not found');
    return;
  }

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
      pYourAnswer.textContent = `あなたの答え: ${answer.selected}`;
      li.appendChild(pYourAnswer);

      const pCorrect = document.createElement('p');
      pCorrect.textContent = `正解: ${answer.correct}`;
      li.appendChild(pCorrect);

      const pResult = document.createElement('p');
      pResult.textContent = `結果: ${answer.isCorrect ? '正解' : '不正解'}`;
      li.appendChild(pResult);

      list.appendChild(li);
    });
  }

  const finalScoreText = document.getElementById('userQuizFinalScoreText');
  if (finalScoreText) {
    finalScoreText.textContent = `最終スコア: ${userQuizScore} / ${userQuizQuestions.length}`;
  }
}

// 再試行ボタンの処理
function retryUserQuiz() {
  console.log('retryUserQuiz called'); // デバッグ用

  // クイズのリセット
  userQuizScore = 0;
  currentUserQuizQuestionIndex = 0;
  userAnswers = [];

  // 結果画面を非表示にする
  MainApp.hideAllScreens();

  // クイズ開始前画面を表示する
  MainApp.showScreen('userQuizStartScreen');
}

// クイズ機能の終了後メニューに戻る関数
function backToUserCreatedMenu() {
  MainApp.hideAllScreens();
  MainApp.showScreen('userQuizStartScreen'); // 必要に応じて他のメニュー画面IDに変更
}


  // ... 以降のクイズ関連関数も同様に名前空間内に配置

  // ========================
  // ページ初期化
  // ========================

  // 単語一覧ページを初期化する
  function initializeUserWordListPage() {
    console.log('Initializing user word list page...');
    updateUserWordList();
  }

// 編集ページを初期化する
function initializeEditWordPage() {
  console.log('Initializing edit word page...');
  const editingWordData = JSON.parse(localStorage.getItem('editingWordData'));
  const editingWordIndex = localStorage.getItem('editingWordIndex');

  if (editingWordData === null || editingWordIndex === null) {
    showAlert('編集する単語が見つかりません。');
    window.location.href = 'user_word_list.html';
    return;
  }

  const koreanElement = document.getElementById('editWordKorean');
  const japaneseElement = document.getElementById('editWordJapanese');
  const exampleKoreanElement = document.getElementById('editExampleKorean');
  const exampleJapaneseElement = document.getElementById('editExampleJapanese');

  if (!koreanElement || !japaneseElement || !exampleKoreanElement || !exampleJapaneseElement) {
    showAlert('フォームの要素が正しく読み込まれていません。');
    return;
  }

  koreanElement.value = editingWordData.korean || '';
  japaneseElement.value = editingWordData.japanese || '';
  
  // 例文の存在を確認してから値を設定
  if (editingWordData.example) {
    exampleKoreanElement.value = editingWordData.example.korean || '';
    exampleJapaneseElement.value = editingWordData.example.japanese || '';
  } else {
    exampleKoreanElement.value = '';
    exampleJapaneseElement.value = '';
  }
}



  // ユーザーガイドページの初期化（必要に応じて追加）

  // ユーザー作成モードの初期化
  function initializeUserCreatedMenu() {
    console.log('Initializing user created menu...');
    // 特に初期化が必要な場合はここに追加
  }

  // クイズ開始ページの初期化
  function initializeUserQuizStartPage() {
    console.log('Initializing user quiz start page...');
    // 特に初期化が必要な場合はここに追加
  }

  // ユーザーガイドページの初期化
  function initializeUserGuidePage() {
    console.log('Initializing user guide page...');
    // 特に初期化が必要な場合はここに追加
  }

  // ページごとの初期化を行う
  function initializePages() {
    if (document.getElementById('userWordListScreen')) {
      initializeUserWordListPage();
    }

    if (document.getElementById('editWordScreen')) {
      initializeEditWordPage();
    }

    if (document.getElementById('userCreatedMenuScreen')) {
      initializeUserCreatedMenu();
    }

    if (document.getElementById('userQuizStartScreen')) {
      initializeUserQuizStartPage();
    }

    if (document.getElementById('userGuideScreen')) {
      initializeUserGuidePage();
    }
  }

  // ページ初期化を実行
  initializePages();

// 公開する関数
return {
  showAlert,
  closeAlert,
  showConfirm,
  addUserWord,
  updateUserWordList,
  editUserWord,
  confirmDeleteWord,
  deleteWord,
  saveEditedWord,
  startUserQuiz,
  retryUserQuiz,              // 追加
  backToUserCreatedMenu,      // 追加
  
  // 他の公開関数もここに追加
};

})(MainApp);
