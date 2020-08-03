import { msgApi } from '@/core/apis'

// 微信授权
export const wxConfig = data => {
  return msgApi.post('wechat/js/config', data)
}

// 钉钉授权
export const ddConfig = (type, data) => {
  return msgApi.post(`ding/js/config`, data)
}
