import Vue from 'vue'
import Router from 'vue-router'
import { setToken } from '@/core/apis'
import AppProtocol from '@/static/appprotocol'
import routerKnowledge from './routerKnowledge'
import routerKngDetail from './routerKngDetail'
import routerKngDetailAudit from './routerKngDetailAudit'
import { Browser } from '@/configs/const'
import { URL, dealedSensors, isNotEmpty } from '@/core/utils'
import { setDingTitle } from '@/static/authorize'

Vue.use(Router)

class BaseRouter extends Router {
  // 覆盖push方法
  push (location) {
    if (window.getLocalStorage('orgId')) {
      location = this.addQuery(location, {
        og: window.getLocalStorage('orgId')
      })
    }
    super.push(location)
  }

  // 覆盖replace方法
  replace (location) {
    if (window.getLocalStorage('orgId')) {
      location = this.addQuery(location, {
        og: window.getLocalStorage('orgId')
      })
    }
    super.replace(location)
  }

  // 添加query参数
  addQuery (location, query) {
    if (typeof location === 'string') {
      location = URL.addQuery(location, query)
    }
    if (typeof location === 'object' && location !== null) {
      location.query = Object.assign({}, location.query, query)
    }
    return location
  }
}

const routers = [
  {
    path: '/',
    redirect: '/catalogs'
  }
]

const router = new BaseRouter({
  scrollBehavior: () => ({ y: 0 }), // 转到新页面时，定位到最顶端
  routes: [...routers, ...routerKnowledge, ...routerKngDetail, ...routerKngDetailAudit]
})

const hasPermission = (code, to) => {
  if (!code) {
    return true
  }
  if (!(to.meta && to.meta.permission)) {
    return true
  }
  let pageCode = to.meta.permission // 用户权限code, [String][Array]
  if (typeof pageCode === 'string') {
    return code.some(item => pageCode.toLowerCase() === item.toLowerCase)
  } else if (typeof pageCode === 'object') {
    return pageCode.some(item => {
      return code.some(v => item.toLowerCase() === v.toLowerCase)
    })
  } else {
    return false
  }
}

router.beforeEach((to, from, next) => {
  // 匿名页
  // keep-alive记录滚动位置
  // 身份验证
  let token = window.getLocalStorage('token')
  router.preRoute = from // 上一个页面的route
  router.functionsRoutes = 0 // 需要显示和首页相同的标题
  const arrPath = ['/login'] // 进入不需要身份的页面
  if (arrPath.indexOf(to.path) > -1 || arrPath.indexOf(to.name) > -1) {
    next()
    return
  }
  let permissionCodes = window.getLocalStorage('personalPermissionCodes') // 当前人有权限的code集合
  if (permissionCodes && permissionCodes.length > 0) {
    permissionCodes = JSON.parse(permissionCodes)
  }
  if (navigator.onLine) {
    setToken(token || '')
    if (token) {
      // 判断页面是否有权限
      if (!hasPermission(permissionCodes, to)) {
        router.replace('/pageerror?t=401')
      } else {
        next()
      }
    } else {
      /**
       * token不存在前一个页面是需要身份页面，记录当前页面地址
       * 当客户登录完成后，会跳转到指定地址
       */
      const url = window.location.href.split('#')[1]
      const route = router.match(url)
      if (
        !(arrPath.indexOf(route.path) > -1 || arrPath.indexOf(route.name) > -1)
      ) {
        window.setLocalStorage('returnUrl', window.location.href)
      }
      window.location.href = window.getAuthUrlByOrgId('og', 'orgid').href
    }
  } else {
    next(false)
  }
})

router.afterEach((route, from) => {
  // 设置title
  const title = (window.locales && window.locales[route.meta.title]) || route.meta.title
  if (window.yxtCore.isApp) {
    if (!route.meta.noSetNavigation) {
      window.yxt.custom({
        name: 'ui.navigation.set',
        param: {
          // 参数
          isShowtitle: true,
          name: title,
          navTitle: title
        }
      })
    }
  } else if (Browser.dingtalk) {
    setDingTitle(title)
  } else {
    document.title = title
  }
  // 神策记录访问日志
  Vue.nextTick(() => {
    dealedSensors.quick('autoTrack', {
      terminal_type: Browser.android ? 'Android' : 'IOS',
      page_id: route.meta.page_id,
      user_position: window.getLocalStorage('positionList'),
      user_detp: window.getLocalStorage('parttimeDeptList'),
      user_role: ''
    })
  })
})

