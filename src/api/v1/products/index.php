<?php
  require 'api/v1/session.php';

  if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $name = '%' . (!empty($_GET['name']) ? $_GET['name'] : '') . '%';

    $select_stmt = 'select products.id as product_id, products.name as product_name, size, price';
    $join_stmt = '';
    $type_query_string = '';
    $type = '';
    $sort_stmt = 'order by products.id';
    if (!empty($_GET['sort'])) {
      $type = substr($_GET['sort'], 0, 1) === '-' ? 'desc' : 'asc';
      $col = substr($_GET['sort'], $type === 'desc' ? 1 : 0);
      
      if (in_array($col,['product_id', 'product_name', 'size', 'price'], true)) {
        $sort_stmt = "order by $col $type";
      }
    }
    
    $includes = explode(',', $_GET['include']);

    if (in_array('product_types', $includes)) {
      $select_stmt .= ', product_types.name as product_type';
      $join_stmt .= 'inner join product_types on type_id = product_types.id';

      $type = !empty($_GET['product_type']) ? $_GET['product_type'] : '';
      if (!empty($type)) {
        $type_query_string = 'and products.type_id = :type_id';
      }
    }
    
    $limit = isset($_GET['page']['limit']) ? min(100, $_GET['page']['limit']) : 10;
    /**
     * Receives offset from url. If page is 1, offset will be 0,
     * if page is 2, offset will be (2 - 1) * 10 = 10.
     */
    $offset = !empty($_GET['page']['number']) ? ($_GET['page']['number'] - 1) * $limit : 0;
    
    $getProducts = $pdo->prepare("
      $select_stmt
      from products
      $join_stmt
      where products.name like :name
      $type_query_string
      $sort_stmt
      limit :limit
      offset :offset
    ");
    $getProducts->bindValue('name', $name);
    $getProducts->bindValue('limit', $limit, PDO::PARAM_INT);
    $getProducts->bindValue('offset', $offset, PDO::PARAM_INT);
    if (!empty($type)) {
      $getProducts->bindValue('type_id', $type, PDO::PARAM_INT);
    };
    
    $getProducts->execute();

    $response = [
      "products" => $getProducts->fetchAll(PDO::FETCH_ASSOC),
    ];

    if (in_array('page_count', $includes) && count($response["products"]) > 0) {
      $getPageCount = $pdo->prepare("
        select count(*)
        from products
        where name like :name
        $type_query_string
        limit :limit
      ");

      $getPageCount->bindValue('name', $name);
      $getPageCount->bindValue('limit', $limit * 9, PDO::PARAM_INT);
      if (!empty($type)) {
        $getPageCount->bindValue('type_id', $type, PDO::PARAM_INT);
      };

      $getPageCount->execute();
      $response["pageCount"] = ceil($getPageCount->fetchColumn() / $limit);
    }
    
    $response = json_encode($response);
    header('Content-Type: application/json');
    header('Content-Length: ' . mb_strlen($response, '8bit'));
    echo $response;

  } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['product_name'];
    $size = $_POST['product_size'];
    $price = $_POST['product_price'];
    $type_id = $_POST['product_type'];
    
    foreach([$size, $price, $type_id] as $value) {
      if (empty($value) || !is_numeric($value)) {
        http_response_code(422);
        exit();
      }
    }
    
    if (empty($name)) {
      http_response_code(422);
      exit();
    }

    $name = mb_strtoupper(mb_substr($name, 0, 1)) . mb_substr($name, 1);

    $checkDuplicate = $pdo->prepare('
      select exists (
        select * from products
        where name = :name and size = :size
      )
    ');
    $checkDuplicate->bindValue('name', $name);
    $checkDuplicate->bindValue('size', $size, PDO::PARAM_INT);
    $checkDuplicate->execute();
    
    if ($checkDuplicate->fetchColumn() > 0) {
      http_response_code(409);
      exit();
    }
    
    $addProduct = $pdo->prepare('
      insert into products (name, size, price, type_id)
      values (:name, :size, :price, :type_id);
    ');

    $addProduct->bindValue('name', $name);
    $addProduct->bindValue('size', $size, PDO::PARAM_INT);
    $addProduct->bindValue('price', $price, PDO::PARAM_INT);
    $addProduct->bindValue('type_id', $type_id, PDO::PARAM_INT);

    try {
      $addProduct->execute();
    } catch(PDOException $err) {
      if (intval($addProduct->errorCode()) === 22001) {
        http_response_code(422);

      } else {
        http_response_code(500);
      }

      exit();
    }
    
    $newProduct = $pdo->query('
      select products.id as product_id, products.name as product_name, size, price, product_types.name as product_type
      from products
      inner join product_types on type_id = product_types.id
      order by product_id desc
      limit 1
      offset 0;
    ');
    
    http_response_code(201);
    $response = json_encode($newProduct->fetch(PDO::FETCH_ASSOC));
    header('Content-Type: application/json');
    header('Content-Length: ' . mb_strlen($response, '8bit'));
    echo $response;
  }
?>