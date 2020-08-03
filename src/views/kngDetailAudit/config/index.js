import { kngTypeEnum } from '@/core/kngType'

// 处理知识播放接口数据
export const kngTypeMaper = {
  [kngTypeEnum.DOC]: {
    handler: 'handlerDoc'
  },
  [kngTypeEnum.VIDEO]: {
    handler: 'handlerVideo'
  },
  [kngTypeEnum.AUDIO]: {
    handler: 'handlerAudio'
  },
  [kngTypeEnum.WEIKE]: {
    showIframe: true,
    playLoading: false,
    handler: 'handlerXuanyes'
  },
  [kngTypeEnum.SCORM]: {
    showIframe: true,
    playLoading: false,
    handler: 'handlerScorm'
  },
  [kngTypeEnum.HTML]: {
    showIframe: true,
    playLoading: false,
    handler: 'handlerHtml'
  }
}

// 0待审核 1同意 2打回
export const auditStatusEnum = {
  WAIT: 0,
  AGREE: 1,
  REJECT: 2
}

// 弹框内容 驳回和通过 隐射
export const btnHandlerMapper = {
  [auditStatusEnum.REJECT]: {
    title: '退回理由',
    placeholder: '请输入退回理由',
    defaultInput: '',
    api: 'putMyBackList',
    confirmHandler: 'clickConfirm'
  },
  [auditStatusEnum.AGREE]: {
    title: '审核通过',
    placeholder: '请输入审核意见',
    defaultInput: '知识不错，建议审核通过',
    api: 'putAuditMyPass',
    confirmHandler: 'clickAuditPass'
  }
}
