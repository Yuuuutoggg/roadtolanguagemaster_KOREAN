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
  
  // user_created.htmlでのみ動作するように条件分岐を追加
document.addEventListener('DOMContentLoaded', () => {
  if (location.pathname.includes('user_created.html')) {
      // 単語を追加する関数
      function addUserWord() {
          const korean = document.getElementById('userWordKorean').value.trim();
          const japanese = document.getElementById('userWordJapanese').value.trim();
          const exampleKorean = document.getElementById('userWordExampleKorean').value.trim();
          const exampleJapanese = document.getElementById('userWordExampleJapanese').value.trim();
          
          // 入力チェック
          if (!korean || !japanese) {
              showCustomAlert('韓国語の単語と日本語訳は必須です。');
              return;
          }

          // 単語リストに追加
          userWordList.push({
              korean: korean,
              japanese: japanese,
              example: {
                  korean: exampleKorean || undefined,
                  japanese: exampleJapanese || undefined,
              },
          });

          // ローカルストレージに保存
          localStorage.setItem('userWordList', JSON.stringify(userWordList));
          showCustomAlert('単語を追加しました。');

          // メニュー画面に戻る処理とリストの更新
          showUserCreatedMenu();
          updateUserWordList();
      }
  }
});

  // 追加した単語の一覧画面を表示
  function showUserWordList() {
    hideAllScreens();
    updateUserWordList();
    showScreen('userWordListScreen');
  }
  
  // 追加した単語のリストを更新する関数
  function updateUserWordList() {
    const list = document.getElementById('userWordList');
    list.innerHTML = '';
  
    if (userWordList.length === 0) {
      const li = document.createElement('li');
      li.textContent = '追加した単語がありません。';
      list.appendChild(li);
    } else {
      userWordList.forEach((word, index) => {
        const li = document.createElement('li');
        const div = document.createElement('div');
        div.className = 'word-list-item';
  
        const pKorean = document.createElement('p');
        pKorean.innerHTML = `<strong>韓国語:</strong> ${word.korean}`;
        div.appendChild(pKorean);
  
        const pJapanese = document.createElement('p');
        pJapanese.innerHTML = `<strong>日本語訳:</strong> ${word.japanese}`;
        div.appendChild(pJapanese);
  
        if (word.example?.korean) {
          const pExampleKorean = document.createElement('p');
          pExampleKorean.innerHTML = `<strong>例文 (韓国語):</strong> ${word.example.korean}`;
          div.appendChild(pExampleKorean);
        }
  
        if (word.example?.japanese) {
          const pExampleJapanese = document.createElement('p');
          pExampleJapanese.innerHTML = `<strong>例文訳 (日本語):</strong> ${word.example.japanese}`;
          div.appendChild(pExampleJapanese);
        }
  
        const editButton = document.createElement('button');
        editButton.textContent = '編集';
        editButton.onclick = () => editUserWord(index);
        div.appendChild(editButton);
  
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.onclick = () => deleteUserWord(index);
        div.appendChild(deleteButton);
  
        li.appendChild(div);
        list.appendChild(li);
      });
    }
  }
  
  // 単語を編集する関数
  function editUserWord(index) {
    editingWordIndex = index;
    const word = userWordList[index];
  
    document.getElementById('editWordKorean').value = word.korean;
    document.getElementById('editWordJapanese').value = word.japanese;
    document.getElementById('editWordExampleKorean').value = word.example?.korean || '';
    document.getElementById('editWordExampleJapanese').value = word.example?.japanese || '';
  
    hideAllScreens();
    showScreen('editWordScreen');
  }
  
  // 編集内容を保存する関数
  function saveEditedWord() {
    if (editingWordIndex === null) {
      return;
    }
  
    const korean = document.getElementById('editWordKorean').value.trim();
    const japanese = document.getElementById('editWordJapanese').value.trim();
    const exampleKorean = document.getElementById('editWordExampleKorean').value.trim();
    const exampleJapanese = document.getElementById('editWordExampleJapanese').value.trim();
  
    if (!korean || !japanese) {
      showCustomAlert('韓国語の単語と日本語訳は必須です。');
      return;
    }
  
    userWordList[editingWordIndex] = {
      korean: korean,
      japanese: japanese,
      example: {
        korean: exampleKorean || undefined,
        japanese: exampleJapanese || undefined,
      },
    };
  
    localStorage.setItem('userWordList', JSON.stringify(userWordList));
    showCustomAlert('単語を更新しました。');
    showUserWordList();
    updateUserWordList();
  }
  
  // 単語を削除する関数
  function deleteUserWord(index) {
    showCustomConfirm('本当にこの単語を削除しますか？', () => {
      userWordList.splice(index, 1);
      localStorage.setItem('userWordList', JSON.stringify(userWordList));
      updateUserWordList();
    });
  }
  
  // ユーザー作成クイズ開始前画面を表示
  function startUserCreatedQuiz() {
    hideAllScreens();
    showScreen('userQuizStartScreen');
  }
  
  // ユーザー作成クイズを開始する関数
  function startUserQuiz() {
    if (userWordList.length < 4) {
      showCustomAlert('クイズを始めるには、最低4つの単語が必要です。');
      return;
    }
  
    hideAllScreens();
    showScreen('userQuizScreen');
  
    userQuizQuestions = shuffleArray([...userWordList]);
    userQuizScore = 0;
    currentUserQuizQuestionIndex = 0;
    userAnswers = [];
  
    showUserQuizQuestion();
  }
  
  // ユーザー作成クイズの質問を表示する関数
  function showUserQuizQuestion() {
    if (currentUserQuizQuestionIndex < userQuizQuestions.length) {
      const question = userQuizQuestions[currentUserQuizQuestionIndex];
      const choices = getUserQuizChoices(question);
  
      document.getElementById('userQuizQuestionText').textContent = `「${question.korean}」の意味は？`;
      document.getElementById('userQuizFeedbackText').textContent = '';
      document.getElementById('userQuizScoreText').textContent = `スコア: ${userQuizScore}`;
  
      const userQuizChoicesDiv = document.getElementById('userQuizChoices');
      userQuizChoicesDiv.innerHTML = '';
      choices.forEach((choice) => {
        const button = document.createElement('button');
        button.className = 'user-quiz-choice-button';
        button.textContent = choice;
        button.onclick = () => handleUserQuizChoice(choice);
        userQuizChoicesDiv.appendChild(button);
      });
  
      showScreen('userQuizScreen');
    } else {
      endUserQuiz();
    }
  }
  
  // ユーザー作成クイズの選択肢を取得する関数
  function getUserQuizChoices(correctQuestion) {
    let incorrectChoices = userWordList.filter((word) => word.japanese !== correctQuestion.japanese);
  
    // 不正解の選択肢が3つ未満の場合、不足分を補う
    while (incorrectChoices.length < 3) {
      incorrectChoices = incorrectChoices.concat(userWordList.filter((word) => word.japanese !== correctQuestion.japanese));
      // 重複を避けるために Set を使用
      incorrectChoices = Array.from(new Set(incorrectChoices.map(JSON.stringify))).map(JSON.parse);
    }
  
    shuffleArray(incorrectChoices);
    const choices = incorrectChoices.slice(0, 3).map((word) => word.japanese);
    choices.push(correctQuestion.japanese);
    return shuffleArray(choices);
  }
  
  // ユーザー作成クイズの選択肢を処理する関数
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
  
    // 選択肢を一時的に無効化
    const userQuizChoicesDiv = document.getElementById('userQuizChoices');
    const buttons = userQuizChoicesDiv.getElementsByTagName('button');
    for (let btn of buttons) {
      btn.disabled = true;
    }
  
    setTimeout(() => {
      currentUserQuizQuestionIndex++;
      showUserQuizQuestion();
    }, 1000);
  }
  
  // ユーザー作成クイズを終了する関数
  function endUserQuiz() {
    hideAllScreens();
    populateUserQuizSummary();
    showScreen('userQuizResultScreen');
  }
  
  // ユーザー作成クイズの結果を表示する関数
  function populateUserQuizSummary() {
    const list = document.getElementById('userQuizSummaryList');
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
  
    document.getElementById('userQuizFinalScoreText').textContent = `最終スコア: ${userQuizScore} / ${userQuizQuestions.length}`;
  }
  
  // ユーザー作成クイズを再試行する関数
  function retryUserQuiz() {
    hideAllScreens();
    startUserQuiz();
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
  
