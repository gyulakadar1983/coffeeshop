<?php
  require 'api/v1/session.php';

  if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $date_from = new DateTimeImmutable(date('Y-m') . '-01');
    $date_to = $date_from->modify('last day of this month 23:59:59');

    if (!empty($_GET['date'])) {
      if (!empty($_GET['date']['from'])) {
        $date_from = new DateTimeImmutable($_GET['date']['from']);
      }
      
      if (!empty($_GET['date']['to'])) {
        $date_to = new DateTimeImmutable($_GET['date']['to']);
      }

      $date_query_string = ' and order_date between :date_from and timestamp(:date_to, maketime(23, 59, 59))';
    }
    
    $diff = $date_to->diff($date_from)->days;
    $prev_date = $date_from->modify('-' . $diff . 'days');
    
    $includes = explode(',', $_GET['include']);
    $response = [];

    if (in_array('diff', $includes)) {
      $getCustomersDiff = $pdo->prepare("
        select count(*) from(
          select customer_id
          from orders
          group by customer_id
          having min(order_date) between
          :date_from and timestamp(:date_to, maketime(23, 59, 59))
        ) as count;
      ");

      $getCustomersDiff->bindValue('date_from', $prev_date->format('Y-m-d'));
      $getCustomersDiff->bindValue('date_to', $date_from->format('Y-m-d'));

      $getCustomersDiff->execute();
      $response['prev'] = $getCustomersDiff->fetchColumn();
    }
    
    $getNewCustomers = $pdo->prepare("
      select count(*) from(
        select customer_id
        from orders
        group by customer_id 
        having min(order_date) between
        :date_from and timestamp(:date_to, maketime(23, 59, 59))
      ) as count;
    ");
    $getNewCustomers->bindValue('date_from', $date_from->format('Y-m-d'));
    $getNewCustomers->bindValue('date_to', $date_to->format('Y-m-d'));

    $getNewCustomers->execute();
    $response['new'] = $getNewCustomers->fetchColumn();
    
    $response = json_encode($response);
    header('Content-Type: application/json');
    header('Content-Length: ' . mb_strlen($response, '8bit'));
    echo $response;
  }
?>