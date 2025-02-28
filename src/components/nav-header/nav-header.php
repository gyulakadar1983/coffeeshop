<div class="nav-header__skip">
  <a href="#content" class="nav-header__skip-link">Перейти к контенту</a>
</div>
<header class="nav-header js-nav-header">
  <button class="nav-header__toggle-btn btn btn--square btn--h-unset js-nav-header-toggle-btn" type="button" aria-label="Меню" aria-controls="nav-menu" aria-expanded="false">
    <svg width="24" height="24" class="burger-svg">
      <use href="#burger-svg"/>
    </svg>
    <svg width="24" height="24" class="x-svg">
      <use href="#x-svg"/>
    </svg>
  </button>
  <div class="nav-header__logo-container">
    <a href="/" class="logo nav-header__logo" aria-label="Домашняя страница">
      <img
        src="/static/logo.svg"
        alt="Логотип"
      >
    </a>
  </div>
  <div class="nav-header__inner" id="nav-menu">
    <div class="nav-header__main">
      <div class="nav-header__account-container">
        <?php
          if (!empty($_COOKIE['sessid'])) {
            echo ('
              <div class="nav-header__picture-container">
                <svg class="nav-header__default-pfp-svg">
                  <use href="#person-fill-svg"/>
                </svg>
              </div>
            ');
          }
        ?>
        <?php
          if (!empty($_COOKIE['sessid'])) {
            echo (
              '<p class="nav-header__username">' . htmlspecialchars($username) . '</p>' .
              '<p class="nav-header__email">' . htmlspecialchars($userEmail) . '</p>'
            );
          }
        ?>
      </div>
      <nav class="table-tabs js-nav-header-table-tabs" aria-label="Вкладки">
        <label class="table-tabs__label" id="table-tabs-main-menu">
          Главное меню
        </label>
        <ul class="table-tabs__list" aria-labelledby="table-tabs-main-menu">
          <li class="table-tabs__item">
            <a href="/dashboard/" class="table-tabs__tab btn btn--w-100 btn--text-left js-dashboard-tab js-nav-header-tab">
              <i class="icon-container">
                <svg width="18" height="18">
                  <use href="#chart-svg"/>
                </svg>
              </i>
              Обзор
            </a>
          </li>
        </ul>
        <label class="table-tabs__label" id="table-tabs-tables">
          Таблицы
        </label>
        <ul class="table-tabs__list" aria-labelledby="table-tabs-tables">
          <li class="table-tabs__item">
            <a href="/products/" class="table-tabs__tab btn btn--w-100 btn--text-left js-products-table-tab js-nav-header-tab">
              <i class="icon-container">
                <svg width="20" height="20">
                  <use href="#coffee-cup-svg"/>
                </svg>
              </i>
              Товары
            </a>
          </li>
          <li class="table-tabs__item">
            <a href="/orders/" class="table-tabs__tab btn btn--w-100 btn--text-left js-orders-table-tab js-nav-header-tab">
              <i class="icon-container">
                <svg width="20" height="20">
                  <use href="#box-svg"/>
                </svg>
              </i>
              Заказы
            </a>
          </li>
          <li class="table-tabs__item">
            <a href="/customers/" class="table-tabs__tab btn btn--w-100 btn--text-left js-customers-table-tab">
              <i class="icon-container">
                <svg width="20" height="20">
                  <use href="#people-svg"/>
                </svg>
              </i>
              Покупатели
            </a>
          </li>
        </ul>
      </nav>
    </div>
    <div class="nav-header__auth-container">
      <?php
        if (empty($_COOKIE['sessid'])) {
          echo ('
            <a href="/login/" class="btn btn--primary">Войти</a>
          ');
        } else {
          echo ('
            <form action="/api/v1/logout/" method="post">
              <button class="btn btn--special-1 btn--w-100 btn--text-left" type="submit">
                <i class="icon-container">
                  <svg width="24" height="24">
                    <use href="#exit-left-svg"/>
                  </svg>
                </i>
                Выйти
              </button>
            </form>
          ');
        }
      ?>
    </div>
    <div class="nav-header__project-info">
      <?php
        require 'components/projectInfo/projectInfo.php';
      ?>
    </div>
  </div>
</header>