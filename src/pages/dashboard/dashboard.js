import "./dashboard.css";
import { Table } from "/components/Table/Table.js";
import { RequestHandler } from "/components/RequestHandler/RequestHandler.js";
import { NavHeader } from "/components/nav-header/NavHeader.js";
import {
  Chart,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Legend,
  Tooltip,
} from "chart.js";

Chart.register(
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Legend,
  Tooltip,
);

new NavHeader(document.querySelector(".js-nav-header")).setActiveTab(
  ".js-dashboard-tab",
);

const requestDateFormat = new Intl.DateTimeFormat("lt", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});
const moneyFormat = new Intl.NumberFormat("ru", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});
const monthNameFormat = new Intl.DateTimeFormat("ru", { month: "long" });
const smallScreen = window.matchMedia("(max-width: 50em)");

const weekStart = 1;
const createDateRange = (period = "week") => {
  // Change this to test different datas on responses.
  const d = new Date();
  let start, end;

  if (period === "week") {
    start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
    const weekStartDay = start.getDay() - weekStart;
    start.setDate(
      weekStartDay < 0
        ? start.getDate() - (7 - weekStart)
        : start.getDate() - weekStartDay,
    );
    end = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + 6,
      23,
      59,
      59,
    );
  } else if (period === "month") {
    start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
    end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
  } else if (period === "year") {
    start = new Date(d.getFullYear(), 0, 1, 0, 0, 0);
    end = new Date(start.getFullYear(), 11, 31, 23, 59, 59);
  }

  return { start, end };
};

/**
 *  LAST ORDERS
 */

const lastOrdersEm = document.querySelector(".js-last-orders");
const lastOrdersRH = new RequestHandler(lastOrdersEm);
lastOrdersRH.request(
  new Request(
    "\\api/v1/orders/?include=order_items&page[limit]=5&sort=-order_id",
    {
      headers: {
        Accept: "application/json",
      },
    },
  ),
  (res) =>
    lastOrdersRH.json(res, (json) => {
      const lastOrdersTemplates = document.querySelector(
        ".js-last-orders-templates",
      );

      if (!json.orders.length) {
        lastOrdersEm.replaceChildren(
          lastOrdersTemplates.content
            .querySelector(".js-empty")
            .cloneNode(true),
        );
        return;
      }

      const lastOrdersFragment = document.createDocumentFragment();

      json.orders.forEach((row) => {
        const lastOrderEm = lastOrdersTemplates.content
          .querySelector(".js-order")
          .cloneNode(true);

        lastOrderEm.querySelector(".js-order-id").textContent =
          "#" + String(row.order_id);
        lastOrderEm.querySelector(".js-order-count").textContent =
          row.item_count +
          " товар" +
          (row.item_count % 10 === 0 ||
          /[5-9]$/.test(row.item_count) ||
          /1\d$/.test(row.item_count)
            ? "ов"
            : /[2-4]$/.test(row.item_count)
              ? "а"
              : "");
        lastOrderEm.querySelector(".js-order-sum").textContent =
          moneyFormat.format(row.sum);
        lastOrderEm.querySelector(".js-order-date").textContent =
          new Intl.DateTimeFormat("ru", {
            year: "numeric",
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          }).format(row.order_date);

        lastOrdersFragment.append(lastOrderEm);
      });

      lastOrdersEm.replaceChildren(lastOrdersFragment);
    }),
);

/**
 *  TODAY ORDERS
 */

