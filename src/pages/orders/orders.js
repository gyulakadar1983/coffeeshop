import "./orders.css";
import { SortableTable } from "/components/Table/Table.js";
import { Pagination } from "/components/Pagination/Pagination.js";
import { RequestHandler } from "/components/RequestHandler/RequestHandler.js";
import { SearchInput } from "/components/Form/SearchInput.js";
import { NavHeader } from "/components/nav-header/NavHeader.js";

new NavHeader(document.querySelector(".js-nav-header")).setActiveTab(
  ".js-orders-table-tab",
);

new SearchInput(document.querySelector(".js-orders-search-input"));

const moneyFormat = new Intl.NumberFormat("ru", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const url = new URL(window.location);

const ordersQuery = new URLSearchParams(window.location.search);
ordersQuery.set("include", "customers,order_items,page_count");
!ordersQuery.has("sort") && ordersQuery.set("sort", "-order_id");

const queryDateFormat = new Intl.DateTimeFormat("lt");
const d = new Date();
const queryDateStart = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
const queryDateEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
!ordersQuery.has("date[from]") &&
  ordersQuery.set("date[from]", queryDateFormat.format(queryDateStart));
!ordersQuery.has("date[to]") &&
  ordersQuery.set("date[to]", queryDateFormat.format(queryDateEnd));

const ordersTableEm = document.querySelector(".js-table");
const ordersRH = new RequestHandler(ordersTableEm.parentElement);
ordersRH.request(
  new Request("\\api/v1/orders/?" + ordersQuery.toString(), {
    headers: {
      Accept: "application/json",
    },
  }),
  (res) =>
    ordersRH.json(res, (json) => {
      if (json.orders.length) {
        ordersTable.renderData(json.orders);

        const currentPage = Number(url.searchParams.get("page[number]")) || 1;
        pages.fillContainer(json.pageCount, currentPage);
        pages.setCurrent(currentPage);
      } else {
        ordersTable.showEmpty();
      }
    }),
);

const ordersTable = new SortableTable(
  ordersTableEm,
  {
    order_id: "ID заказа",
    customer_id: "Покупатель",
    item_count: { text: "Товары", textAlign: "center" },
    sum: { text: "Сумма", textAlign: "center" },
  },
  (row) => {
    const newRow = {};

    /**
     * PK cell
     */

    const orderPKEm = document.createElement("div");
    orderPKEm.classList.add("order-pk");

    const orderIDEm = document.createElement("span");
    orderIDEm.classList.add("order-pk__id");
    orderIDEm.textContent = "#" + String(row.order_id);

    const orderDateEm = document.createElement("span");
    orderDateEm.classList.add("order-pk__date");
    orderDateEm.textContent = new Intl.DateTimeFormat("ru", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(row.order_date);

    orderPKEm.append(orderIDEm, orderDateEm);

    newRow.order_id = orderPKEm;

    /**
     * Customer cell
     */

    const orderCustomerEm = document.createElement("div");
    orderCustomerEm.classList.add("order-customer");

    const orderCustomerFullNameEm = document.createElement("span");
    orderCustomerFullNameEm.classList.add("order-customer__full-name");
    orderCustomerFullNameEm.textContent = row.full_name;

    const orderCustomerIDEm = document.createElement("span");
    orderCustomerIDEm.classList.add("order-customer__id");
    orderCustomerIDEm.textContent = "#" + String(row.customer_id);

    orderCustomerEm.append(orderCustomerFullNameEm, orderCustomerIDEm);

    newRow.customer_id = orderCustomerEm;

    /**
     * Item count cell
     */

    const orderItemCountEm = document.createElement("div");
    orderItemCountEm.classList.add("order-item-count");
    orderItemCountEm.textContent = row.item_count;

    newRow.item_count = orderItemCountEm;

    /**
     * Sum cell
     */

    const orderSumEm = document.createElement("div");
    orderSumEm.classList.add("order-sum");
    orderSumEm.textContent = moneyFormat.format(row.sum);

    newRow.sum = orderSumEm;

    return newRow;
  },
  "order_id",
  url.searchParams.get("sort") || "-order_id",
  (sort) => {
    const url = new URL(window.location);
    url.searchParams.set("sort", sort);
    window.location.assign(url);
  },
);

ordersTable.renderHead();

const pages = new Pagination(
  document.querySelector(".js-page-links-container"),
);
