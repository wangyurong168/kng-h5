const routerKngDetail = [
  {
    path: '/video/detail',
    name: 'videodetail',
    component: resolve => require(['@/views/kngDetail/video'], resolve),
    meta: {
      title: 'kng_project_tit_video'
    }
  }, {
    path: '/audio/detail',
    name: 'audiodetail',
    component: resolve => require(['@/views/kngDetail/audio'], resolve),
    meta: {
      title: 'kng_project_tit_audio'
    }
  }, {
    path: '/doc/detail',
    name: 'documentdetail',
    component: resolve => require(['@/views/kngDetail/doc'], resolve),
    meta: {
      title: 'kng_project_tit_doc'
    }
  }, {
    path: '/scorm/detail',
    name: 'scormdetail',
    // component: resolve => require(['@/views/kngDetail/scormhtml/scorm'], resolve),
    component: resolve => require(['@/views/kngDetailCopy/scorm'], resolve),
    meta: {
      title: 'kng_project_tit_scorm'
    }
  }, {
    path: '/html/detail',
    name: 'ebookdetail',
    // component: resolve => require(['@/views/kngDetail/scormhtml/html'], resolve),
    component: resolve => require(['@/views/kngDetailCopy/html'], resolve),
    meta: {
      title: 'kng_project_tit_html'
    }
  }, {
    path: '/xuanyes/detail',
    name: 'xuanyesdetail',
    component: resolve => require(['@/views/kngDetail/xuanyes'], resolve),
    meta: {
      title: 'kng_project_tit_xuanyes'
    }
  }, {
    path: '/course/detail',
    name: 'coursedetail',
    component: resolve => require(['@/views/kngDetailCopy/course'], resolve),
    meta: {
      title: 'kng_project_tit_course'
    }
  }, {
    path: '/scorm/html/play',
    name: 'ScormHtmlPlay',
    component: resolve => require(['@/views/kngDetailCopy/components/playScormHtml'], resolve),
    meta: {
      title: 'kng_project_tit_play'
    }
  }, {
    path: '/knowledges/score',
    name: 'score',
    component: resolve => require(['@/components/kngDetailComponents/score.vue'], resolve),
    meta: {
      title: '评论'
    }
  }, {
    path: '/reward',
    name: 'reward',
    component: resolve => require(['@/views/app/praise'], resolve),
    meta: {
      title: 'kng_project_tit_reward'
    }
  }, {
    path: '/scan',
    name: 'kngscan',
    component: resolve => require(['@/views/kngDetail/kngscan'], resolve),
    meta: {
      noSetNavigation: true,
      title: 'kng_project_tit_scan'
    }
  }
]

export default routerKngDetail
