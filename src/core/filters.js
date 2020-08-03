export default {
  install: Vue => {
    // 格式化时间所用的数字
    function formatNumber (n) {
      return n >= 10 ? n : '0' + n
    }
    // 格式化时间
    Vue.filter('formatTime', function (date) {
      if (date) {
        date = new Date(date)
      } else {
        return ''
      }
      let year = date.getFullYear()
      let month = date.getMonth() + 1
      let day = date.getDate()
      let hour = date.getHours()
      let minute = date.getMinutes()
      // const second = date.getSeconds()
      // const millisecond = date.getMilliseconds()
      return (
        [year, month, day].map(formatNumber).join('/') +
        ' ' +
        [hour, minute].map(formatNumber).join(':')
      )
    })

    Vue.filter('htmlEncode', function (str) {
      if (str === undefined || str === null || str.length === 0) return ''
      return str
        .replace(/&/g, `&amp;`)
        .replace(/</g, `&lt;`)
        .replace(/>/g, `&gt;`)
        .replace(/ /g, `&nbsp;`)
        .replace(/"/g, `&quot;`)
        .replace(/'/g, `&#39;`)
        .replace(/·/g, `&#183;`)
        .replace(/\\/g, `\\\\`)
        .replace(/%/g, `%25`)
    })

    Vue.filter('htmlDecode', function (str) {
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
    })

    Vue.filter('numberChange', function (val) {
      let tempVal = parseInt(val)
      if (tempVal >= 10000) {
        return (Math.floor(tempVal / 1000) / 10).toFixed(1) + 'w'
      } else {
        return tempVal
      }
    })

    Vue.filter('kngDefaultUrl', function (fileType) {
      let imgUrl
      let url = process.env.VUE_APP_BAIDU_URL + 'kngdefaultimg/'
      let defaultLanguage = 'zh'
      if (localStorage.locales) {
        switch (localStorage.locales) {
          case 'zh-CN':
            defaultLanguage = 'zh'
            break
          case 'zh-TW':
            defaultLanguage = 'ha'
            break
          case 'en':
            defaultLanguage = 'en'
            break
          default:
            defaultLanguage = 'zh'
            break
        }
      }
      // course(课程)、video(视频)、img(图片)、xuanyes(微课)、zip(压缩包)、audio(音频)、
      // excel、html、pdf、ppt、scorm、word
      switch (fileType) {
        case 'audio':
          imgUrl = url + defaultLanguage + '/audio.png'
          break
        case 'course':
          imgUrl = url + defaultLanguage + '/course.png'
          break
        case 'html':
          imgUrl = url + defaultLanguage + '/ebook.png'
          break
        case 'excel':
          imgUrl = url + defaultLanguage + '/excel.png'
          break
        case 'img':
          imgUrl = url + defaultLanguage + '/image.png'
          break
        case 'pdf':
          imgUrl = url + defaultLanguage + '/pdf.png'
          break
        case 'ppt':
          imgUrl = url + defaultLanguage + '/ppt.png'
          break
        case 'scorm':
          imgUrl = url + defaultLanguage + '/scorm.png'
          break
        case 'video':
          imgUrl = url + defaultLanguage + '/video.png'
          break
        case 'xuanyes':
          imgUrl = url + defaultLanguage + '/weike.png'
          break
        case 'word':
          imgUrl = url + defaultLanguage + '/word.png'
          break
        default:
          imgUrl = url + defaultLanguage + '/ukn.png'
          break
      }
      return imgUrl
    })
  }
}
