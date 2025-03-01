<?php
  require 'api/v1/session.php';
?>
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= htmlWebpackPlugin.options.title %></title>
    <?php require 'components/head-preloads/head-preloads.php' ?>
  </head>
  <body>
    <?php
      require 'components/svgs/svgs.html';
      require 'components/RequestHandler/request-handler-templates.html';
      require 'components/Form/search-form-templates.html';
      
      require 'components/Table/table-templates.html';
      $empty_img_name = 'no-customers.svg';
      $empty_img_width = 250;
      $empty_img_height = 200;
      require 'components/Table/empty-table.php';
      
      require 'components/Pagination/page-link-templates.html';
    ?>
    <div class="page">
      <div class="content-wrapper">
        <?php
          require 'components/nav-header/nav-header.php';
        ?>
        <main id="content" class="content">
          <h1 class="content__main-header">Покупатели</h1>
          <div class="customers-control-panel">
            <form method="get" action="?" class="form" role="search">
              <fieldset class="form__fieldset">
                <div class="form-field">
                  <div class="form-field__input-wrapper js-input-wrapper">
                    <input
                      type="search"
                      name="full_name"
                      id="main-search-field"
                      class="form-field__input form-field__input--w-100 js-customers-search-input"
                      placeholder="Искать"
                      aria-label="ФИО покупателя"
                      value="<?php echo htmlspecialchars($_GET['full_name']) ?>"
                    >
                  </div>
                </div>
                <button class="form__submit-btn btn btn--primary" type="submit">Поиск</button>
              </fieldset>
            </form>
          </div>
          <div class="table-container">
            <table class="table js-table">
              <thead class="table__thead js-table-head"></thead>
              <tbody class="table__tbody js-table-body"></tbody>
            </table>
          </div>
          <nav aria-label="Страницы результатов по поиску"><ul class="page-links-container js-page-links-container"></ul></nav>
        </main>
      </div>
    </div>
  </body>
</html>