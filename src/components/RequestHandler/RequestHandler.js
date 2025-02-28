class RequestHandler {
  static #fragment = document.querySelector(".js-request-status-templates")
    .content;
  static #errorMessageEm = RequestHandler.#fragment.querySelector(
    ".js-progress-error-msg",
  );
  static #errorSVGEm = RequestHandler.#fragment.querySelector(
    ".js-progress-error-svg",
  );
  static #loadingSVGEm = RequestHandler.#fragment.querySelector(
    ".js-progress-loading-svg",
  );

  #outputEm;
  #progressOverlayEm;
  #buttonContainerEm;
  #cancelBtn;
  #retryBtn;
  #lastResource;
  #lastReqCallback;
  #throwManually;

  constructor(outputElement, throwManually) {
    this.#outputEm = outputElement;
    this.#throwManually = throwManually;

    this.#progressOverlayEm = RequestHandler.#fragment
      .querySelector(".js-progress-overlay")
      .cloneNode(true);
    this.#buttonContainerEm = RequestHandler.#fragment
      .querySelector(".js-progress-button-container")
      .cloneNode(true);
    this.#retryBtn = RequestHandler.#fragment
      .querySelector(".js-progress-retry-btn")
      .cloneNode(true);
    this.#cancelBtn = RequestHandler.#fragment
      .querySelector(".js-progress-cancel-btn")
      .cloneNode(true);
    this.#cancelBtn.addEventListener("click", (e) => {
      this.#cancel();
    });

    this.#buttonContainerEm.replaceChildren(this.#cancelBtn, this.#retryBtn);
  }

  async request(resource, callback, finishLoading) {
    this.#startLoading();

    this.#lastResource = resource.clone();
    this.#lastReqCallback = callback;
    this.#retryBtn.onclick = () => {
      this.request(this.#lastResource, callback, finishLoading);
    };

    let res;

    try {
      res = await fetch(resource);

      if (!res.ok) {
        throw new Error(res, { cause: { code: res.status } });
      }
    } catch (err) {
      this.#throwManually
        ? this.#finishLoading()
        : this.showError(err.cause.code);

      throw new Error(err, { cause: err.cause });
    }

    if (finishLoading) {
      this.#finishLoading();
    }

    callback(res);

    return res;
  }

  async json(response, callback) {
    this.#retryBtn.onclick = async () => {
      const res = await this.request(this.#lastResource, this.#lastReqCallback);
      this.json(res, callback);
    };

    let json;

    try {
      json = await response.json();
    } catch (err) {
      this.#throwManually ? this.#finishLoading() : this.showError(err);

      throw new Error(err);
    }

    this.#finishLoading();
    callback(json);

    return json;
  }

  #startLoading() {
    this.#progressOverlayEm.replaceChildren(
      RequestHandler.#loadingSVGEm.cloneNode(true),
    );
    this.#outputEm.append(this.#progressOverlayEm);
  }

  #cancel() {
    this.#progressOverlayEm.remove();
  }

  #finishLoading() {
    this.#progressOverlayEm.remove();
  }

  showError(cause) {
    const errorMessageEm = RequestHandler.#errorMessageEm.cloneNode(true);
    errorMessageEm.textContent =
      "Произошла ошибка при" +
      (this.#lastResource.method === "POST" ? " отправке" : " загрузке") +
      " данных." +
      (typeof cause === "number" ? " Код ошибки: " + cause : " " + cause);

    this.#progressOverlayEm.replaceChildren(
      RequestHandler.#errorSVGEm.cloneNode(true),
      errorMessageEm,
      this.#buttonContainerEm,
    );
    this.#outputEm.append(this.#progressOverlayEm);
  }
}

export { RequestHandler };