const todayDate = requestDateFormat.format(new Date(2024, 11, 1));
const ordersStatCard = document.querySelector(".js-orders-stat-card");
const ordersStatRH = new RequestHandler(ordersStatCard);
ordersStatRH.request(
  new Request(
    `\\api/v1/orders/?fields[orders]=count(id),sum(sum)&date[from]=${todayDate}&date[to]=${todayDate}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  ),
  (res) =>
    ordersStatRH.json(res, (json) => {
      ordersStatCard.querySelector(".js-order-count").textContent =
        json["orders"][0]["count(id)"];
      ordersStatCard.querySelector(".js-revenue").textContent =
        "+" + moneyFormat.format(json["orders"][0]["sum(sum)"] || 0);
    }),
);

/**
 *  NEW CUSTOMERS
 */

const customersStatCard = document.querySelector(".js-customers-stat-card");
const customersStatRH = new RequestHandler(customersStatCard);
(() => {
  const range = createDateRange();
  customersStatRH.request(
    new Request(
      `\\api/v1/customers/new/?include=diff&date[from]=${requestDateFormat.format(
        range.start,
      )}&date[to]=${requestDateFormat.format(range.end)}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    ),
    (res) =>
      customersStatRH.json(res, (json) => {
        if (json.new <= json.prev) {
          customersStatCard.classList.add("stat-card--loss");
        }
        customersStatCard.querySelector(".js-customer-count").textContent =
          json.new;
        customersStatCard.querySelector(".js-growth-percent").textContent =
          new Intl.NumberFormat("ru", {
            style: "percent",
            maximumFractionDigits: 0,
          }).format((json.new - json.prev) / json.prev || 0);
      }),
  );
})();

/**
 *  SALES
 */

