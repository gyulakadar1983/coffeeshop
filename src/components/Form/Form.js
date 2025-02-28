class Form {
  #validatableElements;
  #errorLogEm;

  constructor(formElement, onSubmit) {
    this.#validatableElements = [...formElement.elements].filter((em) => {
      if (em.nodeName === "INPUT" || em.nodeName === "SELECT") return true;
    });

    this.#errorLogEm = formElement.querySelector(".js-form-error-log");

    formElement.addEventListener("submit", (e) => {
      let valid = true;
      this.#clearErrorLog();

      for (const em of this.#validatableElements) {
        if (!this.#validate(em)) {
          valid = false;
          em.focus();
          e.preventDefault();
          break;
        }
      }

      if (onSubmit) {
        e.preventDefault();

        if (valid) onSubmit();

        return valid;
      }
    });
  }

  /**
   * Adds 'is-invalid' class to the em,
   * appends warning message below.
   * @param {HTMLElement} em input.
   * @param {String} message the message to be displayed under input.
   */
  #warn = (em, message) => {
    em.classList.add("is-invalid");
    em.isValid = false;

    em.warnMessage = document.createElement("output");
    em.warnMessage.for = em.id;
    em.warnMessage.name = em.name;
    em.warnMessage.textContent = message;
    em.warnMessage.classList.add(
      "form-field__message",
      "js-form-field-warn-message",
    );

    em.closest(".js-form-field").append(em.warnMessage);
  };

  #release = (em) => {
    em.classList.remove("is-invalid");
    em.isValid = true;
    em.warnMessage?.remove();
  };

  #validate = (em) => {
    if (!em.isValid) {
      this.#release(em);
    }

    if (em.nodeName === "INPUT") {
      if (!em.value.trim().length) {
        em.isValid && this.#warn(em, "Пожалуйста, заполните это поле.");
        return em.isValid;
      }

      if (Number(em.value.length) > Number(em.dataset.maxlength)) {
        em.isValid && this.#warn(em, "Кол-во символов не должно превышать 25.");
        return em.isValid;
      }

      if (em.type === "email" && em.validity.typeMismatch) {
        em.isValid &&
          this.#warn(em, "Пожалуйста, введите корректный e-mail адрес.");
        return em.isValid;
      }

      if (
        em.dataset.type === "number" &&
        (em.value.replace(/\d/g, "").length ||
          /[,.]/.test(em.value) ||
          Number(em.value) < 1)
      ) {
        em.isValid &&
          this.#warn(em, "Пожалуйста, введите положительное целое число.");
        return em.isValid;
      }
    } else if (em.nodeName === "SELECT") {
      if (!em.selectedIndex) {
        em.isValid && this.#warn(em, "Пожалуйста, выберите опцию из списка.");
        return em.isValid;
      }
    }

    return em.isValid;
  };

  logError = (message) => {
    this.#errorLogEm.style.display = "block";
    this.#errorLogEm.textContent = message;
  };

  #clearErrorLog = () => {
    delete this.#errorLogEm.style.display;
    this.#errorLogEm.replaceChildren();
  };
}

export { Form };
