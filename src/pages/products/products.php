<?php
  require 'api/v1/session.php';
?>
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= htmlWebpackPlugin.options.title %></title>
    <?php require 'components/favicon/favicon.html' ?>
  </head>
  <body>
    <?php
      require 'components/svgs/svgs.html';
      require 'components/RequestHandler/request-handler-templates.html';
      require 'components/Form/search-form-templates.html';
      
      require 'components/Table/table-templates.html';
      $empty_img_name = 'no-products.svg';
      $empty_img_width = 250;
      $empty_img_height = 250;
      require 'components/Table/empty-table.php';
      
      require 'components/Pagination/page-link-templates.html';
    ?>
    <div class="page">
      <div class="content-wrapper">
        <?php
          require 'components/nav-header/nav-header.php';
        ?>
        <main id="content" class="content">
          <h1 class="content__main-header">Товары</h1>
          <div class="products-control-panel">
            <form method="get" action="?" class="products-control-panel__form form form--w-100" role="search">
              <fieldset class="form__fieldset">
                <div class="form-field">
                  <div class="form-field__input-wrapper js-input-wrapper">
                    <input
                      type="search"
                      name="name"
                      id="main-search-field"
                      class="products-control-panel__search-input form-field__input form-field__input--w-100 js-products-search-input"
                      placeholder="Искать"
                      aria-label="Название продукта"
                      autocomplete="product-name"
                      value="<?php echo htmlspecialchars($_GET['name']) ?>"
                    >
                  </div>
                </div>
                <div class="form-field">
                  <div class="form-field__select-wrapper">
                    <select name="product_type" class="form-field__select" id="product-type" aria-label="Тип продукта">
                      <option value="" class="form-field__option" selected>Все типы</option>
                      <option value="1" class="form-field__option" <?php if ($_GET['product_type'] == 1) echo 'selected' ?>>Напитки</option>
                      <option value="2" class="form-field__option" <?php if ($_GET['product_type'] == 2) echo 'selected' ?>>Еда и закуски</option>
                    </select>
                    <i class="icon-container form-field__select-icon">
                      <svg width="18" height="18">
                        <use href="#chevron-down-svg"/>
                      </svg>
                    </i>
                  </div>
                </div>
                <button class="form__submit-btn btn btn--primary" type="submit">Поиск</button>
              </fieldset>
            </form>
            <dialog class="modal js-modal">
              <header class="modal__header">
                <h2 class="modal__heading">Добавить новый товар</h2>
                <button class="btn btn--tertiary btn--sm btn--square js-modal-close-btn" type="button" aria-label="Отмена">
                  <i class="icon-container">
                    <svg width="18" height="18">
                      <use href="#x-svg"/>
                    </svg>
                  </i>
                </button>
              </header>
              <form metod="post" action="" novalidate class="js-add-product-form">
                <fieldset class="add-product__main-fieldset">
                  <div class="form-field js-form-field">
                    <label for="add-product-type" class="form-field__label">Тип товара</label>
                    <div class="form-field__select-wrapper">
                      <select name="product_type" class="form-field__select form-field__select--w-100" id="add-product-type" required>
                        <option value="" class="form-field__option">Выберите тип</option>
                        <option value="1" class="form-field__option">Напитки</option>
                        <option value="2" class="form-field__option">Еда и закуски</option>
                      </select>
                      <i class="icon-container form-field__select-icon">
                        <svg width="18" height="18">
                          <use href="#chevron-down-svg"/>
                        </svg>
                      </i>
                    </div>
                  </div>
                  <div class="form-field js-form-field">
                    <label class="form-field__label" for="add-product-name">Название</label>
                    <div class="form-field__input-wrapper">
                      <input type="text" placeholder="Введите название товара" class="form-field__input form-field__input--w-100" id="add-product-name" name="product_name" data-maxlength="25" required>
                    </div>
                  </div>
                  <div class="form-field js-form-field">
                    <label class="form-field__label" for="add-product-size">Размер (мл./г.)</label>
                    <div class="form-field__input-wrapper">
                      <input data-type="number" placeholder="Введите размер товара" class="form-field__input form-field__input--w-100" id="add-product-size" name="product_size" required>
                    </div>
                  </div>
                  <div class="form-field js-form-field">
                    <label class="form-field__label" for="add-product-price">Цена</label>
                    <div class="form-field__input-wrapper">
                      <input data-type="number" placeholder="Введите стоимость товара" class="form-field__input form-field__input--w-100" id="add-product-price" name="product_price" required>
                    </div>
                  </div>
                </fieldset>
                <output class="form__error-log js-form-error-log"></output>
                <fieldset class="add-product__buttons">
                  <button type="button" class="btn btn--tertiary btn--sm js-modal-cancel-btn">Отмена</button>
                  <button type="submit" class="btn btn--primary btn--sm js-modal-submit-btn">Добавить</button>
                </fieldset>
              </form>
            </dialog>
            <button class="products-control-panel__add-button btn btn--secondary js-add-product-modal-open-btn">Добавить товар</button>
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