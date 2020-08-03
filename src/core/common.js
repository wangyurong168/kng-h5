import { Browser } from '@/configs/const'

var isWeixin = Browser.weixin
var isDing = Browser.ding
var isFxiaoke = Browser.fxiaoke
// var isPcWeixin = Browser.pcweixin
var isLanxin = Browser.lanxin

export const showKng = function () {
  var isInlay = !!window.localStorage.getItem('isInlay')
  // if (isInlay || isApp || isWeixin || isDing || isFxiaoke || isLanxin) {
  if (isInlay || isWeixin || isDing || isFxiaoke || isLanxin) {
    return true
  }
}

export const flowWarning = function () {
  let vm = this
  if (Browser.weixin || Browser.wxwork) {
    window.wx && window.wx.getNetworkType({
      success: function (res) {
        // 兼容2g+ 3g+ 类型-返回网络类型2g，3g，4g，wifi
        if (res.networkType.indexOf('2g') > -1 || res.networkType.indexOf('3g') > -1 || res.networkType.indexOf('4g') > -1) {
          vm.$toast('建议在wifi环境下观看，土豪请随意')
        }
      }
    })
  } else if (Browser.ding) {
    // 钉钉pc端不出提示
    window.dd && window.dd.version && window.dd.device.connection.getNetworkType({
      onSuccess: function (data) {
        // 兼容2g+ 3g+ 类型
        if (data.result.indexOf('4g') > -1 || data.result.indexOf('3g') > -1 || data.result.indexOf('2g') > -1) {
          vm.warning('建议在wifi环境下观看，土豪请随意')
        }
      }
    })
  }
}
