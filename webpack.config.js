const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = [
  'source-map'
].map(devtool => ({
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'stickythead.js',
    library: 'stickyThead',
    libraryTarget: 'umd',
  },
  devtool,
  optimization: {
    minimizer: [new UglifyJsPlugin({ test: /\.js(\?.*)?$/i, sourceMap: true })],
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
}));
