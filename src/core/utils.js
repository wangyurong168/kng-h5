import sensors from 'sa-sdk-javascript'
import { domainBaseUrl } from '@/configs/domain'
import _isEmpty from 'lodash/isEmpty'
import _trim from 'lodash/trim'

// 神策初始化
sensors.init({
  server_url: domainBaseUrl('sensors'),
  heatmap: {
    // 是否开启点击图，默认为 default 表示开启，自动采集 $WebClick 事件，可以设置 'not_collect' 表示关闭
    // 需要 JSSDK 版本号大于 1.7
    clickmap: 'default',
    // 是否开启触达注意力图，默认为 default 表示开启，自动采集 $WebStay 事件，可以设置 'not_collect' 表示关闭
    // 需要 JSSDK 版本号大于 1.9.1
    scroll_notice_map: 'not_collect',
    // 不走冒泡的模式，防止click.stop时记录不到点击事件
    useCapture: true
    // // 表示是否开启自动采集 web 浏览事件 $pageview 的功能
    // is_track_single_page: function (last_url) {
    //   return true
    // }
  },
  show_log: false
})
const userId = window.localStorage.userId
if (userId) {
  // 标识真实用户
  sensors.login(userId, function () {
  })
}
export const dealedSensors = sensors

export const isNullOrEmpty = s => {
  return s === null || s === ''
}
/**
 * 是否是空 包括 [] | {} | null | undefined | ''
 * @param param
 * @param trimChars 从string字符串中移除前面和后面的 空格 或 指定的字符
 */
export const isEmpty = (param, trimChars = ' ') => {
  let s = param
  if (typeof param === 'string') {
    s = _trim(param, trimChars)
  }

  return _isEmpty(s)
}

export const isNotEmpty = s => {
  return s !== '' && s !== undefined && s !== null
}

export const loadScript = src => {
  return new window.Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.defer = true
    script.src = src
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
}

export const hint = function () {
  let template =
    "<div class='msg-box'><div class='msg-box-container'></div></div>"
  function hide (box) {
    box.animate(
      {
        top: 0,
        opacity: 0
      },
      300,
      function () {
        box.remove()
      }
    )
  }
  return function (msg, time) {
    var box = window.$(template)
    box.find('.msg-box-container').append(this.$t(msg))
    box.css('left', function () {
      return (window.$(window).width() - 200) * 0.5
    })
    window.$('body').append(box)
    box.animate(
      {
        top: '60px',
        opacity: 1
      },
      300
    )

    setTimeout(function () {
      hide(box)
    }, time * 1000 || 3000)
  }
}

