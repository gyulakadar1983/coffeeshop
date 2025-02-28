class Modal {
  #openButton;
  #closeButton;
  #cancelButton;

  constructor(structure, onCancelFunction) {
    this.modal = structure.modal;
    this.#openButton = structure.openButton;
    this.#closeButton = this.modal.querySelector(".js-modal-close-btn");
    this.#cancelButton = this.modal.querySelector(".js-modal-cancel-btn");

    this.#openButton.addEventListener("click", (e) => {
      this.modal.showModal();
    });

    this.#closeButton.addEventListener("click", (e) => {
      this.modal.close();
    });

    this.#cancelButton?.addEventListener("click", (e) => {
      this.modal.close();
      onCancelFunction();
    });
  }
}

export { Modal };
