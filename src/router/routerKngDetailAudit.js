const routerKngDetailAudit = [
  {
    path: '/video/detail/audit',
    name: 'videodetailaudit',
    component: resolve => require(['@/views/kngDetailAudit/video'], resolve),
    meta: {
      title: '视频详情'
    }
  }, {
    path: '/audio/detail/audit',
    name: 'audiodetailaudit',
    component: resolve => require(['@/views/kngDetailAudit/audio'], resolve),
    meta: {
      title: '音频详情'
    }
  }, {
    path: '/doc/detail/audit',
    name: 'documentdetailaudit',
    component: resolve => require(['@/views/kngDetailAudit/doc'], resolve),
    meta: {
      title: '文档详情'
    }
  }, {
    path: '/scorm/detail/audit',
    name: 'scormdetailaudit',
    component: resolve => require(['@/views/kngDetailAudit/scorm'], resolve),
    meta: {
      title: 'scorm详情'
    }
  }, {
    path: '/html/detail/audit',
    name: 'ebookdetailaudit',
    component: resolve => require(['@/views/kngDetailAudit/html'], resolve),
    meta: {
      title: 'html详情'
    }
  }, {
    path: '/xuanyes/detail/audit',
    name: 'xuanyesdetailaudit',
    component: resolve => require(['@/views/kngDetailAudit/xuanyes'], resolve),
    meta: {
      title: 'xuanyesdetail'
    }
  }, {
    path: '/scorm/html/play/audit',
    name: 'ScormHtmlPlayAudit',
    component: resolve => require(['@/views/kngDetailAudit/components/playScormHtml'], resolve),
    meta: {
      title: 'ScormHtmlPlay'
    }
  }, {
    path: '/course/detail/audit',
    name: 'coursedetailaudit',
    component: resolve => require(['@/views/kngDetailAudit/course'], resolve),
    meta: {
      title: '课程详情'
    }
  }
]

export default routerKngDetailAudit
