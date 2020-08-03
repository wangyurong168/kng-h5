import { kngApi, utilityApi, fileApi, fileApiConfig, ccApi, qidaApi } from '@/core/apis'
import * as util from '@/core/utils'

export default {
  // 待审核知识列表
  postAuditList (bodyParams, linkParams) {
    return kngApi.post(util.linkSubString('knowledge/audit', linkParams), bodyParams)
  },
  // 要我审核的知识审核通过
  putAuditMyPass (bodyParams) {
    return kngApi.put('knowledge/audit/mypass', bodyParams)
  },
  // 要我审核的知识退回重传
  putMyBackList (bodyParams) {
    return kngApi.put('/knowledge/audit/myback', bodyParams)
  },
  // 要我审核的知识是否可编辑
  getMyEnabledEdit (kngId) {
    return kngApi.get(util.linkSubString('knowledge/audit/myEnabledEdit/' + kngId))
  },
  // 获取审核历史列表
  postAuditHistory (bodyParams, linkParams) {
    return kngApi.post(util.linkSubString('knowledge/audit/history', linkParams), bodyParams)
  },
  // 自主学习列表
  postKngSelfStudy (bodyParams, linkParams) {
    return kngApi.post(util.linkSubString('kngSelfStudy/list', linkParams), bodyParams)
  },
  // 根据主键删除自主学习
  deleteKngSelfStudy (id) {
    return kngApi.delete('kngSelfStudy/delete/' + id)
  },
  // 删除笔记
  postDeleteNote (bodyParams) {
    return kngApi.post('note/deleted', bodyParams)
  },
  // 创建笔记
  postCreateNote (bodyParams) {
    return kngApi.post('note/create', bodyParams)
  },

  // 修改笔记
  postUpdateNote (bodyParams) {
    return kngApi.post('note/edit', bodyParams)
  },
  // 查看笔记
  getNote (id) {
    return kngApi.get('note/view?id=' + id)
  },
  // 获取当前用户是否点过赞
  getOwnThumbs (id) {
    return utilityApi.get('praisetargets/' + id + '/praised')
  },
  // 添加点赞
  postAddThumbs (bodyParams) {
    return utilityApi.post('praises?usebody=true', bodyParams)
  },
  // 是否收藏
  getFavorited (id) {
    return utilityApi.get('favoritetargets/' + id + '/favorited')
  },
  // 点击收藏
  postAddFavorite (bodyParams) {
    return utilityApi.post('favorites?usebody=true', bodyParams)
  },
  // 取消收藏
  deleteFavorite (id) {
    return utilityApi.delete('favoritetargets/' + id)
  },
  // 获取我的笔记列表
  postGetMyNoteList (bodyParams, linkParams) {
    return kngApi.post(util.linkSubString('note/my/list', linkParams), bodyParams)
  },
  // 获取他人的笔记列表
  postGetOtherNoteList (bodyParams, linkParams) {
    return kngApi.post(util.linkSubString('note/other/list', linkParams), bodyParams)
  },
  postGetCatalogTree (bodyParams) {
    return kngApi.post('kngCatalog/treeCache', bodyParams)
  },
  // 知识笔记列表
  postGetKngNoteList (bodyParams, linkParams) {
    return kngApi.post(util.linkSubString('note/kng/list', linkParams), bodyParams)
  },
  // 加入自主学习
  joinStudy (kngId) {
    return kngApi.put('kngSelfStudy/addStudy/' + kngId)
  },
  // 上传小文件
  postUploadMiniFile (linkParams, bodyParams) {
    fileApiConfig.headers.appCode = 'kng'
    return fileApi.post(util.linkSubString('upload/kng/knowledge/image', linkParams), bodyParams)
  },
  // 获取知识评论列表
  getKngCommentList (linkParams, kngid) {
    return kngApi.get(util.linkSubString(('comment/' + kngid), linkParams))
  },
  // 获取知识评论回复列表
  getKngCommentReply (linkParams, kngId, commentId) {
    return kngApi.get(util.linkSubString((`comment/reply/${kngId}/${commentId}`), linkParams))
  },
  // 回复评论
  postCommentReply (bodyParams) {
    return kngApi.post('comment/reply?usebody=true', bodyParams)
  },
  // 添加评论接口
  postAddComment (bodyParams) {
    return kngApi.post('comment', bodyParams)
  },
  // 删除评论
  deleteMyComment (id) {
    return kngApi.delete('comment/' + id)
  },
  // 获取我的评论列表
  postGetMyCommentList (linkParams, bodyParams) {
    return kngApi.post(util.linkSubString('comment/my', linkParams), bodyParams)
  },
  // 企业知识列表
  postGetKngListWeb (linkParams, bodyParams) {
    return kngApi.post(util.linkSubString('knowledge/pagelist', linkParams), bodyParams)
  },
  // 获取找知识目录树
  postGetKngTreeCache (bodyParams) {
    return kngApi.post('kngCatalog/treeCache', bodyParams)
  },
  // 获取子目录列表
  postGetChildCatalogList (bodyParams) {
    return kngApi.post('kngCatalog/catalogs', bodyParams)
  },
  // 课程章节目录
  getChapterTree (linkParams) {
    return kngApi.get(util.linkSubString('kngPackageMap/chapterTree/study', linkParams))
  },
  // 课程章节目录-带课程进度
  getChapterTreeStudy (linkParams) {
    return kngApi.get(util.linkSubString('kngPackageMap/chapter/tree/study', linkParams))
  },
  // 相关课程
  postRelatedCourses (bodyParams) {
    return kngApi.post('knowledge/guess', bodyParams)
  },
  // 获取目录详情
  postGetCatalogInfo (bodyParams) {
    return kngApi.post('kngCatalog/info', bodyParams)
  },
  // 获取知识类型
  getKnowledgeType (id) {
    return kngApi.get('knowledge/typeInfo/' + id)
  },
  // 获取当前用户对该知识的评价结果
  getCommentRate (kngId) {
    return kngApi.get(`comment/rating/${kngId}`)
  },
  // 获取手机端知识目录页配置
  getkngConfCatalog () {
    return kngApi.get('kngConf/catalog')
  },
  // 批量查询当前用户是否点赞知识
  postIsPraises (bodyParams) {
    return utilityApi.post('praises/findpraisedtargets', bodyParams)
  },
  // 是否允许上传知识(0-不允许 1-允许) 合规管理权限
  getIsAllowKngUpload (linkParams) {
    return ccApi.get(util.linkSubString('silenceconfigs', linkParams))
  },
  // 获取水印配置
  getWatermarkConfig () {
    return fileApi.get('watermark/config')
  },
  // 前台获取目录信息
  postSearchConfigure (bodyParams) {
    return kngApi.post('knowledge/searchConfigure', bodyParams)
  },
  // 根据知识id获取当前用户的审核意见
  getAuditRemark (kngId) {
    return kngApi.get(`knowledge/auditRemark/${kngId}`)
  },
  // 是否展示去充值
  getPayAuth (orgId) {
    return qidaApi.get(`/orgparsetting/code?code=OpenPointRecharge&orgId=${orgId}`)
  },
  // 检查是否已兑换该课程
  getCheckExchanged (courseId) {
    return kngApi.get(`/exchange/checkExchanged/${courseId}`)
  },
  // 积分兑换商品信息
  getExchangeInfo (courseId) {
    return kngApi.get(`/exchange/info/${courseId}`)
  },
  // 课程积分兑换
  postExchangePay (courseId) {
    return kngApi.post(`/exchange/pay/${courseId}`)
  }
}
