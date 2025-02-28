<?php
  require 'api/v1/db.php';

  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $getSession = $pdo->prepare('
      delete from sessions
      where session_id = :sessid
      and id > 0
    ');
    $getSession->execute([
      'sessid' => $_COOKIE['sessid']
    ]);
  
    setcookie('sessid', '', time() - 1, '/');
    http_response_code(200);
    header('Location:/login/');
  }
?>