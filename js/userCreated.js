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
    const korean = document.getElementById('editWordKorean').value.trim();
    const japanese = document.getElementById('editWordJapanese').value.trim();
    const exampleKorean = document.getElementById('editExampleKorean').value.trim();
    const exampleJapanese = document.getElementById('editExampleJapanese').value.trim();

    if (!korean || !japanese) {
      showAlert('韓国語の単語と日本語訳は必須です。');
      return;
    }

    const index = localStorage.getItem('editingWordIndex');
    if (index === null) {
      showAlert('編集する単語が見つかりません。');
      return;
    }

    // 単語を更新
    userWordList[index] = {
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

    // クイズ画面を動的に生成
    createQuizScreen();
    showUserQuizQuestion();
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

    document.getElementById('editWordKorean').value = editingWordData.korean;
    document.getElementById('editWordJapanese').value = editingWordData.japanese;
    document.getElementById('editExampleKorean').value = editingWordData.example.korean;
    document.getElementById('editExampleJapanese').value = editingWordData.example.japanese;
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
    // 他の公開関数もここに追加
  };
})(MainApp);
