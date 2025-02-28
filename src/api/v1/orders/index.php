<?php
  require 'api/v1/session.php';
  
  if ($_SERVER['REQUEST_METHOD'] == 'GET') {
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

    $select_stmt = 'select orders.id as order_id, round(unix_timestamp(order_date)) * 1000 as order_date, orders.sum as sum';
    $join_stmt = '';
    $group_by = '';
    $sort_stmt = 'order by orders.id';
    if (!empty($_GET['sort'])) {
      $type = substr($_GET['sort'], 0, 1) === '-' ? 'desc' : 'asc';
      $col = substr($_GET['sort'], $type === 'desc' ? 1 : 0);
      
      if (in_array($col, ['order_id', 'customer_id', 'item_count', 'sum'], true)) {
        $sort_stmt = "order by $col $type";
      }
    }

    $allowed_fields = ['id', 'orders.id', 'order_date', 'sum'];

    $includes = explode(',', $_GET['include']);

    if (in_array('customers', $includes, true)) {
      $select_stmt .= ', customers.id as customer_id, full_name';
      $join_stmt .= ' inner join customers on orders.customer_id = customers.id';

      array_push($allowed_fields, 'customers.id', 'full_name', 'email', 'phone');

      $full_name = '%' . (!empty($_GET['full_name']) ? $_GET['full_name'] : '') . '%';
      if (!empty($full_name)) {
        $customers_query_string = ' and full_name like :full_name';
      }
    }

    if (in_array('order_items', $includes, true)) {
      $select_stmt .= ', count(order_items.id) as item_count';
      $join_stmt .= ' inner join order_items on order_items.order_id = orders.id';

      array_push($allowed_fields, 'order_items');

      $group_by = 'group by order_id';
    }

    if (!empty($_GET['fields'])) {
      $select_stmt = 'select ';
      
      foreach($_GET['fields'] as $fieldset) {
        
        $fields = explode(',', $fieldset);
        $fields_count = count($fields);

        for ($i = 0; $i < $fields_count; $i++) {
          $forbidden_match = true;

          foreach($allowed_fields as $allowed_field) {
            if (preg_match("/^((count|sum|min|max|avg)\()?" . $allowed_field . "(\))?$/", $fields[$i])) {
              $forbidden_match = false;
              break 1;
            }
          }

          if ($forbidden_match) {
            http_response_code(403);
            exit;
          }
          
          $select_stmt .= $fields[$i];
          
          if ($i !== $fields_count - 1) {
            $select_stmt .= ', ';
          }
        }
      }
    }

    $limit = isset($_GET['page']['limit']) ? min(100, $_GET['page']['limit']) : 10;
    /**
     * Receives offset from url. If page is 1, offset will be 0,
     * if page is 2, offset will be (2 - 1) * 10 = 10.
     */
    $offset = !empty($_GET['page']['number']) ? ($_GET['page']['number'] - 1) * $limit : 0;

    $getOrders = $pdo->prepare("
      $select_stmt
      from orders
      $join_stmt
      where true
      $date_query_string
      $customers_query_string
      $group_by
      $sort_stmt
      limit :limit
      offset :offset;
    ");
    $getOrders->bindValue('limit', $limit, PDO::PARAM_INT);
    $getOrders->bindValue('offset', $offset, PDO::PARAM_INT);
    if (!empty($date_query_string)) {
      $getOrders->bindValue('date_from', $date_from->format('Y-m-d'));
      $getOrders->bindValue('date_to', $date_to->format('Y-m-d'));
    }
    if (!empty($customers_query_string)) {
      $getOrders->bindValue('full_name', $full_name);
    }

    $getOrders->execute();

    $response = [
      "orders" => $getOrders->fetchAll(PDO::FETCH_ASSOC)
    ];

    if (in_array('page_count', $includes) && count($response["orders"]) > 0) {
      $getPageCount = $pdo->prepare("
        select count(orders.id)
        from orders
        inner join customers on orders.customer_id = customers.id
        where true
        $date_query_string
        $customers_query_string
        limit :limit;
      ");
      $getPageCount->bindValue('limit', $limit * 9, PDO::PARAM_INT);
      if (!empty($date_query_string)) {
        $getPageCount->bindValue('date_from', $date_from->format('Y-m-d'));
        $getPageCount->bindValue('date_to', $date_to->format('Y-m-d'));
      }
      if (!empty($customers_query_string)) {
        $getPageCount->bindValue('full_name', $full_name);
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