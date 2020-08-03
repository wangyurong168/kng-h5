const appApienv = process.env.VUE_APP_APIENV

const base = {
  qida: {
    dev: 'https://api-core-phx.yunxuetang.com.cn/v2/', // 内网
    stg: 'https://api-core-phx-ucstable.yunxuetang.com.cn/v2/',
    prod: 'https://api-core-phx.yunxuetang.cn/v2/'
  },
  msg: {
    dev: 'https://api-msg-phx.yunxuetang.com.cn/v2/', // 内网
    stg: 'https://api-msg-phx-ucstable.yunxuetang.com.cn/v2/', // 预发布
    prod: 'https://api-msg-phx.yunxuetang.cn/v2/' // 外网
  },
  kng: {
    dev: 'https://api-kng-phx.yunxuetang.com.cn/v2/',
    stg: 'https://api-kng-phx-ucstable.yunxuetang.com.cn/v2/',
    prod: 'https://api-kng-phx.yunxuetang.cn/v2/'
  },
  utility: {
    dev: 'https://api-utility-phx.yunxuetang.com.cn/v2/',
    stg: 'https://api-utility-phx-ucstable.yunxuetang.com.cn/v2/',
    prod: 'https://api-utility-phx.yunxuetang.cn/v2/'
  },
  file: {
    dev: 'https://api-file-phx.yunxuetang.com.cn/v2/',
    stg: 'https://api-file-phx-ucstable.yunxuetang.com.cn/v2/',
    prod: 'https://api-file-phx.yunxuetang.cn/v2/'
  },
  ssp: {
    dev: 'https://api-ssp-phx.yunxuetang.com.cn/v2/',
    stg: 'https://api-ssp-phx-ucstable.yunxuetang.com.cn/v2/',
    prod: 'https://api-ssp-phx.yunxuetang.cn/v2/'
  },
  sensors: {
    dev: 'https://sa-api.yxt.com/sa?project=default',
    stg: 'https://sa-api.yxt.com/sa?project=default',
    prod: 'https://sa-api.yxt.com/sa?project=production'
  },
  media: {
    dev: 'https://media-phx.yunxuetang.com.cn',
    stg: 'https://media-phx-ucstable.yunxuetang.com.cn',
    prod: 'https://media-phx.yunxuetang.cn'
  },
  cc: {
    dev: 'https://api-cc-phx.yunxuetang.com.cn/v2/',
    stg: 'https://api-cc-phx-ucstable.yunxuetang.com.cn/v2/',
    prod: 'https://api-cc-phx.yunxuetang.cn/v2/'
  },
  decorate: {
    dev: 'https://api-decorate-phx.yunxuetang.com.cn/v2/',
    stg: 'https://api-decorate-phx-ucstable.yunxuetang.com.cn/v2/',
    prod: 'https://api-decorate-phx.yunxuetang.cn/v2/'
  }
}
export const domainBaseUrl = (module, apienv = appApienv) => {
  return base[module][apienv]
}
