<?php
  if (!empty($_COOKIE['sessid'])) {
    http_response_code(302);
    header('Location:/');
    exit();
  }
?>
<!DOCTYPE html>
<html lang="en">
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
    ?>
    <section class="login-content">
      <header class="login-content__logo-container">
        <a href="#" class="logo">
          <img
            src="/static/logo.svg"
            alt="Логотип"
          >
        </a>
      </header>
      <main id="content" class="login-content__inner">
        <header class="login-content__header">
          <h1 class="login-content__heading">Вход в систему</h1>
        </header>
        <form method="post" action="?" class="login-form js-login-form" novalidate>
          <fieldset class="login-form__main-fieldset">
            <div class="form-field js-form-field">
              <label for="email-input" class="form-field__label">E-mail</label>
              <div class="form-field__input-wrapper">
                <input type="email" name="email" id="email-input" placeholder="Электронная почта" class="form-field__input form-field__input--lg js-email-input" required>
              </div>
            </div>
            <div class="form-field js-form-field">
              <label for="password-input" class="form-field__label">Пароль</label>
              <div class="form-field__input-wrapper">
                <input type="password" name="password" id="password-input" placeholder="Пароль" class="form-field__input form-field__input--lg" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" required>
              </div>
            </div>
          </fieldset>
          <output class="form__error-log js-form-error-log"></output>
          <fieldset class="login-form__buttons">
            <button type="submit" class="btn btn--primary btn--w-100">Далее</button>
          </fieldset>
        </form>
      </main>
      <footer class="login-content__footer">
        <?php
          require 'components/projectInfo/projectInfo.php';
        ?>
      </footer>
    </section>
  </body>
</html>