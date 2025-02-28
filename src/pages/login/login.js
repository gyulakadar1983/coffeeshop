import "./login.css";
import { Form } from "/components/Form/Form.js";
import { RequestHandler } from "/components/RequestHandler/RequestHandler.js";

const loginFormEm = document.querySelector(".js-login-form");
const loginRH = new RequestHandler(loginFormEm, true);

const loginForm = new Form(loginFormEm, async () => {
  const formData = new FormData(loginFormEm);
  formData.set("tz", new Intl.DateTimeFormat("ru").resolvedOptions().timeZone);

  try {
    await loginRH.request(
      new Request("\\api/v1/login/", {
        method: "post",
        body: formData,
      }),
      (res) => {
        if (res.status === 201) {
          window.location.replace("/");
        }
      },
    );
  } catch (err) {
    switch (err.cause.code) {
      case 403 || 422:
        loginForm.logError("Указаны неверные данные. Повторите попытку.");
        break;
      case 409:
        window.location.replace("/");
        break;
      default:
        loginRH.showError(err.cause.code);
    }
  }
});

loginFormEm.querySelector(".js-email-input").focus();
