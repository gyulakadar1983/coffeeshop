import "./products.css";
import { SortableTable } from "/components/Table/Table.js";
import { Pagination } from "/components/Pagination/Pagination.js";
import { Modal } from "/components/Modal/Modal.js";
import { Form } from "/components/Form/Form.js";
import { RequestHandler } from "/components/RequestHandler/RequestHandler.js";
import { SearchInput } from "/components/Form/SearchInput.js";
import { NavHeader } from "/components/nav-header/NavHeader.js";

new NavHeader(document.querySelector(".js-nav-header")).setActiveTab(
  ".js-products-table-tab",
);

new SearchInput(document.querySelector(".js-products-search-input"));

const moneyFormat = new Intl.NumberFormat("ru", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const url = new URL(window.location);

const productsQuery = new URLSearchParams(window.location.search);
productsQuery.set("include", "product_types,page_count");
!productsQuery.has("sort") && productsQuery.set("sort", "-product_id");

const productsTableEm = document.querySelector(".js-table");
const productsRH = new RequestHandler(productsTableEm.parentElement);
productsRH.request(
  new Request("\\api/v1/products/?" + productsQuery.toString(), {
    headers: {
      Accept: "application/json",
    },
  }),
  (res) =>
    productsRH.json(res, (json) => {
      if (json.products.length) {
        productsTable.renderData(json.products);

        const currentPage = Number(url.searchParams.get("page[number]")) || 1;
        pages.fillContainer(json.pageCount, currentPage);
        pages.setCurrent(currentPage);
      } else {
        productsTable.showEmpty();
      }
    }),
);
const productsTable = new SortableTable(
  productsTableEm,
  {
    product_id: "ID товара",
    product_name: "Название",
    size: { text: "Размер", textAlign: "center" },
    price: { text: "Цена", textAlign: "center" },
  },
  (row) => {
    /**
     * PK cell
     */

    const productIDEm = document.createElement("div");
    productIDEm.textContent = "#" + String(row.product_id);

    row.product_id = productIDEm;

    /**
     * Product header cell
     */

    const productHeaderEm = document.createElement("div");
    productHeaderEm.classList.add("product-header");

    const productNameEm = document.createElement("span");
    productNameEm.classList.add("product-header__name");
    productNameEm.textContent = row.product_name;

    const productTypeEm = document.createElement("span");
    productTypeEm.classList.add("product-header__type");
    productTypeEm.textContent = row.product_type;

    productHeaderEm.append(productNameEm, productTypeEm);

    row.product_name = productHeaderEm;
    delete row.product_type;

    /**
     * Size cell
     */

    const productSizeEm = document.createElement("div");
    productSizeEm.classList.add("product-size");
    productSizeEm.textContent = row.size;

    row.size = productSizeEm;

    /**
     * Price cell
     */

    const productPriceEm = document.createElement("div");
    productPriceEm.classList.add("product-price");
    productPriceEm.textContent = moneyFormat.format(row.price);

    row.price = productPriceEm;

    return row;
  },
  "product_name",
  url.searchParams.get("sort") || "-product_id",
  (sort) => {
    const url = new URL(window.location);
    url.searchParams.set("sort", sort);
    window.location.assign(url);
  },
);
productsTable.renderHead();

const pages = new Pagination(
  document.querySelector(".js-page-links-container"),
);

const addProductFormEm = document.querySelector(".js-add-product-form");

const addProductDialog = new Modal(
  {
    modal: addProductFormEm.closest(".js-modal"),
    openButton: document.querySelector(".js-add-product-modal-open-btn"),
  },
  () => {
    addProductFormEm.reset();
  },
);

const addProductRH = new RequestHandler(addProductFormEm, true);

const addProductForm = new Form(addProductFormEm, async () => {
  try {
    await addProductRH.request(
      new Request("\\api/v1/products/", {
        method: "post",
        body: new FormData(addProductFormEm),
        headers: {
          Accept: "application/json",
        },
      }),
      (res) =>
        addProductRH.json(res, (json) => {
          productsTable.renderRow(json);
          addProductDialog.modal.close();
          addProductFormEm.reset();
        }),
    );
  } catch (err) {
    switch (err.cause.code) {
      case 409:
        addProductForm.logError("Данный товар уже существует.");
        break;
      case 422:
        addProductForm.logError(
          "Произошла ошибка. Пожалуйста, проверьте правильность \n написания данных и повторите попытку.",
        );
        break;
      default:
        addProductRH.showError(err.cause.code);
    }
  }
});
