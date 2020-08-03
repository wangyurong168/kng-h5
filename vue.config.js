const source = require('./envsource')
const webpack = require('webpack')
const path = require('path')
const resolve = dir => path.join(__dirname, dir)
const version = new Date().getTime().toString().slice(7)
const pages = {
  index: {
    entry: 'src/main.js',
    template: './public/index.html',
    filename: 'index.html'
  }
}
const IS_PROD = process.env.NODE_ENV === 'production'
module.exports = {
  transpileDependencies: ['v-tooltip'],
  // 相对路径、CDN路径
  publicPath: process.env.VUE_APP_PUBLIC_DOMAIN,
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: !IS_PROD,
  productionSourceMap: !IS_PROD,
  pages: { index: pages.index },
  chainWebpack: config => {
    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .tap(options => Object.assign(options, { limit: 1 }))
    config.plugin('html-index').tap(args => {
      args[0].cdn = source
      args[0].version = version
      return args
    })
    config.resolve.symlinks(true)
    config.resolve.alias.set('@', resolve('src'))
  },

  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'windows.jQuery': 'jquery'
      })
    ]
  },

  css: {
    extract: true,
    sourceMap: !IS_PROD,
    modules: false
  },

  // 在多核机器下会默认开启
  parallel: require('os').cpus().length > 1,

  devServer: {
    host: '0.0.0.0',
    port: 8888,
    https: false,
    hot: true,
    open: true,
    disableHostCheck: true
  }
}
