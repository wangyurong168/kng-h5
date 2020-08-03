import axios from 'axios'
import { domainBaseUrl } from '@/configs/domain'
import { Source } from '@/configs/const'
import AppProtocol from '@/static/appprotocol'

class ApiConfig {
  constructor () {
    this.baseURL = ''
    this.headers = {
      'source': Source,
      'Content-Type': 'application/json;charset=UTF-8'
    }
    this.validateStatus = status => {
      return status >= 200 && status < 300
    }
    // this.params = Math.random()
  }
  setBaseUrl (module) {
    this.baseURL = domainBaseUrl(module)
  }
  static checkLogin (data) {
    if (data) {
      if (
        data.error.key === 'global.token.invalid' ||
        data.error.key === 'global.token.empty' ||
        data.error.key === 'global.user.kicked.out' ||
        data.error.key === 'global.user.kicked.app.out'
      ) {
        try {
          window.clearlocalStorageForKey()
        } catch (e) {
          window.clearCookieForKey()
        }
        if (window.isApp) {
          AppProtocol.tokenExpired()
        } else {
          if (window.isCustomThirdScan) {
            window.location.hash = '/customerr'
            return
          }
          // 如果存在returnurl，则不赋值
          if (!window.getLocalStorage('returnUrl')) {
            window.setLocalStorage('returnUrl', window.location.href)
          }
          window.setTimeout(function () {
            window.location.replace(
              window.getAuthUrlByOrgId('og', 'orgid').href
            )
          }, 1000)
        }
      }
    }
  }
}

class Qida extends ApiConfig {
  constructor () {
    super()
    this.setBaseUrl('qida')
  }
}

class Msg extends ApiConfig {
  constructor () {
    super()
    this.setBaseUrl('msg')
  }
}

class Kng extends ApiConfig {
  constructor () {
    super()
    this.setBaseUrl('kng')
  }
}

class Utility extends ApiConfig {
  constructor () {
    super()
    this.setBaseUrl('utility')
  }
}

class File extends ApiConfig {
  constructor () {
    super()
    this.setBaseUrl('file')
  }
}

class SSP extends ApiConfig {
  constructor () {
    super()
    this.setBaseUrl('ssp')
  }
}

class Decorate extends ApiConfig {
  constructor () {
    super()
    this.setBaseUrl('decorate')
  }
}

class Cc extends ApiConfig {
  constructor () {
    super()
    this.setBaseUrl('cc')
  }
}

const qidaApi = axios.create(new Qida())
const kngApi = axios.create(new Kng())
const utilityApi = axios.create(new Utility())
const fileApi = axios.create(new File())
const sspApi = axios.create(new SSP())
const decorateApi = axios.create(new Decorate())
const ccApi = axios.create(new Cc())
const msgApi = axios.create(new Msg())

const request = {
  resolve: config => {
    config.headers.token = localStorage.getItem('token')
    return config
  },
  reject: error => {
    // eslint-disable-next-line
    return Promise.reject('req', error)
  }
}
const response = {
  resolve: res => {
    if (res.status === 201) {
      res.data = res.data || {}
      res.data.Location = res.headers.location
    }
    return res.data
  },
  reject: error => {
    const data = error.response && error.response.data ? error.response.data : {}
    if (error && error.response && error.response.status === 401) {
      ApiConfig.checkLogin(error.response.data) // 检查token
    }
    console.log(error)
    // eslint-disable-next-line
    return Promise.reject(data)
  }
}

// 请求拦截
qidaApi.interceptors.request.use(request.resolve, request.reject)
kngApi.interceptors.request.use(request.resolve, request.reject)
utilityApi.interceptors.request.use(request.resolve, request.reject)
fileApi.interceptors.request.use(request.resolve, request.reject)
sspApi.interceptors.request.use(request.resolve, request.reject)
decorateApi.interceptors.request.use(request.resolve, request.reject)
ccApi.interceptors.request.use(request.resolve, request.reject)
msgApi.interceptors.request.use(request.resolve, request.reject)
// 响应拦截
qidaApi.interceptors.response.use(response.resolve, response.reject)
kngApi.interceptors.response.use(response.resolve, response.reject)
utilityApi.interceptors.response.use(response.resolve, response.reject)
fileApi.interceptors.response.use(response.resolve, response.reject)
sspApi.interceptors.response.use(response.resolve, response.reject)
decorateApi.interceptors.response.use(response.resolve, response.reject)
ccApi.interceptors.response.use(response.resolve, response.reject)
msgApi.interceptors.response.use(response.resolve, response.reject)

const qidaApiConfig = qidaApi.defaults
const msgApiConfig = msgApi.defaults
const kngApiConfig = kngApi.defaults
const utilityApiConfig = utilityApi.defaults
const fileApiConfig = fileApi.defaults
const sspApiConfig = sspApi.defaults
const decorateApiConfig = decorateApi.defaults
const ccApiConfig = ccApi.defaults

const setToken = token => {
  qidaApiConfig.headers.token = token
  kngApiConfig.headers.token = token
  msgApiConfig.headers.token = token
  utilityApiConfig.headers.token = token
  fileApiConfig.headers.token = token
  sspApiConfig.headers.token = token
  decorateApiConfig.headers.token = token
  ccApiConfig.headers.token = token
  if (window.isApp) {
    // app 中发起请求是添加请求参数
    qidaApiConfig.headers['App-Version'] = window.version
    kngApiConfig.headers['App-Version'] = window.version
    msgApiConfig.headers['App-Version'] = window.version
    utilityApiConfig.headers['App-Version'] = window.version
    fileApiConfig.headers['App-Version'] = window.version
    sspApiConfig.headers['App-Version'] = window.version
    decorateApiConfig.headers['App-Version'] = window.version
    ccApiConfig.headers['App-Version'] = window.version
    // 如果在壳里请求头里加上clientKey和deviceId
    let ck = window.getLocalStorage('clientKey')
    let did = window.getLocalStorage('deviceId')
    if (ck && did) {
      qidaApiConfig.headers.clientkey = ck
      qidaApiConfig.headers.deviceid = did
      msgApiConfig.headers.clientkey = ck
      msgApiConfig.headers.deviceid = did
      kngApiConfig.headers.clientkey = ck
      kngApiConfig.headers.deviceid = did
      utilityApiConfig.headers.clientkey = ck
      utilityApiConfig.headers.deviceid = did
      fileApiConfig.headers.clientkey = ck
      fileApiConfig.headers.deviceid = did
      sspApiConfig.headers.clientkey = ck
      sspApiConfig.headers.deviceid = did
      decorateApiConfig.headers.clientkey = ck
      decorateApiConfig.headers.deviceid = did
      ccApiConfig.headers.clientkey = ck
      ccApiConfig.headers.deviceid = did
    }
  }
}
export { qidaApi, msgApi, kngApi, utilityApi, fileApi, sspApi, ccApi, qidaApiConfig, kngApiConfig, utilityApiConfig, fileApiConfig, sspApiConfig, ccApiConfig, decorateApi, setToken }
