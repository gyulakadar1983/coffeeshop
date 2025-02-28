class Table {
  static #emptyStateTemplate = document.querySelector(".js-table-empty-t");
  static #bodyRowTemplate = document.querySelector(".js-tbody-row-t");
  static #headRowTemplate = document.querySelector(".js-thead-row-t");

  #tableEm;
  #headEm;
  #headCols = [];
  #bodyEm;
  #mapRowCallback;
  #cachedData;
  #compact = false;
  #primaryCol;

  constructor(tableElement, headCols, mapRowCallback, primaryCol) {
    this.#tableEm = tableElement;

    headCols.forEach((col, index) => {
      this.#headCols.push({
        text: col.text || col,
        textAlign: col.textAlign || "left",
      });
    });

    this.#headEm = this.#tableEm.querySelector(".js-table-head");
    this.#bodyEm = tableElement.querySelector(".js-table-body");
    this.#mapRowCallback = mapRowCallback;

    this.#primaryCol = primaryCol;
    const compactQuery = window.matchMedia(`(max-width: 30em)`);

    if ((this.#compact = compactQuery.matches))
      this.#tableEm.classList.add("table--compact");

    compactQuery.addEventListener("change", (e) => {
      this.#compact = compactQuery.matches;
      this.#tableEm.classList.toggle("table--compact", this.#compact);
      if (this.#cachedData?.length) {
        this.renderData(this.#cachedData);
      }
    });
  }

  renderHead = () => {
    const headRow = Table.#headRowTemplate.content
      .querySelector(".js-thead-row")
      .cloneNode(true);
    const headCol =
      Table.#headRowTemplate.content.querySelector(".js-thead-col");

    for (const colObj of this.#headCols) {
      const col = headCol.cloneNode(true);
      col.classList.add("text-" + colObj.textAlign);
      col.insertAdjacentText("afterBegin", colObj.text);
      headRow.append(col);
    }

    this.#headEm.append(headRow);
  };

  /**
   * Uses event loop to fill the <tbody> by some amount of rows at a time.
   *
   * @consideration Decide how much to append at once based on amount of
   * columns in rowArray.
   *
   * @param {Array} rowArray Array with text contents.
   */
  renderData = (rowArray) => {
    this.#cachedData = window.structuredClone(rowArray);

    const tableRowsFragment = document.createDocumentFragment();

    const loop = (iMax) => {
      for (let i = 0; i < iMax; i++) {
        tableRowsFragment.append(
          this.#createRowElement(
            this.#mapRow(
              rowArray[tableRowsFragment.childElementCount],
              tableRowsFragment.childElementCount,
            ),
          ),
        );
      }

      if (rowArray.length > tableRowsFragment.childElementCount) {
        setTimeout(() => {
          loop(
            Math.min(rowArray.length - tableRowsFragment.childElementCount, 10),
          );
        });
      }
    };

    setTimeout(() => {
      if (rowArray.length > 10) {
        loop(
          Math.min(rowArray.length - tableRowsFragment.childElementCount, 10),
        );
      }

      this.#bodyEm.replaceChildren(tableRowsFragment);
    });

    for (let i = 0; i < Math.min(rowArray.length, 10); i++) {
      tableRowsFragment.append(
        this.#createRowElement(
          this.#mapRow(rowArray[i], tableRowsFragment.childElementCount),
        ),
      );
    }
  };

  renderRow = (rowObj) => {
    this.#bodyEm.prepend(
      this.#createRowElement(
        this.#mapRow(rowObj, this.#bodyEm.childElementCount),
      ),
    );
  };

  #mapRow = (rowObj, index) => {
    return this.#mapRowCallback ? this.#mapRowCallback(rowObj, index) : rowObj;
  };

  showEmpty = () => {
    this.#tableEm.replaceChildren(Table.#emptyStateTemplate.content);
  };

  /**
   * Creates <tr> element from object with key-value pairs.
   *
   * @param {Object} rowObj contains text or node key-value pairs.
   * @returns {HTMLElement} <tr> element.
   */
  #createRowElement = (rowObj) => {
    const tableRowFragment = Table.#bodyRowTemplate.content.cloneNode(true);
    const tableTR = tableRowFragment.querySelector(".js-table-tr");
    const tableTH = tableRowFragment.querySelector(".js-table-th");
    const tableTD = tableRowFragment.querySelector(".js-table-td");

    if (this.#compact) {
      const cellEm = document.createElement("table");
      cellEm.classList.add("nested-table");

      const cellBody = document.createElement("tbody");
      cellEm.append(cellBody);

      Object.entries(rowObj).forEach((entry, index) => {
        if (entry[0] === this.#primaryCol) {
          if (!(entry[1] instanceof Element)) {
            const compactCellHeader = document.createElement("div");
            compactCellHeader.textContent = entry[1];
            entry[1] = compactCellHeader;
          }

          entry[1].classList.add("table__compact-cell-header");
          tableTR.prepend(entry[1]);
        } else {
          const cellRow = document.createElement("tr");

          const headCol = tableTH.cloneNode(true);
          headCol.textContent = this.#headCols[index].text;
          cellRow.append(headCol);

          const dataCol = tableTD.cloneNode(true);
          dataCol.classList.add("text-" + this.#headCols[index].textAlign);

          dataCol.append(entry[1]);
          cellRow.append(dataCol);

          cellBody.append(cellRow);
          tableTR.append(cellEm);
        }
      });
    } else {
      Object.values(rowObj).forEach((value, index) => {
        const tableCol = index > 0 ? tableTD.cloneNode() : tableTH.cloneNode();
        tableCol.classList.add("text-" + this.#headCols[index].textAlign);

        tableCol.append(value);
        tableTR.append(tableCol);
      });
    }

    return tableTR;
  };

  get tableEm() {
    return this.#tableEm;
  }

  get headEm() {
    return this.#headEm;
  }

  get headCols() {
    return this.#headCols;
  }

  static get headRowTemplate() {
    return Table.#headRowTemplate;
  }
}

