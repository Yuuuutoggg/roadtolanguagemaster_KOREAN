console.log('userCreated.js loaded');


let userWordList = [];
let userQuizQuestions = [];
let currentUserQuizQuestionIndex = 0;
let userQuizScore = 0;
let editingWordIndex = null;
// js/userCreated.js


// ユーザー作成モードのメニュー画面を表示
function showUserCreatedMenu() {
  hideAllScreens();
  showScreen('userCreatedMenuScreen');
}
  
  // 単語追加画面を表示
  function showAddWordScreen() {
    hideAllScreens();
    showScreen('addWordScreen');
    // フォームをリセット
    document.getElementById('userWordKorean').value = '';
    document.getElementById('userWordJapanese').value = '';
    document.getElementById('userWordExampleKorean').value = '';
    document.getElementById('userWordExampleJapanese').value = '';
  }
  
// カスタムアラートモーダルを表示する関数
function showCustomAlert(message) {
  console.log('showCustomAlert called with message:', message); // デバッグ用
  const alertModal = document.getElementById('customAlertModal');
  if (alertModal) {
      document.getElementById('alertMessage').textContent = message;
      alertModal.style.display = 'flex';
  } else {
      console.log('alertModal not found'); // デバッグ用
  }
}

// 単語を追加する関数
function addUserWord() {
  const korean = document.getElementById('userWordKorean').value.trim();
  const japanese = document.getElementById('userWordJapanese').value.trim();
  const exampleKorean = document.getElementById('userWordExampleKorean').value.trim();
  const exampleJapanese = document.getElementById('userWordExampleJapanese').value.trim();

  if (!korean || !japanese) {
    showCustomAlert('韓国語の単語と日本語訳は必須です。');
    return;
  }

  userWordList.push({
    korean: korean,
    japanese: japanese,
    example: {
      korean: exampleKorean || undefined,
      japanese: exampleJapanese || undefined,
    },
  });

  localStorage.setItem('userWordList', JSON.stringify(userWordList));
  showCustomAlert('単語を追加しました。');
  showUserCreatedMenuScreen();
  updateUserWordList();
}


// DOMContentLoadedイベントリスナー
document.addEventListener('DOMContentLoaded', () => {
  console.log('userCreated.js fully loaded and DOMContentLoaded triggered');

  // ローカルストレージから単語リストを読み込む
  const savedWords = localStorage.getItem('userWordList');
  if (savedWords) {
      userWordList = JSON.parse(savedWords);
  }

  // 現在のページパスを取得
  const pathname = location.pathname;

  // 単語追加ページの場合の処理
  if (pathname.includes('add_word.html')) {
      // ボタンの有効化をDOMContentLoaded後に行う
      const addButton = document.querySelector('#addWordScreen button');
      if (addButton) {
          addButton.addEventListener('click', window.addUserWord);
      }
  }

  // 単語一覧ページの場合の処理
  if (pathname.includes('user_word_list.html')) {
      updateUserWordList();
  }

  // 編集ページの場合の処理
  if (pathname.includes('edit_word.html')) {
      const wordData = sessionStorage.getItem('editingWordData');
      const editingWordIndex = sessionStorage.getItem('editingWordIndex');

      if (wordData && editingWordIndex !== null) {
          const word = JSON.parse(wordData);

          document.getElementById('editWordKorean').value = word.korean;
          document.getElementById('editWordJapanese').value = word.japanese;
          document.getElementById('editWordExampleKorean').value = word.example?.korean || '';
          document.getElementById('editWordExampleJapanese').value = word.example?.japanese || '';
      }
  }
});




  // 追加した単語の一覧画面を表示
  function showUserWordList() {
    hideAllScreens();
    updateUserWordList();
    showScreen('userWordListScreen');
  }
  
  function updateUserWordList() {
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
            if (word.example?.korean) {
                const pExampleKorean = document.createElement('p');
                pExampleKorean.innerHTML = `<strong>例文 (韓国語):</strong> ${word.example.korean}`;
                div.appendChild(pExampleKorean);
            }

            // 例文訳（日本語）
            if (word.example?.japanese) {
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
            deleteButton.onclick = () => deleteUserWord(index);
            div.appendChild(deleteButton);

            li.appendChild(div);
            list.appendChild(li);
        });
    }
}


  
function editUserWord(index) {
  const word = userWordList[index];

  // 編集する単語情報をセッションストレージに保存
  sessionStorage.setItem('editingWordIndex', index);
  sessionStorage.setItem('editingWordData', JSON.stringify(word));

  // 編集ページに遷移
  window.location.href = 'edit_word.html';
}

  
function saveEditedWord() {
  // セッションストレージから編集中の単語のインデックスを取得
  const editingWordIndex = sessionStorage.getItem('editingWordIndex');

  // インデックスがnullの場合、処理を中断
  if (editingWordIndex === null) {
      console.error('Editing index not found');
      return;
  }

  // 編集後の内容を取得
  const korean = document.getElementById('editWordKorean').value.trim();
  const japanese = document.getElementById('editWordJapanese').value.trim();
  const exampleKorean = document.getElementById('editWordExampleKorean').value.trim();
  const exampleJapanese = document.getElementById('editWordExampleJapanese').value.trim();

  // 韓国語と日本語が必須
  if (!korean || !japanese) {
      showCustomAlert('韓国語の単語と日本語訳は必須です。');
      return;
  }

  // 単語リストを更新
  userWordList[editingWordIndex] = {
      korean: korean,
      japanese: japanese,
      example: {
          korean: exampleKorean || undefined,
          japanese: exampleJapanese || undefined,
      },
  };

  // ローカルストレージに保存
  localStorage.setItem('userWordList', JSON.stringify(userWordList));

  // 成功メッセージを表示
  showCustomAlert('単語が更新されました。');

  // 単語一覧ページにリダイレクト
  setTimeout(() => {
      window.location.href = 'user_word_list.html';
  }, 1000);
}
  
