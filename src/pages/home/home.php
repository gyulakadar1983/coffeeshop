<?php
  require 'api/v1/session.php';
?>
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php require 'components/favicon/favicon.html' ?>
    <title><%= htmlWebpackPlugin.options.title %></title>
    <link rel="prefetch" href="/dashboard/">
  </head>
  <body>
    <section class="home-content">
      <header class="home-content__logo-container">
        <a href="/home/" class="logo">
          <img
            src="/static/logo.svg"
            alt="Логотип"
          >
        </a>
      </header>
      <main id="content" class="home-content__inner">
        <header class="home-content__header">
          <h1 class="home-content__heading js-heading"></h1>
          <p class="home-content__text">
            Вы вошли как <?php echo htmlspecialchars($username) ?>
          </p>
        </header>
        <div class="home-content__buttons">
          <a href="/dashboard/" class="btn btn--primary js-continue-btn">Продолжить</a>
        </div>
      </main>
      <footer class="home-content__footer">
        <?php
          require 'components/projectInfo/projectInfo.php';
        ?>
      </footer>
    </section>
  </body>
</html>