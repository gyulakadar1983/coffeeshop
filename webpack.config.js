const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, args) => {
  return {
    context: path.resolve(__dirname, "src"),
    resolve: {
      alias: {
        fonts: path.resolve(__dirname, "src/fonts"),
      },
    },
    entry: {
      login: {
        import: "./pages/login/login.js",
      },
      home: {
        import: "./pages/home/home.js",
      },
      dashboard: {
        import: "./pages/dashboard/dashboard.js",
      },
      customers: {
        import: "./pages/customers/customers.js",
      },
      products: {
        import: "./pages/products/products.js",
      },
      orders: {
        import: "./pages/orders/orders.js",
      },
    },
    output: {
      filename: "static/[name].[contenthash].js",
      path: path.resolve(__dirname, "dist"),
      publicPath: "/",
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          use: "html-loader",
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            args.mode === "production"
              ? MiniCssExtractPlugin.loader
              : "style-loader",
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
              },
            },
            "postcss-loader",
          ],
        },
        {
          test: /\.(svg|ico|png|webp|jpg|gif|jpeg)$/,
          type: "asset/resource",
          generator: {
            filename: "static/[name].[contenthash][ext]",
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: "asset/resource",
          generator: {
            filename: "static/[name].[ext]",
          },
        },
      ],
    },
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "api",
            to: "./api",
          },
          {
            context: "components",
            from: "**/*.html",
            to: "./components/",
          },
          {
            context: "components",
            from: "**/*.php",
            to: "./components/",
          },
          {
            context: "images",
            from: "**/*",
            to: "./static",
          },
          {
            context: "favicon",
            from: "**/*",
            to: "./static",
          },
        ],
      }),
      new MiniCssExtractPlugin({
        filename: "static/[name].[contenthash].css",
      }),
      new HtmlWebpackPlugin({
        title: "Вход в аккаунт - Кофейня",
        template: "./pages/login/login.php",
        filename: "pages/login/index.php",
        chunks: ["login"],
      }),
      new HtmlWebpackPlugin({
        title: "Домашняя страница - Кофейня",
        template: "./pages/home/home.php",
        filename: "pages/index.php",
        chunks: ["home"],
      }),
      new HtmlWebpackPlugin({
        title: "Обзор - Кофейня",
        template: "./pages/dashboard/dashboard.php",
        filename: "pages/dashboard/index.php",
        chunks: ["dashboard"],
      }),
      new HtmlWebpackPlugin({
        title: "Покупатели - Кофейня",
        template: "./pages/customers/customers.php",
        filename: "pages/customers/index.php",
        chunks: ["customers"],
      }),
      new HtmlWebpackPlugin({
        title: "Товары - Кофейня",
        template: "./pages/products/products.php",
        filename: "pages/products/index.php",
        chunks: ["products"],
      }),
      new HtmlWebpackPlugin({
        title: "Заказы - Кофейня",
        template: "./pages/orders/orders.php",
        filename: "pages/orders/index.php",
        chunks: ["orders"],
      }),
    ],
    // watch: true,
  };
};
