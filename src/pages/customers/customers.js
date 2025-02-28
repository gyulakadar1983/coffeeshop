import "./customers.css";
import { SortableTable } from "/components/Table/Table.js";
import { Pagination } from "/components/Pagination/Pagination.js";
import { RequestHandler } from "/components/RequestHandler/RequestHandler.js";
import { SearchInput } from "/components/Form/SearchInput.js";
import { NavHeader } from "/components/nav-header/NavHeader.js";

new NavHeader(document.querySelector(".js-nav-header")).setActiveTab(
  ".js-customers-table-tab",
);

new SearchInput(document.querySelector(".js-customers-search-input"));

const url = new URL(window.location);

const customersQuery = new URLSearchParams(window.location.search);
customersQuery.set("include", "page_count");
!customersQuery.has("sort") && customersQuery.set("sort", "-id");

const customersTableEm = document.querySelector(".js-table");
const customersRH = new RequestHandler(customersTableEm.parentElement);
customersRH.request(
  new Request("\\api/v1/customers/?" + customersQuery.toString(), {
    headers: {
      Accept: "application/json",
    },
  }),
  (res) =>
    customersRH.json(res, (json) => {
      if (json.customers.length) {
        customersTable.renderData(json.customers);

        const currentPage = Number(url.searchParams.get("page[number]")) || 1;
        pages.fillContainer(json.pageCount, currentPage);
        pages.setCurrent(currentPage);
      } else {
        customersTable.showEmpty();
      }
    }),
);
const formatCustomerPhone = (phoneString) =>
  "+" +
  phoneString.slice(1, 2) +
  " (" +
  phoneString.slice(2, 5) +
  ")" +
  " " +
  phoneString.slice(5, 8) +
  "-" +
  phoneString.slice(8, 10) +
  "-" +
  phoneString.slice(10, 12);
const customersTable = new SortableTable(
  customersTableEm,
  {
    id: "ID покупателя",
    full_name: "ФИО",
    phone: "Номер телефона",
  },
  (row) => {
    /**
     * PK cell
     */

    const customerIDEm = document.createElement("div");
    customerIDEm.textContent = "#" + row.id;

    row.id = customerIDEm;

    /**
     * Full name cell
     */

    const fullNameEm = document.createElement("div");
    fullNameEm.classList.add("customer-full-name");
    fullNameEm.textContent = row.full_name;

    row.full_name = fullNameEm;

    /**
     * Phone
     */

    row.phone = formatCustomerPhone(row.phone);

    return row;
  },
  "full_name",
  url.searchParams.get("sort") || "-id",
  (sort) => {
    const url = new URL(window.location);
    url.searchParams.set("sort", sort);
    window.location.assign(url);
  },
);
customersTable.renderHead();

const pages = new Pagination(
  document.querySelector(".js-page-links-container"),
);
