// import purgeCSSPlugin from '@fullhuman/postcss-purgecss';
const path = require('path');

module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano'),
    require('postcss-import')({
      path: path.resolve(__dirname, 'src'),
    }),
    require('postcss-mixins'),
  ],
};