<?php
  require 'api/v1/session.php';

  if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!empty($_GET['date']['from'])) {
      $date_from = new DateTimeImmutable($_GET['date']['from']);

    } else {
      $date_from = new DateTimeImmutable(date('Y-m') . '-01');
    }
    
    if (!empty($_GET['date']['to'])) {
      $date_to = new DateTimeImmutable($_GET['date']['to']);

    } else {
      $date_to = $date_from->modify('last day of this month 23:59:59');
    }
    
    $group_stmt = $date_to->diff($date_from)->days < 32 ? "date_format(order_date, '%Y-%m-%d')" : "timestamp(last_day(order_date), maketime(23, 59, 59))";

    $getSales = $pdo->prepare("
      select round(unix_timestamp($group_stmt)) * 1000 as date, count(id) as order_count, sum(sum) as sum
      from orders
      where order_date between
      convert_tz(
        :date_from, 'UTC', '$tz'
      ) and
      convert_tz(
        :date_to, 'UTC', '$tz'
      )
      group by round(unix_timestamp($group_stmt)) * 1000
      with rollup;
    ");

    $getSales->execute([
      'date_from' => $date_from->format('Y-m-d H:i:s'),
      'date_to' => $date_to->format('Y-m-d H:i:s')
    ]);

    $sales = $getSales->fetchAll(PDO::FETCH_ASSOC);
    $rollup = array_pop($sales);
    unset($rollup['date']);

    $response = [
      'rollup' => $rollup,
      'sales' => $sales
    ];
    
    $response = json_encode($response);
    header('Content-Type: application/json');
    header('Content-Length: ' . mb_strlen($response, '8bit'));
    echo $response;
  }
?>