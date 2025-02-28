<?php
  require 'api/v1/db.php';
  
  if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (!empty($_COOKIE['sessid'])) {
      $getSessId = $pdo->prepare('
        select exists (
          select * from sessions
          where session_id = :sessid
        )
      ');
      $getSessId->execute(['sessid' => $_COOKIE['sessid']]);

      if ($getSessId->fetchColumn() > 0) {
        http_response_code(409);
        exit();
        
      } else {
        setcookie('sessid', '', time() - 1, '/');
      }
    }

    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $passwordInput = $_POST['password'];
    $tz = in_array($_POST['tz'], DateTimeZone::listIdentifiers()) ? $_POST['tz'] : '';

    if (empty($email) || empty($passwordInput) || empty($tz)) {
      http_response_code(422);
      exit();
    }

    $getUserData = $pdo->prepare('
      select id, password
      from users
      where email = :email
    ');
    $getUserData->execute(['email' => $email]);
    $userData = $getUserData->fetch(PDO::FETCH_ASSOC);
    
    if (
      !$userData ||
      !password_verify($passwordInput, $userData['password'])
    ) {
      http_response_code(403);
      exit();
    }

    $session_id = session_create_id();
    
    $setSession = $pdo->prepare('
      insert into sessions (session_id, user_id, tz)
      values (:session_id, :user_id, :tz);
    ');
    $setSession->execute([
      'session_id' => $session_id,
      'user_id' => $userData['id'],
      'tz' => $tz
    ]);

    setcookie(
      'sessid', $session_id,
      [
        'expires' => time() + 60 * 60 * 24 * 30,
        'path' => '/',
        'domain' => 'localhost',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'strict'
      ]
    );

    http_response_code(201);
  }
?>