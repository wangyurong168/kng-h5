const routerKnowledge = [
  {
    path: '/catalogs',
    name: 'catalogs',
    component: resolve => require(['@/views/catalogs'], resolve),
    meta: {
      title: '目录',
      keepAlive: true
    }
  },
  {
    path: '/selfstudy',
    name: 'selfstudy',
    component: resolve => require(['@/views/selfstudy'], resolve),
    meta: {
      title: '自学知识'
    }
  },
  {
    path: '/audit',
    name: 'audit',
    component: resolve => require(['@/views/audit'], resolve),
    meta: {
      title: '知识审核'
    }
  },
  {
    path: '/notelist',
    name: 'note',
    component: resolve => require(['@/views/note'], resolve),
    meta: {
      title: '学习笔记'
    }
  },
  {
    path: '/notedetail',
    name: 'viewNoteDetail',
    component: resolve => require(['@/views/note/detail'], resolve),
    meta: {
      title: '查看笔记'
    }
  },
  {
    path: '/notecreateedit',
    name: 'notecreateedit',
    component: resolve => require(['@/views/note/createEdit'], resolve),
    meta: {
      title: '创建笔记'
    }
  },
  {
    path: '/mycomments',
    name: 'myComments',
    component: resolve => require(['@/views/comments'], resolve),
    meta: {
      title: '我的评论'
    }
  },
  {
    path: '/index',
    name: 'Index',
    component: resolve => require(['@/views/list'], resolve),
    meta: {
      title: '企业知识'
    }
  },
  {
    path: '/orderDetail',
    name: 'OrderDetail',
    component: resolve => require(['@/views/orderDetail'], resolve),
    meta: {
      title: '订单详情'
    }
  },
  {
    path: '/orderDetailResult',
    name: 'OrderDetailResult',
    component: resolve => require(['@/views/orderDetail/components/result'], resolve),
    meta: {
      title: '订单详情'
    }
  }
]

export default routerKnowledge