const salesEm = document.querySelector(".js-sales");
const salesRH = new RequestHandler(salesEm);
const createSalesReq = (range = createDateRange()) => {
  return new Request(
    `\\api/v1/sales/?date[from]=${requestDateFormat.format(
      range.start,
    )}&date[to]=${requestDateFormat.format(range.end)}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );
};

const salesHeading = salesEm.querySelector(".js-sales-heading");
const salesSumEm = salesEm.querySelector(".js-sales-sum");
const renderSales = (json, range, period = "week") => {
  salesSumEm.textContent = moneyFormat.format(Number(json.rollup?.sum) || 0);
  salesModes.setActive(period);

  if (salesSelectEm.dataset.period !== period) {
    if (period === "week") {
      let weekCount = 4;

      if (
        new Date(
          range.start.getFullYear(),
          range.start.getMonth(),
          1,
        ).getDay() < 1
      ) {
        weekCount++;
      }
      if (
        new Date(
          range.start.getFullYear(),
          range.start.getMonth() + 1,
          0,
        ).getDay() > 0
      ) {
        weekCount++;
      }

      let firstWeekDate = new Date(range.start);

      if (range.start.getMonth() === range.end.getMonth()) {
        firstWeekDate.setDate(1);
        const monthStartDay = firstWeekDate.getDay() - weekStart;
        firstWeekDate.setDate(
          monthStartDay < 0 ? 1 - (7 - weekStart) : 1 - monthStartDay,
        );
      }

      const lastWeekDate = new Date(
        firstWeekDate.getFullYear(),
        firstWeekDate.getMonth(),
        firstWeekDate.getDate() + weekCount * 7,
      );

      for (
        let i = new Date(firstWeekDate);
        i < lastWeekDate;
        i.setDate(i.getDate() + 7)
      ) {
        const optionEm = document.createElement("option");
        optionEm.textContent =
          "Неделя " + (salesOptionsFragment.childElementCount + 1);
        optionEm.value = i.getTime();
        if (
          i.getDate() + 3 > range.start.getDate() &&
          i.getDate() + 3 < range.end.getDate()
        ) {
          optionEm.setAttribute("selected", true);
        }
        salesOptionsFragment.append(optionEm);
      }

      salesSelectEm.setAttribute("aria-label", "Выбор недели");
    } else if (period === "month") {
      for (
        let i = new Date(range.start.getFullYear(), 0, 1);
        i < new Date(range.start.getFullYear(), 12);
        i.setMonth(i.getMonth() + 1)
      ) {
        const optionEm = document.createElement("option");
        optionEm.textContent = monthNameFormat
          .format(i)
          .replace(/[а-я]/, (match) => match.toUpperCase());
        optionEm.value = i.getTime();
        if (range.start.getMonth() === i.getMonth()) {
          optionEm.setAttribute("selected", true);
        }
        salesOptionsFragment.append(optionEm);
      }

      salesSelectEm.setAttribute("aria-label", "Выбор месяца");
    } else {
      salesSelectEm.removeAttribute("aria-label");
    }

    salesSelectEm.dataset.period = period;
    salesSelectEm.replaceChildren(salesOptionsFragment);
  }

  let chartDateFormat;
  if (period === "week") {
    chartDateFormat = new Intl.DateTimeFormat("ru", {
      day: "numeric",
      month: "numeric",
    });
    salesHeading.textContent = "Заказы за неделю";
  } else if (period === "month") {
    chartDateFormat = new Intl.DateTimeFormat("ru", { day: "numeric" });
    salesHeading.textContent = "Заказы за месяц";
  } else if (period === "year") {
    chartDateFormat = new Intl.DateTimeFormat("ru", { month: "short" });
    salesHeading.textContent = "Заказы за год";
  }

  json.sales.forEach((data) => {
    data.date = new Date(Number(data.date));
    data.date.setMinutes(
      data.date.getMinutes() + data.date.getTimezoneOffset(),
    );
  });

  const sales = [];
  for (
    let i = new Date(range.start);
    i < range.end;
    period !== "year"
      ? i.setDate(i.getDate() + 1)
      : i.setMonth(i.getMonth() + 1)
  ) {
    const match = json.sales.find((data) =>
      data.date.getFullYear() === i.getFullYear() &&
      data.date.getMonth() === i.getMonth() &&
      period === "year"
        ? true
        : data.date.getDate() === i.getDate(),
    );
    const salesObj = {
      date: match?.date || i,
      sum: match?.sum || 0,
      order_count: match?.order_count || 0,
    };
    salesObj.date = chartDateFormat.format(salesObj.date);
    sales.push(salesObj);
  }

  salesChart.data.labels = sales.map((obj) => obj.date);
  salesChart.data.datasets[0].data = sales.map((obj) => obj.order_count);
  salesChart.data.datasets[1].data = sales.map((obj) => obj.sum);
  salesChart.options.scales.y.ticks.stepSize =
    Math.max(
      ...salesChart.data.datasets[salesChart.getDatasetMeta(0).visible ? 0 : 1]
        .data,
    ) / 4;

  salesChart.update();
};

const salesSelectEm = salesEm.querySelector(".js-sales-select");
const salesOptionsFragment = new DocumentFragment();

salesSelectEm.addEventListener("input", () => {
  const selectedDate = new Date(
    Number(salesSelectEm.item(salesSelectEm.selectedIndex).value),
  );
  const start = selectedDate;
  const end =
    salesSelectEm.dataset.period === "week"
      ? new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate() + 6,
          23,
          59,
          59,
        )
      : salesSelectEm.dataset.period === "month" &&
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
          0,
          23,
          59,
          59,
        );

  salesRH.request(createSalesReq({ start, end }), (res) =>
    salesRH.json(res, (json) => {
      renderSales(json, { start, end }, salesSelectEm.dataset.period);
    }),
  );
});

const salesModes = {
  weekBtn: null,
  monthBtn: null,
  yearBtn: null,
  activeBtn: null,
  activeMode: "week",
  setActive(period) {
    (this.activeMode = period), this.activeBtn?.classList.remove("is-active");
    this.activeBtn = salesModes[period + "Btn"];
    this.activeBtn.classList.add("is-active");
  },
};

new Array("week", "month", "year").forEach((period) => {
  salesModes[period + "Btn"] = salesEm.querySelector(
    ".js-" + period + "-sales-btn",
  );
  salesModes[period + "Btn"].addEventListener("click", (e) => {
    const dateRange = createDateRange(period);
    salesRH.request(createSalesReq(dateRange), (res) =>
      salesRH.json(res, (json) => {
        renderSales(json, dateRange, period);
      }),
    );
  });
});

salesRH.request(createSalesReq(), (res) =>
  salesRH.json(res, (json) => {
    renderSales(json, createDateRange());
  }),
);

const chartMoneyFormat = new Intl.NumberFormat("ru", {
  style: "currency",
  currency: "RUB",
  notation: "compact",
  maximumFractionDigits: 1,
});
document.fonts.ready.then(() => salesChart.update());
const salesChart = new Chart(salesEm.querySelector(".js-sales-chart-canvas"), {
  type: "bar",
  options: {
    layout: {
      padding: {
        left: smallScreen.matches ? 0 : 20,
      },
    },
    responsive: true,
    barValueSpacing: 20,
    font: {
      family: "Inter",
      weight: 500,
      size: smallScreen.matches ? 10 : 12,
    },
    animation: false,
    scales: {
      x: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        ticks: {
          color: "#a6a6a6",
          font: {},
        },
      },
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        ticks: {
          callback: (val) => (val < 1 ? val : chartMoneyFormat.format(val)),
          padding: smallScreen.matches ? 0 : 10,
          color: "#a6a6a6",
          font: {},
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            if (context.datasetIndex === 1) {
              return " Доход: " + chartMoneyFormat.format(context.raw);
            } else if (context.datasetIndex === 0) {
              return " Заказы: " + context.raw;
            }
          },
          title: function (context) {
            context = context[0];
            const d = new Date();

            if (salesModes.activeMode === "week") {
              return new Intl.DateTimeFormat("ru", { weekday: "long" })
                .format(
                  new Date(
                    d.getFullYear(),
                    context.label.replace(/\d{2}./, "") - 1,
                    context.label.replace(/.\d{2}/, ""),
                  ),
                )
                .replace(/[а-я]/, (match) => match.toUpperCase());
            } else if (salesModes.activeMode === "month") {
              return new Intl.DateTimeFormat("ru", {
                month: "short",
                day: "numeric",
              }).format(
                new Date(
                  d.getFullYear(),
                  salesSelectEm.selectedIndex,
                  context.label,
                ),
              );
            } else if (salesModes.activeMode === "year") {
              return new Intl.DateTimeFormat("ru", { month: "long" })
                .format(new Date(d.getFullYear(), context.dataIndex))
                .replace(/[а-я]/, (match) => match.toUpperCase());
            }
          },
        },
        padding: 15,
        cornerRadius: 10,
        backgroundColor: "#fff",
        titleMarginBottom: 10,
        titleColor: "#725740",
        titleFont: { family: "Inter", size: 12 },
        bodyFont: { family: "Inter", size: 12, weight: 400 },
        bodyColor: "#000",
        borderColor: "#bfbfbf",
        borderWidth: 1,
        usePointStyle: true,
      },
      htmlLegend: {
        container: "sales-chart-legend-list",
      },
      legend: {
        display: false,
      },
    },
  },
  data: {
    labels: ["01.01", "02.01", "03.01", "04.01", "05.01", "06.01", "07.01"],
    datasets: [
      {
        label: "Заказы",
        data: [0, 0, 0, 0, 0, 0, 0],
        normalized: true,
        backgroundColor: "#f7cc87",
      },
      {
        label: "Доход",
        data: [0, 0, 0, 0, 0, 0, 0],
        normalized: true,
        backgroundColor: "#a27b5c",
      },
    ],
  },
  plugins: [
    {
      id: "sales-legend-list",
      afterUpdate(chart, args, options) {
        const ulEm = salesEm.querySelector(".js-sales-chart-legend-list");
        ulEm.replaceChildren();

        const items = chart.options.plugins.legend.labels.generateLabels(chart);
        items.forEach((item) => {
          const itemEm = document.createElement("li");
          itemEm.classList.add("sales-chart__legend-container");
          item.hidden && itemEm.classList.add("is-disabled");
          itemEm.addEventListener("click", (e) => {
            if (item.datasetIndex === 0) {
              salesChart.options.scales.y.ticks.callback = (val) =>
                val < 1 ? val : Math.round(val);
            } else if (item.datasetIndex === 1) {
              salesChart.options.scales.y.ticks.callback = (val) =>
                val < 1 ? val : chartMoneyFormat.format(val);
            }

            salesChart.data.datasets.forEach((ds, index) => {
              if (index !== item.datasetIndex) {
                salesChart.hide(index);
              }
            });

            salesChart.show(item.datasetIndex);

            salesChart.options.scales.y.ticks.stepSize =
              Math.max(...salesChart.data.datasets[item.datasetIndex].data) / 4;

            salesChart.update();
          });

          const markerEm = document.createElement("span");
          markerEm.classList.add("sales-chart__marker");
          markerEm.style.background = item.fillStyle;

          const textEm = document.createElement("p");
          textEm.classList.add("sales-chart__legend");
          textEm.dataset.color = item.fillStyle;
          textEm.textContent = item.text;

          itemEm.append(markerEm, textEm);
          ulEm.append(itemEm);
        });
      },
    },
  ],
});
salesChart.hide(0);

smallScreen.addEventListener("change", (e) => {
  if (smallScreen.matches) {
    salesChart.options.layout.padding.left = 0;
    salesChart.options.scales.y.ticks.padding = 0;
    salesChart.options.font.size = 10;
  } else {
    salesChart.options.layout.padding.left = 20;
    salesChart.options.scales.y.ticks.padding = 10;
    salesChart.options.font.size = 12;
  }
});

/**
 *  TOP PRODUCTS
 */

const topProductsEm = document.querySelector(".js-top-products");
const topProductsTableEm = topProductsEm.querySelector(".js-table");
const topProductsRH = new RequestHandler(
  topProductsEm.querySelector(".js-table-container"),
);
topProductsRH.request(
  new Request(`\\api/v1/products/top/?page[limit]=5`, {
    headers: {
      Accept: "application/json",
    },
  }),
  (res) =>
    topProductsRH.json(res, (json) => {
      if (json.productTop.length) {
        topProductsTable.renderData(json.productTop);
      } else {
        topProductsEm.remove();
      }
    }),
);
const topProductsTable = new Table(
  topProductsTableEm,
  [
    { text: " ", textAlign: "center" },
    "Название",
    { text: "Размер", textAlign: "center" },
    { text: "Цена", textAlign: "center" },
    { text: "Продажи", textAlign: "center" },
  ],
  (row, index) => {
    /**
     * Product top cell
     */

    const rankEm = document.createElement("div");
    rankEm.classList.add("top-products__rank");
    rankEm.textContent =
      "№" + String(index + 1).padStart(String(index + 1).length + 1, "0");

    const newRow = {
      product_rank: rankEm,
    };

    /**
     * PK cell
     */

    const productPKEm = document.createElement("div");
    productPKEm.classList.add("top-products__pk");

    const productNameEm = document.createElement("span");
    productNameEm.classList.add("top-products__name");
    productNameEm.textContent = row.name;

    const productIDEm = document.createElement("span");
    productIDEm.classList.add("top-products__id");
    productIDEm.textContent = "#" + String(row.product_id);

    productPKEm.append(productNameEm, productIDEm);

    newRow.product_id = productPKEm;

    /**
     * Size cell
     */

    const productSizeEm = document.createElement("div");
    productSizeEm.classList.add("top-products__size");
    productSizeEm.textContent = row.size;

    newRow.size = productSizeEm;

    /**
     * Price cell
     */

    const productPriceEm = document.createElement("div");
    productPriceEm.classList.add("top-products__price");
    productPriceEm.textContent = moneyFormat.format(row.price);

    newRow.price = productPriceEm;

    /**
     * Order count cell
     */

    const productOrderCountEm = document.createElement("div");
    productOrderCountEm.classList.add("top-products__order-count");
    productOrderCountEm.textContent = row.order_count;

    newRow.order_count = productOrderCountEm;

    return newRow;
  },
  "product_rank",
);
topProductsTable.renderHead();