// 格式化时间所用的数字
export const formatNumber = function (n) {
  return n >= 10 ? n : '0' + n
}
export const htmlEncode = function (str) {
  if (str === undefined || str === null || str.length === 0) return ''
  return str
    .replace(/&/g, `&amp;`)
    .replace(/</g, `&lt;`)
    .replace(/>/g, `&gt;`)
    .replace(/ /g, `&nbsp;`)
    .replace(/'/g, `&#39;`)
    .replace(/"/g, `&quot;`)
    .replace(/·/g, `&#183;`)
    .replace(/\\/g, `\\\\`)
    .replace(/%/g, `%25`)
}
export const htmlDecode = function (str) {
  if (str === undefined || str === null || str.length === 0) return ''
  return str
    .replace(/&amp;/g, `&`)
    .replace(/&lt;/g, `<`)
    .replace(/&gt;/g, `>`)
    .replace(/&nbsp;/g, ` `)
    .replace(/&#39;/g, `'`)
    .replace(/&quot;/g, `"`)
    .replace(/&#183;/g, `·`)
    .replace(/\\\\/g, `\\`)
    .replace(/%25/g, `%`)
}

export const Reg = {
  mobile: /^\d{11}$/,
  email: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
}

export const getQueryString = name => {
  try {
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    let r = window.location.search.substr(1).match(reg)
    if (r != null) {
      return decodeURIComponent(r[2])
    }
    r = window.location.hash
      .substr(window.location.hash.indexOf('?') + 1)
      .match(reg)
    if (r != null) {
      return decodeURIComponent(r[2])
    }
    return null
  } catch (e) {
    return null
  }
}

// 拼接URL参数
export const linkSubString = (url, data) => {
  if (url === null || url === '') {
    return url
  }
  let queryString = ''
  if (typeof data === 'object') {
    for (var i in data) {
      queryString += i + '=' + data[i] + '&'
    }
  }
  if (url.indexOf('?') > url.indexOf('/')) {
    url += '&'
  } else {
    url += '?'
  }
  if (queryString !== '') {
    queryString = queryString.substr(0, queryString.length - 1)
  }
  url += queryString
  return url
}

export class URL {
  static lastUrl = ''
  static queryCache = {}

  /**
   * 获取hash值里面的query部分，并json。
   * @param url
   */
  static getQuery (url) {
    let r = {}
    let query = (url.split('#')[1] || '').substring(1).split('?')[1]
    if (query) {
      query.split('&').forEach(q => {
        const i = q.indexOf('=')
        r[q.substring(0, i)] = q.substring(i + 1)
      })
    }
    return r
  }

  /**
   * 查找url上查询字段的值
   * @param key {string} 查询key
   * @param url {string} 链接字符
   * @return {string | undefined}
   */
  static getQueryVal (key, url) {
    if (this.lastUrl !== url) {
      this.lastUrl = url
      this.queryCache = this.getQuery(url)
    }
    return this.queryCache[key]
  }

  /**
   * 在url上串上新的值
   * e.g: url?xx=ss&xx=ee
   * @param {string} url 链接地址
   * @param {Object} value 需要添加的值
   */
  static addQuery (url, value) {
    let hashIndex = url.indexOf('#')
    let hasQuery = url.indexOf('?', hashIndex) >= 0
    let query = []
    for (let i in value) {
      if (String(value[i]) !== 'undefined' && String(value[i]) !== 'null') {
        let k = `${i}=${value[i]}`
        if (url.indexOf(k) === -1) {
          query.push(k)
        }
      }
    }
    if (query.length > 0) {
      return url + (hasQuery ? '&' : '?') + query.join('&')
    } else {
      return url
    }
  }

  /**
   * 检查url是否是同一个项目里
   * @author zhangp
   * @date 20181120
   * @param url
   * @return {boolean}
   */
  static isSameOriginAndPath (url) {
    url = url || ''
    url = url.split('#')[0].split('?')[0]
    return url === (window.location.origin + window.location.pathname)
  }

  /**
   * 是否是全路径url
   * @author zhangp
   * @date 20181120
   * @param url
   * @return {boolean}
   */
  static isAbsUrl (url) {
    return typeof url === 'string' && url.indexOf('http') === 0
  }
}

export const getTimeDifference = (updateTime) => {
  let dateBegin = new Date(updateTime).getTime()
  let dateEnd = new Date().getTime()
  let dateDiff = dateEnd - dateBegin // 时间差的毫秒数
  let dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000)) // 计算出相差天数
  let leave1 = dateDiff % (24 * 3600 * 1000) // 计算天数后剩余的毫秒数
  let hours = Math.floor(leave1 / (3600 * 1000)) // 计算出小时数
  // 计算相差分钟数
  let leave2 = leave1 % (3600 * 1000) // 计算小时数后剩余的毫秒数
  let minutes = Math.floor(leave2 / (60 * 1000)) // 计算相差分钟数
  // 计算相差秒数
  let leave3 = leave2 % (60 * 1000) // 计算分钟数后剩余的毫秒数
  let seconds = Math.round(leave3 / 1000)
  let returnVal = ''
  // 小于1分钟显示整数秒（不足一秒舍掉）
  // 大于1分钟显示整数分钟（不足一分钟舍掉）
  // 大于1小时显示整数小时（不足一小时舍掉）
  // 大于1天显示整数天（不足一天舍掉）
  if (dayDiff > 0) {
    returnVal = dayDiff + '天'
  } else if (hours > 0) {
    returnVal = hours + '小时'
  } else if (minutes > 0) {
    returnVal = minutes + '分钟'
  } else {
    returnVal = seconds + '秒'
  }
  return returnVal
}
export const parseDate = (da) => {
  da = new Date(Date.parse(da.replace(/-/g, '/'))).getTime()
  var date1 = new Date(da)
  var date2 = new Date()
  // var s1 = date1.getTime(), s2 = date2.getTime()
  var total = date2.getTime() - date1.getTime()
  var minutes = 1000 * 60
  // var hours = minutes * 60
  // var days = hours * 24
  // var years = days * 365
  var m = Math.round(total / minutes)
  var shi = Math.round(m / 60)
  var tian = Math.round(shi / 24)
  if (m >= 0 && m < 1) {
    return '刚刚'
  } else if (m >= 1 && m < 59) {
    return m + '分钟以前'
  } else if (m >= 60 && m < 1380) {
    return shi + '小时以前'
  } else if (m >= 1380 && m <= 4320) {
    return tian + '天以前'
  } else if (m > 4320) {
    return window.formatDate(date1, 'yyyy-MM-dd')
  }
}

export const getUrl = () => {
  let url = process.env.NODE_ENV === 'production' ? 'https://picobd.yunxuetang.cn/' : 'https://picobd-test.yunxuetang.cn/'
  return url
}

// 排除相同kngId情况
export const publicRemoveRepeat = (selection, key = 'kngId') => {
  let newMap = new Map()
  let newArr = selection.filter(item => {
    return !newMap.has(item[key]) && newMap.set(item[key], 1)
  })
  return newArr
}

// 清除重复&&设置本地缓存
export const removeRepeatAndSetLocalStorage = (cacheKey, array, arrayKey = 'kngId') => {
  let newArr = JSON.stringify(publicRemoveRepeat(array, arrayKey))
  localStorage.setItem(cacheKey, newArr)
}

// 存储当前正在学,进行下次进入知识调delete接口
export const storeKngStudying = (kngId) => {
  let playStudyArr = []
  if (localStorage.playStudyArr) {
    playStudyArr = JSON.parse(localStorage.playStudyArr)
    playStudyArr.push(kngId)
  } else {
    playStudyArr.push(kngId)
  }
  let newSet = Array.from(new Set([...playStudyArr]))
  localStorage.setItem('playStudyArr', JSON.stringify(newSet))
}
