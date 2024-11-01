<?php
// 文字エンコーディングを設定
mb_language("Japanese");
mb_internal_encoding("UTF-8");

// フォームからの入力を取得し、サニタイズ
$name = htmlspecialchars($_POST['name'], ENT_QUOTES, 'UTF-8');
$email = htmlspecialchars($_POST['email'], ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($_POST['message'], ENT_QUOTES, 'UTF-8');

// メールの宛先
$to = 'languagemaster_app@gmail.com';

// メールの件名
$subject = 'お問い合わせフォームからのメッセージ';

// メールの本文
$body = "お名前: {$name}\nメールアドレス: {$email}\n\nお問い合わせ内容:\n{$message}";

// メールのヘッダー
$headers = "From: {$email}\r\n";
$headers .= "Reply-To: {$email}\r\n";

// メール送信
if (mb_send_mail($to, $subject, $body, $headers)) {
    // 送信成功時の処理
    header('Location: thank_you.html');
    exit;
} else {
    // 送信失敗時の処理
    echo '申し訳ございませんが、メッセージの送信に失敗しました。時間をおいて再度お試しください。';
}
?>