router.goBack = () => {
  window.isApp ? AppProtocol.goBack() : window.history.go(-1)
}

/**
 * 只执行第一次的触发函数, 间隔一段时间后再触发才再次执行
 * @param  {Function} fn   要执行的函数
 * @param  {int}   time 时间 毫秒
 * @return {Function}
 */
function setRunByTime (fn, time) {
  let timer = null
  return function () {
    let context = this
    let args = arguments
    // window.clearTimeout(timer)
    if (!timer) {
      timer = window.setTimeout(function () {
        timer = null
      }, time)
      window.setTimeout(function () {
        fn.apply(context, args)
      })
    }
  }
}

// router跳转详情
router.skipKngDetail = setRunByTime(function () {
  let _router = this
  let args = arguments
  skipKngDetail.apply(_router, args)
}, 2000)

/**
 * 通过项目跳转知识对应学习页面
 * 创建人 chxu
 * 创建时间 2020.02.04
 * @param isReplace - {int} 是否需要replace页面,0-当前页打开，1-replace,2-打开新页面
 * @param fileType - {string} 文件类型
 * @param courseId - {string} 课程包的id
 * @param kngId - {string} 知识id
 * @param targetId - {string} 对应跳转来的业务id
 * @param targetCode - {string} 对应的业务名称，暂时kng和o2o
 * @param type - {int} 表示是自主学习还是项目 0-自主 1-项目（空或0都是自主）
 * @param status - {int} 当前知识的状态
 * @param taskType - {int} 项目跳转过来区分学员还是管理员
 * @param isProject - {int} 是否是项目跳转
 */
function skipKngDetail (isReplace, fileType, courseId, kngId, targetId, targetCode, type, status, taskType, isProject) {
  // 知识类型 0.课程、1.文档、2.视频、3.音频、4.微课、5.SCORM、6.HTML、7.压缩包
  // 文件类型：course(课程)、video(视频)、img(图片)、xuanyes(微课)、zip(压缩包)、audio(音频)、excel、html、pdf、ppt、scorm、word
  const code = targetCode || 'kng'
  let route = {
    query: {
      id: kngId,
      courseId,
      targetId,
      targetCode: code,
      type
    }
  }

  if (isNotEmpty(status) && status !== 4) {
    route.query.status = status
  }

  if (isNotEmpty(taskType)) {
    route.query.taskType = taskType
  }

  switch (fileType) {
    case 'course':
      route.name = 'coursedetail'
      break
    case 'scorm':
      route.name = 'scormdetail'
      break
    case 'html':
      route.name = 'ebookdetail'
      break
    case 'video':
      route.name = 'videodetail'
      break
    case 'audio':
      route.name = 'audiodetail'
      break
    case 'img':
    case 'excel':
    case 'pdf':
    case 'ppt':
    case 'word':
      route.name = 'documentdetail'
      break
    case 'xuanyes':
      route.name = 'xuanyesdetail'
      break
  }
  if (window.isApp) {
    window.yxt.custom({
      name: 'action.kng.detail', // 自定义协议名
      param: { id: kngId, courseId: courseId, targetCode: targetCode, targetId: targetId, taskType, preview: status === 2 ? 1 : 0 }, // 传参
      onSuccess: () => {}, // 成功回调
      onFail: () => {} // 失败回调
    })
    if (isProject === 1) {
      window.history.back(-1)
    }
  } else {
    if (isReplace === 0) {
      this.push(route)
    } else if (isReplace === 1) {
      this.replace(route)
    } else if (isReplace === 2) {
      const { href } = this.resolve({
        name: route.name,
        query: route.query
      })
      window.open(href, '_blank')
    }
  }
}

export default router
