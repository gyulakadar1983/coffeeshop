<?php
  require 'db.php';

  if (empty($_COOKIE['sessid'])) {
    http_response_code(302);
    header('Location:/login/');
    exit();
  }

  $getSession = $pdo->prepare('
    select session_id, email, username, tz
    from sessions inner join users
    where session_id = :sessid and sessions.user_id = users.id
  ');
  $getSession->execute([
    'sessid' => $_COOKIE['sessid']
  ]);
  $res = $getSession->fetch(PDO::FETCH_ASSOC);
  
  if(empty($res['session_id'])) {
    setcookie('sessid', '', time() - 1, '/');
    http_response_code(302);
    header('Location:/login/');
    exit();
  }

  $userEmail = $res['email'];
  $username = $res['username'];

  /**
   * How to use:
   * convert_tz([any sql date func], 'UTC', '$tz').
   * 
   * Don't use this on a date which was added manually,
   * only on date-related SQL functions.
   * 
   * Altough I should rebuild all of orders to use UTC tz... Remove timeZone: 'UTC' from everywhere then.
   */
  $tz = $res['tz'];
?>