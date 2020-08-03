import { kngApi, sspApi, utilityApi } from '@/core/apis'
// import * as util from '@/core/utils'

export default {
  // 知识详情接口
  postKngDetail (bodyParams) {
    return kngApi.post('play/detail/study', bodyParams)
  },
  getUserPointData (userId) {
    return sspApi.get(`user/point/${userId}`)
  },
  putPointData (data) {
    return sspApi.put('user/point/move', data)
  },
  // 文档播放接口
  postPlayStudy (bodyParams) {
    return kngApi.post('play/study', bodyParams)
  },
  // 检查知识权限
  getCheckPlayPermissions (kngId) {
    return kngApi.get('knowledge/checkPlayPermission/' + kngId)
  },
  // 知识提交进度
  postKngSubmit (bodyParams) {
    return kngApi.post('study/submit', bodyParams)
  },
  // 知识提交秒级进度
  postKngSubmitSecond (bodyParams) {
    return kngApi.post('study/submit/second', bodyParams)
  },
  // 检查知识版本更新
  postKngVersionAlert (bodyParams) {
    return kngApi.post('kngVersion/alert', bodyParams)
  },
  putkngVersionAlert (bodyParams) {
    return kngApi.put('kngVersion/alert', bodyParams)
  },
  // 查看知识的类型和文件类型
  getTypeInfo (kngId) {
    return kngApi.get('knowledge/typeInfo/' + kngId)
  },
  // 切换当前学习知识
  postStudyChange (bodyParams) {
    return kngApi.post('study/change/studying', bodyParams)
  },
  // 获取指定对象的Id列表
  getTagIds (kngId) {
    return utilityApi.get(`tagtargets/${kngId}/orgtags`)
  },
  // 获取防作弊配置
  getKngConf () {
    return kngApi.get('kngConf/cheat')
  },
  // 保存打赏的知识
  postRewardScore (bodyParams) {
    return kngApi.post('knowledge/rewardPoint', bodyParams)
  },
  // 删除当前正在学的知识
  postDeleteStudy (bodyParams) {
    return kngApi.post('study/del/studying', bodyParams)
  }
}
