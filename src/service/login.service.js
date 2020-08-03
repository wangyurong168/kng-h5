import { qidaApi } from '@/core/apis'

export const findByCode = (data) => {
  return qidaApi.post('auth/ding', data)
}

export const checkConfident = () => {
  return qidaApi.get('secretprotocol/isshow')
}

// 修改密码--获取步骤条展示项
export const getShowRedirect = () => {
  return qidaApi.get('/userinfo/redirect')
}
