<?php
  require 'api/v1/session.php';
  
  if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $full_name = '%' . (!empty($_GET['full_name']) ? $_GET['full_name'] : '') . '%';

    $select_stmt = 'select id, full_name, phone';
    $sort_stmt = 'order by id';
    if (!empty($_GET['sort'])) {
      $type = substr($_GET['sort'], 0, 1) === '-' ? 'desc' : 'asc';
      $col = substr($_GET['sort'], $type === 'desc' ? 1 : 0);
      
      if (in_array($col, ['id', 'full_name', 'phone'], true)) {
        $sort_stmt = "order by $col $type";
      }
    }

    $includes = explode(',', $_GET['include']);
    
    $limit = isset($_GET['page']['limit']) ? min(100, $_GET['page']['limit']) : 10;
    /**
     * Receives offset from url. If page is 1, offset will be 0,
     * if page is 2, offset will be (2 - 1) * 10 = 10.
     */
    $offset = !empty($_GET['page']['number']) ? ($_GET['page']['number'] - 1) * $limit : 0;

    $getCustomers = $pdo->prepare("
      $select_stmt
      from customers
      where full_name like :full_name
      $sort_stmt
      limit :limit
      offset :offset
    ");

    $getCustomers->bindValue('full_name', $full_name, PDO::PARAM_STR);
    $getCustomers->bindValue('limit', $limit, PDO::PARAM_INT);
    $getCustomers->bindValue('offset', $offset, PDO::PARAM_INT);
    
    $getCustomers->execute();
    
    $response = [
      "customers" => $getCustomers->fetchAll(PDO::FETCH_ASSOC),
    ];

    if (in_array('page_count', $includes) && count($response["customers"]) > 0) {
      $getPageCount = $pdo->prepare("
        select count(*)
        from customers
        where full_name like :full_name
        limit :limit
      ");

      $getPageCount->bindValue('full_name', $full_name, PDO::PARAM_STR);
      $getPageCount->bindValue('limit', $limit * 9, PDO::PARAM_INT);
      
      $getPageCount->execute();
      $response['pageCount'] = ceil($getPageCount->fetchColumn() / $limit);
    }

    $response = json_encode($response);
    header('Content-Type: application/json');
    header('Content-Length: ' . mb_strlen($response, '8bit'));
    echo $response;
  }
?>