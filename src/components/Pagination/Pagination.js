class Pagination {
  static #pageLinkTemplates = document.querySelector(".js-page-link-templates");
  static #pageLinkTemplate =
    Pagination.#pageLinkTemplates.querySelector(".js-page-link-t");

  #pageLinksContainer;
  #linkContainerCapacity;

  constructor(pageLinksContainer, linkContainerCapacity = 9) {
    this.#pageLinksContainer = pageLinksContainer;
    this.#linkContainerCapacity = linkContainerCapacity;
  }

  fillContainer(pageCount, currentPage) {
    const pageLinksFragment = document.createDocumentFragment();

    if (!pageCount) {
      this.#pageLinksContainer.replaceChildren();
    } else if (pageCount <= this.#linkContainerCapacity) {
      /**
       * If all links can be visible just append them all.
       */
      for (let i = 0; i < this.#linkContainerCapacity && pageCount > i; i++) {
        pageLinksFragment.append(Pagination.#createPageLinkEm(i + 1));
      }
    } else {
      /**
       * If some of the links are invisible:
       */
      const halfCapacityFloor = Math.floor(this.#linkContainerCapacity / 2);
      const halfCapacityCeil = Math.ceil(this.#linkContainerCapacity / 2);

      for (let i = 0; i < this.#linkContainerCapacity; i++) {
        if (currentPage <= halfCapacityCeil) {
          /**
           * If user is at a page less than half a capacity, just display a [linkContainerCapacity] links
           * starting from page=1.
           */
          pageLinksFragment.append(Pagination.#createPageLinkEm(i + 1));
        } else if (
          currentPage > halfCapacityCeil &&
          currentPage <= pageCount - halfCapacityCeil
        ) {
          /**
           * If a user is at a page which is bigger than half a capacity,
           * append the currentPage in the middle,
           * then halfCapacity pages before and after it.
           */
          pageLinksFragment.append(
            Pagination.#createPageLinkEm(currentPage - halfCapacityFloor + i),
          );
        } else if (currentPage <= pageCount) {
          /**
           * If last [linkContainerCapacity] pages are visible to the user,
           * display them starting from page=(pageCount - [linkContainerCapacity] + 1).
           */
          pageLinksFragment.append(
            Pagination.#createPageLinkEm(
              pageCount - (this.#linkContainerCapacity - i - 1),
            ),
          );
        }
      }
    }

    if (currentPage > 1) {
      pageLinksFragment.prepend(
        Pagination.#createPageLinkEm(1, "full-back"),
        Pagination.#createPageLinkEm(currentPage - 1, "back"),
      );
    }

    if (currentPage < pageCount) {
      pageLinksFragment.append(
        Pagination.#createPageLinkEm(currentPage + 1, "forward"),
        Pagination.#createPageLinkEm(pageCount, "full-forward"),
      );
    }

    this.#pageLinksContainer.replaceChildren(pageLinksFragment);
  }

  setCurrent(n) {
    const link =
      this.#pageLinksContainer.querySelector(
        `a[href="${window.location.search}"]`,
      ) || this.#pageLinksContainer.querySelector("a");

    link.classList.add("is-active");
    link.setAttribute("aria-current", "page");
  }

  /**
   *
   * @param {int} refPage page that will be set to the 'href' attribute of an <a> element.
   * @param {string} type a string that corresponds to a certain className of a template element.
   * @returns <a> element.
   */
  static #createPageLinkEm(refPage, type) {
    const liEm = document.createElement("li");
    let linkEm;

    if (!type) {
      const pageLinkFragment =
        Pagination.#pageLinkTemplate.content.cloneNode(true);
      linkEm = pageLinkFragment.querySelector("a");
      linkEm.textContent = refPage;
      linkEm.setAttribute("aria-label", "Страница " + refPage);
    } else {
      const pageLinkFragment = Pagination.#pageLinkTemplates
        .querySelector(`.js-page-link-${type}-t`)
        .content.cloneNode(true);
      linkEm = pageLinkFragment.querySelector("a");
    }

    const search = new URLSearchParams(window.location.search);
    search.set("page[number]", refPage);

    linkEm.setAttribute("href", "?" + search.toString());
    liEm.append(linkEm);

    return liEm;
  }
}

export { Pagination };