function deleteUserWord(index) {
  console.log(`Deleting word at index: ${index}`); // デバッグ用

  // 指定されたインデックスの単語を削除
  userWordList.splice(index, 1);

  // ローカルストレージを更新
  localStorage.setItem('userWordList', JSON.stringify(userWordList));

  // 単語リストを再表示
  updateUserWordList();

  // 成功メッセージを表示
  showCustomAlert('単語が削除されました。');
}

// クイズ開始関数
function startUserQuiz() {
  console.log('startUserQuiz called'); // デバッグメッセージ

  // クイズの単語が4つ未満の場合はアラートを表示
  if (userWordList.length < 4) {
      showCustomAlert('クイズを始めるには、最低4つの単語が必要です。');
      return;
  }

  // クイズ用の単語リストをシャッフル
  userQuizQuestions = shuffleArray([...userWordList]);
  userQuizScore = 0;
  currentUserQuizQuestionIndex = 0;
  userAnswers = [];

  console.log('Quiz initialized with questions:', userQuizQuestions); // デバッグメッセージ

  // クイズ画面を動的に生成
  createQuizScreen();
  showUserQuizQuestion();
}

// クイズ画面を動的に生成する関数
function createQuizScreen() {
  // クイズ画面のコンテナを作成
  const quizScreen = document.createElement('div');
  quizScreen.id = 'userQuizScreen';
  quizScreen.className = 'screen fade-in';
  quizScreen.style.display = 'none'; // 初期状態は非表示

  // 質問の表示
  const questionText = document.createElement('p');
  questionText.id = 'userQuizQuestionText';
  quizScreen.appendChild(questionText);

  // フィードバックの表示
  const feedbackText = document.createElement('div');
  feedbackText.id = 'userQuizFeedbackText';
  quizScreen.appendChild(feedbackText);

  // スコアの表示
  const scoreText = document.createElement('div');
  scoreText.id = 'userQuizScoreText';
  quizScreen.appendChild(scoreText);

  // 選択肢のコンテナ
  const choicesDiv = document.createElement('div');
  choicesDiv.id = 'userQuizChoices';
  choicesDiv.className = 'choices-container';
  quizScreen.appendChild(choicesDiv);

  // クイズ画面をapp-containerに追加
  document.querySelector('.app-container').appendChild(quizScreen);

  // クイズ画面を表示
  hideAllScreens();
  quizScreen.style.display = 'flex';
}

// 質問を表示する関数
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
  const questionTextElement = document.getElementById('userQuizQuestionText');
  const feedbackTextElement = document.getElementById('userQuizFeedbackText');
  const scoreTextElement = document.getElementById('userQuizScoreText');
  const userQuizChoicesDiv = document.getElementById('userQuizChoices');

  // エラーチェック
  if (!questionTextElement || !feedbackTextElement || !scoreTextElement || !userQuizChoicesDiv) {
      console.error('Quiz elements not found');
      return;
  }

  // 質問と選択肢を表示
  questionTextElement.textContent = `「${question.korean}」の意味は？`;
  feedbackTextElement.textContent = '';
  scoreTextElement.textContent = `スコア: ${userQuizScore}`;

  userQuizChoicesDiv.innerHTML = '';
  choices.forEach(choice => {
      const button = document.createElement('button');
      button.className = 'user-quiz-choice-button';
      button.textContent = choice;
      button.onclick = () => handleUserQuizChoice(choice);
      userQuizChoicesDiv.appendChild(button);
  });

  console.log('Question displayed:', question); // デバッグメッセージ
}

// 選択肢を生成する関数
function getUserQuizChoices(correctQuestion) {
  let incorrectChoices = userWordList.filter(word => word.japanese !== correctQuestion.japanese);

  // 最大3つの不正解選択肢を抽出
  incorrectChoices = shuffleArray(incorrectChoices).slice(0, 3);

  // 正解選択肢を追加
  const choices = incorrectChoices.map(word => word.japanese);
  choices.push(correctQuestion.japanese);

  console.log('Choices generated:', choices); // デバッグメッセージ
  return shuffleArray(choices);
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

  document.getElementById('userQuizScoreText').textContent = `スコア: ${userQuizScore}`;
  document.getElementById('userQuizFeedbackText').textContent = isCorrect ? '〇' : '✖';

  // 次の質問に進む
  currentUserQuizQuestionIndex++;
  setTimeout(() => showUserQuizQuestion(), 500); // 短い遅延で次の質問を表示
}

// クイズを終了する関数
function endUserQuiz() {
  console.log('endUserQuiz called'); // デバッグ用

  // すべての画面を非表示にする
  hideAllScreens();

  // 結果画面を表示する
  populateUserQuizSummary(); 
  document.getElementById('userQuizResultScreen').style.display = 'flex';
}

// 画面を切り替えるための関数
function hideAllScreens() {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
      screen.style.display = 'none';
  });
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

  // 画面の切り替え
  hideAllScreens();
  document.getElementById('userQuizStartScreen').style.display = 'flex';
}


// 配列をシャッフルする関数
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
  
  // 使い方ガイド画面を表示する関数
  function showUserGuide() {
    hideAllScreens();
    showScreen('userGuideScreen');
  }
  
  // 使い方ガイド画面から戻る
  function backToUserCreatedMenu() {
    hideAllScreens();
    showScreen('userCreatedMenuScreen');
  }
  

  function backToUserCreatedMenu() {
    console.log('Navigating back to the user created menu'); // デバッグ用

    // user_created.htmlにリダイレクト
    window.location.href = 'user_created.html';
}
