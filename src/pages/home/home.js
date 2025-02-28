import "./home.css";

const welcomeMsgEm = document.querySelector(".js-heading");

const date = new Date();

welcomeMsgEm.textContent =
  date.getHours() > 6 && date.getHours() < 13
    ? "Доброе утро!"
    : date.getHours() > 12 && date.getHours() < 18
      ? "Добрый день!"
      : "Добрый вечер!";

document.querySelector(".js-continue-btn").focus({ focusVisible: true });
