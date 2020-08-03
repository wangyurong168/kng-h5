const appServer = process.env.VUE_APP_SERVER
const appApienv = process.env.VUE_APP_APIENV

const fileSource = {
  dev: {
    css: [
      './static/stylesheets/lecai.min.css'
    ],
    js: [
      'https://media-phx.yunxuetang.com.cn/bridge.min.js',
      'https://media-phx.yunxuetang.com.cn/yxtcore-h5.js'
    ]
  },
  stg: {
    css: [
      './static/stylesheets/lecai.min.css'
    ],
    js: [
      'https://media-phx.yunxuetang.com.cn/bridge.min.js',
      'https://media-phx-ucstable.yunxuetang.com.cn/yxtcore-h5.js',
      'https://media-phx-ucstable.yunxuetang.com.cn/kng/tingyun/tingyun-rum.js'
    ]
  },
  prod: {
    css: [
      './static/stylesheets/lecai.min.css'
    ],
    js: [
      'https://media-phx.yunxuetang.cn/bridge.min.js',
      'https://media-phx.yunxuetang.cn/yxtcore-h5.js',
      'https://media-phx.yunxuetang.cn/kng/tingyun/tingyun-rum.js'
    ]
  }
}

module.exports = fileSource[appApienv]
