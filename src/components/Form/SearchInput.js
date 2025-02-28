class SearchInput {
  static #clearButtonFragment = document.querySelector(".js-clear-search-btn-t")
    .content;
  static #searchInputIcon = document.querySelector(".js-search-icon-t").content;

  constructor(inputElement) {
    inputElement
      .closest(".js-input-wrapper")
      .append(SearchInput.#searchInputIcon.cloneNode(true));

    const clearButton = SearchInput.#clearButtonFragment
      .cloneNode(true)
      .querySelector(".js-clear-search-btn");
    clearButton.addEventListener("click", (e) => {
      inputElement.value = "";
      clearButton.remove();
      inputElement.focus();
    });
    if (inputElement.value.length) {
      inputElement.after(clearButton);
    }

    ["input", "focus"].forEach((event) => {
      inputElement.addEventListener(event, (e) => {
        if (inputElement.value.length) {
          inputElement.after(clearButton);
        } else {
          clearButton.remove();
        }
      });
    });
  }
}

export { SearchInput };
