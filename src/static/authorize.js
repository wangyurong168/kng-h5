/*
 * @description 微服务微信钉钉授权 未对接过直接进入， 对接过走授权，待完善。
 * @description 业务无需要先删除
 * @param isWxAuth 标识微信成功授权
 * @param isDDAuth 标识钉钉成功授权
 * */
import Vue from 'vue'
import { Browser } from '@/configs/const'
import { loadScript } from '@/core/utils'
import {
  wxConfig,
  ddConfig
} from '@/service/main.service'
import { findByCode, checkConfident, getShowRedirect } from '@/service/login.service'

export async function commonAuth (orgId, appId) {
  if (Browser.weixin) {
    weixinAuth()
  }
  if (Browser.dingtalk) {
    dingdingAuth(orgId, appId)
  }
}

// 微信授权
async function weixinAuth () {
  let EventUtil = {
    addHandler: function (element, type, handler) {
      if (element.addEventListener) {
        element.addEventListener(type, handler, false)
      } else if (element.attachEvent) {
        element.attachEvent('on' + type, handler)
      } else {
        element['on' + type] = handler
      }
    }
  }

  EventUtil.addHandler(window, 'offline', function (event) {
    // h5 断网提示
    Vue.$toast('网络异常，请检查网络')
  })
  // 微信授权，用于替换头像
  loadScript('https://res.wx.qq.com/open/js/jweixin-1.2.0.js').then(() => {
    let orgId = window.getLocalStorage('orgId') || ''
    wxConfig({
      agentId: window.getLocalStorage('agentId'),
      orgId: orgId.replace(/-/g, ''),
      url: window.location.href.split('#')[0]
    }).then(res => {
      window.wx.config({
        debug: false,
        appId: res.appId, // 必填，公众号的唯一标识
        timestamp: res.timestamp, // 必填，生成签名的时间戳
        nonceStr: res.noncestr, // 必填，生成签名的随机串
        signature: res.signature, // 必填，签名，见附录1
        jsApiList: [
          'scanQRCode',
          'chooseImage',
          'previewImage',
          'uploadImage',
          'downloadImage',
          'startRecord',
          'stopRecord',
          'onVoiceRecordEnd',
          'playVoice',
          'onVoicePlayEnd',
          'pauseVoice',
          'stopVoice',
          'uploadVoice',
          'downloadVoice',
          'onMenuShareTimeline',
          'onMenuShareAppMessage',
          'getNetworkType',
          'onMenuShareQQ',
          'onMenuShareQZone'
        ] // 必填，需要使用的JS接口列表
      })
      window.wx.ready(function () {
        window.isWxAuth = true
      })
      window.wx.error(function (result) {
        window.isWxAuth = false
        Vue.$toast('wx：' + window.JSON.stringify(result))
      })
    })
  })
}

// 钉钉授权
function dingdingAuth (appId, orgId) {
  loadScript('https://g.alicdn.com/dingding/dingtalk-jsapi/2.3.0/dingtalk.open.js')
    .then(() => {
      let data = {
        agentId: appId,
        orgId: orgId.replace(/-/g, ''),
        url: window.location.href.split('#')[0],
        type: 2 // 钉钉code
      }
      ddConfig(data).then(res => {
        window.dd.config({
          agentId: res.agentId,
          corpId: res.appId,
          timeStamp: res.timestamp,
          nonceStr: res.noncestr,
          signature: res.signature,
          jsApiList: [
            'runtime.info',
            'device.notification.prompt',
            'biz.chat.pickConversation',
            'device.notification.confirm',
            'device.notification.alert',
            'device.notification.prompt',
            'biz.chat.open',
            'biz.util.open',
            'biz.user.get',
            'biz.contact.choose',
            'biz.telephone.call',
            'biz.util.uploadImage',
            'biz.ding.post']
        })
        window.dd.ready(() => {
          window.dd.runtime.permission.requestAuthCode({
            corpId: res.appId,
            onSuccess: (result) => {
              let param = {
                'anonymousId': '',
                'appId': appId,
                'orgId': orgId,
                'code': result.code,
                'type': 0
              }
              auth(param)
            },
            onFail: error => {
              Vue.$toast('dd error: ' + JSON.stringify(error))
            }
          })
        })
        window.dd.error(err => {
          window.isDDAuth = false
          Vue.$toast('dd error: ' + JSON.stringify(err))
        })
      }).catch(err => {
        Vue.$toast(JSON.stringify(err))
      })
      // ddSetNavRight()
    })
    .catch(err => {
      console.log(err)
    })
}
function auth (param) {
  findByCode(param).then((result) => {
    Object.keys(result.userInfo).forEach(key => { window.setLocalStorage(key, result.userInfo[key]) })
    window.localStorage.setItem('token', result.userInfo.token)
    localStorage.wxtype = 0
    checkConfident().then((res) => {
      if (res) {
        window.location.replace(window.location.origin + '/#/nda')
      } else {
        let returnUrl = window.getLocalStorage('returnUrl')
        afterreDirect(returnUrl)
      }
    })
  }).catch((result) => {
    if (result) {
      if (result.key === 'apis.core.open.not.exist') {
        try {
          window.setLocalStorage('agentId', param.appId)
          window.setLocalStorage('openId', result.data[0])
          window.location.replace(window.location.origin + '/#/login?isBind=0') // 跳到登录
        } catch (err) {
          Vue.$toast('error: ' + JSON.stringify(err))
        }
      }
    }
  })
}

export function afterreDirect (returnurl) {
  getShowRedirect().then(res => {
    console.log(res)
    if (res.status === '1') {
      // 跳转到安全设置
      window.location.href = '/#/editpwd'
    } else if (returnurl) {
      window.location.replace(returnurl)
    } else {
      window.location.href = '/main/#/index'
    }
  }).catch(err => {
    this.handelTips(err)
  })
}

// 钉钉设置标题
export function setDingTitle (title) {
  try {
    window.dd.biz.navigation.setTitle({
      title, // 控制标题文本，空字符串表示显示默认文本
      onSuccess: function (result) {
      },
      onFail: function () {}
    })
  } catch (e) {}
}
