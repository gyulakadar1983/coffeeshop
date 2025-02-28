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
      require 'components/Table/table-templates.html';
      require 'components/RequestHandler/request-handler-templates.html';
    ?>
    <template class="js-last-orders-templates">
      <p class="last-orders__empty js-empty">
        За последнее время не было сделано ни одного заказа.
      </p>
      <article class="last-orders__order js-order">
        <header class="last-orders__header">
          <h3 class="last-orders__id js-order-id"></h3>
          <p class="last-orders__item-count js-order-count"></p>
        </header>
        <div class="last-orders__footer">
          <p class="last-orders__sum js-order-sum"></p>
          <span aria-hidden="true">
          <i class="last-orders__separator" aria-hidden="true">
            <svg width="18" height="18" fill="var(--fg-3)">
              <use href="#dot-svg"/>
            </svg>
          </i>
          </span>
          <p class="last-orders__date js-order-date"></p>
        </div>
      </article>      
    </template>
    <div class="page">
      <div class="content-wrapper">
        <?php
          require 'components/nav-header/nav-header.php';
        ?>
        <main id="content" class="content">
          <h1 class="content__main-header">Обзор</h1>
          <section class="stat-layout">
            <section class="last-orders">
              <h2 class="last-orders__heading">Последние заказы</h2>
              <div class="last-orders__layout js-last-orders">
                <?php
                  for ($i = 0; $i < 5; $i++) {
                    echo '
                      <article class="last-orders__order">
                        <header class="last-orders__header">
                          <h3 class="last-orders__id">#000000</h3>
                          <p class="last-orders__item-count">0 товаров</p>
                        </header>
                        <div class="last-orders__footer">
                          <p class="last-orders__sum">
                            0 ₽
                          </p>
                          <i class="last-orders__separator" aria-hidden="true">
                            <svg width="18" height="18" fill="var(--fg-3)">
                              <use href="#dot-svg"/>
                            </svg>
                          </i>
                          <p class="last-orders__date">
                            1 апр. 1969 г.
                          </p>
                        </div>
                      </article>
                    ';
                  }
                ?>
              </div>
            </section>
            <div class="stat-layout__right-col">
              <div class="stat-layout__card-container">
                <section class="stat-card stat-card--orders js-orders-stat-card">
                  <h2 class="stat-card__heading">Заказы за сегодня</h2>
                  <div class="stat-card__middle">
                    <p class="stat-card__count js-order-count">0</p>
                    <img 
                      src="/static/today-orders.svg"
                      width="40"
                      height="40"
                      loading="lazy"
                      decoding="async"
                      alt=""
                    >
                  </div>
                  <p class="stat-card__result">
                    <span class="stat-card__key">Прибыль</span>
                    <span class="stat-card__value js-revenue">+0 ₽</span>
                  </p>
                </section>
                <section class="stat-card stat-card--customers js-customers-stat-card">
                  <h2 class="stat-card__heading">Новые покупатели</h2>
                  <div class="stat-card__middle">
                    <p class="stat-card__count js-customer-count">0</p>
                    <img 
                      src="/static/new-customers.svg"
                      width="40"
                      height="40"
                      loading="lazy"
                      decoding="async"
                      alt=""
                    >
                  </div>
                  <p class="stat-card__result">
                    <span class="stat-card__key">Рост</span>
                    <span class="stat-card__value js-growth-percent">0 %</span>
                  </p>
                </section>
              </div>
              <section class="sales js-sales">
                <div class="sales__header-container">
                  <header class="sales__header">
                    <h2 class="sales__heading js-sales-heading">Заказы за неделю</h2>
                    <p class="sales__sum js-sales-sum">0 ₽</p>
                  </header>
                  <div class="sales__mode">
                    <button class="btn sales__mode-btn is-active js-week-sales-btn">Неделя</button>
                    <button class="btn sales__mode-btn js-month-sales-btn">Месяц</button>
                    <button class="btn sales__mode-btn js-year-sales-btn">Год</button>
                  </div>
                </div>
                <div class="sales-chart">
                  <div class="sales-chart__options">
                    <menu class="sales-chart__legend-list js-sales-chart-legend-list" id="sales-chart-legend-list" aria-label="Выбор данных графика">
                      <li>Заказы</li>
                      <li>Доход</li>
                    </menu>
                    <div class="form-field sales__select-field">
                      <div class="form-field__select-wrapper js-sales-select-wrapper">
                        <select name="" id="" class="form-field__select form-field__select--sm js-sales-select"></select>
                        <i class="icon-container form-field__select-icon">
                          <svg width="18" height="18">
                            <use href="#chevron-down-svg"/>
                          </svg>
                        </i>
                      </div>
                    </div>
                  </div>
                  <div class="sales-chart__tooltip js-sales-chart-tooltip"></div>
                  <canvas class="js-sales-chart-canvas"></canvas>
                </div>
              </section>
              <section class="top-products js-top-products">
                <h2 class="top-products__heading">
                  <!-- Топ товаров за <span class="js-top-products-month">январь</span> -->
                  Топ товаров за все время
                </h2>
                <div class="table-container top-products__table-container js-table-container">
                  <table class="table top-products__table js-table">
                    <thead class="table__thead js-table-head"></thead>
                    <tbody class="table__tbody js-table-body"></tbody>
                  </table>
                </div>
              </section>
            </div>
          </section>
        </main>
      </div>
    </div>
  </body>
</html>