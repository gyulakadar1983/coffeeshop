<?php
  require 'api/v1/session.php';
  
  if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!empty($_GET['date'])) {
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

      $date_query_string = ' and order_date between :date_from and timestamp(:date_to, maketime(23, 59, 59))';
    }
    
    $includes = explode(',', $_GET['include']);

    $limit = isset($_GET['page']['limit']) ? min(100, $_GET['page']['limit']) : 10;
    /**
     * Receives offset from url. If page is 1, offset will be 0,
     * if page is 2, offset will be (2 - 1) * 10 = 10.
     */
    $offset = !empty($_GET['page']['number']) ? ($_GET['page']['number'] - 1) * $limit : 0;

    $getTop = $pdo->prepare("
      select name, products.id as product_id, size, price, count(products.id) as order_count
      from orders
      inner join order_items on orders.id = order_items.order_id
      inner join products on order_items.product_id = products.id
      where true
      $date_query_string
      group by products.id
      order by order_count desc
      limit :limit
      offset :offset;
    ");
    $getTop->bindValue('limit', $limit, PDO::PARAM_INT);
    $getTop->bindValue('offset', $offset, PDO::PARAM_INT);
    if (!empty($date_query_string)) {
      $getTop->bindValue('date_from', $date_from->format('Y-m-d'));
      $getTop->bindValue('date_to', $date_to->format('Y-m-d'));
    }

    $getTop->execute();

    $response = [
      "productTop" => $getTop->fetchAll(PDO::FETCH_ASSOC)
    ];

    if (in_array('page_count', $includes) && count($response["productTop"]) > 0) {
      $getPageCount = $pdo->prepare("
        select count(*) from(
          select count(*)
          from orders
          inner join order_items on orders.id = order_items.order_id
          inner join products on order_items.product_id = products.id
          where true
          $date_query_string
          group by products.id
          limit :limit
        ) as count;
      ");
      $getPageCount->bindValue('limit', $limit * 9, PDO::PARAM_INT);
      if (!empty($date_query_string)) {
        $getPageCount->bindValue('date_from', $date_from->format('Y-m-d'));
        $getPageCount->bindValue('date_to', $date_to->format('Y-m-d'));
      }
      
      $getPageCount->execute();
      $response["pageCount"] = ceil($getPageCount->fetchColumn() / $limit);
    }
      
    $response = json_encode($response);
    header('Content-Type: application/json');
    header('Content-Length: ' . mb_strlen($response, '8bit'));
    echo $response;
  }
?>