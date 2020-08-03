const u = navigator.userAgent.toLowerCase()
const p = navigator.platform.toLowerCase()
const d = /firefox/.test(u) // isFirefox
const r = /opera|opr\/[\d]+/.test(u) // isOpera
const k = !r && /(msie|trident)/.test(u) // isIE
const e = /edge\/(\d+)/.test(u) // isEdge
const b = !r && !e && /chrome/.test(u) && /webkit/.test(u) // isChrome
const o = !r && !e && !b && /safari/.test(u) // isSafari

export const Browser = {
  // 移动终端浏览器版本信息
  win: p ? /win/.test(p) : /win/.test(u),
  mac: p ? /mac/.test(p) : /mac/.test(u),
  trident: u.indexOf('trident') > -1, // IE内核
  opera: r, // opera
  webKit: u.indexOf('applewebkit') > -1, // 苹果、谷歌内核
  firefox: d, // 火狐
  ie: k,
  ieVersion: '',
  safari: o,
  edge: e,
  chrome: b,
  mobile: !!u.match(/applewebkit.*mobile.*/), // 是否为移动终端
  ios: !!u.match(/\(i[^;]+;?( u;)? cpu.+mac os x/), // ios终端
  android: u.indexOf('android') > -1 || u.indexOf('linux') > -1, // android终端或者uc浏览器
  iPhone: u.indexOf('iphone') > -1 || u.indexOf('mac') > -1, // 是否为iPhone
  iPad: u.indexOf('ipad') > -1, // 是否iPad
  webApp: u.indexOf('safari') === -1, // 是否web应该程序，没有头部与底部
  weixin: !!u.match(/micromessenger/i),
  wxwork: !!u.match(/wxwork/i),
  pcweixin: u.toLowerCase().match(/MicroMessenger/i) === 'micromessenger' && !u.match(/AppleWebKit.*Mobile.*/), // 微信端并且不是移动端
  winwechat: u.indexOf('windowswechat') > -1, // windows 微信客户端
  dingtalk: u.indexOf('dingtalk') > -1, // 钉钉
  ding: u.indexOf('DingTalk') > -1 || u.toLowerCase().indexOf('dingtalk') > -1,
  qqbrowser:
    !u.match(/micromessenger/i) &&
    u.indexOf('mqqbrowser') > -1 &&
    u.indexOf('yxtapp') < 0, // 手机qq浏览器
  ios9: u.match(/os [9]_\d[_\d]* like mac os x/i),
  isUcBrowser: u.toLowerCase().indexOf('ucbrowser') > -1 || u.toLowerCase().indexOf('ucweb') > -1 || u.toLowerCase().indexOf('ubrowser') > -1, // uc
  qq: u.indexOf('qq/') > -1, // qq壳
  fxiaoke: u.indexOf('fsbrowser') > -1,
  lanxin: u.toLowerCase().indexOf('lanxin') > -1, // 蓝信
  language: window.localStorage.getItem('locale') || navigator.browserLanguage || navigator.language
}

const SouceKey = {
  iosApp: 502,
  androidApp: 503,
  weixin: 504,
  wxwork: 505,
  default: 506,
  dingtalk: 507
}
const getSourceVal = () => {
  if (Browser.weixin) {
    return SouceKey.weixin
  }
  if (window.yxtCore.isApp) {
    return Browser.android ? SouceKey.androidApp : SouceKey.iosApp
  }
  if (Browser.dingtalk) {
    return SouceKey.dingtalk
  }
  if (Browser.wxwork) {
    return SouceKey.wxwork
  }
  return SouceKey.default
}

export const Source = getSourceVal()