class SortableTable extends Table {
  static #sortButtonTemplate = document.querySelector(".js-table-sort-btn-t");

  #sortConfig;
  #activeSortBtn;
  #activeSortName;
  #activeSortType;
  #onSortCallback;

  constructor(
    tableElement,
    sortConfig,
    mapRowCallback,
    primaryCol,
    activeSortParams,
    onSortCallback,
  ) {
    super(tableElement, Object.values(sortConfig), mapRowCallback, primaryCol);

    if (typeof activeSortParams === "string") {
      this.#activeSortType = activeSortParams[0] === "-" ? "desc" : "asc";
      this.#activeSortName =
        this.#activeSortType === "desc"
          ? activeSortParams.slice(1)
          : activeSortParams;
    } else if (activeSortParams?.sortName && activeSortParams?.sortType) {
      this.#activeSortName = activeSortParams.sortName;
      this.#activeSortType = activeSortParams.sortType;
    } else {
      this.#activeSortName = Object.keys(sortConfig)[0];
      this.#activeSortType = "asc";
    }

    this.#sortConfig = sortConfig;
    this.#onSortCallback = onSortCallback;
  }

  renderHead = () => {
    const headRow = Table.headRowTemplate.content
      .querySelector(".js-thead-row")
      .cloneNode(true);
    const headCol =
      Table.headRowTemplate.content.querySelector(".js-thead-col");
    const headBtn =
      SortableTable.#sortButtonTemplate.content.querySelector(
        ".js-table-sort-btn",
      );

    Object.keys(this.#sortConfig).forEach((k, i) => {
      const col = headCol.cloneNode(true);

      const sortBtn = headBtn.cloneNode(true);
      sortBtn.classList.add("text-" + this.headCols[i].textAlign);
      sortBtn.name = k;

      if (k === this.#activeSortName) {
        this.#activeSortBtn = sortBtn;
        sortBtn.value = this.#activeSortType;
        sortBtn.classList.add("table__sort-btn--active");
      }

      sortBtn.insertAdjacentText("afterBegin", this.headCols[i].text);

      sortBtn.addEventListener("click", (e) => {
        if (this.#activeSortName === sortBtn.name) {
          this.#setSort(
            sortBtn.name,
            this.#activeSortType === "asc" ? "desc" : "asc",
          );
        } else {
          this.#setSort(sortBtn.name, "asc");
        }
      });

      col.append(sortBtn);

      headRow.append(col);
    });

    this.headEm.append(headRow);
  };

  #setSort = (
    sortName = this.#activeSortName,
    sortType = this.#activeSortType,
  ) => {
    this.#activeSortType = sortType;

    if (this.#activeSortName !== sortName) {
      this.#activeSortName = sortName;
      this.#activeSortBtn?.classList.remove("table__sort-btn--active");
      this.#activeSortBtn = this.headEm.querySelector(
        `button[name=${sortName}]`,
      );
      this.#activeSortBtn.value = this.#formatSort();
      this.#activeSortBtn.classList.add("table__sort-btn--active");
    }

    this.#onSortCallback(this.#formatSort());
  };

  #formatSort = (
    sortName = this.#activeSortName,
    sortType = this.#activeSortType,
  ) => {
    return (sortType === "asc" ? "" : "-") + sortName;
  };
}

export { Table, SortableTable };
