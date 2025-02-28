class NavHeader {
  #tableTabsEm;
  #tabArray;
  #activeTab;

  constructor(element) {
    element
      .querySelector(".js-nav-header-toggle-btn")
      .addEventListener("click", (e) => {
        element.classList.toggle("is-active");
      });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        element.classList.remove("is-active");
      }
    });

    document.addEventListener("click", (e) => {
      if (!element.contains(e.target)) {
        element.classList.remove("is-active");
      }
    });

    this.#tableTabsEm = element.querySelector(".js-nav-header-table-tabs");
    this.#tabArray = this.#tableTabsEm.querySelectorAll(".js-nav-header-tab");
  }

  setActiveTab(tab) {
    this.#activeTab?.classList.remove("is-active");

    this.#activeTab =
      tab instanceof Element
        ? tab
        : /^\./.test(tab)
          ? this.#tableTabsEm.querySelector(tab)
          : /\D/.test(tab)
            ? this.#tabArray.find((em) => em.textContent.includes(tab))
            : tab.replace(/\D/, "").length > 0 && this.#tabArray[tab];
    this.#activeTab.classList.add("is-active");
    this.#activeTab.setAttribute("aria-current", "page");
  }
}

export { NavHeader };
